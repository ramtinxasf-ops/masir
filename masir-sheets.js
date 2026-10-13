/* Masir sheets module — isolated from the core app. */
(function () {
  "use strict";
  if (window.__masirSheetsInitialized) return;
  window.__masirSheetsInitialized = true;
  const translations = {
    fa:{menu:"منو",title:"مسیر",profile:"پروفایل من",settings:"تنظیمات",password:"تغییر رمز عبور",notes:"یادداشت‌ها",calendar:"تقویم",about:"درباره مسیر",close:"بستن",save:"ذخیره",saved:"ذخیره شد.",notePlaceholder:"یادداشت را اینجا بنویسید",language:"زبان برنامه",calendarType:"نوع تقویم",country:"کشور",solar:"شمسی",gregorian:"میلادی",lunar:"قمری",japanese:"ژاپنی",passwordNew:"رمز عبور جدید",passwordAgain:"تکرار رمز عبور جدید",change:"تغییر رمز",passwordRules:"حداقل ۸ نویسه و شامل حرف بزرگ، حرف کوچک و عدد انگلیسی.",passwordMismatch:"رمزها یکسان نیستند.",passwordSuccess:"رمز عبور تغییر کرد.",passwordError:"تغییر رمز انجام نشد. ابتدا وارد حساب شوید.",developer:"برنامه‌نویس",email:"ایمیل مدیر"},
    en:{title:"Masir",profile:"My profile",settings:"Settings",password:"Change password",notes:"Notes",calendar:"Calendar",about:"About Masir",close:"Close",save:"Save",saved:"Saved.",notePlaceholder:"Write your note here",language:"App language",calendarType:"Calendar type",country:"Country",solar:"Solar Hijri",gregorian:"Gregorian",lunar:"Lunar Hijri",japanese:"Japanese",passwordNew:"New password",passwordAgain:"Confirm new password",change:"Change password",passwordRules:"At least 8 characters, uppercase, lowercase, and an English number.",passwordMismatch:"Passwords do not match.",passwordSuccess:"Password changed.",passwordError:"Could not change password. Sign in first.",developer:"Developer",email:"Admin email"},
    ar:{title:"مسير",profile:"ملفي الشخصي",settings:"الإعدادات",password:"تغيير كلمة المرور",notes:"الملاحظات",calendar:"التقويم",about:"حول مسير",close:"إغلاق",save:"حفظ",saved:"تم الحفظ.",notePlaceholder:"اكتب ملاحظتك هنا",language:"لغة التطبيق",calendarType:"نوع التقويم",country:"البلد",solar:"هجري شمسي",gregorian:"ميلادي",lunar:"هجري قمري",japanese:"ياباني",passwordNew:"كلمة المرور الجديدة",passwordAgain:"تأكيد كلمة المرور",change:"تغيير كلمة المرور",passwordRules:"٨ أحرف على الأقل مع حرف كبير وصغير ورقم إنجليزي.",passwordMismatch:"كلمتا المرور غير متطابقتين.",passwordSuccess:"تم تغيير كلمة المرور.",passwordError:"تعذر تغيير كلمة المرور. سجّل الدخول أولاً.",developer:"المطور",email:"بريد المدير"},
    tr:{title:"Masir",profile:"Profilim",settings:"Ayarlar",password:"Şifreyi değiştir",notes:"Notlar",calendar:"Takvim",about:"Masir hakkında",close:"Kapat",save:"Kaydet",saved:"Kaydedildi.",notePlaceholder:"Notunuzu buraya yazın",language:"Uygulama dili",calendarType:"Takvim türü",country:"Ülke",solar:"Hicrî Şemsî",gregorian:"Miladi",lunar:"Hicrî Kamerî",japanese:"Japon",passwordNew:"Yeni şifre",passwordAgain:"Yeni şifreyi doğrula",change:"Şifreyi değiştir",passwordRules:"En az 8 karakter; büyük, küçük harf ve İngilizce rakam.",passwordMismatch:"Şifreler eşleşmiyor.",passwordSuccess:"Şifre değiştirildi.",passwordError:"Şifre değiştirilemedi. Önce giriş yapın.",developer:"Geliştirici",email:"Yönetici e-postası"},
    ja:{title:"Masir",profile:"プロフィール",settings:"設定",password:"パスワード変更",notes:"メモ",calendar:"カレンダー",about:"Masirについて",close:"閉じる",save:"保存",saved:"保存しました。",notePlaceholder:"ここにメモを入力",language:"アプリの言語",calendarType:"カレンダーの種類",country:"国",solar:"太陽ヒジュラ暦",gregorian:"グレゴリオ暦",lunar:"太陰ヒジュラ暦",japanese:"和暦",passwordNew:"新しいパスワード",passwordAgain:"新しいパスワードの確認",change:"パスワード変更",passwordRules:"8文字以上で、大文字・小文字・英数字を含めてください。",passwordMismatch:"パスワードが一致しません。",passwordSuccess:"パスワードを変更しました。",passwordError:"変更できません。先にログインしてください。",developer:"開発者",email:"管理者メール"}
  };
  const countries = ["Azerbaijan","Iran","Turkey","Japan","United States","United Kingdom","Saudi Arabia","United Arab Emirates","Afghanistan","Pakistan"];
  const $ = id => document.getElementById(id);
  const lang = () => translations[$("appLanguage")?.value] ? $("appLanguage").value : "fa";
  const t = key => (translations[lang()] || translations.fa)[key] || translations.fa[key] || key;
  const read = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } };
  const style = document.createElement("style");
  style.textContent = [
    "#masirSheetsMenu{position:fixed;top:10px;right:10px;z-index:10020;background:#211b38;color:#e9d5ff;border:1px solid #514477;border-radius:12px;font-size:22px;width:44px;height:44px;padding:0}",
    "#masirSheetsShade{position:fixed;inset:0;background:rgba(3,6,18,.65);z-index:10021;display:none}",
    "#masirSheetsDrawer{position:fixed;top:0;right:0;height:100dvh;width:min(320px,84vw);overflow:auto;z-index:10022;padding:18px 12px;background:#11182b;border-left:1px solid #514477;transform:translateX(105%);transition:transform .2s ease}",
    "#masirSheetsDrawer.open{transform:translateX(0)}",
    "#masirSheetsDrawer h2{color:#c4b5fd;margin:6px 4px 16px}",
    "#masirSheetsDrawer button{display:block;width:100%;text-align:start;margin:7px 0;background:#1d2740;color:#f3f4f6;border:1px solid #303b57;padding:12px}",
    "#masirSheetsModal{position:fixed;inset:0;z-index:10030;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(3,6,18,.78)}",
    "#masirSheetsModal .panel{width:min(560px,100%);max-height:88dvh;overflow:auto;background:#151c30;color:#f3f4f6;border:1px solid #514477;border-radius:18px;padding:18px;box-shadow:0 18px 50px #0008}",
    "#masirSheetsModal h2{color:#c4b5fd}",
    "#masirSheetsModal label{display:block;margin:12px 0 5px;color:#a5b4cc}",
    "#masirSheetsModal input,#masirSheetsModal select,#masirSheetsModal textarea{width:100%;padding:11px;background:#0d1426;color:#f3f4f6;border:1px solid #303b57;border-radius:9px;font:inherit}",
    "#masirSheetsModal textarea{min-height:180px;resize:vertical}",
    "#masirSheetsModal .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}",
    "#masirSheetsModal .actions button{background:#7c3aed;color:white}",
    "#masirSheetsModal .actions .secondary{background:#1d2740;border:1px solid #303b57}",
    "#masirSheetsStatus{min-height:1.5em;color:#a7f3d0;font-size:13px}",
    "@media(max-width:520px){#masirSheetsMenu{top:8px;right:8px}}"
  ].join("\n");
  document.head.appendChild(style);
  const menu = document.createElement("button");
  menu.id = "masirSheetsMenu"; menu.type = "button"; menu.setAttribute("aria-label","Open menu"); menu.textContent = "☰";
  const shade = document.createElement("div"); shade.id = "masirSheetsShade";
  const drawer = document.createElement("aside"); drawer.id = "masirSheetsDrawer"; drawer.setAttribute("aria-label","Masir menu");
  const modal = document.createElement("div"); modal.id = "masirSheetsModal"; modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true");
  modal.innerHTML = '<div class="panel"><div id="masirSheetsContent"></div><div class="actions"><button type="button" id="masirSheetsSave"></button><button type="button" class="secondary" id="masirSheetsClose"></button></div><p id="masirSheetsStatus" role="status" aria-live="polite"></p></div>';
  document.body.append(menu,shade,drawer,modal);
  function closeDrawer(){drawer.classList.remove("open");shade.style.display="none";menu.setAttribute("aria-expanded","false");}
  function openDrawer(){renderDrawer();shade.style.display="block";drawer.classList.add("open");menu.setAttribute("aria-expanded","true");}
  function closeModal(){modal.style.display="none";$("masirSheetsStatus").textContent="";}
  function renderDrawer(){
    drawer.innerHTML='<h2>💜 '+t("title")+'</h2>'+
      [["profile","👤 "],["settings","⚙️ "],["password","🔐 "],["notes","📝 "],["calendar","📅 "],["about","ℹ️ "]].map(([k,icon])=>'<button type="button" data-sheet="'+k+'">'+icon+t(k)+'</button>').join("");
    drawer.querySelectorAll("[data-sheet]").forEach(b=>b.addEventListener("click",()=>{
      const page=b.dataset.sheet;closeDrawer();
      if(page==="profile"){if(typeof window.showPage==="function")window.showPage("profile");else $("nav-profile")?.click();return;}
      openSheet(page);
    }));
  }
  function openSheet(page){
    const content=$("masirSheetsContent");let html="<h2>"+t(page)+"</h2>";
    if(page==="settings"){
      const current=$("appLanguage")?.value||lang();
      html+='<label for="masirSheetLanguage">'+t("language")+'</label><select id="masirSheetLanguage">'+[["fa","فارسی"],["en","English"],["ar","العربية"],["tr","Türkçe"],["ja","日本語"]].map(([v,n])=>'<option value="'+v+'"'+(v===current?" selected":"")+'>'+n+'</option>').join("")+'</select>';
    }else if(page==="notes"){
      html+='<label for="masirSheetNote">'+t("notes")+'</label><textarea id="masirSheetNote" placeholder="'+t("notePlaceholder")+'"></textarea>';
    }else if(page==="calendar"){
      const selectedType=read("masir.calendarType","solar"),selectedCountry=read("masir.calendarCountry","Azerbaijan");
      html+='<label for="masirSheetCalendarType">'+t("calendarType")+'</label><select id="masirSheetCalendarType">'+[["solar","solar"],["gregorian","gregorian"],["lunar","lunar"],["japanese","japanese"]].map(([v,k])=>'<option value="'+v+'"'+(v===selectedType?" selected":"")+'>'+t(k)+'</option>').join("")+'</select><label for="masirSheetCountry">'+t("country")+'</label><select id="masirSheetCountry">'+countries.map(c=>'<option value="'+c+'"'+(c===selectedCountry?" selected":"")+'>'+c+'</option>').join("")+'</select><p class="help-text">Calendar preferences are stored separately and do not yet change the calendar rendering.</p>';
    }else if(page==="password"){
      html+='<label for="masirSheetNewPassword">'+t("passwordNew")+'</label><input type="password" id="masirSheetNewPassword" autocomplete="new-password" minlength="8"><label for="masirSheetPasswordAgain">'+t("passwordAgain")+'</label><input type="password" id="masirSheetPasswordAgain" autocomplete="new-password"><p class="help-text">'+t("passwordRules")+'</p>';
    }else if(page==="about"){
      html+='<p>'+t("title")+' — personal planner for your daily path.</p><p><strong>'+t("developer")+':</strong> رامتین همتای</p><p><strong>'+t("email")+':</strong> <a href="mailto:ramtinxasf@gmail.com" style="color:#c4b5fd">ramtinxasf@gmail.com</a></p>';
    }
    content.innerHTML=html;$("masirSheetsSave").textContent=page==="about"?t("close"):page==="password"?t("change"):t("save");$("masirSheetsClose").textContent=t("close");$("masirSheetsSave").style.display=page==="about"?"none":"";$("masirSheetsStatus").textContent="";
    if(page==="notes")$("masirSheetNote").value=read("masir.notes","");
    modal.dataset.page=page;modal.style.display="flex";
  }
  async function saveSheet(){
    const page=modal.dataset.page,status=$("masirSheetsStatus");
    if(page==="settings"){
      const target=$("appLanguage"),next=$("masirSheetLanguage")?.value;
      if(!target||!next){status.textContent="Language selector unavailable.";return;}
      target.value=next;target.dispatchEvent(new Event("change",{bubbles:true}));write("masir.language",next);status.textContent=t("saved");renderDrawer();return;
    }
    if(page==="notes"){status.textContent=write("masir.notes",$("masirSheetNote").value)?t("saved"):"Could not save note in this browser.";return;}
    if(page==="calendar"){write("masir.calendarType",$("masirSheetCalendarType").value);write("masir.calendarCountry",$("masirSheetCountry").value);status.textContent=t("saved");return;}
    if(page==="password"){
      const p1=$("masirSheetNewPassword").value,p2=$("masirSheetPasswordAgain").value;
      if(p1!==p2){status.textContent=t("passwordMismatch");return;}
      if(p1.length<8||!/[A-Z]/.test(p1)||!/[a-z]/.test(p1)||!/[0-9]/.test(p1)){status.textContent=t("passwordRules");return;}
      try{if(!window.supabaseClient?.auth?.updateUser)throw new Error("auth unavailable");const {error}=await window.supabaseClient.auth.updateUser({password:p1});if(error)throw error;$("masirSheetNewPassword").value="";$("masirSheetPasswordAgain").value="";status.textContent=t("passwordSuccess");}
      catch(_){status.textContent=t("passwordError");}
    }
  }
  menu.addEventListener("click",openDrawer);shade.addEventListener("click",closeDrawer);$("masirSheetsClose").addEventListener("click",closeModal);$("masirSheetsSave").addEventListener("click",saveSheet);
  document.addEventListener("keydown",event=>{if(event.key==="Escape"){closeDrawer();closeModal();}});
  document.addEventListener("change",event=>{if(event.target?.id==="appLanguage")renderDrawer();});
  renderDrawer();
})();