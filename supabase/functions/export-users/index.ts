import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://ramtinxasf-ops.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Vary": "Origin",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, {
      status: 405,
      headers: { ...corsHeaders, "Allow": "GET, OPTIONS" },
    });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== "https://ramtinxasf-ops.github.io") {
    return Response.json({ error: "Origin not allowed" }, { status: 403, headers: corsHeaders });
  }

  const authorization = request.headers.get("authorization") || "";
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return Response.json({ error: "Authentication required" }, { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Required Supabase environment variables are missing.");
    return Response.json({ error: "Server configuration is incomplete" }, { status: 500, headers: corsHeaders });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser(tokenMatch[1]);
  if (authError || !authData.user) {
    return Response.json({ error: "Invalid or expired session" }, { status: 401, headers: corsHeaders });
  }
  if (authData.user.app_metadata?.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403, headers: corsHeaders });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const users: Array<{
      email?: string | null;
      phone?: string | null;
      created_at?: string;
      user_metadata?: Record<string, unknown>;
    }> = [];
    const perPage = 1000;
    for (let page = 1; ; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      users.push(...data.users);
      if (data.users.length < perPage) break;
    }

    const formattedUsers = users.map((user, index) => {
      const metadata = user.user_metadata || {};
      const phone = [user.phone, metadata.phone, metadata.phone_number, metadata.phoneNumber]
        .find((value) => typeof value === "string" && value.trim().length > 0) ?? "";
      const firstName = metadata.first_name ?? metadata.firstName ?? "ثبت نشده";
      const lastName = metadata.last_name ?? metadata.lastName ?? "ثبت نشده";
      const email = user.email ?? "ثبت نشده";
      const createdAt = user.created_at
        ? new Date(user.created_at).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })
        : "ثبت نشده";
      return [
        `کاربر شماره ${index + 1}`,
        `نام: ${firstName}`,
        `نام خانوادگی: ${lastName}`,
        `تلفن: ${phone || "ثبت نشده"}`,
        `ایمیل: ${email}`,
        `تاریخ ثبت‌نام: ${createdAt}`,
      ].join("\r\n");
    });
    const textFile = "\uFEFF" + (formattedUsers.length
      ? formattedUsers.join("\r\n\r\n------------------------------\r\n\r\n")
      : "هیچ کاربری برای نمایش وجود ندارد.");
    const date = new Date().toISOString().slice(0, 10);
    return new Response(textFile, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="masir-users-${date}.txt"` ,
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("User CSV export failed:", error);
    return Response.json({ error: "Could not export users" }, {
      status: 500,
      headers: { ...corsHeaders, "Cache-Control": "no-store" },
    });
  }
});
