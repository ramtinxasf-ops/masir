const { test, expect } = require("@playwright/test");

test("activity category can be created, changed, and saved without a real Supabase account", async ({ page }) => {
  test.setTimeout(45000);
  page.on("pageerror", error => console.log("PAGE ERROR:", error.stack || error.message));
  page.on("console", message => { if (message.type() === "error") console.log("BROWSER ERROR:", message.text()); });
  page.on("dialog", dialog => dialog.accept());
  await page.addInitScript(() => {
    window.__mockState = { rows: [], upserts: [] };
    const user = { id: "playwright-test-user", email: "masir-test@example.invalid", app_metadata: { role: "admin" } };
    const session = { user };
    window.__testSupabase = {
      createClient: () => ({
        auth: {
          getSession: async () => ({ data: { session: { user, access_token: "test-access-token" } }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          signInWithPassword: async () => ({ data: { user, session }, error: null }),
          signUp: async () => ({ data: { user, session }, error: null }),
          signOut: async () => ({ error: null }),
          updateUser: async ({ data }) => ({ data: { user: { ...user, user_metadata: data } }, error: null }),
          resetPasswordForEmail: async () => ({ error: null }),
          signInWithOtp: async () => ({ error: null }),
          verifyOtp: async () => ({ data: { user, session }, error: null })
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
    if (url.includes("/functions/v1/export-users")) return route.fulfill({ status: 200, contentType: "text/csv; charset=utf-8", headers: { "Content-Disposition": 'attachment; filename="masir-users-test.csv"' }, body: '\uFEFF"نام","نام خانوادگی","تلفن","ایمیل","تاریخ ثبت‌نام"\r\n"کاربر","آزمایشی","+989123456789","test@example.invalid","2026-10-11T00:00:00Z"\r\n' });
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
    window.masirCurrentUser = { id: "playwright-test-user", email: "masir-test@example.invalid", app_metadata: { role: "admin" } };
    document.getElementById("masir-auth-overlay").style.display = "none";
  });

  console.log("STEP: mock user set");

  // Profile details save to Supabase user metadata and remain editable.
  await page.evaluate(() => showPage("profile"));
  console.log("STEP: profile page opened");
  await expect(page.locator("#adminUserExportPanel")).toBeVisible();
  const csvDownloadPromise = page.waitForEvent("download");
  await page.locator("#exportUsersCsvButton").click();
  const csvDownload = await csvDownloadPromise;
  expect(csvDownload.suggestedFilename()).toBe("masir-users-test.csv");
  await expect(page.locator("#adminUserExportMessage")).toContainText("دانلود شد");
  await page.locator("#profileFirstName").fill("رامتین");
  console.log("STEP: profile first name filled");
  await page.locator("#profileLastName").fill("آزمایشی");
  await page.locator("#profilePhoneInput").fill("+989123456789");
  await page.locator("#profileBirthDate").fill("1998-04-23");
  console.log("STEP: profile fields filled");
  await page.locator("#saveProfileButton").click();
  console.log("STEP: profile save clicked");
  await expect(page.locator("#profileSaveMessage")).toContainText("ذخیره شد");
  await expect(page.locator("#profileEmail")).toContainText("masir-test@example.invalid");
  await expect(page.locator("#profileLogoutArea button")).toContainText("خروج از حساب");

  // Password requirements update while typing; phone OTP panel can be selected.
  await page.evaluate(() => { document.getElementById("masir-auth-overlay").style.display = "flex"; });
  await page.locator("#masir-password").fill("weak");
  await expect(page.locator('#masir-password-rules [data-rule="length"]')).toContainText("○");
  await page.locator("#masir-password").fill("StrongPass1");
  await expect(page.locator('#masir-password-rules [data-rule="length"]')).toContainText("✓");
  await expect(page.locator('#masir-password-rules [data-rule="upper"]')).toContainText("✓");
  await expect(page.locator('#masir-password-rules [data-rule="number"]')).toContainText("✓");
  await page.locator("#masir-phone-tab").click();
  await expect(page.locator("#masir-phone-auth")).toBeVisible();
  await page.evaluate(() => { document.getElementById("masir-auth-overlay").style.display = "none"; });

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

  console.log("STEP: waiting for local save");
  await expect.poll(async () => page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("masir_activities_v1_playwright-test-user") || "[]");
    return saved.some(activity => activity.name === "فعالیت آزمایشی دسته‌بندی" && activity.category === "work");
  }), { timeout: 10000 }).toBe(true);
  console.log("STEP: local save verified");
  await page.evaluate(async () => { await window.masirSaveQueue; });
  console.log("STEP: save queue settled");
  await expect.poll(async () => page.evaluate(() =>
    window.__mockState.rows.some(row => row.data?.name === "فعالیت آزمایشی دسته‌بندی" && row.data?.category === "work")
  ), { timeout: 10000 }).toBe(true);
  console.log("STEP: server mock save verified");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("masir_activities_v1_playwright-test-user") || "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0].category).toBe("work");
  expect(await page.evaluate(() => window.__mockState.upserts.length)).toBeGreaterThan(0);

  await page.locator("#activityCategoryFilter").evaluate(select => {
    select.value = "study";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator("#activityList .activity-item")).toHaveCount(0);
  await expect(page.locator("#activityList .empty-message")).toContainText("با این دسته‌بندی");
  await expect(page.locator("#activityFilterCount")).toContainText("۰ از ۱");

  await page.locator("#activityCategoryFilter").evaluate(select => {
    select.value = "work";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator("#activityList .activity-item")).toHaveCount(1);
  await expect(page.locator("#activityFilterCount")).toContainText("۱ از ۱");

  await page.locator("#activityCategoryFilter").evaluate(select => {
    select.value = "all";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator("#activityList .activity-item")).toHaveCount(1);
  await expect(page.locator("#activityFilterCount")).toContainText("همه فعالیت‌ها");

  // The calendar's notion of today must follow Baku even when the browser timezone is behind UTC.
  const bakuBoundaryKey = await page.evaluate(() =>
    getDateKey(getTodayDate(new Date("2026-10-11T21:30:00.000Z")))
  );
  expect(bakuBoundaryKey).toBe("2026-10-12");
  expect(await page.evaluate(() =>
    getPersianDateInputValue(getTodayDate(new Date("2026-10-11T21:30:00.000Z")))
  )).toBe("۱۴۰۵/۰۷/۲۰");

  // Calendar navigation: direct date jump updates the selected day and weekly report.
  await page.evaluate(() => showPage("home"));
  const dateJump = page.locator("#calendarDateJump");
  await expect(dateJump).toHaveValue(/^۱۴[۰-۹]{2}\/[۰-۹]{2}\/[۰-۹]{2}$/);
  await dateJump.evaluate(input => {
    input.value = "۱۴۰۵/۰۷/۲۹";
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(dateJump).toHaveValue("۱۴۰۵/۰۷/۲۹");
  expect(await page.evaluate(() => getDateKey(selectedDate))).toBe("2026-10-21");
  await expect(page.locator("#calendarMonth")).not.toBeEmpty();
  await expect(page.locator("#reportWeekLabel")).not.toBeEmpty();

  await page.locator("#previousWeekButton").click();
  expect(await page.evaluate(() => getDateKey(selectedDate))).toBe("2026-10-14");
  await expect(dateJump).toHaveValue("۱۴۰۵/۰۷/۲۲");

  await page.locator("#nextWeekButton").click();
  expect(await page.evaluate(() => getDateKey(selectedDate))).toBe("2026-10-21");
  await expect(dateJump).toHaveValue("۱۴۰۵/۰۷/۲۹");

  await page.locator("#todayButton").click();
  const todayKey = await page.evaluate(() => getDateKey(new Date()));
  expect(await page.evaluate(() => getDateKey(selectedDate))).toBe(todayKey);
  await expect(dateJump).toHaveValue(await page.evaluate(() => getPersianDateInputValue(new Date())));
});
