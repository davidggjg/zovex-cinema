import React, { useState, useEffect } from 'react';

const Admin = () => {
  // מצבי מערכת (State)
  const [data, setData] = useState([]);
  const [keys, setKeys] = useState({ tmdb: '', gemini: '' });
  const [activeScreen, setActiveScreen] = useState('browse');
  const [adminTab, setAdminTab] = useState('הכל');
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [tmdbResults, setTmdbResults] = useState([]);
  
  // טופס הוספה
  const [formData, setFormData] = useState({
    title: '', year: '2026', cat: 'סרטים', desc: '', poster: '', video: ''
  });

  // טעינת נתונים ראשונית
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('zovex_data') || '[]');
    const savedKeys = JSON.parse(localStorage.getItem('zovex_keys') || '{}');
    setData(savedData);
    setKeys(savedKeys);
  }, []);

  // פונקציות עזר
  const saveToLocal = (newData) => {
    setData(newData);
    localStorage.setItem('zovex_data', JSON.stringify(newData));
  };

  const handleSaveItem = () => {
    if (!formData.title || !formData.video) {
      showStatus('⚠️ שם ולינק וידאו חובה', 'err');
      return;
    }
    const newItem = { ...formData, id: Date.now(), isNew: formData.cat === 'חדש 2026' };
    const updatedData = [newItem, ...data];
    saveToLocal(updatedData);
    setFormData({ title: '', year: '2026', cat: 'סרטים', desc: '', poster: '', video: '' });
    showStatus('✅ נשמר בהצלחה!', 'ok');
  };

  const deleteItem = (id) => {
    if (window.confirm('למחוק את התוכן?')) {
      const updatedData = data.filter(item => item.id !== id);
      saveToLocal(updatedData);
    }
  };

  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zovex_backup.json';
    a.click();
  };

  // רינדור רשימת התכנים (Browse)
  const filteredData = adminTab === 'הכל' ? data : data.filter(item => item.cat === adminTab);

  return (
    <div className="admin-container" style={{ direction: 'rtl', backgroundColor: '#F5F5F7', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: '#fff', borderBottom: '1px solid #d2d2d7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: '900', color: '#0071e3' }}>ZOVEX <span style={{ fontSize: '12px', color: '#6e6e73' }}>Admin</span></div>
        <button onClick={() => window.location.href = '/'} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #d2d2d7', cursor: 'pointer' }}>יציאה</button>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', background: 'rgba(245,245,247,0.9)', borderBottom: '1px solid #d2d2d7', sticky: 'top' }}>
        {['browse', 'add', 'manage', 'settings'].map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveScreen(tab)}
            style={{ 
              flex: 1, padding: '14px', textAlign: 'center', cursor: 'pointer', 
              color: activeScreen === tab ? '#0071e3' : '#6e6e73',
              borderBottom: activeScreen === tab ? '2px solid #0071e3' : '2px solid transparent',
              fontWeight: '700', fontSize: '13px'
            }}
          >
            {tab === 'browse' && '🎬 תכנים'}
            {tab === 'add' && '➕ הוסף'}
            {tab === 'manage' && '📋 ניהול'}
            {tab === 'settings' && '⚙️ הגדרות'}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        {/* Screen: Browse */}
        {activeScreen === 'browse' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto' }}>
              {['הכל', 'סרטים', 'סדרות', 'מצוירים', 'חדש 2026'].map(t => (
                <button 
                  key={t}
                  onClick={() => setAdminTab(t)}
                  style={{ 
                    padding: '6px 16px', borderRadius: '20px', border: '1px solid #d2d2d7',
                    background: adminTab === t ? '#0071e3' : '#fff',
                    color: adminTab === t ? '#fff' : '#6e6e73', cursor: 'pointer'
                  }}
                >{t}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              {filteredData.map(item => (
                <div key={item.id} style={{ borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <img src={item.poster} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  <div style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screen: Add Item */}
        {activeScreen === 'add' && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginBottom: '15px' }}>הוספת תוכן חדש</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="שם הסרט/סדרה" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder="שנה" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} style={{...inputStyle, flex: 1}} />
                <select value={formData.cat} onChange={e => setFormData({...formData, cat: e.target.value})} style={{...inputStyle, flex: 1}}>
                  <option>סרטים</option>
                  <option>סדרות</option>
                  <option>מצוירים</option>
                  <option>חדש 2026</option>
                </select>
              </div>
              <textarea placeholder="תיאור" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} style={{...inputStyle, height: '80px'}} />
              <input type="text" placeholder="קישור לפוסטר (URL)" value={formData.poster} onChange={e => setFormData({...formData, poster: e.target.value})} style={inputStyle} />
              <input type="text" placeholder="קישור וידאו (m3u8/mp4)" value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} style={inputStyle} />
              <button onClick={handleSaveItem} style={{ background: '#34c759', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>💾 שמור תוכן</button>
              {status.msg && <div style={{ padding: '10px', borderRadius: '8px', fontSize: '13px', backgroundColor: status.type === 'ok' ? '#f0fff4' : '#fff5f5', color: status.type === 'ok' ? 'green' : 'red', border: '1px solid' }}>{status.msg}</div>}
            </div>
          </div>
        )}

        {/* Screen: Manage */}
        {activeScreen === 'manage' && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '16px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>ניהול תכנים ({data.length})</div>
            {data.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <img src={item.poster} alt="" style={{ width: '40px', height: '55px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: '#6e6e73' }}>{item.year} • {item.cat}</div>
                </div>
                <button onClick={() => deleteItem(item.id)} style={{ padding: '5px 10px', color: 'red', border: '1px solid red', borderRadius: '6px', background: 'none', cursor: 'pointer' }}>מחק</button>
              </div>
            ))}
          </div>
        )}

        {/* Screen: Settings */}
        {activeScreen === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>מפתחות API</div>
              <input type="password" placeholder="TMDB API Key" value={keys.tmdb} onChange={e => setKeys({...keys, tmdb: e.target.value})} style={inputStyle} />
              <button onClick={() => { localStorage.setItem('zovex_keys', JSON.stringify(keys)); alert('נשמר!'); }} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#0071e3', color: '#fff', borderRadius: '10px', border: 'none' }}>שמור מפתחות</button>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '16px' }}>
              <button onClick={exportData} style={{ width: '100%', padding: '10px', background: '#f0f0f5', border: '1px solid #d2d2d7', borderRadius: '10px', marginBottom: '10px' }}>📤 ייצא גיבוי JSON</button>
              <button onClick={() => { if(window.confirm('למחוק הכל?')) saveToLocal([]); }} style={{ width: '100%', padding: '10px', background: '#fff5f5', color: 'red', border: '1px solid red', borderRadius: '10px' }}>🗑 נקה את כל הנתונים</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #d2d2d7',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};

export default Admin;