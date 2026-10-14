const { test, expect } = require("@playwright/test");

test("activity category can be created, changed, and saved without a real Supabase account", async ({ page }) => {
  test.setTimeout(30000);
  page.on("pageerror", error => console.log("PAGE ERROR:", error.stack || error.message));
  page.on("console", message => { if (message.type() === "error") console.log("BROWSER ERROR:", message.text()); });
  page.on("dialog", dialog => dialog.accept());
  await page.addInitScript(() => {
    window.__mockState = { rows: [], upserts: [], updates: [], signOutCalls: 0, resetPasswordCalls: [] };
    const user = { id: "playwright-test-user", email: "ramtinxasf@gmail.com", app_metadata: { role: "admin" }, user_metadata: { first_name: "آزمایشی", last_name: "کاربر", phone: "+989123456789", birth_date: "1998-04-23" } };
    const session = { user };
    window.__testSupabase = {
      createClient: () => ({
        auth: {
          getSession: async () => ({ data: { session: { user, access_token: "test-access-token" } }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          signInWithPassword: async () => ({ data: { user, session }, error: null }),
          signUp: async () => ({ data: { user, session }, error: null }),
          signOut: async () => { window.__mockState.signOutCalls += 1; return { error: null }; },
          updateUser: async ({ data }) => { window.__mockState.updates.push(data); return { data: { user: { ...user, user_metadata: data } }, error: null }; },
          resetPasswordForEmail: async (email, options) => { window.__mockState.resetPasswordCalls.push({ email, options }); return { error: null }; },
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
    if (url.includes("/functions/v1/export-users")) return route.fulfill({ status: 200, contentType: "text/plain; charset=utf-8", headers: { "Content-Disposition": 'attachment; filename="masir-users-test.txt"' }, body: '\uFEFFکاربر شماره ۱\r\nنام: کاربر\r\nنام خانوادگی: آزمایشی\r\nتلفن: +989123456789\r\nایمیل: test@example.invalid\r\nتاریخ ثبت‌نام: ۱۴۰۵/۰۷/۱۹' });
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
    window.masirCurrentUser = { id: "playwright-test-user", email: "ramtinxasf@gmail.com", app_metadata: { role: "admin" }, user_metadata: { first_name: "آزمایشی", last_name: "کاربر", phone: "+989123456789", birth_date: "1998-04-23" } };
    document.getElementById("masir-auth-overlay").style.display = "none";
    window.masirPopulateProfile(window.masirCurrentUser);
  });

  console.log("STEP: mock user set");

  // Profile page is read-only; edits are available only from Settings.
  await page.evaluate(() => showPage("profile"));
  await expect(page.locator("#profileEmail")).toHaveText("ramtinxasf@gmail.com");
  await expect(page.locator("#profileReadOnlyFirstName")).toHaveText("آزمایشی");
  await expect(page.locator("#profileReadOnlyLastName")).toHaveText("کاربر");
  await expect(page.locator("#profileReadOnlyBirthDate")).toHaveText("1998-04-23");
  await expect(page.locator("#profileSection #profileForm")).toHaveCount(0);
  await expect(page.locator("#profileSection #appInfoButton")).toHaveCount(0);

  await page.evaluate(() => showPage("settings"));
  await page.locator("#profileFirstName").fill("رامتین");
  await page.locator("#profileLastName").fill("آزمایشی");
  await page.locator("#profilePhoneInput").fill("+989111111111");
  await page.locator("#profileBirthDate").fill("1998-04-24");
  await page.locator("#saveProfileButton").click();
  await expect(page.locator("#profileSaveMessage")).toContainText("ذخیره شد");
  await expect.poll(() => page.evaluate(() => window.__mockState.updates.length)).toBe(1);
  await page.evaluate(() => showPage("profile"));
  await expect(page.locator("#profileReadOnlyFirstName")).toHaveText("رامتین");
  await expect(page.locator("#profileReadOnlyLastName")).toHaveText("آزمایشی");
  await expect(page.locator("#profileReadOnlyBirthDate")).toHaveText("1998-04-24");

  // Password recovery must be available to regular accounts, not only the administrator.
  await page.evaluate(() => { document.getElementById("masir-auth-overlay").style.display = "flex"; });
  await page.locator("#masir-email").fill("user@example.com");
  await expect(page.locator("#masir-forgot-password")).toBeVisible();
  await page.locator("#masir-forgot-password").click();
  await expect.poll(() => page.evaluate(() => window.__mockState.resetPasswordCalls.length)).toBe(1);
  expect(await page.evaluate(() => window.__mockState.resetPasswordCalls[0].email)).toBe("user@example.com");
  await page.evaluate(() => { document.getElementById("masir-auth-overlay").style.display = "none"; });

  // Continue with category and calendar regression checks.
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
    localizedDateInputValue(getTodayDate(new Date("2026-10-11T21:30:00.000Z")))
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
  await expect(dateJump).toHaveValue(await page.evaluate(() => localizedDateInputValue(new Date())));

  // Japanese dates include an era prefix; the input and parser must agree.
  await page.evaluate(() => {
    const picker = document.getElementById("appLanguage");
    picker.value = "ja";
    picker.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(dateJump).toHaveAttribute("placeholder", "令和8/10/13");
  await dateJump.evaluate(input => {
    input.value = "令和8/10/21";
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(dateJump).toHaveValue("令和8/10/21");
  expect(await page.evaluate(() => getDateKey(selectedDate))).toBe("2026-10-21");

  // The calendar placeholder and date parser must stay synchronized for every supported language.
  const languageExamples = { en: "2026/10/13", ar: "١٤٤٨/٠٤/٠١", tr: "2026/10/13" };
  for (const language of ["en", "ar", "tr"]) {
    await page.evaluate(language => {
      const picker = document.getElementById("appLanguage");
      picker.value = language;
      picker.dispatchEvent(new Event("change", { bubbles: true }));
    }, language);
    await expect(dateJump).toHaveAttribute("placeholder", languageExamples[language]);
    const localizedValue = await page.evaluate(() => localizedDateInputValue(new Date(2026, 9, 21, 12)));
    await dateJump.evaluate((input, value) => {
      input.value = value;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, localizedValue);
    expect(await page.evaluate(() => getDateKey(selectedDate))).toBe("2026-10-21");
  }

  // Regression check: the account action must call Supabase signOut.
  await page.evaluate(() => {
    const button = document.querySelector("#settingsAccountActions button");
    if (!button) throw new Error("Logout button was not added to account settings.");
    button.click();
  });
  await expect.poll(() => page.evaluate(() => window.__mockState.signOutCalls)).toBe(1);
});
