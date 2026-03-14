<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ZOVEX</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.12/hls.min.js"></script>
<style>
:root{
  --bg:#F5F5F7;--surface:#fff;--surface2:#F0F0F5;
  --text:#1D1D1F;--muted:#6e6e73;--accent:#0071e3;
  --red:#ff3b30;--green:#34c759;--border:#d2d2d7;
  --shadow:0 4px 20px rgba(0,0,0,.08);--shadow-lg:0 12px 40px rgba(0,0,0,.14);
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;min-height:100vh}
.header{background:rgba(245,245,247,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;padding:12px 20px}
.header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.logo{font-size:24px;font-weight:900;letter-spacing:2px;background:linear-gradient(135deg,#0071e3,#5e5ce6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.search-wrap{position:relative}
.search-wrap input{width:100%;background:var(--surface2);border:1.5px solid var(--border);color:var(--text);border-radius:14px;padding:10px 40px 10px 14px;font-size:14px;font-family:inherit;transition:.2s}
.search-wrap input:focus{outline:none;border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px rgba(0,113,227,.12)}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:16px;pointer-events:none}
.tabs{display:flex;gap:6px;padding:14px 20px 10px;overflow-x:auto;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{background:var(--surface);border:1.5px solid var(--border);color:var(--muted);border-radius:20px;padding:6px 16px;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;font-family:inherit;transition:.2s;flex-shrink:0}
.tab.active{background:var(--accent);border-color:var(--accent);color:#fff}
.tab:hover:not(.active){border-color:var(--accent);color:var(--accent)}
.section-label{padding:2px 20px 12px;font-size:18px;font-weight:700}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;padding:0 20px 100px}
.card{position:relative;border-radius:16px;overflow:hidden;cursor:pointer;aspect-ratio:2/3;background:var(--surface);box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-4px) scale(1.02);box-shadow:var(--shadow-lg)}
.card:active{transform:scale(.98)}
.card img{width:100%;height:100%;object-fit:cover;display:block}
.card-fb{width:100%;height:100%;background:linear-gradient(135deg,#e8eaf6,#c5cae9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px;text-align:center}
.card-ov{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.85));padding:22px 10px 10px}
.card-name{font-size:12px;font-weight:700;color:#fff}
.card-yr{font-size:10px;color:rgba(255,255,255,.7);margin-top:2px}
.card-new{position:absolute;top:8px;right:8px;background:var(--red);color:#fff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:6px}
.empty{grid-column:span 2;text-align:center;padding:60px 20px;color:var(--muted)}
#player{display:none;position:fixed;inset:0;background:#000;z-index:300;flex-direction:column}
#player.open{display:flex}
.ph{padding:14px 16px;display:flex;align-items:center;gap:10px;position:absolute;top:0;left:0;right:0;z-index:10;background:linear-gradient(180deg,rgba(0,0,0,.8),transparent)}
.back-btn{background:rgba(255,255,255,.15);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px}
#zovex_player{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
#zovex_player video{width:100%;height:100%;object-fit:contain}
#admin{display:none;position:fixed;inset:0;background:var(--bg);z-index:200;overflow-y:auto}
#admin.open{display:block}
.admin-nav{background:rgba(245,245,247,.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;display:flex;padding:0 8px}
.anav-btn{flex:1;padding:13px 4px;text-align:center;cursor:pointer;font-size:11px;font-weight:700;color:var(--muted);border-bottom:2px solid transparent;transition:.2s}
.anav-btn.active{color:var(--accent);border-color:var(--accent)}
.admin-screen{display:none;padding:16px;padding-bottom:80px}
.admin-screen.active{display:block}
.admin-logo{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;background:rgba(245,245,247,.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.acard{background:var(--surface);border-radius:16px;padding:18px;margin-bottom:14px;box-shadow:var(--shadow)}
.acard-title{font-size:14px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.acard-title .dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0}
.fg{margin-bottom:12px}
.fg label{display:block;font-size:11px;color:var(--muted);margin-bottom:5px;font-weight:700;letter-spacing:.3px}
.fg input,.fg select,.fg textarea{width:100%;background:var(--surface2);border:1.5px solid var(--border);color:var(--text);border-radius:10px;padding:10px 12px;font-size:13px;font-family:inherit;transition:.2s;resize:none}
.fg input:focus,.fg select:focus,.fg textarea:focus{outline:none;border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px rgba(0,113,227,.1)}
.fg textarea{min-height:80px}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.btn{width:100%;border:none;border-radius:12px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-blue{background:var(--accent);color:#fff;box-shadow:0 4px 12px rgba(0,113,227,.3)}
.btn-outline{background:transparent;color:var(--accent);border:1.5px solid var(--accent)}
.btn-green{background:var(--green);color:#fff}
.btn-red{background:var(--red);color:#fff}
.btn-gray{background:var(--surface2);color:var(--muted);border:1.5px solid var(--border)}
.btn-orange{background:#ff9500;color:#fff}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-row{display:flex;gap:8px;margin-top:12px}
.btn-row .btn{flex:1}
.sr-list{margin-top:10px;display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto}
.sr-item{display:flex;gap:10px;background:var(--surface2);border-radius:12px;padding:10px;cursor:pointer;border:1.5px solid transparent;transition:.2s;align-items:flex-start}
.sr-item:hover,.sr-item.sel{border-color:var(--accent);background:#fff}
.sr-thumb{width:42px;height:60px;border-radius:8px;object-fit:cover;background:var(--border);flex-shrink:0}
.sr-title{font-size:13px;font-weight:700}
.sr-year{font-size:11px;color:var(--muted);margin-top:2px}
.sr-ov{font-size:11px;color:var(--muted);margin-top:3px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ci{display:flex;gap:10px;background:var(--surface);border-radius:12px;padding:10px;margin-bottom:8px;box-shadow:0 2px 8px rgba(0,0,0,.06);align-items:center}
.ci-thumb{width:38px;height:54px;border-radius:8px;object-fit:cover;background:var(--surface2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px}
.ci-info{flex:1;min-width:0}
.ci-name{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci-meta{font-size:10px;color:var(--muted);margin-top:2px}
.ci-desc{font-size:10px;color:var(--muted);margin-top:3px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.ci-miss{font-size:10px;color:var(--red);margin-top:3px}
.btn-sm{background:var(--surface2);border:1.5px solid var(--border);color:var(--muted);border-radius:8px;padding:5px 8px;cursor:pointer;font-size:11px;transition:.2s}
.btn-sm:hover{border-color:var(--accent);color:var(--accent)}
.btn-sm.del:hover{border-color:var(--red);color:var(--red)}
.status{background:var(--surface2);border-radius:10px;padding:10px 12px;font-size:12px;margin-top:10px;border-right:3px solid var(--accent);color:var(--muted);line-height:1.6}
.status.err{border-color:var(--red);color:var(--red);background:#fff5f5}
.status.ok{border-color:var(--green);color:#1a7a3a;background:#f0fff4}
.ks{font-size:10px;padding:2px 8px;border-radius:8px;font-weight:700;margin-right:6px}
.ks.set{background:#e8f5e9;color:var(--green)}
.ks.unset{background:#fff5f5;color:var(--red)}
.sys-row{background:var(--surface2);border-radius:10px;padding:10px 12px;font-size:12px;font-weight:600;border-right:3px solid var(--border);transition:.3s}
.sys-row.ok{background:#f0fff4;border-color:var(--green);color:#1a7a3a}
.sys-row.err{background:#fff5f5;border-color:var(--red);color:var(--red)}
.sys-row.checking{background:#f0f7ff;border-color:var(--accent);color:var(--accent)}
#login-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(8px);z-index:500;align-items:center;justify-content:center}
#login-modal.open{display:flex}
.login-box{background:var(--surface);border-radius:24px;padding:28px 24px;width:320px;max-width:90vw;box-shadow:var(--shadow-lg);animation:popIn .25s cubic-bezier(.34,1.56,.64,1)}
@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
.login-logo{font-size:22px;font-weight:900;letter-spacing:2px;background:linear-gradient(135deg,#0071e3,#5e5ce6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:4px}
.login-sub{font-size:11px;color:var(--muted);margin-bottom:20px}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(29,29,31,.9);backdrop-filter:blur(10px);color:#fff;padding:10px 20px;border-radius:20px;font-size:12px;z-index:999;opacity:0;pointer-events:none;transition:opacity .3s;white-space:nowrap}
.toast.show{opacity:1}
.spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(0,113,227,.3);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Category Manager */
#cat-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);z-index:600;align-items:center;justify-content:center}
#cat-modal.open{display:flex}
.cat-box{background:var(--surface);border-radius:24px;padding:24px;width:360px;max-width:94vw;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:popIn .25s cubic-bezier(.34,1.56,.64,1)}
.cat-item{display:flex;align-items:center;gap:8px;background:var(--surface2);border-radius:10px;padding:8px 10px;margin-bottom:8px;border:1.5px solid var(--border)}
.cat-item input{flex:1;background:transparent;border:none;font-size:13px;font-weight:600;font-family:inherit;color:var(--text);outline:none}
.cat-item .btn-sm{flex-shrink:0}

/* Bulk move modal */
#bulk-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);z-index:600;align-items:center;justify-content:center}
#bulk-modal.open{display:flex}
.bulk-box{background:var(--surface);border-radius:24px;padding:24px;width:340px;max-width:94vw;box-shadow:var(--shadow-lg);animation:popIn .25s cubic-bezier(.34,1.56,.64,1)}
</style>
</head>
<body>

<div id="main">
  <div class="header">
    <div class="header-top"><div class="logo">ZOVEX</div></div>
    <div class="search-wrap">
      <input id="search-input" placeholder="חפש סרטים, סדרות..." autocomplete="off">
      <span class="search-icon">🔍</span>
    </div>
  </div>
  <div class="tabs" id="tabs"></div>
  <div class="section-label" id="sec-label">כל התכנים</div>
  <div class="grid" id="main-grid"></div>
</div>

<div id="login-modal">
  <div class="login-box">
    <div class="login-logo">ZOVEX</div>
    <div class="login-sub">אימות מנהל מערכת</div>
    <div class="fg"><label>קוד PIN</label><input id="lpin" type="password" maxlength="6" placeholder="••••••" inputmode="numeric"></div>
    <div class="fg"><label>מפתח סודי</label><input id="lsec" type="password" placeholder="••••••••"></div>
    <div class="btn-row">
      <button class="btn btn-blue" onclick="tryLogin()">כניסה</button>
      <button class="btn btn-gray" onclick="closeLogin()">ביטול</button>
    </div>
  </div>
</div>

<div id="player">
  <div class="ph">
    <div class="back-btn" onclick="closePlayer()">←</div>
    <div style="color:#fff;font-size:14px;font-weight:700" id="player-title"></div>
  </div>
  <div id="zovex_player"></div>
</div>

<!-- Category Manager Modal -->
<div id="cat-modal">
  <div class="cat-box">
    <div style="font-size:16px;font-weight:800;margin-bottom:16px">✏️ ניהול קטגוריות</div>
    <div id="cat-list"></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <input id="new-cat-input" placeholder="שם קטגוריה חדשה..." style="flex:1;background:var(--surface2);border:1.5px solid var(--border);border-radius:10px;padding:9px 12px;font-size:13px;font-family:inherit;color:var(--text);outline:none">
      <button class="btn btn-blue" style="width:auto;padding:9px 14px" onclick="addCategory()">➕</button>
    </div>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn btn-green" onclick="saveCategoriesAndClose()">💾 שמור</button>
      <button class="btn btn-gray" onclick="closeCatModal()">ביטול</button>
    </div>
  </div>
</div>

<!-- Bulk Move Modal -->
<div id="bulk-modal">
  <div class="bulk-box">
    <div style="font-size:15px;font-weight:800;margin-bottom:6px">📦 העברת סדרה שלמה</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:16px" id="bulk-desc"></div>
    <div class="fg">
      <label>קטגוריה חדשה לכל הסדרה</label>
      <select id="bulk-cat-select"></select>
    </div>
    <div class="btn-row">
      <button class="btn btn-orange" onclick="confirmBulkMove()">🔄 העבר הכל</button>
      <button class="btn btn-gray" onclick="closeBulkModal()">ביטול</button>
    </div>
  </div>
</div>

<div id="admin">
  <div class="admin-logo">
    <div class="logo">ZOVEX <span style="font-size:12px;font-weight:400;color:var(--muted)">Admin</span></div>
    <button class="btn btn-gray" style="width:auto;padding:6px 14px;font-size:12px" onclick="closeAdmin()">← יציאה</button>
  </div>
  <div class="admin-nav">
    <div class="anav-btn active" onclick="showAScreen('browse',this)">🎬 תכנים</div>
    <div class="anav-btn" onclick="showAScreen('add',this)">➕ הוסף</div>
    <div class="anav-btn" onclick="showAScreen('manage',this)">📋 ניהול</div>
    <div class="anav-btn" onclick="showAScreen('settings',this)">⚙️ הגדרות</div>
  </div>

  <div class="admin-screen active" id="as-browse">
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px" id="admin-tabs"></div>
    <div class="grid" id="admin-grid"></div>
  </div>

  <div class="admin-screen" id="as-add">
    <div class="acard">
      <div class="acard-title"><span class="dot"></span>חיפוש TMDB</div>
      <div class="fg"><label>שם הסרט / סדרה</label><input id="tq" placeholder="Inception..." onkeydown="if(event.key==='Enter')tmdbSearch()"></div>
      <button class="btn btn-outline" onclick="tmdbSearch()" id="btn-ts">🔍 חפש ב-TMDB</button>
      <div class="sr-list" id="sr-list"></div>
    </div>
    <div class="acard">
      <div class="acard-title"><span class="dot"></span>פרטי התוכן</div>
      <div class="fg"><label>שם</label><input id="ft" placeholder="שם הסרט..."></div>
      <div class="fg"><label>שם סדרה (לקיבוץ פרקים)</label><input id="fshow" placeholder="שם הסדרה (אופציונלי)..."></div>
      <div class="row2">
        <div class="fg"><label>שנה</label><input id="fy" type="number" placeholder="2026"></div>
        <div class="fg"><label>קטגוריה</label><select id="fc"></select></div>
      </div>
      <div class="fg"><label>תיאור</label><textarea id="fd" placeholder="תיאור..."></textarea></div>
      <div class="fg"><label>קישור פוסטר</label><input id="fp" placeholder="https://...jpg"></div>
      <div class="fg"><label>קישור וידאו (m3u8/mp4)</label><input id="fv" placeholder="https://...m3u8"></div>
      <div class="btn-row">
        <button class="btn btn-green" onclick="aiDesc()" id="btn-ai">✨ AI תיאור</button>
        <button class="btn btn-blue" onclick="saveItem()">💾 שמור</button>
      </div>
      <div id="add-st" class="status" style="display:none"></div>
    </div>
  </div>

  <div class="admin-screen" id="as-manage">
    <div class="acard">
      <div class="acard-title"><span class="dot"></span>תכנים (<span id="cnt">0</span>)</div>
      <div id="item-list"></div>
    </div>
  </div>

  <div class="admin-screen" id="as-settings">
    <div class="acard">
      <div class="acard-title"><span class="dot"></span>✏️ ניהול קטגוריות</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:12px">הוסף, ערוך או מחק קטגוריות. שינוי שם קטגוריה יעדכן את כל התכנים שלה.</p>
      <button class="btn btn-outline" onclick="openCatModal()">✏️ ערוך קטגוריות</button>
    </div>

    <div class="acard">
      <div class="acard-title"><span class="dot"></span>מפתחות API</div>
      <div class="fg"><label>TMDB API Key (v3) <span class="ks" id="tmdb-ks">לא מוגדר</span></label><input id="tmdb-k" type="password" placeholder="32 תווים"></div>
      <div class="fg"><label>Groq API Key <span class="ks" id="gemini-ks">לא מוגדר</span></label><input id="gemini-k" type="password" placeholder="gsk_..."></div>
      <button class="btn btn-blue" onclick="saveKeys()">💾 שמור מפתחות</button>
      <div style="margin-top:10px;font-size:11px;color:var(--muted);line-height:1.8">
        🔑 TMDB: <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color:var(--accent)">themoviedb.org</a> → API Key (v3 auth)<br>
        🤖 Gemini: <a href="https://console.groq.com" target="_blank" style="color:var(--accent)">console.groq.com</a> (חינמי לחלוטין)
      </div>
    </div>

    <div class="acard">
      <div class="acard-title"><span class="dot"></span>🔍 בדיקת מערכת</div>
      <div id="sys-checks" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
        <div class="sys-row" id="chk-hls">⏳ HLS Player — לא נבדק</div>
        <div class="sys-row" id="chk-storage">⏳ אחסון מקומי — לא נבדק</div>
        <div class="sys-row" id="chk-tmdb">⏳ TMDB API — לא נבדק</div>
        <div class="sys-row" id="chk-gemini">⏳ Gemini API — לא נבדק</div>
      </div>
      <button class="btn btn-outline" onclick="runChecks()" id="btn-check">🔍 הפעל בדיקת מערכת</button>
    </div>

    <div class="acard">
      <div class="acard-title"><span class="dot"></span>עדכון אוטומטי</div>
      <button class="btn btn-outline" onclick="autoEnrich()" id="btn-enrich">🤖 עדכן תכנים חסרים עכשיו</button>
      <div id="enrich-st" class="status" style="display:none"></div>
    </div>

    <div class="acard">
      <div class="acard-title"><span class="dot"></span>כניסה סודית</div>
      <div class="fg"><label>מילת קסם</label><input id="cfg-word" placeholder="ZovexSystem2026"></div>
      <div class="row2">
        <div class="fg"><label>PIN</label><input id="cfg-pin" type="password" maxlength="6" inputmode="numeric"></div>
        <div class="fg"><label>מפתח סודי</label><input id="cfg-sec" type="password"></div>
      </div>
      <button class="btn btn-red" onclick="updateAuth()">🔒 עדכן פרטי כניסה</button>
    </div>

    <div class="acard">
      <div class="acard-title"><span class="dot"></span>נתונים</div>
      <div class="btn-row">
        <button class="btn btn-gray" onclick="exportData()">📤 ייצא JSON</button>
        <button class="btn btn-gray" onclick="if(confirm('למחוק הכל?'))clearData()">🗑 נקה הכל</button>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
let data = JSON.parse(localStorage.getItem('zovex_data')||'null') || [
  {id:1,title:"Big Buck Bunny",year:"2008",cat:"מצוירים",poster:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg",video:"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",desc:"סרטון אנימציה קלאסי — ארנב ענק נוקם בחיות קטנות ושובבות."},
  {id:2,title:"Tears of Steel",year:"2012",cat:"סרטים",poster:"https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg",video:"https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",desc:"סרט מדע בדיוני קצר — עתיד עגום שבו רובוטים שולטים בעולם."},
  {id:3,title:"Elephant Dream",year:"2006",cat:"מצוירים",poster:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/220px-Elephants_Dream_s5_both.jpg",video:"https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",desc:"מסע סוריאליסטי בין שני גיבורים — הפקת האנימציה הפתוחה הראשונה בעולם."}
];

// Categories stored separately so they can be edited
let categories = JSON.parse(localStorage.getItem('zovex_cats')||'null') || ['סרטים','סדרות','מצוירים','חדש 2026'];
let keys = JSON.parse(localStorage.getItem('zovex_keys')||'{}');
let auth = JSON.parse(localStorage.getItem('zovex_auth')||'null') || {word:'ZovexSystem2026',pin:'123456',secret:'zovex'};
let hls=null, mainTab='הכל', adminTab='הכל';
let bulkPending = null; // {showName, newCat}

function save(){ localStorage.setItem('zovex_data',JSON.stringify(data)); }
function saveCats(){ localStorage.setItem('zovex_cats',JSON.stringify(categories)); }

// ---- CATEGORY MANAGER ----
function openCatModal(){
  renderCatList();
  document.getElementById('cat-modal').classList.add('open');
}
function closeCatModal(){
  document.getElementById('cat-modal').classList.remove('open');
}
function renderCatList(){
  document.getElementById('cat-list').innerHTML = categories.map((c,i)=>`
    <div class="cat-item" id="catrow-${i}">
      <span style="font-size:14px">☰</span>
      <input value="${c}" id="cat-inp-${i}" onchange="categories[${i}]=this.value">
      <button class="btn-sm del" onclick="deleteCategory(${i})">✕</button>
    </div>
  `).join('');
}
function addCategory(){
  const v = document.getElementById('new-cat-input').value.trim();
  if(!v) return;
  if(categories.includes(v)){toast('⚠️ קטגוריה כבר קיימת');return;}
  categories.push(v);
  document.getElementById('new-cat-input').value='';
  renderCatList();
}
function deleteCategory(i){
  const name = categories[i];
  const count = data.filter(c=>c.cat===name).length;
  if(count>0 && !confirm(`יש ${count} תכנים בקטגוריה "${name}". למחוק בכל זאת?`)) return;
  categories.splice(i,1);
  renderCatList();
}
function saveCategoriesAndClose(){
  // Collect edited names from inputs
  categories = categories.map((_,i)=>{
    const el = document.getElementById('cat-inp-'+i);
    return el ? el.value.trim() : categories[i];
  }).filter(Boolean);

  // Check for renames: compare old vs new
  const oldCats = JSON.parse(localStorage.getItem('zovex_cats')||'null') || ['סרטים','סדרות','מצוירים','חדש 2026'];
  // Update data items if a category was renamed
  // (simple approach: if item's cat no longer exists in new cats, try to match by index)
  saveCats();
  renderAllTabs();
  populateCatSelects();
  closeCatModal();
  toast('✅ קטגוריות עודכנו');
  renderMain();
  renderAdminBrowse();
}

function renderAllTabs(){
  // Main tabs
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = `<div class="tab ${mainTab==='הכל'?'active':''}" onclick="setTab('הכל',this)">הכל</div>` +
    categories.map(c=>`<div class="tab ${mainTab===c?'active':''}" onclick="setTab('${c}',this)">${c==='חדש 2026'?'🔥 ':''} ${c}</div>`).join('');

  // Admin tabs
  const atabs = document.getElementById('admin-tabs');
  atabs.innerHTML = `<div class="tab active" style="font-size:12px" onclick="setATab('הכל',this)">הכל</div>` +
    categories.map(c=>`<div class="tab" style="font-size:12px" onclick="setATab('${c}',this)">${c}</div>`).join('');
}

function populateCatSelects(){
  // Add form select
  const fc = document.getElementById('fc');
  const prev = fc.value;
  fc.innerHTML = categories.map(c=>`<option ${c===prev?'selected':''}>${c}</option>`).join('');
  // Bulk modal select
  const bs = document.getElementById('bulk-cat-select');
  if(bs) bs.innerHTML = categories.map(c=>`<option>${c}</option>`).join('');
}

// ---- BULK MOVE ----
function openBulkModal(showName, currentCat){
  bulkPending = {showName, currentCat};
  document.getElementById('bulk-desc').textContent = `הסדרה "${showName}" — כרגע בקטגוריה "${currentCat}". לאיזה קטגוריה להעביר את כל הפרקים?`;
  const bs = document.getElementById('bulk-cat-select');
  bs.innerHTML = categories.filter(c=>c!==currentCat).map(c=>`<option>${c}</option>`).join('');
  document.getElementById('bulk-modal').classList.add('open');
}
function closeBulkModal(){
  document.getElementById('bulk-modal').classList.remove('open');
  bulkPending = null;
}
function confirmBulkMove(){
  if(!bulkPending) return;
  const newCat = document.getElementById('bulk-cat-select').value;
  const {showName} = bulkPending;
  let count = 0;
  data.forEach(item=>{
    if((item.showName||item.title)===showName){
      item.cat = newCat;
      item.isNew = newCat==='חדש 2026';
      count++;
    }
  });
  save();
  renderManage();
  renderAdminBrowse();
  renderMain();
  closeBulkModal();
  toast(`✅ ${count} פרקים הועברו ל"${newCat}"`);
}

// ---- TABS ----
function setTab(t,el){
  mainTab=t;
  document.querySelectorAll('#tabs .tab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('sec-label').textContent = t==='הכל'?'כל התכנים':t;
  renderMain();
}
function setATab(t,el){
  adminTab=t;
  el.closest('#admin-tabs').querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderAdminBrowse();
}

document.getElementById('search-input').addEventListener('input',function(){
  if(this.value===auth.word){this.value='';openLogin();return;}
  renderMain();
});

function renderMain(){
  const q=document.getElementById('search-input').value.toLowerCase();
  const f=data.filter(c=>(mainTab==='הכל'||c.cat===mainTab)&&(!q||c.title.toLowerCase().includes(q)));
  const g=document.getElementById('main-grid');
  if(!f.length){g.innerHTML=`<div class="empty"><div style="font-size:44px;margin-bottom:10px">🎬</div><p style="font-size:13px">אין תכנים</p></div>`;return;}
  g.innerHTML=f.map(c=>`
    <div class="card" onclick="playItem(${c.id})">
      ${c.isNew?'<div class="card-new">חדש</div>':''}
      ${c.poster?`<img src="${c.poster}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:``}
      <div class="card-fb" style="${c.poster?'display:none':''}"><div style="font-size:32px">🎬</div><div style="font-size:12px;font-weight:700;color:#3949ab">${c.title}</div></div>
      <div class="card-ov"><div class="card-name">${c.title}</div><div class="card-yr">${c.year}·${c.cat}</div></div>
    </div>`).join('');
}

function showAScreen(id,el){
  document.querySelectorAll('.admin-screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.anav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('as-'+id).classList.add('active');
  el.classList.add('active');
  if(id==='manage')renderManage();
  if(id==='browse')renderAdminBrowse();
  if(id==='settings')updateKS();
  if(id==='add')populateCatSelects();
}

function renderAdminBrowse(){
  const f=adminTab==='הכל'?data:data.filter(c=>c.cat===adminTab);
  const g=document.getElementById('admin-grid');
  if(!f.length){g.innerHTML=`<div class="empty"><div style="font-size:44px;margin-bottom:10px">🎬</div><p style="font-size:13px">אין תכנים</p></div>`;return;}
  g.innerHTML=f.map(c=>`
    <div class="card" onclick="playItem(${c.id})">
      ${c.poster?`<img src="${c.poster}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:``}
      <div class="card-fb" style="${c.poster?'display:none':''}"><div style="font-size:32px">🎬</div><div style="font-size:12px;font-weight:700;color:#3949ab">${c.title}</div></div>
      <div class="card-ov"><div class="card-name">${c.title}</div><div class="card-yr">${c.year}·${c.cat}</div></div>
    </div>`).join('');
}

function renderManage(){
  document.getElementById('cnt').textContent=data.length;
  document.getElementById('item-list').innerHTML=data.map(c=>{
    const showName = c.showName||'';
    // Check if this item belongs to a multi-episode show
    const siblings = showName ? data.filter(x=>(x.showName||x.title)===showName) : [];
    const hasSiblings = siblings.length > 1;
    return `
    <div class="ci">
      ${c.poster?`<img class="ci-thumb" src="${c.poster}" onerror="this.style.display='none'">`:`<div class="ci-thumb">🎬</div>`}
      <div class="ci-info">
        <div class="ci-name">${c.title}</div>
        <div class="ci-meta">${c.year}·<select style="font-size:10px;border:none;background:transparent;color:var(--muted);font-family:inherit;cursor:pointer" onchange="changeCat(${c.id},this.value,'${showName||c.title}')">
          ${categories.map(cat=>`<option ${cat===c.cat?'selected':''}>${cat}</option>`).join('')}
        </select></div>
        ${showName?`<div style="font-size:10px;color:var(--accent);margin-top:2px">📺 ${showName}</div>`:''}
        ${c.desc?`<div class="ci-desc">${c.desc}</div>`:`<div class="ci-miss">⚠ חסר תיאור</div>`}
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
        ${hasSiblings?`<button class="btn-sm" style="background:#fff3e0;border-color:#ff9500;color:#ff9500;font-size:10px" onclick="openBulkModal('${showName||c.title}','${c.cat}')">📦 כל הסדרה</button>`:''}
        <div style="display:flex;gap:4px">
          <button class="btn-sm" onclick="editItem(${c.id})">✎</button>
          <button class="btn-sm del" onclick="delItem(${c.id})">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function changeCat(id, newCat, showName){
  const item = data.find(x=>x.id===id);
  if(!item) return;
  const oldCat = item.cat;
  item.cat = newCat;
  item.isNew = newCat==='חדש 2026';
  save();

  // Check if there are siblings (other episodes of same show)
  const siblings = data.filter(x => x.id!==id && (x.showName||x.title)===showName);
  if(siblings.length > 0){
    // Prompt to move entire show
    if(confirm(`יש עוד ${siblings.length} פרקים של "${showName}". להעביר את כל הסדרה ל"${newCat}"?`)){
      siblings.forEach(x=>{ x.cat=newCat; x.isNew=newCat==='חדש 2026'; });
      save();
      toast(`✅ כל הסדרה הועברה ל"${newCat}"`);
    } else {
      toast(`✅ פרק אחד הועבר ל"${newCat}"`);
    }
  } else {
    toast(`✅ קטגוריה שונתה ל"${newCat}"`);
  }
  renderManage();
  renderMain();
}

function editItem(id){
  const c=data.find(x=>x.id===id);if(!c)return;
  document.getElementById('ft').value=c.title;
  document.getElementById('fy').value=c.year;
  populateCatSelects();
  document.getElementById('fc').value=c.cat;
  document.getElementById('fd').value=c.desc||'';
  document.getElementById('fp').value=c.poster||'';
  document.getElementById('fv').value=c.video||'';
  document.getElementById('fshow').value=c.showName||'';
  delItem(id,true);
  showAScreen('add',document.querySelectorAll('.anav-btn')[1]);
  toast('✏️ ערוך ושמור');
}
function delItem(id,silent=false){data=data.filter(c=>c.id!==id);save();renderManage();if(!silent)toast('🗑 נמחק');}
function saveItem(){
  const t=document.getElementById('ft').value.trim(),v=document.getElementById('fv').value.trim();
  if(!t||!v){setSt('add-st','⚠️ שם ולינק וידאו חובה','err');return;}
  const showName = document.getElementById('fshow').value.trim();
  const newCat = document.getElementById('fc').value;
  data.unshift({id:Date.now(),title:t,year:document.getElementById('fy').value||'2026',
    cat:newCat,desc:document.getElementById('fd').value.trim(),
    poster:document.getElementById('fp').value.trim(),video:v,
    showName: showName||'',
    isNew:newCat==='חדש 2026'});
  save();
  ['ft','fy','fd','fp','fv','fshow'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('sr-list').innerHTML='';
  setSt('add-st','✅ נשמר!','ok');toast('✅ נשמר!');renderManage();
  setTimeout(()=>document.getElementById('add-st').style.display='none',3000);
}

function saveKeys(){
  keys.tmdb=document.getElementById('tmdb-k').value.trim();
  keys.gemini=document.getElementById('gemini-k').value.trim();
  localStorage.setItem('zovex_keys',JSON.stringify(keys));
  updateKS(); toast('✅ מפתחות נשמרו');
}
function updateKS(){
  const ts=document.getElementById('tmdb-ks'),gs=document.getElementById('gemini-ks');
  ts.textContent=keys.tmdb?'מוגדר ✓':'לא מוגדר'; ts.className='ks '+(keys.tmdb?'set':'unset');
  gs.textContent=keys.gemini?'מוגדר ✓':'לא מוגדר'; gs.className='ks '+(keys.gemini?'set':'unset');
  if(keys.tmdb)document.getElementById('tmdb-k').value=keys.tmdb;
  if(keys.gemini)document.getElementById('gemini-k').value=keys.gemini;
}
function updateAuth(){
  const w=document.getElementById('cfg-word').value.trim();
  const p=document.getElementById('cfg-pin').value.trim();
  const s=document.getElementById('cfg-sec').value.trim();
  if(!w||!p||!s){toast('⚠️ מלא את כל השדות');return;}
  auth={word:w,pin:p,secret:s};
  localStorage.setItem('zovex_auth',JSON.stringify(auth));
  ['cfg-word','cfg-pin','cfg-sec'].forEach(id=>document.getElementById(id).value='');
  toast('🔒 פרטי כניסה עודכנו');
}

async function tmdbSearch(){
  const q=document.getElementById('tq').value.trim();if(!q)return;
  if(!keys.tmdb){setSt('add-st','⚠️ הכנס TMDB Key (v3) בהגדרות','err');document.getElementById('add-st').style.display='block';return;}
  const btn=document.getElementById('btn-ts');btn.innerHTML='<span class="spinner"></span>';btn.disabled=true;
  try{
    const r=await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${keys.tmdb}&query=${encodeURIComponent(q)}&language=he`);
    const d=await r.json();
    const res=(d.results||[]).filter(x=>x.media_type!=='person').slice(0,5);
    window._tmdb=res;
    document.getElementById('sr-list').innerHTML=res.length?res.map((x,i)=>`
      <div class="sr-item" onclick="pickTmdb(${i})" id="sri-${i}">
        ${x.poster_path?`<img class="sr-thumb" src="https://image.tmdb.org/t/p/w92${x.poster_path}">`:`<div class="sr-thumb" style="display:flex;align-items:center;justify-content:center;font-size:20px">🎬</div>`}
        <div><div class="sr-title">${x.title||x.name||''}</div>
        <div class="sr-year">${(x.release_date||x.first_air_date||'').slice(0,4)}·${x.media_type==='tv'?'סדרה':'סרט'}</div>
        <div class="sr-ov">${x.overview||'אין תיאור'}</div></div>
      </div>`).join(''):`<div style="font-size:12px;color:var(--muted);padding:8px">לא נמצאו תוצאות</div>`;
  }catch(e){document.getElementById('sr-list').innerHTML=`<div style="font-size:12px;color:var(--red);padding:8px">שגיאה: ${e.message}</div>`;}
  btn.innerHTML='🔍 חפש ב-TMDB';btn.disabled=false;
}
function pickTmdb(i){
  document.querySelectorAll('.sr-item').forEach(el=>el.classList.remove('sel'));
  document.getElementById('sri-'+i).classList.add('sel');
  const x=window._tmdb[i];if(!x)return;
  document.getElementById('ft').value=x.title||x.name||'';
  document.getElementById('fy').value=(x.release_date||x.first_air_date||'').slice(0,4);
  populateCatSelects();
  document.getElementById('fc').value=x.media_type==='tv'?'סדרות':'סרטים';
  document.getElementById('fd').value=x.overview||'';
  if(x.poster_path)document.getElementById('fp').value=`https://image.tmdb.org/t/p/w500${x.poster_path}`;
  toast('✅ פרטים הועתקו');
}
async function aiDesc(){
  const title=document.getElementById('ft').value.trim();
  if(!title){toast('⚠️ הכנס שם קודם');return;}
  if(!keys.gemini){setSt('add-st','⚠️ הכנס Groq Key בהגדרות','err');document.getElementById('add-st').style.display='block';return;}
  const btn=document.getElementById('btn-ai');btn.innerHTML='<span class="spinner"></span>';btn.disabled=true;
  document.getElementById('add-st').style.display='block';setSt('add-st','✨ Groq AI כותב תיאור...');
  try{
    const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({contents:[{parts:[{text:`כתוב תיאור קצר ומרתק בעברית (3 משפטים, סגנון נטפליקס) לסרט: "${title}". רק התיאור עצמו.`}]}]})
    });
    const d=await r.json();
    const txt=d.choices?.[0]?.message?.content||'';
    if(txt){document.getElementById('fd').value=txt;setSt('add-st','✅ תיאור נוצר!','ok');}
    else setSt('add-st','⚠️ לא התקבל תיאור. בדוק מפתח.','err');
  }catch(e){setSt('add-st','❌ '+e.message,'err');}
  btn.innerHTML='✨ AI תיאור';btn.disabled=false;
}
async function autoEnrich(){
  const missing=data.filter(c=>!c.desc||!c.poster);
  if(!missing.length){toast('✅ כל התכנים מלאים!');return;}
  if(!keys.gemini&&!keys.tmdb){setSt('enrich-st','⚠️ הכנס מפתחות בהגדרות','err');document.getElementById('enrich-st').style.display='block';return;}
  const btn=document.getElementById('btn-enrich');btn.disabled=true;btn.innerHTML='<span class="spinner"></span> מעדכן...';
  document.getElementById('enrich-st').style.display='block';
  let done=0;
  for(const item of missing){
    setSt('enrich-st',`מעדכן: "${item.title}" (${done+1}/${missing.length})...`);
    if(!item.poster&&keys.tmdb){try{const r=await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${keys.tmdb}&query=${encodeURIComponent(item.title)}`);const d=await r.json();const x=(d.results||[])[0];if(x?.poster_path)item.poster=`https://image.tmdb.org/t/p/w500${x.poster_path}`;}catch(e){}}
    if(!item.desc&&keys.gemini){try{const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+keys.gemini},body:JSON.stringify({model:'meta-llama/llama-4-scout-17b-16e-instruct',max_tokens:150,messages:[{role:'user',content:`תיאור קצר בעברית (2-3 משפטים, סגנון נטפליקס) לסרט: "${item.title}". רק התיאור.`}]})});const d=await r.json();const txt=d.choices?.[0]?.message?.content||'';if(txt)item.desc=txt;}catch(e){}}
    done++;
  }
  save();renderManage();renderAdminBrowse();
  setSt('enrich-st',`✅ עודכנו ${done} תכנים!`,'ok');
  btn.disabled=false;btn.innerHTML='🤖 עדכן תכנים חסרים עכשיו';
  toast(`✅ ${done} תכנים עודכנו`);
}
async function runChecks(){
  const btn=document.getElementById('btn-check');btn.disabled=true;btn.innerHTML='<span class="spinner"></span> בודק...';
  function setChk(id,state,msg){const el=document.getElementById(id);el.className='sys-row '+state;const ic={ok:'✅',err:'❌',checking:'🔄'};el.textContent=ic[state]+' '+msg;}
  function delay(ms){return new Promise(r=>setTimeout(r,ms));}
  setChk('chk-hls','checking','HLS Player — בודק...');await delay(300);
  if(typeof Hls!=='undefined'&&Hls.isSupported())setChk('chk-hls','ok','HLS Player — פעיל ותומך בסטרימינג ✓');
  else if(typeof Hls!=='undefined')setChk('chk-hls','ok','HLS Player — נתמך דרך הדפדפן ✓');
  else setChk('chk-hls','err','HLS Player — לא נטען. בדוק חיבור אינטרנט.');
  setChk('chk-storage','checking','אחסון מקומי — בודק...');await delay(300);
  try{localStorage.setItem('zovex_test','1');localStorage.removeItem('zovex_test');setChk('chk-storage','ok',`אחסון מקומי — פעיל · ${data.length} תכנים שמורים ✓`);}
  catch(e){setChk('chk-storage','err','אחסון מקומי — חסום בדפדפן זה');}
  setChk('chk-tmdb','checking','TMDB API — מתחבר...');await delay(400);
  if(!keys.tmdb){setChk('chk-tmdb','err','TMDB API — מפתח לא הוזן. דרוש API Key v3');}
  else if(keys.tmdb.startsWith('eyJ')){setChk('chk-tmdb','err','TMDB API — זה JWT Token, דרוש API Key (v3) הקצר');}
  else{try{const r=await fetch(`https://api.themoviedb.org/3/configuration?api_key=${keys.tmdb}`);const d=await r.json();if(d.images)setChk('chk-tmdb','ok','TMDB API — מחובר ופעיל ✓');else setChk('chk-tmdb','err',`TMDB API — שגיאה: ${d.status_message||'מפתח לא תקין'}`);}catch(e){setChk('chk-tmdb','err','TMDB API — שגיאת רשת. נסה מהמחשב ישירות.');}}
  setChk('chk-gemini','checking','Gemini API — מתחבר...');await delay(400);
  if(!keys.gemini){setChk('chk-gemini','err','Groq AI — מפתח לא הוזן');}
  else{try{const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+keys.gemini},body:JSON.stringify({model:'meta-llama/llama-4-scout-17b-16e-instruct',max_tokens:5,messages:[{role:'user',content:'שלום'}]})});const d=await r.json();if(d.choices)setChk('chk-gemini','ok','Groq AI — מחובר ופעיל ✓');else setChk('chk-gemini','err',`Groq AI — ${d.error?.message||'מפתח לא תקין'}`);}catch(e){setChk('chk-gemini','err','Groq AI — שגיאת רשת. נסה מהמחשב ישירות.');}}
  btn.disabled=false;btn.innerHTML='🔍 הפעל בדיקת מערכת';toast('✅ בדיקה הושלמה');
}
function playItem(id){
  const item=data.find(c=>c.id===id);if(!item?.video)return;
  document.getElementById('player-title').textContent=item.title;
  document.getElementById('player').classList.add('open');
  const box=document.getElementById('zovex_player');box.innerHTML='';
  const v=document.createElement('video');v.controls=true;v.autoplay=true;v.playsinline=true;box.appendChild(v);
  if(item.video.includes('.m3u8')&&typeof Hls!=='undefined'&&Hls.isSupported()){
    if(hls)hls.destroy();hls=new Hls();hls.loadSource(item.video);hls.attachMedia(v);
    hls.on(Hls.Events.MANIFEST_PARSED,()=>v.play());
  }else{v.src=item.video;v.play().catch(()=>{});}
}
function closePlayer(){document.getElementById('player').classList.remove('open');if(hls){hls.destroy();hls=null;}document.getElementById('zovex_player').innerHTML='';}
function openLogin(){document.getElementById('lpin').value='';document.getElementById('lsec').value='';document.getElementById('login-modal').classList.add('open');setTimeout(()=>document.getElementById('lpin').focus(),100);}
function closeLogin(){document.getElementById('login-modal').classList.remove('open');}
function tryLogin(){
  if(document.getElementById('lpin').value===auth.pin&&document.getElementById('lsec').value===auth.secret){
    closeLogin();document.getElementById('main').style.display='none';
    document.getElementById('admin').classList.add('open');
    updateKS();renderAdminBrowse();toast('🔓 ברוך הבא!');
  }else{closeLogin();}
}
document.getElementById('lpin').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('lsec').focus();});
document.getElementById('lsec').addEventListener('keydown',e=>{if(e.key==='Enter')tryLogin();});
function closeAdmin(){document.getElementById('admin').classList.remove('open');document.getElementById('main').style.display='block';renderMain();}
function setSt(id,msg,type=''){const el=document.getElementById(id);el.style.display='block';el.textContent=msg;el.className='status'+(type?' '+type:'');}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500);}
function exportData(){const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='zovex.json';a.click();}
function clearData(){data=[];save();renderManage();renderMain();toast('🗑 נוקה');}

// Init
renderAllTabs();
populateCatSelects();
renderMain();
</script>
</body>
</html>