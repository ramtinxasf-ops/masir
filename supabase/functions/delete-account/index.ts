import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://ramtinxasf-ops.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, {
      status: 405,
      headers: { ...corsHeaders, "Allow": "POST, OPTIONS" },
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

  const userId = authData.user.id;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // حذف داده‌های متعلق به همین کاربر؛ هیچ حساب دیگری تغییر نمی‌کند.
    const { error: activitiesError } = await adminClient
      .from("user_activities")
      .delete()
      .eq("user_id", userId);

    if (activitiesError) {
      console.error("Could not delete account activities:", activitiesError);
      return Response.json({ error: "حذف فعالیت‌های حساب انجام نشد؛ حساب حذف نشده است." }, {
        status: 500,
        headers: { ...corsHeaders, "Cache-Control": "no-store" },
      });
    }

    // حذف کاربر از Supabase Auth باعث حذف اطلاعات پروفایل متصل به همان حساب می‌شود.
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("Could not delete auth user:", deleteUserError);
      return Response.json({ error: "فعالیت‌ها پاک شدند، اما حذف خود حساب انجام نشد. با پشتیبانی تماس بگیر." }, {
        status: 500,
        headers: { ...corsHeaders, "Cache-Control": "no-store" },
      });
    }

    return Response.json({ success: true }, {
      status: 200,
      headers: { ...corsHeaders, "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Unexpected account deletion error:", error);
    return Response.json({ error: "حذف حساب به دلیل خطای غیرمنتظره انجام نشد." }, {
      status: 500,
      headers: { ...corsHeaders, "Cache-Control": "no-store" },
    });
  }
});
