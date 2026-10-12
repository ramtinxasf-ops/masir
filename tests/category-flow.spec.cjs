const { test, expect } = require("@playwright/test");

test("activity category can be created, changed, and saved without a real Supabase account", async ({ page }) => {
  test.setTimeout(45000);
  page.on("pageerror", error => console.log("PAGE ERROR:", error.stack || error.message));
  page.on("console", message => { if (message.type() === "error") console.log("BROWSER ERROR:", message.text()); });
  page.on("dialog", dialog => dialog.accept());
  await page.addInitScript(() => {
    window.__mockState = { rows: [], upserts: [] };
    const user = { id: "playwright-test-user", email: "masir-test@example.invalid" };
    const session = { user };
    window.__testSupabase = {
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

  await page.route("**/*", route => {
    const url = route.request().url();
    if (url.startsWith("http://127.0.0.1:4173/")) return route.continue();
    if (url.includes("cdn.jsdelivr.net/npm/@supabase/supabase-js@2")) {
      return route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "window.supabase = window.__testSupabase;"
      });
    }
    return route.abort();
  });
  console.log("STEP: opening app");
  await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "domcontentloaded", timeout: 15000 });
  console.log("STEP: app loaded");
  // Category flow test only: bypass the login UI and set a synthetic test user.
  // All Supabase calls remain mocked; no real account or production data is used.
  await page.evaluate(() => {
    window.masirCurrentUser = { id: "playwright-test-user", email: "masir-test@example.invalid" };
    document.getElementById("masir-auth-overlay").style.display = "none";
  });

  console.log("STEP: mock user set");
  await page.evaluate(() => showPage("planning"));
  console.log("STEP: planning page opened");
  await page.locator("#activityName").fill("فعالیت آزمایشی دسته‌بندی");
  await page.locator("#activityCategory").selectOption("study");
  await page.locator("#startTime").fill("09:00");
  await page.locator("#endTime").fill("10:00");
  await page.locator("#dailyOption").check();
  console.log("STEP: submitting activity");
  await page.locator("#activityForm button[type='submit']").click();
  console.log("STEP: activity submitted");

  await expect(page.locator("#activityCategoryFilter")).toHaveValue("all");
  await expect(page.locator("#activityList .activity-item")).toHaveCount(1);

  const categorySelect = page.locator("#activityList select.activity-category").first();
  await expect(categorySelect).toHaveValue("study");
  console.log("STEP: category select verified");
  await categorySelect.evaluate(select => {
    select.value = "work";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  console.log("STEP: category change event dispatched");

  await expect.poll(async () => page.evaluate(() =>
    window.__mockState.rows.some(row => row.data?.name === "فعالیت آزمایشی دسته‌بندی" && row.data?.category === "work")
  )).toBe(true);

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("masir_activities_v1_playwright-test-user") || "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0].category).toBe("work");
  expect(await page.evaluate(() => window.__mockState.upserts.length)).toBeGreaterThan(0);

  await page.locator("#activityCategoryFilter").selectOption("study");
  await expect(page.locator("#activityList .activity-item")).toHaveCount(0);
  await expect(page.locator("#activityList .empty-message")).toContainText("با این دسته‌بندی");
  await expect(page.locator("#activityFilterCount")).toContainText("۰ از ۱");

  await page.locator("#activityCategoryFilter").selectOption("work");
  await expect(page.locator("#activityList .activity-item")).toHaveCount(1);
  await expect(page.locator("#activityFilterCount")).toContainText("۱ از ۱");

  await page.locator("#activityCategoryFilter").selectOption("all");
  await expect(page.locator("#activityList .activity-item")).toHaveCount(1);
  await expect(page.locator("#activityFilterCount")).toContainText("همه فعالیت‌ها");
});
