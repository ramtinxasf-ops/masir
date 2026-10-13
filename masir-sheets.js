/* Masir sheets: isolated UI layer. Keeps existing planner/auth logic untouched. */
(() => {
  "use strict";
  if (window.__masirSheetsInitialized) return;
  window.__masirSheetsInitialized = true;

  const LANG_KEY = "masir_app_language_v1";
  const NOTES_KEY = "masir_notes_v1";
  const CALENDAR_KEY = "masir_calendar_preferences_v1";
  const dict = {
    fa: {menu:"منوی مسیر",profile:"پروفایل من",settings:"تنظیمات",password:"تغییر رمز عبور",notes:"یادداشت‌ها",calendar:"تقویم",about:"درباره مسیر",back:"بازگشت",close:"بستن",language:"زبان برنامه",save:"ذخیره",saved:"ذخیره شد.",notePlaceholder:"یادداشتت را اینجا بنویس…",calendarType:"نوع تقویم",country:"کشور",gregorian:"میلادی",jalali:"شمسی",hijri:"قمری",japanese:"ژاپنی",selectCountry:"انتخاب کشور",iran:"ایران",azerbaijan:"آذربایجان",turkey:"ترکیه",japan:"ژاپن",other:"سایر",accountInfo:"برای مدیریت اطلاعات حساب، خروج یا حذف حساب، از بخش پروفایل اصلی استفاده کن.",manageProfile:"رفتن به پروفایل اصلی",managePassword:"رفتن به تنظیمات امنیت حساب",aboutText:"مسیر، برنامه‌ریز شخصی برای مدیریت فعالیت‌ها، پیگیری پیشرفت و ساختن عادت‌های روزانه است.",developer:"برنامه‌نویس",email:"ایمیل مدیر",emailLabel:"ایمیل حساب",phoneLabel:"شماره تلفن",security:"امنیت حساب",backup:"پشتیبان‌گیری",signOut:"خروج از حساب",deleteAccount:"حذف حساب",openSecurity:"باز کردن بخش امنیت حساب",openBackup:"باز کردن پشتیبان‌گیری",logoutHint:"برای خروج، دکمه اصلی حساب اجرا می‌شود.",deleteHint:"حذف حساب برگشت‌ناپذیر است و از تأیید خود برنامه استفاده می‌کند.",notesLocalHint:"یادداشت‌ها روی همین دستگاه ذخیره می‌شوند.",languageHint:"زبان انتخابی برای بخش‌های جدید ذخیره می‌شود و به تنظیم زبان اصلی برنامه نیز منتقل می‌شود.",calendarHint:"این انتخاب‌ها ذخیره می‌شوند؛ اتصال آن‌ها به نمایش تقویم اصلی را در مرحله بعد انجام می‌دهیم."},
    en: {menu:"Masir menu",profile:"My profile",settings:"Settings",password:"Change password",notes:"Notes",calendar:"Calendar",about:"About Masir",back:"Back",close:"Close",language:"App language",save:"Save",saved:"Saved.",notePlaceholder:"Write your note here…",calendarType:"Calendar type",country:"Country",gregorian:"Gregorian",jalali:"Jalali",hijri:"Hijri",japanese:"Japanese",selectCountry:"Choose a country",iran:"Iran",azerbaijan:"Azerbaijan",turkey:"Türkiye",japan:"Japan",other:"Other",accountInfo:"To manage account details, sign out, or delete your account, use the main profile section.",manageProfile:"Open main profile",managePassword:"Open account security settings",aboutText:"Masir is a personal planner for organizing activities, tracking progress, and building daily habits.",developer:"Developer",email:"Admin email",languageHint:"The selected language is saved for these sheets and also synced to the main app language setting.",calendarHint:"These preferences are saved; connecting them to the main calendar display will be done in the next step."},
    ar: {menu:"قائمة مسير",profile:"ملفي الشخصي",settings:"الإعدادات",password:"تغيير كلمة المرور",notes:"الملاحظات",calendar:"التقويم",about:"حول مسير",back:"رجوع",close:"إغلاق",language:"لغة التطبيق",save:"حفظ",saved:"تم الحفظ.",notePlaceholder:"اكتب ملاحظتك هنا…",calendarType:"نوع التقويم",country:"الدولة",gregorian:"ميلادي",jalali:"جلالي",hijri:"هجري",japanese:"ياباني",selectCountry:"اختر دولة",iran:"إيران",azerbaijan:"أذربيجان",turkey:"تركيا",japan:"اليابان",other:"أخرى",accountInfo:"لإدارة الحساب أو تسجيل الخروج أو حذف الحساب، استخدم قسم الملف الشخصي الرئيسي.",manageProfile:"فتح الملف الشخصي",managePassword:"فتح إعدادات أمان الحساب",aboutText:"مسير مخطط شخصي لتنظيم الأنشطة ومتابعة التقدم وبناء العادات اليومية.",developer:"المطوّر",email:"بريد المدير",languageHint:"يتم حفظ اللغة المختارة لهذه الصفحات ومزامنتها مع إعداد اللغة الرئيسي.",calendarHint:"تم حفظ هذه التفضيلات؛ وسيتم ربطها بالتقويم الرئيسي في خطوة لاحقة."},
    tr: {menu:"Masir menüsü",profile:"Profilim",settings:"Ayarlar",password:"Şifreyi değiştir",notes:"Notlar",calendar:"Takvim",about:"Masir hakkında",back:"Geri",close:"Kapat",language:"Uygulama dili",save:"Kaydet",saved:"Kaydedildi.",notePlaceholder:"Notunu buraya yaz…",calendarType:"Takvim türü",country:"Ülke",gregorian:"Miladi",jalali:"Celali",hijri:"Hicri",japanese:"Japon",selectCountry:"Ülke seç",iran:"İran",azerbaijan:"Azerbaycan",turkey:"Türkiye",japan:"Japonya",other:"Diğer",accountInfo:"Hesap bilgileri, çıkış veya hesap silme işlemleri için ana profil bölümünü kullan.",manageProfile:"Ana profili aç",managePassword:"Hesap güvenliği ayarlarını aç",aboutText:"Masir; etkinlikleri düzenlemek, ilerlemeyi izlemek ve günlük alışkanlıklar oluşturmak için kişisel bir planlayıcıdır.",developer:"Geliştirici",email:"Yönetici e-postası",languageHint:"Seçilen dil bu sayfalar için kaydedilir ve ana uygulama diline aktarılır.",calendarHint:"Tercihler kaydedilir; ana takvime bağlama işlemi sonraki adımda yapılacaktır."},
    ja: {menu:"Masir メニュー",profile:"プロフィール",settings:"設定",password:"パスワード変更",notes:"メモ",calendar:"カレンダー",about:"Masir について",back:"戻る",close:"閉じる",language:"アプリの言語",save:"保存",saved:"保存しました。",notePlaceholder:"ここにメモを入力…",calendarType:"カレンダーの種類",country:"国",gregorian:"西暦",jalali:"ジャラーリー",hijri:"ヒジュラ暦",japanese:"和暦",selectCountry:"国を選択",iran:"イラン",azerbaijan:"アゼルバイジャン",turkey:"トルコ",japan:"日本",other:"その他",accountInfo:"アカウント情報、ログアウト、削除はメインのプロフィール画面から操作してください。",manageProfile:"プロフィールを開く",managePassword:"アカウントセキュリティを開く",aboutText:"Masir は、活動の整理、進捗の確認、毎日の習慣づくりを支援する個人用プランナーです。",developer:"開発者",email:"管理者メール",languageHint:"選択した言語を保存し、メインアプリの言語設定にも同期します。",calendarHint:"設定を保存しました。メインカレンダーへの反映は次の段階で行います。"}
  };
  const getLang = () => {
    try { const el = document.getElementById("appLanguage"); const v = el && el.value; if (dict[v]) return v; const saved = localStorage.getItem(LANG_KEY); return dict[saved] ? saved : "fa"; }
    catch (_) { return "fa"; }
  };
  const t = key => dict[getLang()]?.[key] || dict.fa[key] || key;
  const safeRead = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; } };
  const safeWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };

  const style = document.createElement("style");
  style.id = "masirSheetsStyles";
  style.textContent = `
    #masirSheetsOpen{position:fixed;top:12px;right:12px;z-index:9000;width:44px;height:44px;border:1px solid #514477;border-radius:13px;background:#211b38;color:#f3e8ff;font-size:23px;box-shadow:0 5px 18px #0003}
    #masirSheetsShade[hidden],#masirSheetsPanel[hidden],#masirSheetsPanel [hidden]{display:none!important}
    #masirSheetsShade{position:fixed;inset:0;z-index:9001;background:#050816b8;backdrop-filter:blur(3px)}
    #masirSheetsPanel{position:fixed;inset:0 0 0 auto;width:min(430px,92vw);height:100dvh;overflow:auto;z-index:9002;background:linear-gradient(155deg,#15182a,#21182f);color:#f8fafc;border-left:1px solid #514477;box-shadow:-15px 0 45px #0005;padding:16px;box-sizing:border-box}
    #masirSheetsPanel *{box-sizing:border-box}
    #masirSheetsPanel button,#masirSheetsPanel select,#masirSheetsPanel textarea{font:inherit}
    #masirSheetsPanel button{cursor:pointer;border:1px solid #514477;border-radius:10px;padding:10px 12px;background:#302541;color:#f3e8ff}
    #masirSheetsPanel .ms-head{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #393452;padding-bottom:14px;margin-bottom:14px}
    #masirSheetsPanel .ms-title{font-size:21px;color:#d8b4fe;margin:0}
    #masirSheetsPanel .ms-menu-item{width:100%;display:flex;align-items:center;gap:10px;text-align:start;margin:7px 0;padding:14px;background:#151c30;border-color:#303b57}
    #masirSheetsPanel .ms-menu-item span:last-child{margin-inline-start:auto;color:#c4b5fd;font-size:20px}
    #masirSheetsPanel .ms-card{border:1px solid #393452;background:#171d31;border-radius:14px;padding:15px;margin:12px 0;line-height:1.9}
    #masirSheetsPanel label{display:block;margin:12px 0 6px;color:#ddd6fe}
    #masirSheetsPanel select,#masirSheetsPanel textarea{display:block;width:100%;padding:12px;border-radius:10px;border:1px solid #514477;background:#0d1426;color:#f8fafc}
    #masirSheetsPanel textarea{min-height:190px;resize:vertical;line-height:1.8}
    #masirSheetsPanel .ms-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
    #masirSheetsPanel .ms-muted{font-size:12px;color:#a5b4cc;line-height:1.8}
    #masirSheetsPanel .ms-status{min-height:1.6em;color:#a7f3d0;font-size:13px}
    #masirSheetsPanel .ms-primary{background:#6d28d9;border-color:#8b5cf6;color:white}
    @media(max-width:520px){#masirSheetsOpen{top:8px;right:8px;width:40px;height:40px}#masirSheetsPanel{width:88vw;padding:13px}}
  `;
  document.head.appendChild(style);

  const button = document.createElement("button");
  button.type = "button"; button.id = "masirSheetsOpen"; button.textContent = "☰";
  button.setAttribute("aria-label", "Open Masir menu"); button.title = "Masir";
  const shade = document.createElement("div"); shade.id = "masirSheetsShade"; shade.hidden = true;
  const panel = document.createElement("aside"); panel.id = "masirSheetsPanel"; panel.hidden = true;
  panel.setAttribute("aria-label", "Masir menu");
  panel.innerHTML = `
    <div class="ms-head"><h2 class="ms-title" id="msTitle"></h2><button type="button" id="msClose" aria-label="Close">×</button></div>
    <section id="msMenu">
      <button class="ms-menu-item" type="button" data-sheet="profile">👤 <span data-label="profile"></span><span>‹</span></button>
      <button class="ms-menu-item" type="button" data-sheet="settings">⚙️ <span data-label="settings"></span><span>‹</span></button>
      <button class="ms-menu-item" type="button" data-sheet="password">🔐 <span data-label="password"></span><span>‹</span></button>
      <button class="ms-menu-item" type="button" data-sheet="notes">📝 <span data-label="notes"></span><span>‹</span></button>
      <button class="ms-menu-item" type="button" data-sheet="calendar">🗓️ <span data-label="calendar"></span><span>‹</span></button>
      <button class="ms-menu-item" type="button" data-sheet="about">💜 <span data-label="about"></span><span>‹</span></button>
    </section>
    <section id="msPage" hidden><div class="ms-actions"><button type="button" id="msBack">← <span data-label="back"></span></button></div><div id="msContent"></div></section>`;
  document.body.append(button, shade, panel);

  let activeSheet = "";
  function closePanel() { shade.hidden = true; panel.hidden = true; activeSheet = ""; document.body.style.overflow = ""; }
  function openPanel() { shade.hidden = false; panel.hidden = false; document.body.style.overflow = "hidden"; showMenu(); }
  function showMenu() {
    activeSheet = ""; panel.querySelector("#msMenu").hidden = false; panel.querySelector("#msPage").hidden = true;
    panel.querySelector("#msTitle").textContent = t("menu");
    panel.querySelectorAll("[data-label]").forEach(el => { el.textContent = t(el.dataset.label); });
    panel.querySelector("#msClose").setAttribute("aria-label", t("close"));
  }
  function showSheet(name) {
    activeSheet = name; panel.querySelector("#msMenu").hidden = true; panel.querySelector("#msPage").hidden = false;
    panel.querySelector("#msTitle").textContent = t(name);
    const content = panel.querySelector("#msContent");
    if (name === "profile") {
      const email = document.getElementById("profileEmail")?.textContent?.trim() || "—";
      const phone = document.getElementById("profilePhone")?.textContent?.trim() || "—";
      content.innerHTML = '<div class="ms-card"><p><strong data-email-label></strong><br><span id="msProfileEmail"></span></p><p><strong data-phone-label></strong><br><span id="msProfilePhone"></span></p><p class="ms-muted" data-profile-info></p><div class="ms-actions"><button class="ms-primary" id="msManageProfile" type="button"></button><button id="msOpenSecurity" type="button"></button><button id="msOpenBackup" type="button"></button><button id="msSignOut" type="button"></button><button id="msDeleteAccount" type="button"></button></div><p class="ms-muted" data-delete-hint></p></div>';
      content.querySelector("#msProfileEmail").textContent = email; content.querySelector("#msProfilePhone").textContent = phone;
      content.querySelector("[data-email-label]").textContent = t("emailLabel"); content.querySelector("[data-phone-label]").textContent = t("phoneLabel");
      content.querySelector("[data-profile-info]").textContent = t("accountInfo"); content.querySelector("#msManageProfile").textContent = t("manageProfile");
      content.querySelector("#msOpenSecurity").textContent = t("openSecurity"); content.querySelector("#msOpenBackup").textContent = t("openBackup");
      content.querySelector("#msSignOut").textContent = t("signOut"); content.querySelector("#msDeleteAccount").textContent = t("deleteAccount");
      content.querySelector("[data-delete-hint]").textContent = t("deleteHint");
      const openProfile = () => { closePanel(); if (typeof window.showPage === "function") window.showPage("profile"); };
      content.querySelector("#msManageProfile").onclick = openProfile;
      content.querySelector("#msOpenSecurity").onclick = () => { openProfile(); setTimeout(() => { const el=document.getElementById("profileSecurityPanel"); if(el) { el.style.display="block"; el.scrollIntoView({behavior:"smooth",block:"start"}); } }, 150); };
      content.querySelector("#msOpenBackup").onclick = () => { openProfile(); setTimeout(() => { const el=document.getElementById("profileBackupPanel"); if(el) { el.style.display="block"; el.scrollIntoView({behavior:"smooth",block:"start"}); } }, 150); };
      content.querySelector("#msSignOut").onclick = () => { openProfile(); setTimeout(() => { const area=document.getElementById("profileLogoutArea"); const btn=area && Array.from(area.querySelectorAll("button")).find(b=>/خروج از حساب|sign out|log out/i.test(b.textContent)); if(btn) btn.click(); },150); };
      content.querySelector("#msDeleteAccount").onclick = () => { openProfile(); setTimeout(() => { const area=document.getElementById("profileLogoutArea"); const btn=area && Array.from(area.querySelectorAll("button")).find(b=>/حذف دائمی حساب|delete account/i.test(b.textContent)); if(btn) btn.click(); },150); };
    } else if (name === "settings") {
      content.innerHTML = '<div class="ms-card"><label for="msLanguage"></label><select id="msLanguage"><option value="fa">فارسی</option><option value="en">English</option><option value="ar">العربية</option><option value="tr">Türkçe</option><option value="ja">日本語</option></select><p class="ms-muted" data-hint></p><div class="ms-status" id="msStatus" role="status"></div></div>';
      content.querySelector("label").textContent = t("language"); content.querySelector("[data-hint]").textContent = t("languageHint");
      const select = content.querySelector("#msLanguage"); select.value = getLang();
      select.onchange = () => {
        try { localStorage.setItem(LANG_KEY, select.value); } catch (_) {}
        const main = document.getElementById("appLanguage");
        if (main) { main.value = select.value; main.dispatchEvent(new Event("change", {bubbles:true})); }
        document.documentElement.lang = select.value; document.documentElement.dir = select.value === "fa" || select.value === "ar" ? "rtl" : "ltr";
        showSheet("settings"); const status = panel.querySelector("#msStatus"); if (status) status.textContent = t("saved");
      };
    } else if (name === "password") {
      content.innerHTML = '<div class="ms-card"><p data-password-info></p><div class="ms-actions"><button class="ms-primary" id="msManagePassword" type="button"></button></div></div>';
      content.querySelector("[data-password-info]").textContent = t("accountInfo"); content.querySelector("#msManagePassword").textContent = t("managePassword");
      content.querySelector("#msManagePassword").onclick = () => { closePanel(); if (typeof window.showPage === "function") window.showPage("profile"); setTimeout(() => { const sec=document.getElementById("profileSecurityPanel"); if(sec) { sec.style.display="block"; sec.scrollIntoView({behavior:"smooth",block:"start"}); const reset=document.getElementById("profileResetPasswordButton"); if(reset) reset.focus({preventScroll:true}); } else { const form=document.getElementById("profileForm"); if(form) form.scrollIntoView({behavior:"smooth",block:"start"}); } }, 150); };
    } else if (name === "notes") {
      const saved = safeRead(NOTES_KEY, "");
      content.innerHTML = '<div class="ms-card"><label for="msNote"></label><textarea id="msNote" maxlength="20000"></textarea><div class="ms-actions"><button class="ms-primary" id="msSaveNote" type="button"></button></div><div class="ms-status" id="msStatus" role="status"></div></div>';
      content.querySelector("label").textContent = t("notes"); content.querySelector("#msNote").placeholder = t("notePlaceholder"); content.querySelector("#msNote").value = typeof saved === "string" ? saved : "";
      content.querySelector("#msSaveNote").textContent = t("save");
      let noteTimer; content.querySelector("#msNote").addEventListener("input", () => { clearTimeout(noteTimer); content.querySelector("#msStatus").textContent = ""; noteTimer=setTimeout(() => { const ok=safeWrite(NOTES_KEY,content.querySelector("#msNote").value); content.querySelector("#msStatus").textContent=ok?t("saved"):"Could not save on this device."; },350); });
      content.querySelector("#msSaveNote").onclick = () => { clearTimeout(noteTimer); const ok = safeWrite(NOTES_KEY, content.querySelector("#msNote").value); content.querySelector("#msStatus").textContent = ok ? t("saved") : "Could not save on this device."; };
    } else if (name === "calendar") {
      const prefs = safeRead(CALENDAR_KEY, {type:"jalali",country:"iran"});
      content.innerHTML = '<div class="ms-card"><label for="msCalendarType"></label><select id="msCalendarType"><option value="gregorian"></option><option value="jalali"></option><option value="hijri"></option><option value="japanese"></option></select><label for="msCountry"></label><select id="msCountry"><option value="iran"></option><option value="azerbaijan"></option><option value="turkey"></option><option value="japan"></option><option value="other"></option></select><p class="ms-muted" data-hint></p><div class="ms-actions"><button class="ms-primary" id="msSaveCalendar" type="button"></button></div><div class="ms-status" id="msStatus" role="status"></div></div>';
      content.querySelector('label[for="msCalendarType"]').textContent = t("calendarType"); content.querySelector('label[for="msCountry"]').textContent = t("country");
      [["gregorian","gregorian"],["jalali","jalali"],["hijri","hijri"],["japanese","japanese"]].forEach(([v,k])=>content.querySelector('#msCalendarType option[value="'+v+'"]').textContent=t(k));
      [["iran","iran"],["azerbaijan","azerbaijan"],["turkey","turkey"],["japan","japan"],["other","other"]].forEach(([v,k])=>content.querySelector('#msCountry option[value="'+v+'"]').textContent=t(k));
      content.querySelector("#msCalendarType").value = prefs.type || "jalali"; content.querySelector("#msCountry").value = prefs.country || "iran";
      content.querySelector("[data-hint]").textContent = t("calendarHint"); content.querySelector("#msSaveCalendar").textContent = t("save");
      content.querySelector("#msSaveCalendar").onclick = () => { const value={type:content.querySelector("#msCalendarType").value,country:content.querySelector("#msCountry").value}; const ok=safeWrite(CALENDAR_KEY,value); if(ok){ try { window.dispatchEvent(new CustomEvent("masir:calendar-preferences-changed",{detail:value})); } catch(_){} } content.querySelector("#msStatus").textContent = ok ? t("saved") : "Could not save on this device."; };
    } else if (name === "about") {
      content.innerHTML = '<div class="ms-card" style="text-align:center"><div style="font-size:38px">💜</div><h3 style="color:#d8b4fe">مسیر</h3><p data-about-text></p><hr style="border-color:#393452"><p><strong data-developer-label></strong><br><span>رامتین همتای</span></p><p><strong data-email-label></strong><br><span dir="ltr">ramtinxasf@gmail.com</span></p></div>';
      content.querySelector("[data-about-text]").textContent = t("aboutText"); content.querySelector("[data-developer-label]").textContent = t("developer"); content.querySelector("[data-email-label]").textContent = t("email");
    }
  }
  button.addEventListener("click", openPanel); shade.addEventListener("click", closePanel);
  panel.querySelector("#msClose").addEventListener("click", closePanel); panel.querySelector("#msBack").addEventListener("click", showMenu);
  panel.querySelectorAll("[data-sheet]").forEach(el => el.addEventListener("click", () => showSheet(el.dataset.sheet)));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) closePanel(); });
  const mainLanguage = document.getElementById("appLanguage");
  if (mainLanguage) mainLanguage.addEventListener("change", () => { try { localStorage.setItem(LANG_KEY, mainLanguage.value); } catch (_) {} if (!panel.hidden && activeSheet) showSheet(activeSheet); });
})();