import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-968c49f6/health", (c) => {
  return c.json({ status: "ok" });
});

// Helper function to generate match ID
function generateMatchId() {
  return `MATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Helper function to get week number from date
function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Create a new match (Manager)
app.post("/make-server-968c49f6/matches", async (c) => {
  try {
    const body = await c.req.json();
    
    const matchId = generateMatchId();
    const createdAt = new Date().toISOString();
    const receivingWeek = getWeekNumber(new Date(body.match_received_on || createdAt));
    
    const match = {
      match_id: matchId,
      status: "created",
      created_at: createdAt,
      updated_at: createdAt,
      
      // Manager details
      manager: {
        organizer_name: body.organizer_name,
        client_type: body.client_type, // paid/unpaid/demo
        match_analysis_type: body.match_analysis_type,
        team_a: body.team_a,
        team_b: body.team_b,
        game_time: body.game_time,
        venue: body.venue,
        tournament_name: body.tournament_name,
        match_video_type: body.match_video_type,
        match_age_group: body.match_age_group,
        match_received_on: body.match_received_on || createdAt,
        receiving_week: receivingWeek,
      },
      
      // Analyst details (to be filled later)
      analyst: null,
      
      // Reviewer details (to be filled later)
      reviewer: null,
    };
    
    await kv.set(`match:${matchId}`, match);
    
    // Also store in a list for easy retrieval
    const matchList = await kv.get("match:list") || [];
    matchList.push(matchId);
    await kv.set("match:list", matchList);
    
    console.log(`Match created successfully: ${matchId}`);
    return c.json({ success: true, match });
  } catch (error) {
    console.error("Error creating match:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all matches with optional filtering
app.get("/make-server-968c49f6/matches", async (c) => {
  try {
    const status = c.req.query("status");
    const clientType = c.req.query("client_type");
    const analyst = c.req.query("analyst");
    
    const matchList = await kv.get("match:list") || [];
    const matches = await kv.mget(matchList.map((id: string) => `match:${id}`));
    
    let filteredMatches = matches.filter((m: any) => m !== null);
    
    // Apply filters
    if (status) {
      filteredMatches = filteredMatches.filter((m: any) => m.status === status);
    }
    if (clientType) {
      filteredMatches = filteredMatches.filter((m: any) => m.manager?.client_type === clientType);
    }
    if (analyst) {
      filteredMatches = filteredMatches.filter((m: any) => 
        m.analyst?.analysts?.some((a: any) => a.name === analyst)
      );
    }
    
    // Sort by created_at descending (newest first)
    filteredMatches.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ success: true, matches: filteredMatches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single match by ID
app.get("/make-server-968c49f6/matches/:id", async (c) => {
  try {
    const matchId = c.req.param("id");
    const match = await kv.get(`match:${matchId}`);
    
    if (!match) {
      return c.json({ success: false, error: "Match not found" }, 404);
    }
    
    return c.json({ success: true, match });
  } catch (error) {
    console.error("Error fetching match:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update match with analyst details
app.put("/make-server-968c49f6/matches/:id/analyst", async (c) => {
  try {
    const matchId = c.req.param("id");
    const body = await c.req.json();
    
    const match = await kv.get(`match:${matchId}`);
    if (!match) {
      return c.json({ success: false, error: "Match not found" }, 404);
    }
    
    const analysedOn = new Date().toISOString();
    const analysisWeek = getWeekNumber(new Date(analysedOn));
    
    // Check if this is a rework scenario
    const isRework = match.status === "rework";
    
    match.analyst = {
      analysed_on: analysedOn,
      live_match: body.live_match,
      analysts: body.analysts, // Array of { name, analyst_id }
      remarks: body.remarks,
      analysis_tat: body.analysis_tat,
      analysis_start_end_time: body.analysis_start_end_time,
      analysis_week: analysisWeek,
      analysis_start_time: body.analysis_start_time,
      rework_count: isRework ? (match.analyst?.rework_count || 0) + 1 : 0,
    };
    
    match.status = "in_review";
    match.updated_at = analysedOn;
    
    await kv.set(`match:${matchId}`, match);
    
    console.log(`Match ${matchId} updated with analyst details`);
    return c.json({ success: true, match });
  } catch (error) {
    console.error("Error updating match with analyst details:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update match with reviewer details
app.put("/make-server-968c49f6/matches/:id/reviewer", async (c) => {
  try {
    const matchId = c.req.param("id");
    const body = await c.req.json();
    
    const match = await kv.get(`match:${matchId}`);
    if (!match) {
      return c.json({ success: false, error: "Match not found" }, 404);
    }
    
    const reviewedOn = new Date().toISOString();
    const reviewWeek = getWeekNumber(new Date(reviewedOn));
    
    match.reviewer = {
      reviewed_by: body.reviewed_by,
      qc_error_count: body.qc_error_count,
      review_tat: body.review_tat,
      review_week: reviewWeek,
      reviewed_on: reviewedOn,
      reviewer_remarks: body.reviewer_remarks,
    };
    
    // Calculate total TAT
    const analysisTAT = match.analyst?.analysis_tat || 0;
    const reviewTAT = body.review_tat || 0;
    match.reviewer.total_tat = analysisTAT + reviewTAT;
    
    // Update status based on reviewer action
    if (body.has_errors && body.send_back_to_analyst) {
      match.status = "rework";
    } else {
      match.status = "completed";
    }
    
    match.updated_at = reviewedOn;
    
    await kv.set(`match:${matchId}`, match);
    
    console.log(`Match ${matchId} updated with reviewer details`);
    return c.json({ success: true, match });
  } catch (error) {
    console.error("Error updating match with reviewer details:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Export matches data
app.get("/make-server-968c49f6/matches/export/csv", async (c) => {
  try {
    const matchList = await kv.get("match:list") || [];
    const matches = await kv.mget(matchList.map((id: string) => `match:${id}`));
    
    const validMatches = matches.filter((m: any) => m !== null);
    
    // Generate CSV
    const headers = [
      "Match ID", "Status", "Organizer Name", "Client Type", "Match Analysis Type",
      "Team A", "Team B", "Game Time", "Venue", "Tournament Name", "Video Type",
      "Age Group", "Received On", "Receiving Week", "Analysed On", "Live Match",
      "Analysts", "Analysis TAT", "Analysis Week", "Reviewed By", "QC Error Count",
      "Review TAT", "Review Week", "Total TAT", "Created At", "Remarks"
    ].join(",");
    
    const rows = validMatches.map((match: any) => {
      const analysts = match.analyst?.analysts?.map((a: any) => a.name).join("; ") || "";
      return [
        match.match_id,
        match.status,
        match.manager?.organizer_name || "",
        match.manager?.client_type || "",
        match.manager?.match_analysis_type || "",
        match.manager?.team_a || "",
        match.manager?.team_b || "",
        match.manager?.game_time || "",
        match.manager?.venue || "",
        match.manager?.tournament_name || "",
        match.manager?.match_video_type || "",
        match.manager?.match_age_group || "",
        match.manager?.match_received_on || "",
        match.manager?.receiving_week || "",
        match.analyst?.analysed_on || "",
        match.analyst?.live_match || "",
        analysts,
        match.analyst?.analysis_tat || "",
        match.analyst?.analysis_week || "",
        match.reviewer?.reviewed_by || "",
        match.reviewer?.qc_error_count || "",
        match.reviewer?.review_tat || "",
        match.reviewer?.review_week || "",
        match.reviewer?.total_tat || "",
        match.created_at || "",
        match.analyst?.remarks || ""
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });
    
    const csv = [headers, ...rows].join("\n");
    
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="matches-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting matches:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);