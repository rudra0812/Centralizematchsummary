import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

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

// ============= AUTH ENDPOINTS =============

// Register a new user
app.post("/auth/register", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json(
        { success: false, error: "Email and password are required" },
        400
      );
    }

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return c.json({ success: false, error: error.message }, 400);
    }

    // Create user_roles entry (initially inactive, waiting for admin assignment)
    const { error: roleError } = await supabase.from("user_roles").insert({
      email,
      role: "pending",
      is_active: false,
    });

    if (roleError) {
      console.error("Error creating user role:", roleError);
      // Don't fail registration if role creation fails
    }

    return c.json({
      success: true,
      message: "User registered successfully. Awaiting admin role assignment.",
      user: data.user,
    });
  } catch (error) {
    console.error("Register error:", error);
    return c.json(
      { success: false, error: "Registration failed" },
      500
    );
  }
});

// Login user
app.post("/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json(
        { success: false, error: "Email and password are required" },
        400
      );
    }

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ success: false, error: error.message }, 401);
    }

    // Fetch user's assigned role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("email", email)
      .single();

    if (roleError && roleError.code !== "PGRST116") {
      console.error("Error fetching role:", roleError);
    }

    return c.json({
      success: true,
      message: "Login successful",
      user: data.user,
      session: data.session,
      role: roleData?.role || null,
      isActive: roleData?.is_active || false,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ success: false, error: "Login failed" }, 500);
  }
});

// Get current user with role
app.get("/auth/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json(
        { success: false, error: "No authorization header" },
        401
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Get user from Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Fetch user's role from database
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("email", data.user.email)
      .single();

    if (roleError && roleError.code !== "PGRST116") {
      console.error("Error fetching role:", roleError);
    }

    return c.json({
      success: true,
      user: data.user,
      role: roleData?.role || null,
      isActive: roleData?.is_active || false,
      createdAt: roleData?.created_at || null,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return c.json({ success: false, error: "Failed to fetch user" }, 500);
  }
});

// Logout user (token invalidation happens on client)
app.post("/auth/logout", async (c) => {
  try {
    return c.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ success: false, error: "Logout failed" }, 500);
  }
});

// ============= ADMIN ENDPOINTS =============

// Get all users (admin only)
app.get("/admin/users", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json(
        { success: false, error: "No authorization header" },
        401
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify admin status
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user.user?.email) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { data: isAdmin } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", user.user.email)
      .single();

    if (!isAdmin) {
      return c.json(
        { success: false, error: "Only admins can access this endpoint" },
        403
      );
    }

    // Fetch all users with roles
    const { data: users, error: usersError } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (usersError) {
      return c.json({ success: false, error: usersError.message }, 500);
    }

    return c.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return c.json(
      { success: false, error: "Failed to fetch users" },
      500
    );
  }
});

