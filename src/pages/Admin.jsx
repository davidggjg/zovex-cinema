import React, { useState, useEffect } from "react";
import { uploadFile } from "@/integrations/core";
import { generateText } from "@/integrations/ai";
import { Movie } from "@/entities/Movie";
import { 
  Plus, Film, Image as ImageIcon, 
  Video, Sparkles, Loader2, Lock, LogOut 
} from "lucide-react";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ word: "", pin: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "סרטים",
    thumbnail_url: "",
    video_url: "",
    description: ""
  });

  // בדיקה אם המשתמש כבר מחובר (שמור בדפדפן)
  useEffect(() => {
    if (localStorage.getItem("zovex_admin_auth") === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // פונקציית כניסה
  const handleLogin = (e) => {
    e.preventDefault();
    const secretWord = "ZovexSystem2026";
    const secretPin = "123456";

    if (loginData.word === secretWord && loginData.pin === secretPin) {
      setIsLoggedIn(true);
      localStorage.setItem("zovex_admin_auth", "true");
    } else {
      alert("פרטי כניסה שגויים! בדוק את מילת הקסם וה-PIN");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("zovex_admin_auth");
  };

  // העלאת קבצים מהטלפון
  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(30); 

    try {
      const { url } = await uploadFile(file);
      setFormData(prev => ({ ...prev, [field]: url }));
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1500);
    } catch (error) {
      alert("ההעלאה נכשלה");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // יצירת תיאור AI
  const handleGenerateAI = async () => {
    if (!formData.title) return alert("רשום קודם את שם הסרט");
    setIsGenerating(true);
    try {
      const prompt = `כתוב תקציר מרתק לסרט "${formData.title}" בעברית. עד 3 משפטים.`;
      const aiText = await generateText(prompt);
      setFormData(prev => ({ ...prev, description: aiText }));
    } catch (error) {
      alert("שגיאה ב-AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url) return alert("חובה למלא שם ווידאו");
    try {
      await Movie.create(formData);
      alert("הסרט פורסם בהצלחה!");
      setFormData({ title: "", category: "סרטים", thumbnail_url: "", video_url: "", description: "" });
    } catch (error) {
      alert("שגיאה בשמירה");
    }
  };

  // מסך כניסה
  if (!isLoggedIn) {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-gray-200 text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black mb-6 text-gray-800">כניסת מנהל ZOVEX</h2>
          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">מילת קסם</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500"
                onChange={e => setLoginData({...loginData, word: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">קוד PIN</label>
              <input 
                type="password" 
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500 text-center tracking-widest"
                onChange={e => setLoginData({...loginData, pin: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all">
              התחבר עכשיו
            </button>
          </form>
        </div>
      </div>
    );
  }

  // פאנל ניהול (אחרי כניסה)
  return (
    <div dir="rtl" className="max-w-xl mx-auto p-5 bg-gray-50 min-h-screen pb-20">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Film size={24} /></div>
          <h1 className="text-2xl font-black text-gray-800">ניהול תוכן</h1>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">שם הסרט</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="למשל: מהיר ועצבני 10"
          />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase">תיאור העלילה</label>
            <button type="button" onClick={handleGenerateAI} disabled={isGenerating} className="text-blue-600 text-xs font-bold flex items-center gap-1">
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} צור עם AI ✨
            </button>
          </div>
          <textarea 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border relative cursor-pointer hover:bg-gray-50 text-center">
            <ImageIcon size={20} className="mx-auto mb-1 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500">פוסטר מהגלריה</span>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => handleFileUpload(e, 'thumbnail_url')} />
            {formData.thumbnail_url && <div className="text-[9px] text-green-500 font-bold mt-1">✅ נבחר</div>}
          </div>

          <div className="bg-white p-4 rounded-2xl border relative cursor-pointer hover:bg-gray-100 text-center">
            <Video size={20} className="mx-auto mb-1 text-blue-500" />
            <span className="text-[10px] font-bold text-blue-600 uppercase">העלאת וידאו</span>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" onChange={e => handleFileUpload(e, 'video_url')} />
            {uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />} פרסם סרט
        </button>
      </form>
    </div>
  );
}