const { test, expect } = require("@playwright/test");

test("activity category can be created, changed, and saved without a real Supabase account", async ({ page }) => {
  test.setTimeout(60000);
  page.on("pageerror", error => console.log("PAGE ERROR:", error.stack || error.message));
  page.on("console", message => { if (message.type() === "error") console.log("BROWSER ERROR:", message.text()); });
  await page.addInitScript(() => {
    window.__mockState = { rows: [], upserts: [] };
    const user = { id: "playwright-test-user", email: "masir-test@example.invalid" };
    const session = { user };
    window.supabase = {
      createClient: () => ({
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          signInWithPassword: async () => ({ data: { user, session }, error: null }),
          signUp: async () => ({ data: { user, session }, error: null }),
          signOut: async () => ({ error: null })
        },
        from: (table) => ({
          select: function () { return this; },
          eq: function () { return this; },
          then: function (resolve, reject) {
            return Promise.resolve({
              data: window.__mockState.rows.map(row => ({ ...row })),
              error: null
            }).then(resolve, reject);
          },
          upsert: async (rows) => {
            window.__mockState.upserts.push(JSON.parse(JSON.stringify(rows)));
            for (const row of rows) {
              const index = window.__mockState.rows.findIndex(
                saved => saved.user_id === row.user_id && saved.activity_id === row.activity_id
              );
              if (index >= 0) window.__mockState.rows[index] = JSON.parse(JSON.stringify(row));
              else window.__mockState.rows.push(JSON.parse(JSON.stringify(row)));
            }
            return { error: null };
          }
        })
      })
    };
  });

  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.abort());
  await page.goto("http://127.0.0.1:4173/index.html");
  await page.locator("#masir-email").fill("masir-test@example.invalid");
  await page.locator("#masir-password").fill("safe-test-password");
  await page.locator("#masir-login").click();
  await expect(page.locator("#masir-auth-overlay")).toBeHidden({ timeout: 15000 }).catch(async error => {
    console.log("AUTH DEBUG:", await page.locator("#masir-auth-message").innerText());
    console.log("OVERLAY DISPLAY:", await page.locator("#masir-auth-overlay").evaluate(el => getComputedStyle(el).display));
    throw error;
  });

  await page.evaluate(() => showPage("planning"));
  await page.locator("#activityName").fill("فعالیت آزمایشی دسته‌بندی");
  await page.locator("#activityCategory").selectOption("study");
  await page.locator("#startTime").fill("09:00");
  await page.locator("#endTime").fill("10:00");
  await page.locator("#dailyOption").check();
  page.once("dialog", dialog => dialog.accept());
  await page.locator("#activityForm button[type='submit']").click();

  const categorySelect = page.locator("#activityList select.activity-category").first();
  await expect(categorySelect).toHaveValue("study");
  await categorySelect.selectOption("work");

  await expect.poll(async () => page.evaluate(() =>
    window.__mockState.rows.some(row => row.data?.name === "فعالیت آزمایشی دسته‌بندی" && row.data?.category === "work")
  )).toBe(true);

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("masir_activities_v1_playwright-test-user") || "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0].category).toBe("work");
  expect(await page.evaluate(() => window.__mockState.upserts.length)).toBeGreaterThan(0);
});
