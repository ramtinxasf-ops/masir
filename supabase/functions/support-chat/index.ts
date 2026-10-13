import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const ADMIN_EMAIL = "ramtinxasf@gmail.com";
const ORIGIN = "https://ramtinxasf-ops.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { ...corsHeaders, "Cache-Control": "no-store", "Content-Type": "application/json" },
});
async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const origin = request.headers.get("origin");
  if (origin && origin !== ORIGIN) return json({ error: "Origin not allowed" }, 403);
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return json({ error: "Server configuration is incomplete" }, 500);
  const db = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: "درخواست نامعتبر است." }, 400); }
  const action = typeof body.action === "string" ? body.action : "";
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  let isAdmin = false;
  if (tokenMatch && anon) {
    const authClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await authClient.auth.getUser(tokenMatch[1]);
    isAdmin = (data.user?.email || "").trim().toLowerCase() === ADMIN_EMAIL;
  }
  try {
    if (action === "create") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "ایمیل معتبر وارد کن." }, 400);
      if (!message || message.length > 4000) return json({ error: "پیام باید بین ۱ تا ۴۰۰۰ نویسه باشد." }, 400);
      const ticket = crypto.randomUUID() + crypto.randomUUID();
      const { data: thread, error: threadError } = await db.from("support_chat_threads")
        .insert({ email, access_token_hash: await hashToken(ticket) }).select("id").single();
      if (threadError) throw threadError;
      const { error: messageError } = await db.from("support_chat_messages")
        .insert({ thread_id: thread.id, sender: "user", message });
      if (messageError) throw messageError;
      return json({ success: true, thread_id: thread.id, ticket, message: "پیامت برای مدیر ارسال شد. این گفتگو در همین دستگاه قابل پیگیری است." }, 201);
    }
    if (action === "user_read" || action === "user_send") {
      const threadId = typeof body.thread_id === "string" ? body.thread_id : "";
      const ticket = typeof body.ticket === "string" ? body.ticket : "";
      if (!threadId || ticket.length < 32) return json({ error: "گفتگو معتبر نیست." }, 400);
      const { data: thread, error } = await db.from("support_chat_threads").select("id, email")
        .eq("id", threadId).eq("access_token_hash", await hashToken(ticket)).maybeSingle();
      if (error) throw error;
      if (!thread) return json({ error: "دسترسی به این گفتگو تأیید نشد." }, 403);
      if (action === "user_send") {
        const message = typeof body.message === "string" ? body.message.trim() : "";
        if (!message || message.length > 4000) return json({ error: "پیام باید بین ۱ تا ۴۰۰۰ نویسه باشد." }, 400);
        const { error: insertError } = await db.from("support_chat_messages").insert({ thread_id: threadId, sender: "user", message });
        if (insertError) throw insertError;
        await db.from("support_chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
      }
      const { data: messages, error: listError } = await db.from("support_chat_messages").select("id,sender,message,created_at")
        .eq("thread_id", threadId).order("created_at", { ascending: true });
      if (listError) throw listError;
      return json({ success: true, email: thread.email, messages });
    }
    if (action === "admin_list" || action === "admin_read" || action === "admin_reply") {
      if (!isAdmin) return json({ error: "فقط مدیر اجازه دسترسی به پیام‌ها را دارد." }, 403);
      if (action === "admin_list") {
        const { data, error } = await db.from("support_chat_threads").select("id,email,created_at,updated_at")
          .order("updated_at", { ascending: false }).limit(200);
        if (error) throw error;
        return json({ success: true, threads: data });
      }
      const threadId = typeof body.thread_id === "string" ? body.thread_id : "";
      if (!threadId) return json({ error: "گفتگو انتخاب نشده است." }, 400);
      if (action === "admin_reply") {
        const message = typeof body.message === "string" ? body.message.trim() : "";
        if (!message || message.length > 4000) return json({ error: "پیام باید بین ۱ تا ۴۰۰۰ نویسه باشد." }, 400);
        const { error } = await db.from("support_chat_messages").insert({ thread_id: threadId, sender: "admin", message });
        if (error) throw error;
        await db.from("support_chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
      }
      const { data: messages, error } = await db.from("support_chat_messages").select("id,sender,message,created_at")
        .eq("thread_id", threadId).order("created_at", { ascending: true });
      if (error) throw error;
      return json({ success: true, messages });
    }
    return json({ error: "عملیات ناشناخته است." }, 400);
  } catch (error) {
    console.error("support-chat error:", error);
    return json({ error: "خطای سرور در پیام‌رسانی. بررسی کن جدول‌های گفتگوی پشتیبانی ساخته شده باشند." }, 500);
  }
});
