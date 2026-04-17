import type { FC } from 'react';
import { useDbPath } from '../../hooks/useDbPath';
import { usePlatform } from '../../hooks/usePlatform';
import { usePoemVault } from '../../hooks/usePoemVault';
import { useAppConfig } from '../../hooks/useAppConfig';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import './SettingsView.css';

const SettingsView: FC = () => {
  const { isDesktop, ready } = usePlatform();
  const { dbPath, changing, changeLocation, error: dbError } = useDbPath();
  const { syncNow, syncing, syncError } = usePoemVault();
  const { config, updateConfig } = useAppConfig();
  const [localIp, setLocalIp] = useState<string | null>(null);

  useEffect(() => {
    if (config?.local_sync_enabled) {
      invoke<string>('get_local_ip').then(setLocalIp).catch(console.warn);
    }
  }, [config?.local_sync_enabled]);

  if (!ready || !config) return null;

  const isMaster = config.supabase_role === 'Master';

  return (
    <div className="settings-view">
      <h2 className="settings-title">الإعدادات</h2>
      
      {/* ─── Database Section ─── */}
      <div className="settings-section">
        <h3 className="section-label">قاعدة البيانات</h3>
        {isDesktop ? (
          <div className="settings-card db-card">
            <div className="field-group">
              <span className="field-label">موقع الملف:</span>
              <code className="path-display">{dbPath || '—'}</code>
            </div>
            {dbError && <p className="error-text">{dbError}</p>}
            <button className="primary-btn" onClick={changeLocation} disabled={changing}>
              {changing ? 'جارٍ النقل...' : 'تغيير موقع الحفظ'}
            </button>
          </div>
        ) : (
          <p className="hint-text">يتم إدارة الملف تلقائيًا على هذا الجهاز.</p>
        )}
      </div>

      {/* ─── Sync Identity Section ─── */}
      <div className="settings-section">
        <h3 className="section-label">الهوية والمزامنة</h3>
        <div className="settings-card role-card">
          <p className="field-desc">اختر دور هذا الجهاز في المزامنة:</p>
          <div className="role-selector">
            <button 
              className={`role-tab ${isMaster ? 'active' : ''}`}
              onClick={() => updateConfig({ ...config, supabase_role: 'Master' })}
            >
              جهاز رئيسي (Laptop)
            </button>
            <button 
              className={`role-tab ${!isMaster ? 'active' : ''}`}
              onClick={() => updateConfig({ ...config, supabase_role: 'Peer' })}
            >
              جهاز تابع (Phone)
            </button>
          </div>
          <p className="hint-text">
            {isMaster 
              ? "الجهاز الرئيسي هو الوحيد الذي يمكنه رفع البيانات إلى Supabase."
              : "الجهاز التابع يحصل على البيانات من السحاب أو من الجهاز الرئيسي عبر Wi-Fi."}
          </p>
        </div>
      </div>

      {/* ─── Supabase Section ─── */}
      <div className="settings-section">
        <h3 className="section-label">السحابة (Supabase)</h3>
        <div className="settings-card cloud-card">
          <div className="input-field">
            <label>Supabase URL</label>
            <input 
              type="text" 
              value={config.supabase_url || ''} 
              onChange={(e) => updateConfig({ ...config, supabase_url: e.target.value })}
              placeholder="https://xxx.supabase.co"
            />
          </div>
          <div className="input-field">
            <label>API Key</label>
            <input 
              type="password" 
              value={config.supabase_anon_key || ''} 
              onChange={(e) => updateConfig({ ...config, supabase_anon_key: e.target.value })}
              placeholder="Your anon key"
            />
          </div>
          
          {isMaster && (
            <button 
              className="sync-btn" 
              onClick={syncNow} 
              disabled={syncing || !config.supabase_url}
            >
              {syncing ? 'جارٍ المزامنة...' : 'مزامنة مع السحابة الآن'}
            </button>
          )}
          {syncError && <p className="error-text">{syncError}</p>}
        </div>
      </div>

      {/* ─── Local Sync Section ─── */}
      <div className="settings-section">
        <h3 className="section-label">المزامنة المحلية (Wi-Fi)</h3>
        <div className="settings-card local-card">
          {isMaster ? (
            <div className="hub-setup">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={config.local_sync_enabled}
                  onChange={(e) => updateConfig({ ...config, local_sync_enabled: e.target.checked })}
                />
                تفعيل البث (Hub)
              </label>
              {config.local_sync_enabled && localIp && (
                <div className="ip-info">
                  <p>عنوان الجهاز الحالي:</p>
                  <code className="ip-display">{localIp}</code>
                  <p className="hint-text">أدخل هذا العنوان في إعدادات الهاتف للمزامنة المباشرة.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="peer-setup">
              <div className="input-field">
                <label>عنوان الجهاز الرئيسي (IP)</label>
                <input 
                  type="text" 
                  value={config.local_hub_ip || ''} 
                  onChange={(e) => updateConfig({ ...config, local_hub_ip: e.target.value })}
                  placeholder="192.168.1.xxx"
                />
              </div>
              <button 
                className="sync-btn" 
                onClick={syncNow} 
                disabled={syncing || !config.local_hub_ip}
              >
                {syncing ? 'جارٍ المزامنة...' : 'مزامنة مع الكمبيوتر الآن'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