// Assign role to user (admin only)
app.post("/admin/assign-role", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json(
        { success: false, error: "No authorization header" },
        401
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { email, role } = await c.req.json();

    if (!email || !role) {
      return c.json(
        { success: false, error: "Email and role are required" },
        400
      );
    }

    // Verify admin status
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user.user?.email) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { data: isAdmin } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", user.user.email)
      .single();

    if (!isAdmin) {
      return c.json(
        { success: false, error: "Only admins can assign roles" },
        403
      );
    }

    // Validate role
    const validRoles = ["admin", "manager", "analyst", "reviewer"];
    if (!validRoles.includes(role)) {
      return c.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        400
      );
    }

    // Update user role
    const { data: updatedRole, error: updateError } = await supabase
      .from("user_roles")
      .update({
        role,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select()
      .single();

    if (updateError) {
      return c.json(
        { success: false, error: updateError.message },
        500
      );
    }

    return c.json({
      success: true,
      message: `Role assigned successfully`,
      user: updatedRole,
    });
  } catch (error) {
    console.error("Assign role error:", error);
    return c.json(
      { success: false, error: "Failed to assign role" },
      500
    );
  }
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

// Helper to format date as dd/mm/yy
function formatDateDDMMYY(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

// Create a new match (Manager)
app.post("/make-server-968c49f6/matches", async (c) => {
  try {
    const body = await c.req.json();
    
    const matchId = generateMatchId();
    const createdAt = new Date().toISOString();
    const receivedOn = body.match_received_on || createdAt;
    const receivingWeek = getWeekNumber(new Date(receivedOn));
    
    const match = {
      match_id: matchId,
      status: "created",
      created_at: createdAt,
      updated_at: createdAt,
      
      // Manager details (MATCH DETAILS section)
      manager: {
        organizer_name: body.organizer_name || "",        // Client Name
        client_type: body.client_type || "",              // Demo / Unpaid / Paid
        match_analysis_type: body.match_analysis_type || "", // Basic / B2C / Live / Pro
        team_a: body.team_a || "",
        team_b: body.team_b || "",
        game_time: body.game_time || "",                  // in mins
        match_country: body.venue || body.match_country || "", // Match Country
        tournament_name: body.tournament_name || "",      // Major Tournament Name
        match_video_type: body.match_video_type || "",    // Veo / Pixelot / Hudl / Broadcasting / Other
        match_age_group: body.match_age_group || "",      // U12-U21 / Pro
        match_received_on: receivedOn,                    // dd/mm/yy
        receiving_week: receivingWeek,                    // auto-calculated
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
        m.analyst?.analysts?.some((a: any) => a.name === analyst) ||
        m.analyst?.live_match_analysed_by === analyst ||
        m.analyst?.first_half_analysed_by === analyst ||
        m.analyst?.second_half_analysed_by === analyst
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

// Update match with analyst details (ANALYSIS DETAILS section)
app.put("/make-server-968c49f6/matches/:id/analyst", async (c) => {
  try {
    const matchId = c.req.param("id");
    const body = await c.req.json();
    
    const match = await kv.get(`match:${matchId}`);
    if (!match) {
      return c.json({ success: false, error: "Match not found" }, 404);
    }
    
    const analysedOn = body.analysed_on || new Date().toISOString();
    const analysisWeek = getWeekNumber(new Date(analysedOn));
    
    // Check if this is a rework scenario
    const isRework = match.status === "rework";
    
    match.analyst = {
      analysed_on: analysedOn,                                     // Match Analysed on (Date - dd/mm/yy)
      live_match_analysed_by: body.live_match_analysed_by || "",   // Live match analysed by
      first_half_analysed_by: body.first_half_analysed_by || "",   // First half analysed by
      second_half_analysed_by: body.second_half_analysed_by || "", // Second half analysed by
      remarks: body.remarks || "",                                 // Analyst Remarks on the game or match video
      analysis_tat: body.analysis_tat || 0,                        // Analysis TAT (mins)
      analysis_start_end_time: body.analysis_start_end_time || 0,  // Analysis Start to End Time (mins)
      analysis_week: analysisWeek,                                 // Match Analysis Week (auto)
      // Keep backward compat
      analysts: body.analysts || [],
      rework_count: isRework ? (match.analyst?.rework_count || 0) + 1 : (match.analyst?.rework_count || 0),
    };
    
    match.status = "in_review";
    match.updated_at = new Date().toISOString();
    
    await kv.set(`match:${matchId}`, match);
    
    console.log(`Match ${matchId} updated with analyst details`);
    return c.json({ success: true, match });
  } catch (error) {
    console.error("Error updating match with analyst details:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update match with reviewer details (REVIEW DETAILS section)
app.put("/make-server-968c49f6/matches/:id/reviewer", async (c) => {
  try {
    const matchId = c.req.param("id");
    const body = await c.req.json();
    
    const match = await kv.get(`match:${matchId}`);
    if (!match) {
      return c.json({ success: false, error: "Match not found" }, 404);
    }
    
    const reviewedOn = body.reviewed_on || new Date().toISOString();
    const reviewWeek = getWeekNumber(new Date(reviewedOn));
    
    // Calculate Total Start to Completion TAT (hours)
    // Uses match received time -> review completed time
    let totalTatHours = 0;
    if (match.manager?.match_received_on) {
      const receivedTime = new Date(match.manager.match_received_on).getTime();
      const completedTime = new Date(reviewedOn).getTime();
      totalTatHours = Math.round(((completedTime - receivedTime) / (1000 * 60 * 60)) * 100) / 100;
      if (totalTatHours < 0) totalTatHours = 0;
    }
    
    match.reviewer = {
      reviewed_by: body.reviewed_by || "",                // Match Reviewed by
      reviewed_on: reviewedOn,                            // Match Reviewed on (Date - dd/mm/yy)
      qc_error_count: body.qc_error_count || 0,          // Match QC Error Count
      review_tat: body.review_tat || 0,                   // Match Review TAT (mins)
      match_status: body.match_status || "",              // Match Status (Not Assigned / Assigned / Analysed / Completed / NA)
      reviewer_remarks: body.reviewer_remarks || "",
      review_week: reviewWeek,                            // Match Review Week (auto)
      total_start_to_completion_tat: totalTatHours,       // Total Start to Completion TAT (hours)
    };
    
    // Update internal status based on reviewer action
    if (body.has_errors && body.send_back_to_analyst) {
      match.status = "rework";
    } else {
      match.status = "completed";
    }
    
    match.updated_at = new Date().toISOString();
    
    await kv.set(`match:${matchId}`, match);
    
    console.log(`Match ${matchId} updated with reviewer details`);
    return c.json({ success: true, match });
  } catch (error) {
    console.error("Error updating match with reviewer details:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Export matches data as CSV matching the exact schema
app.get("/make-server-968c49f6/matches/export/csv", async (c) => {
  try {
    const matchList = await kv.get("match:list") || [];
    const matches = await kv.mget(matchList.map((id: string) => `match:${id}`));
    
    const validMatches = matches.filter((m: any) => m !== null);
    
    // CSV headers matching exact schema columns
    const headers = [
      // MATCH DETAILS
      "Client Name",
      "Client Type (Demo/ Unpaid/ Paid)",
      "Match Analysis Type (Basic/ B2C/ Live/ Pro)",
      "Match ID",
      "Team A",
      "vs",
      "Team B",
      "Game time (mins)",
      "Match Country",
      "Major Tournament Name",
      "Match Video type (Veo/ Pixelot/ Hudl/ Broadcasting/ Other)",
      "Match Age Group (U12/ U13/ U14/ U15/ U16/ U17/ U18/ U19/ U21/ Pro)",
      "Match Received on (Date - dd/mm/yy)",
      // ANALYSIS DETAILS
      "Match Analysed on (Date - dd/mm/yy)",
      "Live match analysed by",
      "First half analysed by",
      "Second half analysed by",
      "Analyst Remarks on the game or match video",
      "Analysis TAT (mins)",
      "Analysis Start to End Time (mins)",
      // REVIEW DETAILS
      "Match Reviewed by",
      "Match Reviewed on (Date - dd/mm/yy)",
      "Match QC Error Count",
      "Match Review TAT (mins)",
      "Match Status (Not Assigned/ Assigned/ Analysed/ Completed/ NA)",
      // CALCULATED
      "Total Start to Completion TAT (hours)",
      "Match Receiving Week",
      "Match Analysis Week",
      "Match Review Week",
    ].join(",");
    
    const rows = validMatches.map((match: any) => {
      return [
        // MATCH DETAILS
        match.manager?.organizer_name || "",
        match.manager?.client_type || "",
        match.manager?.match_analysis_type || "",
        match.match_id || "",
        match.manager?.team_a || "",
        "vs",
        match.manager?.team_b || "",
        match.manager?.game_time || "",
        match.manager?.match_country || match.manager?.venue || "",
        match.manager?.tournament_name || "",
        match.manager?.match_video_type || "",
        match.manager?.match_age_group || "",
        formatDateDDMMYY(match.manager?.match_received_on || ""),
        // ANALYSIS DETAILS
        formatDateDDMMYY(match.analyst?.analysed_on || ""),
        match.analyst?.live_match_analysed_by || "",
        match.analyst?.first_half_analysed_by || "",
        match.analyst?.second_half_analysed_by || "",
        match.analyst?.remarks || "",
        match.analyst?.analysis_tat || "",
        match.analyst?.analysis_start_end_time || "",
        // REVIEW DETAILS
        match.reviewer?.reviewed_by || "",
        formatDateDDMMYY(match.reviewer?.reviewed_on || ""),
        match.reviewer?.qc_error_count ?? "",
        match.reviewer?.review_tat || "",
        match.reviewer?.match_status || "",
        // CALCULATED
        match.reviewer?.total_start_to_completion_tat || "",
        match.manager?.receiving_week ? `Week ${match.manager.receiving_week}` : "",
        match.analyst?.analysis_week ? `Week ${match.analyst.analysis_week}` : "",
        match.reviewer?.review_week ? `Week ${match.reviewer.review_week}` : "",
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
