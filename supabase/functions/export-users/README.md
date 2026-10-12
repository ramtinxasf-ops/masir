# Exporting registered users from Masir

The static GitHub Pages frontend cannot safely read every account from Supabase Auth directly. The CSV export therefore uses a Supabase Edge Function with server-side authorization.

## One-time Supabase setup

1. Deploy `supabase/functions/export-users/index.ts` as an Edge Function named `export-users`.
2. Ensure the function has these server-side secrets configured: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Supabase normally provides the project URL and service-role key to Edge Functions; configure any missing values using the Supabase dashboard/CLI. **Never put the service-role key in `index.html`, GitHub, or the browser.**
3. In Supabase Dashboard → Authentication → Users, open the owner's account and set server-controlled **App Metadata** to include `{"role":"admin"}`. Do not put this role in User Metadata, because users can edit their own User Metadata. Sign out and back in after changing the role so the new claim appears in the session token.
4. In Edge Function settings, keep JWT verification enabled. The function also validates the session and independently checks `app_metadata.role === "admin"`.
5. Test with an admin account and a regular account. Only the admin should see the CSV button and only the admin token should be accepted by the function.

## Export contents

The downloaded UTF-8 CSV includes name, surname, phone, email, and account creation timestamp. It contains no passwords or password hashes. A UTF-8 BOM is included for compatibility with Excel. The function disables caching and escapes spreadsheet-formula-like values.

This endpoint exports the account directory from Supabase Auth; it does not send the data to a third party. Keep downloaded files in a protected location and delete them when no longer needed.
