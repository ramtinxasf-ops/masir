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
  if (tokenMatch) {
    const authClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await authClient.auth.getUser(tokenMatch[1]);
    isAdmin = (data.user?.email || "").trim().toLowerCase() === ADMIN_EMAIL;
  }

  try {
    if (action === "create") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const displayName = typeof body.display_name === "string" ? body.display_name.trim().slice(0, 120) : "";
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "ایمیل معتبر وارد کن." }, 400);
      if (!message || message.length > 4000) return json({ error: "پیام باید بین ۱ تا ۴۰۰۰ نویسه باشد." }, 400);
      const ticket = crypto.randomUUID() + crypto.randomUUID();
      const { data: thread, error: threadError } = await db.from("support_chat_threads")
        .insert({ email, display_name: displayName || null, access_token_hash: await hashToken(ticket) })
        .select("id,email,display_name").single();
      if (threadError) throw threadError;
      const { error: messageError } = await db.from("support_chat_messages")
        .insert({ thread_id: thread.id, sender: "user", message, read_by_admin: false, read_by_user: true });
      if (messageError) throw messageError;
      await db.from("support_chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", thread.id);
      const { data: messages, error: readError } = await db.from("support_chat_messages")
        .select("id,sender,message,created_at").eq("thread_id", thread.id).order("created_at", { ascending: true });
      if (readError) throw readError;
      return json({ success: true, thread_id: thread.id, ticket, email: thread.email, display_name: thread.display_name, messages, message: "پیامت ثبت شد و در صندوق پیام‌های مدیر قرار گرفت." }, 201);
    }

    if (action === "user_read" || action === "user_send" || action === "user_status") {
      const threadId = typeof body.thread_id === "string" ? body.thread_id : "";
      const ticket = typeof body.ticket === "string" ? body.ticket : "";
      if (!threadId || ticket.length < 32) return json({ error: "گفتگو معتبر نیست." }, 400);
      const { data: thread, error } = await db.from("support_chat_threads").select("id,email,display_name")
        .eq("id", threadId).eq("access_token_hash", await hashToken(ticket)).maybeSingle();
      if (error) throw error;
      if (!thread) return json({ error: "دسترسی به این گفتگو تأیید نشد." }, 403);

      if (action === "user_send") {
        const message = typeof body.message === "string" ? body.message.trim() : "";
        if (!message || message.length > 4000) return json({ error: "پیام باید بین ۱ تا ۴۰۰۰ نویسه باشد." }, 400);
        const { error: insertError } = await db.from("support_chat_messages")
          .insert({ thread_id: threadId, sender: "user", message, read_by_admin: false, read_by_user: true });
        if (insertError) throw insertError;
        await db.from("support_chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
      }

      if (action === "user_status") {
        const { count, error: countError } = await db.from("support_chat_messages").select("id", { count: "exact", head: true })
          .eq("thread_id", threadId).eq("sender", "admin").eq("read_by_user", false);
        if (countError) throw countError;
        const { data: unreadMessages, error: unreadError } = await db.from("support_chat_messages")
          .select("id,message,created_at").eq("thread_id", threadId).eq("sender", "admin")
          .eq("read_by_user", false).order("created_at", { ascending: true }).limit(50);
        if (unreadError) throw unreadError;
        return json({
          success: true,
          unread_count: count || 0,
          unread_messages: unreadMessages || [],
          email: thread.email,
          display_name: thread.display_name
        });
      }

      if (action === "user_read") {
        const { error: markError } = await db.from("support_chat_messages").update({ read_by_user: true })
          .eq("thread_id", threadId).eq("sender", "admin").eq("read_by_user", false);
        if (markError) throw markError;
      }
      const { data: messages, error: listError } = await db.from("support_chat_messages").select("id,sender,message,created_at")
        .eq("thread_id", threadId).order("created_at", { ascending: true });
      if (listError) throw listError;
      return json({ success: true, email: thread.email, display_name: thread.display_name, messages });
    }

    if (action === "admin_broadcast") {
      if (!isAdmin) return json({ error: "فقط مدیر اجازه ارسال پیام همگانی را دارد." }, 403);
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message || message.length > 4000) return json({ error: "پیام باید بین ۱ تا ۴۰۰۰ نویسه باشد." }, 400);
      const { data: threads, error: threadsError } = await db.from("support_chat_threads")
        .select("id").order("created_at", { ascending: true }).limit(5000);
      if (threadsError) throw threadsError;
      if (!threads || !threads.length) return json({ success: true, sent_count: 0, message: "هنوز گفتگویی برای ارسال پیام وجود ندارد." });
      const now = new Date().toISOString();
      const rows = threads.map((thread) => ({
        thread_id: thread.id,
        sender: "admin",
        message,
        read_by_user: false,
        read_by_admin: true
      }));
      const { error: insertError } = await db.from("support_chat_messages").insert(rows);
      if (insertError) throw insertError;
      const { error: updateError } = await db.from("support_chat_threads").update({ updated_at: now }).in("id", threads.map((thread) => thread.id));
      if (updateError) throw updateError;
      return json({ success: true, sent_count: threads.length });
    }

    if (action === "admin_list" || action === "admin_read" || action === "admin_reply") {
      if (!isAdmin) return json({ error: "فقط مدیر اجازه دسترسی به پیام‌ها را دارد." }, 403);
      if (action === "admin_list") {
        const { data: threads, error } = await db.from("support_chat_threads")
          .select("id,email,display_name,created_at,updated_at").order("updated_at", { ascending: false }).limit(200);
        if (error) throw error;
        const ids = (threads || []).map((thread) => thread.id);
        let unreadByThread: Record<string, number> = {};
        if (ids.length) {
          const { data: unreadMessages, error: unreadError } = await db.from("support_chat_messages")
            .select("thread_id").in("thread_id", ids).eq("sender", "user").eq("read_by_admin", false);
          if (unreadError) throw unreadError;
          for (const message of unreadMessages || []) unreadByThread[message.thread_id] = (unreadByThread[message.thread_id] || 0) + 1;
        }
        return json({ success: true, threads: (threads || []).map((thread) => ({
          ...thread, unread_count: unreadByThread[thread.id] || 0,
        })) });
      }

      const threadId = typeof body.thread_id === "string" ? body.thread_id : "";
      if (!threadId) return json({ error: "گفتگو انتخاب نشده است." }, 400);
      if (action === "admin_reply") {
        const message = typeof body.message === "string" ? body.message.trim() : "";
        if (!message || message.length > 4000) return json({ error: "پیام باید بین ۱ تا ۴۰۰۰ نویسه باشد." }, 400);
        const { error } = await db.from("support_chat_messages")
          .insert({ thread_id: threadId, sender: "admin", message, read_by_user: false, read_by_admin: true });
        if (error) throw error;
        await db.from("support_chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
      }
      if (action === "admin_read") {
        const { error: markError } = await db.from("support_chat_messages").update({ read_by_admin: true })
          .eq("thread_id", threadId).eq("sender", "user").eq("read_by_admin", false);
        if (markError) throw markError;
      }
      const { data: messages, error } = await db.from("support_chat_messages").select("id,sender,message,created_at")
        .eq("thread_id", threadId).order("created_at", { ascending: true });
      if (error) throw error;
      return json({ success: true, messages });
    }
    return json({ error: "عملیات ناشناخته است." }, 400);
  } catch (error) {
    console.error("support-chat error:", error);
    return json({ error: "خطای سرور در پیام‌رسانی. ساختار جدول‌های چت را در Supabase بررسی کن." }, 500);
  }
});
