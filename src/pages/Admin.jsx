import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Logo from '../components/zovex/Logo';
import CategoryTabs from '../components/zovex/CategoryTabs';
import ContentGrid from '../components/zovex/ContentGrid';
import ContentDetailModal from '../components/zovex/ContentDetailModal';
import PlayerModal from '../components/zovex/PlayerModal';
import TMDBSearch from '../components/zovex/admin/TMDBSearch';
import ContentForm from '../components/zovex/admin/ContentForm';
import ManageList from '../components/zovex/admin/ManageList';
import SettingsPanel from '../components/zovex/admin/SettingsPanel';
import CategoryManager from '../components/zovex/admin/CategoryManager';
import Toast, { showToast } from '../components/zovex/Toast';
import { Film, Plus, List, Settings, ArrowRight, Tag } from 'lucide-react';

const TABS = [
  { id: 'browse', label: 'תכנים', icon: Film },
  { id: 'add', label: 'הוסף', icon: Plus },
  { id: 'manage', label: 'ניהול', icon: List },
  { id: 'categories', label: 'קטגוריות', icon: Tag },
  { id: 'settings', label: 'הגדרות', icon: Settings },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('browse');
  const [browseCategory, setBrowseCategory] = useState('הכל');
  const [tmdbData, setTmdbData] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [settings, setSettings] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['admin-content'],
    queryFn: () => base44.entities.Content.list('-created_date', 500),
    initialData: [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order', 50),
    initialData: [],
  });

  const { data: settingsData = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
    initialData: [],
  });

  useEffect(() => {
    const s = {};
    settingsData.forEach(item => {
      if (item.setting_key === 'tmdb_key') s.tmdb_key = item.setting_value;
      if (item.setting_key === 'auth_config') {
        try { Object.assign(s, JSON.parse(item.setting_value)); } catch {}
      }
    });
    setSettings(s);
  }, [settingsData]);

  const refreshContent = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-content'] });
    queryClient.invalidateQueries({ queryKey: ['content'] });
  }, [queryClient]);

  const refreshCategories = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }, [queryClient]);

  const filteredBrowse = browseCategory === 'הכל' ? items : items.filter(c => c.category === browseCategory);

  const handleEdit = (item) => {
    setEditItem(item);
    setTmdbData(null);
    setActiveTab('add');
    showToast('✏️ ערוך ושמור');
  };

  const handleSaved = () => {
    refreshContent();
    setEditItem(null);
    setTmdbData(null);
  };

  return (
    <div className="min-h-screen bg-[var(--zovex-bg)]" dir="rtl">
      {/* Top bar */}
      <div className="bg-[rgba(245,245,247,0.9)] backdrop-blur-[20px] border-b border-[var(--zovex-border)] px-5 py-4 flex items-center justify-between">
        <Logo subtitle="Admin" />
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="bg-[var(--zovex-surface2)] text-[var(--zovex-muted)] border-[1.5px] border-[var(--zovex-border)] rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 hover:border-[var(--zovex-accent)] transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" /> יציאה
        </button>
      </div>

      {/* Nav tabs */}
      <div className="bg-[rgba(245,245,247,0.9)] backdrop-blur-[20px] border-b border-[var(--zovex-border)] sticky top-0 z-10 flex overflow-x-auto hide-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[64px] py-3 text-center text-[10px] font-bold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'text-[var(--zovex-accent)] border-[var(--zovex-accent)]'
                : 'text-[var(--zovex-muted)] border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4 mx-auto mb-0.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Browse */}
        {activeTab === 'browse' && (
          <div>
            <div className="mb-4">
              <CategoryTabs active={browseCategory} onChange={setBrowseCategory} categories={categories} size="small" />
            </div>
            <ContentGrid items={filteredBrowse} onItemClick={setSelected} />
          </div>
        )}

        {/* Add / Edit */}
        {activeTab === 'add' && (
          <div>
            <TMDBSearch tmdbKey={settings.tmdb_key} onSelect={(d) => { setTmdbData(d); setEditItem(null); }} />
            <ContentForm
              tmdbData={tmdbData}
              editItem={editItem}
              categories={categories}
              onSaved={handleSaved}
            />
          </div>
        )}

        {/* Manage */}
        {activeTab === 'manage' && (
          <ManageList items={items} onEdit={handleEdit} onRefresh={refreshContent} />
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <CategoryManager categories={categories} onRefresh={refreshCategories} />
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <SettingsPanel settings={settings} onSettingsChange={setSettings} items={items} onRefresh={refreshContent} />
        )}
      </div>

      {/* Detail */}
      {selected && (
        <ContentDetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onPlay={(item) => { setSelected(null); setPlaying(item); }}
        />
      )}

      {playing && <PlayerModal item={playing} onClose={() => setPlaying(null)} />}
      <Toast />
    </div>
  );
}