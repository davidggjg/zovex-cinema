import React, { useState } from "react";
import { uploadFile } from "@/integrations/core";
import { generateText } from "@/integrations/ai";
import { Movie } from "@/entities/Movie";
import { 
  Plus, Trash2, Film, Image as ImageIcon, 
  Video, Sparkles, Loader2, CheckCircle 
} from "lucide-react";

export default function Admin() {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    category: "סרטים",
    thumbnail_url: "",
    video_url: "",
    description: ""
  });

  // פונקציה להעלאת קבצים (תמונה או וידאו) מהטלפון
  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(30); // סימולציה של התחלת טעינה

    try {
      const { url } = await uploadFile(file);
      setFormData(prev => ({ ...prev, [field]: url }));
      setProgress(100);
      setTimeout(() => setProgress(0), 2000);
    } catch (error) {
      alert("שגיאה בהעלאת הקובץ");
    } finally {
      setIsUploading(false);
    }
  };

  // פונקציית AI ליצירת תיאור אוטומטי
  const handleAIDescription = async () => {
    if (!formData.title) return alert("אנא הזן שם סרט קודם");
    
    setIsGenerating(true);
    try {
      const prompt = `כתוב תקציר מרתק בעברית (2-3 משפטים) בסגנון נטפליקס לסרט: "${formData.title}"`;
      const text = await generateText(prompt);
      setFormData(prev => ({ ...prev, description: text }));
    } catch (error) {
      alert("שגיאה ביצירת תיאור AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.video_url) return alert("חובה להעלות וידאו!");
    
    try {
      await Movie.create(formData);
      alert("הסרט נוסף בהצלחה!");
      setFormData({ title: "", category: "סרטים", thumbnail_url: "", video_url: "", description: "" });
    } catch (error) {
      alert("שגיאה בשמירת הסרט");
    }
  };

  return (
    <div dir="rtl" className="p-4 max-w-2xl mx-auto bg-gray-50 min-h-screen font-sans">
      <header className="flex items-center gap-2 mb-8 border-b pb-4">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Film size={24} />
        </div>
        <h1 className="text-xl font-black text-gray-900">ZOVEX STUDIO</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        {/* שם הסרט */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">שם הסרט / סדרה</label>
          <input 
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="מהיר ועצבני 10..."
          />
        </div>

        {/* תיאור AI */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-500 uppercase">תיאור</label>
            <button 
              type="button"
              onClick={handleAIDescription}
              disabled={isGenerating}
              className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:opacity-70 transition-opacity"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              צור תיאור ✨
            </button>
          </div>
          <textarea 
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none focus:border-blue-500 h-24 resize-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {/* העלאת פוסטר */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">פוסטר (מהגלריה)</label>
          <div className="flex gap-2">
            <input 
              className="flex-1 p-3 bg-gray-100 border border-gray-200 rounded-xl text-xs truncate"
              value={formData.thumbnail_url} 
              readOnly 
              placeholder="העלה תמונה..."
            />
            <label className="cursor-pointer bg-gray-200 p-3 rounded-xl hover:bg-gray-300 transition-colors">
              <ImageIcon size={20} className="text-gray-600" />
              <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'thumbnail_url')} />
            </label>
          </div>
        </div>

        {/* העלאת וידאו + פס טעינה (שנצ'יציה) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">קובץ וידאו (הסרט עצמו)</label>
          <div className="flex gap-2">
            <input 
              className="flex-1 p-3 bg-gray-100 border border-gray-200 rounded-xl text-xs truncate"
              value={formData.video_url} 
              readOnly 
              placeholder="העלה וידאו..."
            />
            <label className="cursor-pointer bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              <Video size={20} />
              <input type="file" className="hidden" accept="video/*" onChange={e => handleFileChange(e, 'video_url')} />
            </label>
          </div>
          
          {progress > 0 && (
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={isUploading || isGenerating}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center gap-2 hover:bg-green-600 transition-all disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
          פרסם סרט ב-ZOVEX
        </button>

      </form>
    </div>
  );
}