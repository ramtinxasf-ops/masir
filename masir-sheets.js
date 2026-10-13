/* Masir sheets: isolated UI layer. Keeps existing planner/auth logic untouched. */
(() => {
  "use strict";
  if (window.__masirSheetsInitialized) return;
  window.__masirSheetsInitialized = true;

  const LANG_KEY = "masir_app_language_v1";
  const NOTES_KEY = "masir_notes_v1";
  const CALENDAR_KEY = "masir_calendar_preferences_v1";
  const dict = {
    fa: {menu:"منوی مسیر",profile:"نمایه",settings:"تنظیمات",password:"تغییر رمز عبور",notes:"یادداشت‌ها",calendar:"تقویم",about:"درباره مسیر",back:"بازگشت",close:"بستن",language:"زبان برنامه",save:"ذخیره",saved:"ذخیره شد.",notePlaceholder:"یادداشتت را اینجا بنویس…",calendarType:"نوع تقویم",country:"کشور",gregorian:"میلادی",jalali:"شمسی",hijri:"قمری",japanese:"ژاپنی",selectCountry:"انتخاب کشور",iran:"ایران",azerbaijan:"آذربایجان",turkey:"ترکیه",japan:"ژاپن",other:"سایر",accountInfo:"برای مدیریت اطلاعات حساب، خروج یا حذف حساب، از بخش پروفایل اصلی استفاده کن.",manageProfile:"رفتن به پروفایل اصلی",managePassword:"رفتن به تنظیمات امنیت حساب",aboutText:"مسیر، برنامه‌ریز شخصی برای مدیریت فعالیت‌ها، پیگیری پیشرفت و ساختن عادت‌های روزانه است.",developer:"برنامه‌نویس",email:"ایمیل مدیر",emailLabel:"ایمیل حساب",phoneLabel:"شماره تلفن",security:"امنیت حساب",backup:"پشتیبان‌گیری",signOut:"خروج از حساب",deleteAccount:"حذف حساب",openSecurity:"باز کردن بخش امنیت حساب",openBackup:"باز کردن پشتیبان‌گیری",logoutHint:"برای خروج، دکمه اصلی حساب اجرا می‌شود.",deleteHint:"حذف حساب برگشت‌ناپذیر است و از تأیید خود برنامه استفاده می‌کند.",notesLocalHint:"یادداشت‌ها روی همین دستگاه ذخیره می‌شوند.",languageHint:"زبان انتخابی برای بخش‌های جدید ذخیره می‌شود و به تنظیم زبان اصلی برنامه نیز منتقل می‌شود.",calendarHint:"نوع تقویم انتخابی در نمایش تقویم اصلی اعمال می‌شود. ورودی رفتن مستقیم به تاریخ فعلاً تاریخ شمسی می‌پذیرد."},
    en: {menu:"Masir menu",profile:"My profile",settings:"Settings",password:"Change password",notes:"Notes",calendar:"Calendar",about:"About Masir",back:"Back",close:"Close",language:"App language",save:"Save",saved:"Saved.",notePlaceholder:"Write your note here…",calendarType:"Calendar type",country:"Country",gregorian:"Gregorian",jalali:"Jalali",hijri:"Hijri",japanese:"Japanese",selectCountry:"Choose a country",iran:"Iran",azerbaijan:"Azerbaijan",turkey:"Türkiye",japan:"Japan",other:"Other",accountInfo:"To manage account details, sign out, or delete your account, use the main profile section.",manageProfile:"Open main profile",managePassword:"Open account security settings",aboutText:"Masir is a personal planner for organizing activities, tracking progress, and building daily habits.",developer:"Developer",email:"Admin email",languageHint:"The selected language is saved for these sheets and also synced to the main app language setting.",calendarHint:"The selected calendar type updates the main calendar. The jump-to-date field currently accepts Jalali dates."},
    ar: {menu:"قائمة مسير",profile:"ملفي الشخصي",settings:"الإعدادات",password:"تغيير كلمة المرور",notes:"الملاحظات",calendar:"التقويم",about:"حول مسير",back:"رجوع",close:"إغلاق",language:"لغة التطبيق",save:"حفظ",saved:"تم الحفظ.",notePlaceholder:"اكتب ملاحظتك هنا…",calendarType:"نوع التقويم",country:"الدولة",gregorian:"ميلادي",jalali:"جلالي",hijri:"هجري",japanese:"ياباني",selectCountry:"اختر دولة",iran:"إيران",azerbaijan:"أذربيجان",turkey:"تركيا",japan:"اليابان",other:"أخرى",accountInfo:"لإدارة الحساب أو تسجيل الخروج أو حذف الحساب، استخدم قسم الملف الشخصي الرئيسي.",manageProfile:"فتح الملف الشخصي",managePassword:"فتح إعدادات أمان الحساب",aboutText:"مسير مخطط شخصي لتنظيم الأنشطة ومتابعة التقدم وبناء العادات اليومية.",developer:"المطوّر",email:"بريد المدير",languageHint:"يتم حفظ اللغة المختارة لهذه الصفحات ومزامنتها مع إعداد اللغة الرئيسي.",calendarHint:"يتم تطبيق نوع التقويم المختار على التقويم الرئيسي. حقل الانتقال إلى التاريخ يقبل التواريخ الجلالية حاليًا."},
    tr: {menu:"Masir menüsü",profile:"Profilim",settings:"Ayarlar",password:"Şifreyi değiştir",notes:"Notlar",calendar:"Takvim",about:"Masir hakkında",back:"Geri",close:"Kapat",language:"Uygulama dili",save:"Kaydet",saved:"Kaydedildi.",notePlaceholder:"Notunu buraya yaz…",calendarType:"Takvim türü",country:"Ülke",gregorian:"Miladi",jalali:"Celali",hijri:"Hicri",japanese:"Japon",selectCountry:"Ülke seç",iran:"İran",azerbaijan:"Azerbaycan",turkey:"Türkiye",japan:"Japonya",other:"Diğer",accountInfo:"Hesap bilgileri, çıkış veya hesap silme işlemleri için ana profil bölümünü kullan.",manageProfile:"Ana profili aç",managePassword:"Hesap güvenliği ayarlarını aç",aboutText:"Masir; etkinlikleri düzenlemek, ilerlemeyi izlemek ve günlük alışkanlıklar oluşturmak için kişisel bir planlayıcıdır.",developer:"Geliştirici",email:"Yönetici e-postası",languageHint:"Seçilen dil bu sayfalar için kaydedilir ve ana uygulama diline aktarılır.",calendarHint:"Seçilen takvim türü ana takvime uygulanır. Tarihe gitme alanı şu anda Celali tarih kabul eder."},
    ja: {menu:"Masir メニュー",profile:"プロフィール",settings:"設定",password:"パスワード変更",notes:"メモ",calendar:"カレンダー",about:"Masir について",back:"戻る",close:"閉じる",language:"アプリの言語",save:"保存",saved:"保存しました。",notePlaceholder:"ここにメモを入力…",calendarType:"カレンダーの種類",country:"国",gregorian:"西暦",jalali:"ジャラーリー",hijri:"ヒジュラ暦",japanese:"和暦",selectCountry:"国を選択",iran:"イラン",azerbaijan:"アゼルバイジャン",turkey:"トルコ",japan:"日本",other:"その他",accountInfo:"アカウント情報、ログアウト、削除はメインのプロフィール画面から操作してください。",manageProfile:"プロフィールを開く",managePassword:"アカウントセキュリティを開く",aboutText:"Masir は、活動の整理、進捗の確認、毎日の習慣づくりを支援する個人用プランナーです。",developer:"開発者",email:"管理者メール",languageHint:"選択した言語を保存し、メインアプリの言語設定にも同期します。",calendarHint:"選択した暦はメインカレンダーに反映されます。日付移動欄は現在ジャラーリー暦の日付を受け付けます。"}
  };
  const extraDict = {
    fa: {emailLabel:"ایمیل حساب",phoneLabel:"شماره تلفن",passwordInfo:"رمز جدید را وارد و دوباره تأیید کن. رمز باید حداقل ۸ نویسه و شامل حرف بزرگ، حرف کوچک و عدد انگلیسی باشد.",newPassword:"رمز عبور جدید",confirmPassword:"تکرار رمز عبور جدید",showPassword:"نمایش رمزها",ruleLength:"حداقل ۸ نویسه",ruleUpper:"یک حرف بزرگ انگلیسی (A-Z)",ruleLower:"یک حرف کوچک انگلیسی (a-z)",ruleNumber:"یک عدد انگلیسی (0-9)",passwordRulesError:"رمز هنوز همه شرایط را ندارد.",passwordMismatch:"دو رمز واردشده یکسان نیستند.",passwordUnavailable:"سرویس تغییر رمز در دسترس نیست؛ دوباره وارد حساب شو و تلاش کن.",passwordUpdating:"در حال تغییر رمز…",passwordUpdated:"رمز عبور با موفقیت تغییر کرد.",passwordFailed:"تغییر رمز انجام نشد.",downloadUserInfo:"دریافت اطلاعات حساب",userInfoDownloaded:"فایل اطلاعات حساب آماده شد.",userName:"نام",downloadFailed:"ساخت فایل ممکن نشد."},
    en: {emailLabel:"Account email",phoneLabel:"Phone number",passwordInfo:"Enter and confirm a new password. Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.",newPassword:"New password",confirmPassword:"Confirm new password",showPassword:"Show passwords",ruleLength:"At least 8 characters",ruleUpper:"An uppercase English letter (A-Z)",ruleLower:"A lowercase English letter (a-z)",ruleNumber:"A number (0-9)",passwordRulesError:"The password does not meet all requirements.",passwordMismatch:"The passwords do not match.",passwordUnavailable:"Password service is unavailable. Sign in again and retry.",passwordUpdating:"Changing password…",passwordUpdated:"Password changed successfully.",passwordFailed:"Password could not be changed.",downloadUserInfo:"Download account information",userInfoDownloaded:"Account information file is ready.",userName:"Name",downloadFailed:"Could not create the file."},
    ar: {emailLabel:"البريد الإلكتروني للحساب",phoneLabel:"رقم الهاتف",passwordInfo:"أدخل كلمة مرور جديدة وأكدها. يجب أن تتكون من ٨ أحرف على الأقل، مع حرف كبير وصغير ورقم باللغة الإنجليزية.",newPassword:"كلمة المرور الجديدة",confirmPassword:"تأكيد كلمة المرور الجديدة",showPassword:"إظهار كلمات المرور",ruleLength:"٨ أحرف على الأقل",ruleUpper:"حرف إنجليزي كبير (A-Z)",ruleLower:"حرف إنجليزي صغير (a-z)",ruleNumber:"رقم (0-9)",passwordRulesError:"كلمة المرور لا تستوفي جميع الشروط.",passwordMismatch:"كلمتا المرور غير متطابقتين.",passwordUnavailable:"خدمة تغيير كلمة المرور غير متاحة. سجّل الدخول مجددًا وحاول.",passwordUpdating:"جارٍ تغيير كلمة المرور…",passwordUpdated:"تم تغيير كلمة المرور بنجاح.",passwordFailed:"تعذر تغيير كلمة المرور.",downloadUserInfo:"تنزيل معلومات الحساب",userInfoDownloaded:"ملف معلومات الحساب جاهز.",userName:"الاسم",downloadFailed:"تعذر إنشاء الملف."},
    tr: {emailLabel:"Hesap e-postası",phoneLabel:"Telefon numarası",passwordInfo:"Yeni parolayı girip onayla. En az 8 karakter; büyük harf, küçük harf ve rakam içermelidir.",newPassword:"Yeni parola",confirmPassword:"Yeni parolayı onayla",showPassword:"Parolaları göster",ruleLength:"En az 8 karakter",ruleUpper:"Büyük İngilizce harf (A-Z)",ruleLower:"Küçük İngilizce harf (a-z)",ruleNumber:"Rakam (0-9)",passwordRulesError:"Parola tüm koşulları karşılamıyor.",passwordMismatch:"Parolalar eşleşmiyor.",passwordUnavailable:"Parola hizmeti kullanılamıyor. Yeniden giriş yapıp deneyin.",passwordUpdating:"Parola değiştiriliyor…",passwordUpdated:"Parola başarıyla değiştirildi.",passwordFailed:"Parola değiştirilemedi.",downloadUserInfo:"Hesap bilgilerini indir",userInfoDownloaded:"Hesap bilgileri dosyası hazır.",userName:"Ad",downloadFailed:"Dosya oluşturulamadı."},
    ja: {emailLabel:"アカウントのメール",phoneLabel:"電話番号",passwordInfo:"新しいパスワードを入力して確認してください。8文字以上で、大文字・小文字・数字を含めてください。",newPassword:"新しいパスワード",confirmPassword:"新しいパスワードを確認",showPassword:"パスワードを表示",ruleLength:"8文字以上",ruleUpper:"英大文字 (A-Z)",ruleLower:"英小文字 (a-z)",ruleNumber:"数字 (0-9)",passwordRulesError:"パスワードがすべての条件を満たしていません。",passwordMismatch:"パスワードが一致しません。",passwordUnavailable:"パスワードサービスを利用できません。再ログインしてお試しください。",passwordUpdating:"パスワードを変更中…",passwordUpdated:"パスワードを変更しました。",passwordFailed:"パスワードを変更できませんでした。",downloadUserInfo:"アカウント情報をダウンロード",userInfoDownloaded:"アカウント情報ファイルを作成しました。",userName:"名前",downloadFailed:"ファイルを作成できませんでした。"}
  };
  const commonLabels = {
    fa:{accountInfo:"برای مدیریت حساب از گزینه‌های زیر استفاده کن.",manageProfile:"رفتن به پروفایل اصلی",managePassword:"باز کردن تنظیمات امنیت حساب",openSecurity:"باز کردن بخش امنیت حساب",openBackup:"باز کردن پشتیبان‌گیری",signOut:"خروج از حساب",deleteAccount:"حذف حساب",deleteHint:"حذف حساب برگشت‌ناپذیر است و از تأیید خود برنامه استفاده می‌کند."},
    en:{accountInfo:"Manage your account using the actions below.",manageProfile:"Open main profile",managePassword:"Open account security",openSecurity:"Open account security",openBackup:"Open backup tools",signOut:"Sign out",deleteAccount:"Delete account",deleteHint:"Account deletion cannot be undone and requires confirmation."},
    ar:{accountInfo:"أدر حسابك باستخدام الخيارات أدناه.",manageProfile:"فتح الملف الشخصي",managePassword:"فتح أمان الحساب",openSecurity:"فتح أمان الحساب",openBackup:"فتح النسخ الاحتياطي",signOut:"تسجيل الخروج",deleteAccount:"حذف الحساب",deleteHint:"لا يمكن التراجع عن حذف الحساب ويتطلب تأكيدًا."},
    tr:{accountInfo:"Hesabını aşağıdaki seçeneklerle yönet.",manageProfile:"Ana profili aç",managePassword:"Hesap güvenliğini aç",openSecurity:"Hesap güvenliğini aç",openBackup:"Yedekleme araçlarını aç",signOut:"Çıkış yap",deleteAccount:"Hesabı sil",deleteHint:"Hesap silme işlemi geri alınamaz ve onay gerektirir."},
    ja:{accountInfo:"以下の操作からアカウントを管理できます。",manageProfile:"メインプロフィールを開く",managePassword:"アカウントのセキュリティを開く",openSecurity:"アカウントのセキュリティを開く",openBackup:"バックアップを開く",signOut:"ログアウト",deleteAccount:"アカウントを削除",deleteHint:"アカウントの削除は取り消せず、確認が必要です。"}
  };

  Object.assign(dict.fa, {
    interestsTitle:"علایق عمومی", interestPlaceholder:"یک علاقه وارد کن؛ مثلاً هنر، ورزش یا فناوری", addInterest:"افزودن علاقه", removeInterest:"حذف علاقه", goalsTitle:"اهداف من", goalsPlaceholder:"اهداف شخصی یا کاری‌ات را بنویس…", saveGoals:"ذخیره اهداف", profileDataSaved:"اطلاعات ذخیره شد.", interestEmpty:"اول یک علاقه بنویس.", interestDuplicate:"این علاقه قبلاً در فهرست است.", interestLimit:"می‌توانی هر تعداد علاقه دلخواه اضافه کنی.", interestsEmpty:"هنوز علاقه‌ای اضافه نکرده‌ای.", profileLocalHint:"علایق و اهداف روی همین دستگاه و برای همین حساب ذخیره می‌شوند.", adminManagementTitle:"مدیریت کاربران", backupTitle:"پشتیبان‌گیری و بازیابی", adminOnlyHint:"این بخش فقط برای مدیر فعال است."
  });
  Object.assign(dict.en, {
    security:"Account security", interestsTitle:"General interests", interestPlaceholder:"Add an interest, e.g. art, sports, or technology", addInterest:"Add interest", removeInterest:"Remove interest", goalsTitle:"My goals", goalsPlaceholder:"Write your personal or work goals…", saveGoals:"Save goals", profileDataSaved:"Information saved.", interestEmpty:"Enter an interest first.", interestDuplicate:"This interest is already in the list.", interestLimit:"Add as many interests as you need.", interestsEmpty:"No interests added yet.", profileLocalHint:"Interests and goals are saved on this device for this account.", adminManagementTitle:"User management", backupTitle:"Backup and restore", adminOnlyHint:"This section is available to the administrator only."
  });
  Object.assign(dict.ar, {
    security:"أمان الحساب", interestsTitle:"الاهتمامات العامة", interestPlaceholder:"أضف اهتمامًا، مثل الفن أو الرياضة أو التقنية", addInterest:"إضافة اهتمام", removeInterest:"حذف الاهتمام", goalsTitle:"أهدافي", goalsPlaceholder:"اكتب أهدافك الشخصية أو المهنية…", saveGoals:"حفظ الأهداف", profileDataSaved:"تم حفظ المعلومات.", interestEmpty:"أدخل اهتمامًا أولًا.", interestDuplicate:"هذا الاهتمام موجود بالفعل في القائمة.", interestLimit:"يمكنك إضافة أي عدد من الاهتمامات التي تريدها.", interestsEmpty:"لم تتم إضافة اهتمامات بعد.", profileLocalHint:"تُحفظ الاهتمامات والأهداف على هذا الجهاز لهذا الحساب.", adminManagementTitle:"إدارة المستخدمين", backupTitle:"النسخ الاحتياطي والاستعادة", adminOnlyHint:"هذا القسم متاح للمدير فقط."
  });
  Object.assign(dict.tr, {
    security:"Hesap güvenliği", interestsTitle:"Genel ilgi alanları", interestPlaceholder:"Sanat, spor veya teknoloji gibi bir ilgi alanı ekle", addInterest:"İlgi alanı ekle", removeInterest:"İlgi alanını sil", goalsTitle:"Hedeflerim", goalsPlaceholder:"Kişisel veya iş hedeflerini yaz…", saveGoals:"Hedefleri kaydet", profileDataSaved:"Bilgiler kaydedildi.", interestEmpty:"Önce bir ilgi alanı yaz.", interestDuplicate:"Bu ilgi alanı listede zaten var.", interestLimit:"İstediğin kadar ilgi alanı ekleyebilirsin.", interestsEmpty:"Henüz ilgi alanı eklenmedi.", profileLocalHint:"İlgi alanları ve hedefler bu cihazda bu hesap için saklanır.", adminManagementTitle:"Kullanıcı yönetimi", backupTitle:"Yedekleme ve geri yükleme", adminOnlyHint:"Bu bölüm yalnızca yöneticiye açıktır."
  });
  Object.assign(dict.ja, {
    security:"アカウントのセキュリティ", interestsTitle:"一般的な興味", interestPlaceholder:"芸術、スポーツ、テクノロジーなどを入力", addInterest:"興味を追加", removeInterest:"興味を削除", goalsTitle:"目標", goalsPlaceholder:"個人または仕事の目標を入力…", saveGoals:"目標を保存", profileDataSaved:"保存しました。", interestEmpty:"先に興味を入力してください。", interestDuplicate:"この興味はすでに一覧にあります。", interestLimit:"興味はいくつでも追加できます。", interestsEmpty:"興味はまだ追加されていません。", profileLocalHint:"興味と目標はこの端末のこのアカウント用に保存されます。", adminManagementTitle:"ユーザー管理", backupTitle:"バックアップと復元", adminOnlyHint:"この項目は管理者のみ利用できます。"
  });

  const getLang = () => {
    try { const el = document.getElementById("appLanguage"); const v = el && el.value; if (dict[v]) return v; const saved = localStorage.getItem(LANG_KEY); return dict[saved] ? saved : "fa"; }
    catch (_) { return "fa"; }
  };
  const t = key => extraDict[getLang()]?.[key] || commonLabels[getLang()]?.[key] || dict[getLang()]?.[key] || extraDict.fa[key] || commonLabels.fa[key] || dict.fa[key] || key;
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

  style.textContent += `
    #masirProfileGoalsCard .ms-interest-form{display:flex;gap:8px;align-items:stretch}
    #masirProfileGoalsCard .ms-interest-form input{min-width:0;flex:1;padding:11px;border-radius:10px;border:1px solid #514477;background:#0d1426;color:#f8fafc;font:inherit}
    #masirProfileGoalsCard .ms-interest-list{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:8px}
    #masirProfileGoalsCard .ms-interest-list li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border:1px solid #393452;border-radius:10px;background:#0f172a;overflow-wrap:anywhere}
    #masirProfileGoalsCard .ms-interest-list li span{min-width:0;flex:1}
    #masirProfileGoalsCard .ms-interest-list li button{padding:5px 8px;color:#fecaca;border-color:#7f1d1d}
    #masirProfileGoalsCard textarea{min-height:110px}
    #masirSheetsPanel #adminUserExportPanel,#masirSheetsPanel #profileSecurityPanel,#masirSheetsPanel #profileBackupPanel{margin:12px 0}
  `;

  document.head.appendChild(style);


  // Keep privileged account controls out of the profile page; render them only in their assigned menu sheets.
  const legacyPanelParking = document.createElement("div");
  legacyPanelParking.id = "masirLegacyPanelParking";
  legacyPanelParking.hidden = true;
  document.body.appendChild(legacyPanelParking);
  ["adminUserExportPanel","profileSecurityPanel","profileBackupPanel"].forEach(id => {
    const el = document.getElementById(id);
    if (el) legacyPanelParking.appendChild(el);
  });

  function mountProfileInterests() {
    const profile = document.getElementById("profileSection");
    if (!profile || document.getElementById("masirProfileGoalsCard")) return;
    const card = document.createElement("div");
    card.id = "masirProfileGoalsCard";
    card.className = "profile-panel";
    card.innerHTML = `
      <h3 id="msInterestsTitle"></h3>
      <p class="ms-muted" id="msProfileLocalHint"></p>
      <form class="ms-interest-form" id="msInterestForm">
        <input id="msInterestInput" type="text" maxlength="100" autocomplete="off">
        <button class="ms-primary" id="msAddInterest" type="submit"></button>
      </form>
      <p class="ms-muted" id="msInterestStatus" role="status" aria-live="polite"></p>
      <ul class="ms-interest-list" id="msInterestList"></ul>
      <hr style="border-color:rgba(196,167,255,.15);margin:18px 0">
      <label for="msGoalsInput" id="msGoalsTitle"></label>
      <textarea id="msGoalsInput" maxlength="10000"></textarea>
      <div class="ms-actions"><button class="ms-primary" type="button" id="msSaveGoals"></button></div>
      <p class="ms-status" id="msGoalsStatus" role="status" aria-live="polite"></p>`;
    const form = document.getElementById("profileForm");
    const accountPanel = form?.closest(".profile-panel");
    if (accountPanel) accountPanel.insertAdjacentElement("afterend", card);
    else profile.insertBefore(card, profile.firstChild);
    const key = () => "masir_profile_interests_goals_v1_" + String(window.masirCurrentUser?.id || "guest");
    const read = () => {
      try { const value = JSON.parse(localStorage.getItem(key()) || "{}"); return { interests:Array.isArray(value.interests) ? value.interests.filter(x => typeof x === "string") : [], goals:typeof value.goals === "string" ? value.goals : "" }; }
      catch (_) { return {interests:[],goals:""}; }
    };
    const write = value => { try { localStorage.setItem(key(), JSON.stringify(value)); return true; } catch (_) { return false; } };
    function render() {
      card.querySelector("#msInterestsTitle").textContent = t("interestsTitle");
      card.querySelector("#msProfileLocalHint").textContent = t("profileLocalHint");
      card.querySelector("#msInterestInput").placeholder = t("interestPlaceholder");
      card.querySelector("#msAddInterest").textContent = t("addInterest");
      card.querySelector("#msGoalsTitle").textContent = t("goalsTitle");
      card.querySelector("#msGoalsInput").placeholder = t("goalsPlaceholder");
      card.querySelector("#msSaveGoals").textContent = t("saveGoals");
      const data = read();
      const list = card.querySelector("#msInterestList");
      list.replaceChildren();
      if (!data.interests.length) {
        const empty = document.createElement("li");
        empty.textContent = t("interestsEmpty");
        list.appendChild(empty);
      } else {
        data.interests.forEach((interest, index) => {
          const li = document.createElement("li");
          const label = document.createElement("span"); label.textContent = interest;
          const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×";
          remove.setAttribute("aria-label", t("removeInterest") + ": " + interest); remove.title = t("removeInterest");
          remove.addEventListener("click", () => {
            const current = read(); current.interests.splice(index,1);
            const ok = write(current); render();
            card.querySelector("#msInterestStatus").textContent = ok ? t("profileDataSaved") : t("downloadFailed");
          });
          li.append(label,remove); list.appendChild(li);
        });
      }
      card.querySelector("#msGoalsInput").value = data.goals;
    }
    card.querySelector("#msInterestForm").addEventListener("submit", event => {
      event.preventDefault();
      const input = card.querySelector("#msInterestInput");
      const value = input.value.trim();
      const status = card.querySelector("#msInterestStatus");
      if (!value) { status.textContent = t("interestEmpty"); return; }
      const data = read();
      if (data.interests.some(x => x.toLocaleLowerCase() === value.toLocaleLowerCase())) { status.textContent = t("interestDuplicate"); return; }
      data.interests.push(value);
      const ok = write(data);
      if (ok) { input.value = ""; status.textContent = t("profileDataSaved"); render(); }
      else status.textContent = t("downloadFailed");
    });
    card.querySelector("#msSaveGoals").addEventListener("click", () => {
      const data = read(); data.goals = card.querySelector("#msGoalsInput").value.trim();
      const ok = write(data); card.querySelector("#msGoalsStatus").textContent = ok ? t("profileDataSaved") : t("downloadFailed");
    });
    render();
    document.addEventListener("click", event => {
      if (event.target.closest("#nav-profile")) setTimeout(render, 80);
    });
    const langSelect = document.getElementById("appLanguage");
    if (langSelect) langSelect.addEventListener("change", render);
    window.addEventListener("masir:profile-changed", render);
  }
  mountProfileInterests();

  function isMasirAdmin() {
    const email = String(window.masirCurrentUser?.email || "").trim().toLowerCase();
    return email === "ramtinxasf@gmail.com";
  }

  function movePrivilegedPanel(id, slotId, headingKey) {
    const panelEl = document.getElementById(id);
    const slot = document.getElementById(slotId);
    if (!panelEl || !slot) return;
    slot.replaceChildren();
    const adminOnly = ["adminUserExportPanel", "profileSecurityPanel", "profileBackupPanel"].includes(id);
    if (adminOnly && !isMasirAdmin()) {
      panelEl.style.display = "none";
      if (legacyPanelParking && !legacyPanelParking.contains(panelEl)) legacyPanelParking.appendChild(panelEl);
      return;
    }
    if (adminOnly) panelEl.style.display = "block";
    const heading = panelEl.querySelector("h3");
    if (heading && headingKey) heading.textContent = t(headingKey);
    slot.appendChild(panelEl);
  }

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
    // Preserve privileged panel nodes when switching sheets; innerHTML replacement would otherwise detach them.
    ["adminUserExportPanel","profileSecurityPanel","profileBackupPanel"].forEach(id => { const el=document.getElementById(id); if(el && legacyPanelParking && !legacyPanelParking.contains(el)) legacyPanelParking.appendChild(el); });
    if (name === "profile") {
      const email = document.getElementById("profileEmail")?.textContent?.trim() || "—";
      const phone = document.getElementById("profilePhone")?.textContent?.trim() || "—";
      content.innerHTML = '<div class="ms-card"><p><strong data-email-label></strong><br><span id="msProfileEmail"></span></p><p><strong data-phone-label></strong><br><span id="msProfilePhone"></span></p><p class="ms-muted" data-profile-info></p><div class="ms-actions"><button class="ms-primary" id="msManageProfile" type="button"></button><button id="msDownloadInfo" type="button"></button><button id="msSignOut" type="button"></button><button id="msDeleteAccount" type="button"></button></div><div class="ms-status" id="msProfileStatus" role="status" aria-live="polite"></div><p class="ms-muted" data-delete-hint></p></div>';
      content.querySelector("#msProfileEmail").textContent = email; content.querySelector("#msProfilePhone").textContent = phone;
      content.querySelector("[data-email-label]").textContent = t("emailLabel"); content.querySelector("[data-phone-label]").textContent = t("phoneLabel");
      content.querySelector("[data-profile-info]").textContent = t("accountInfo"); content.querySelector("#msManageProfile").textContent = t("manageProfile");
      content.querySelector("#msDownloadInfo").textContent = t("downloadUserInfo");
      content.querySelector("#msDownloadInfo").onclick = () => {
        const status = content.querySelector("#msProfileStatus");
        try {
          const name = [document.getElementById("profileFirstName")?.value, document.getElementById("profileLastName")?.value].filter(Boolean).join(" ").trim() || "—";
          const user = window.masirCurrentUser || {};
          const rows = [[t("userName"), name], [t("emailLabel"), email], [t("phoneLabel"), phone], ["User ID", user.id || "—"], ["Exported", new Date().toISOString()]];
          const body = rows.map(([label, value]) => label + ": " + String(value || "—")).join("\n");
          const blob = new Blob(["\uFEFF", body], {type:"text/plain;charset=utf-8"});
          const url = URL.createObjectURL(blob); const a = document.createElement("a");
          a.href = url; a.download = "masir-account-info.txt"; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000); status.textContent = t("userInfoDownloaded");
        } catch (_) { status.textContent = t("downloadFailed"); }
      };
      content.querySelector("#msSignOut").textContent = t("signOut"); content.querySelector("#msDeleteAccount").textContent = t("deleteAccount");
      content.querySelector("[data-delete-hint]").textContent = t("deleteHint");
      const openProfile = () => { closePanel(); if (typeof window.showPage === "function") window.showPage("profile"); };
      content.querySelector("#msManageProfile").onclick = openProfile;
      content.querySelector("#msSignOut").onclick = () => { openProfile(); setTimeout(() => { const area=document.getElementById("profileLogoutArea"); const btn=area?.querySelector("button"); if(btn) btn.click(); },150); };
      content.querySelector("#msDeleteAccount").onclick = () => { openProfile(); setTimeout(() => { const area=document.getElementById("profileLogoutArea"); const buttons=area ? Array.from(area.querySelectorAll("button")) : []; const btn=buttons.length > 1 ? buttons[buttons.length - 1] : null; if(btn) btn.click(); },150); };
    } else if (name === "settings") {
      content.innerHTML = '<div class="ms-card"><label for="msLanguage"></label><select id="msLanguage"><option value="fa">فارسی</option><option value="en">English</option><option value="ar">العربية</option><option value="tr">Türkçe</option><option value="ja">日本語</option></select><p class="ms-muted" data-hint></p><div class="ms-status" id="msStatus" role="status"></div></div>';
      content.querySelector("label").textContent = t("language"); content.querySelector("[data-hint]").textContent = t("languageHint");
      const backupSlot = document.createElement("div"); backupSlot.id = "msBackupSlot"; content.appendChild(backupSlot);
      movePrivilegedPanel("profileBackupPanel","msBackupSlot","backupTitle");
      const select = content.querySelector("#msLanguage"); select.value = getLang();
      select.onchange = () => {
        try { localStorage.setItem(LANG_KEY, select.value); } catch (_) {}
        const main = document.getElementById("appLanguage");
        if (main) { main.value = select.value; main.dispatchEvent(new Event("change", {bubbles:true})); }
        document.documentElement.lang = select.value; document.documentElement.dir = select.value === "fa" || select.value === "ar" ? "rtl" : "ltr";
        showSheet("settings"); const status = panel.querySelector("#msStatus"); if (status) status.textContent = t("saved");
      };
    } else if (name === "password") {
      content.innerHTML = '<div class="ms-card"><p data-password-info></p><label for="msNewPassword" data-new-password-label></label><input id="msNewPassword" type="password" autocomplete="new-password" minlength="8" style="display:block;width:100%;padding:12px;border-radius:10px;border:1px solid #514477;background:#0d1426;color:#f8fafc"><label for="msConfirmPassword" data-confirm-password-label></label><input id="msConfirmPassword" type="password" autocomplete="new-password" minlength="8" style="display:block;width:100%;padding:12px;border-radius:10px;border:1px solid #514477;background:#0d1426;color:#f8fafc"><label style="display:flex;align-items:center;gap:8px"><input id="msShowPassword" type="checkbox" style="width:auto"> <span data-show-password-label></span></label><p class="ms-muted" id="msPasswordRules"></p><div class="ms-actions"><button class="ms-primary" id="msUpdatePassword" type="button"></button></div><div class="ms-status" id="msPasswordStatus" role="status" aria-live="polite"></div><hr style="border-color:#393452;margin:18px 0"><div id="msAdminManagementSlot"></div><div id="msRecoverySlot"></div></div>';
      content.querySelector("[data-password-info]").textContent = t("passwordInfo");
      movePrivilegedPanel("adminUserExportPanel","msAdminManagementSlot","adminManagementTitle");
      movePrivilegedPanel("profileSecurityPanel","msRecoverySlot","security");
      content.querySelector("[data-new-password-label]").textContent = t("newPassword");
      content.querySelector("[data-confirm-password-label]").textContent = t("confirmPassword");
      content.querySelector("[data-show-password-label]").textContent = t("showPassword");
      content.querySelector("#msUpdatePassword").textContent = t("save");
      const passwordInput = content.querySelector("#msNewPassword");
      const confirmInput = content.querySelector("#msConfirmPassword");
      const status = content.querySelector("#msPasswordStatus");
      const rulesText = content.querySelector("#msPasswordRules");
      content.querySelector("#msShowPassword").addEventListener("change", e => {
        const type = e.target.checked ? "text" : "password";
        passwordInput.type = type; confirmInput.type = type;
      });
      const validate = () => {
        const p = passwordInput.value;
        const checks = [[p.length >= 8,t("ruleLength")],[/[A-Z]/.test(p),t("ruleUpper")],[/[a-z]/.test(p),t("ruleLower")],[/[0-9]/.test(p),t("ruleNumber")]];
        rulesText.textContent = checks.map(([ok,label]) => (ok ? "✓ " : "○ ") + label).join(" · ");
        return checks.every(([ok]) => ok);
      };
      passwordInput.addEventListener("input", validate);
      content.querySelector("#msUpdatePassword").onclick = async () => {
        status.style.color = "#fca5a5";
        if (!validate()) { status.textContent = t("passwordRulesError"); return; }
        if (passwordInput.value !== confirmInput.value) { status.textContent = t("passwordMismatch"); return; }
        const client = window.supabaseClient;
        if (!window.masirCurrentUser || !client || !client.auth || typeof client.auth.updateUser !== "function") { status.textContent = t("passwordUnavailable"); return; }
        const saveButton = content.querySelector("#msUpdatePassword");
        saveButton.disabled = true; status.textContent = t("passwordUpdating");
        try {
          const { error } = await client.auth.updateUser({ password: passwordInput.value });
          if (error) throw error;
          passwordInput.value = ""; confirmInput.value = ""; rulesText.textContent = "";
          status.style.color = "#a7f3d0"; status.textContent = t("passwordUpdated");
        } catch (error) {
          status.style.color = "#fca5a5";
          status.textContent = (error && error.message) ? error.message : t("passwordFailed");
        } finally { saveButton.disabled = false; }
      };
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
  window.addEventListener("masir:calendar-preferences-changed", () => { try { if (typeof window.renderAll === "function") window.renderAll(); else if (typeof window.renderCalendar === "function") window.renderCalendar(); } catch (error) { console.error("Masir calendar refresh failed:", error); } });

  const mainLanguage = document.getElementById("appLanguage");
  if (mainLanguage) mainLanguage.addEventListener("change", () => { try { localStorage.setItem(LANG_KEY, mainLanguage.value); } catch (_) {} if (!panel.hidden && activeSheet) showSheet(activeSheet); });
})();