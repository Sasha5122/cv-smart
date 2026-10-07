import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  console.error("Lipsește SUPABASE_SERVICE_ROLE_KEY în mediu (vezi .env.example).");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function createSchema() {
  console.log("Creating Supabase schema...");

  const { error: e1 } = await supabase.rpc("exec_sql", {
    sql: `
      create table if not exists sessions (
        id uuid primary key default gen_random_uuid(),
        email text,
        status text default 'in_progress',
        cv_data jsonb default '{}',
        job_description text,
        ideal_profile jsonb,
        draft_cv text,
        final_cv text,
        photo_url text,
        template_id text default 'classic',
        created_at timestamptz default now(),
        updated_at timestamptz default now(),
        expires_at timestamptz default (now() + interval '30 days')
      );
    `,
  });

  if (e1) {
    console.log("Note:", e1.message);
    console.log("\nPlease run supabase-schema.sql manually in Supabase dashboard:");
    console.log("https://supabase.com/dashboard/project/vhhvywptbntlhykkznpk/sql/new");
  } else {
    console.log("✓ Schema created successfully!");
  }

  // Test connection
  const { data, error } = await supabase.from("sessions").select("id").limit(1);
  if (error) {
    console.log("\n⚠ Tables not found. Run supabase-schema.sql manually.");
    console.log("File: cv-smart/supabase-schema.sql");
  } else {
    console.log("✓ Sessions table accessible! Data:", data);
  }
}

createSchema().catch(console.error);
