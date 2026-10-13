import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "ramtinxasf@gmail.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://ramtinxasf-ops.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== "https://ramtinxasf-ops.github.io") {
    return Response.json({ error: "Origin not allowed" }, { status: 403, headers: corsHeaders });
  }

  const tokenMatch = (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return Response.json({ error: "Authentication required" }, { status: 401, headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return Response.json({ error: "Server configuration is incomplete" }, { status: 500, headers: corsHeaders });
  }

  const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await userClient.auth.getUser(tokenMatch[1]);
  const signedInEmail = (authData.user?.email || "").trim().toLowerCase();
  if (authError || !authData.user) {
    return Response.json({ error: "نشست ورود معتبر نیست؛ دوباره وارد شو." }, { status: 401, headers: corsHeaders });
  }
  if (signedInEmail !== ADMIN_EMAIL) {
    return Response.json({ error: "این حساب اجازه مدیریت ندارد." }, { status: 403, headers: corsHeaders });
  }

  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 400, headers: corsHeaders });
  }
  const targetEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!targetEmail || !targetEmail.includes("@")) {
    return Response.json({ error: "ایمیل کاربر را درست وارد کن." }, { status: 400, headers: corsHeaders });
  }
  const passwordRules = [
    { valid: password.length >= 8, message: "رمز جدید باید حداقل ۸ کاراکتر داشته باشد." },
    { valid: /[A-Z]/.test(password), message: "رمز جدید باید حداقل یک حرف بزرگ انگلیسی (A-Z) داشته باشد." },
    { valid: /[a-z]/.test(password), message: "رمز جدید باید حداقل یک حرف کوچک انگلیسی (a-z) داشته باشد." },
    { valid: /[0-9]/.test(password), message: "رمز جدید باید حداقل یک عدد انگلیسی (0-9) داشته باشد." },
  ];
  const failedRule = passwordRules.find((rule) => !rule.valid);
  if (failedRule) {
    return Response.json({ error: failedRule.message }, { status: 400, headers: corsHeaders });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    let targetUser = null;
    for (let page = 1; ; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      targetUser = data.users.find((u) => (u.email || "").trim().toLowerCase() === targetEmail) || null;
      if (targetUser || data.users.length < 1000) break;
    }
    if (!targetUser) return Response.json({ error: "کاربری با این ایمیل پیدا نشد." }, { status: 404, headers: corsHeaders });
    if ((targetUser.email || "").trim().toLowerCase() === ADMIN_EMAIL) {
      return Response.json({ error: "از این بخش نمی‌توان رمز حساب مدیر را تغییر داد." }, { status: 400, headers: corsHeaders });
    }
    const { error } = await adminClient.auth.admin.updateUserById(targetUser.id, { password });
    if (error) {
      return Response.json({ error: error.message || "تغییر رمز انجام نشد." }, { status: 400, headers: corsHeaders });
    }
    return Response.json({ success: true, message: "رمز جدید با موفقیت تنظیم شد." }, {
      status: 200,
      headers: { ...corsHeaders, "Cache-Control": "no-store", "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin password reset failed:", error);
    return Response.json({ error: "خطای سرور هنگام تغییر رمز." }, { status: 500, headers: corsHeaders });
  }
});
