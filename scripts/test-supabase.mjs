// Test Supabase connectivity and check auth users
const SUPABASE_URL = "https://bznrdorobwlvthhngnll.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bnJkb3JvYndsdnRoaG5nbmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NDAzMDMsImV4cCI6MjA4NzMxNjMwM30.1nlCUeC9xo9toXnuAmqpuIZdUWYKd_st7E3XSuTQMdM";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bnJkb3JvYndsdnRoaG5nbmxsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTc0MDMwMywiZXhwIjoyMDg3MzE2MzAzfQ.0nYMU79-OSgjwXufFjF5YvHHwP2KWNWZahsg-R2YI-s";

async function test() {
  console.log("=== Testing Supabase Connectivity ===\n");
  console.log("URL:", SUPABASE_URL);
  
  // Test 1: Basic REST API ping
  console.log("\n--- Test 1: REST API Health ---");
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`,
      },
    });
    console.log("Status:", res.status);
    console.log("OK:", res.ok);
  } catch (e) {
    console.log("FAILED:", e.message);
  }

  // Test 2: Check users table with anon key
  console.log("\n--- Test 2: Query users table (anon key) ---");
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,email,role,status&limit=5`, {
      headers: {
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`,
      },
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Result:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("FAILED:", e.message);
  }

  // Test 3: Check auth users with service role
  console.log("\n--- Test 3: List auth users (service role) ---");
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=5`, {
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    console.log("Status:", res.status);
    const data = await res.json();
    if (data.users) {
      console.log("Auth users found:", data.users.length);
      data.users.forEach(u => {
        console.log(`  - ${u.email} (id: ${u.id}, confirmed: ${!!u.email_confirmed_at})`);
      });
    } else {
      console.log("Result:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log("FAILED:", e.message);
  }

  // Test 4: Try to create a test admin user via service role
  console.log("\n--- Test 4: Create admin user via service role ---");
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@stepoutplay.ai",
        password: "Admin@12345",
        email_confirm: true,
        user_metadata: { name: "Admin" },
      }),
    });
    console.log("Status:", res.status);
    const data = await res.json();
    if (data.id) {
      console.log("Auth user created! ID:", data.id);
      console.log("Email:", data.email);
      
      // Now insert into users table with service role
      console.log("\n--- Test 5: Insert admin into users table ---");
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          auth_id: data.id,
          email: "admin@stepoutplay.ai",
          name: "Admin",
          role: "admin",
          status: "approved",
        }),
      });
      console.log("Insert status:", insertRes.status);
      const insertData = await insertRes.json();
      console.log("Insert result:", JSON.stringify(insertData, null, 2));
    } else {
      console.log("Result:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log("FAILED:", e.message);
  }

  console.log("\n=== Tests Complete ===");
}

test();
