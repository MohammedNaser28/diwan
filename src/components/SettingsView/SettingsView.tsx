import type { FC } from 'react';
import { useDbPath } from '../../hooks/useDbPath';
import { usePlatform } from '../../hooks/usePlatform';
import { usePoemVault } from '../../hooks/usePoemVault';
import { useAppConfig } from '../../hooks/useAppConfig';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { useEffect, useState } from 'react';
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import './SettingsView.css';

const SettingsView: FC = () => {
  const { isDesktop, ready } = usePlatform();
  const { dbPath, changing, changeLocation, error: dbError } = useDbPath();
  const { syncError, deduplicate, syncLocalNow, syncSupabaseNow, syncingLocal, syncingCloud, localSyncError, cloudSyncError } = usePoemVault();
  const { config, updateConfig } = useAppConfig();
  const [localIp, setLocalIp] = useState<string | null>(null);
  const [serverRunning, setServerRunning] = useState(false);
  const [dedupCount, setDedupCount] = useState<number | null>(null);
  const [version, setVersion] = useState<string>("...");

  // Update State
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getVersion().then(setVersion).catch(console.error);
    if (config?.local_sync_enabled) {
      invoke<string>('get_local_ip').then(setLocalIp).catch(console.warn);
      invoke<boolean>('get_server_status').then(setServerRunning).catch(console.warn);
    }
  }, [config?.local_sync_enabled]);

  if (!ready || !config) return null;

  const isMaster = config.supabase_role === 'Master';

  const handleCheckUpdate = async () => {
    setUpdateStatus("جارٍ التحقق من التحديثات...");
    try {
      const update = await check();
      if (update) {
        setUpdateStatus(`نسخة جديدة v${update.version} متوفرة!`);
        setUpdateAvailable(true);
      } else {
        setUpdateStatus("التطبيق محدث إلى آخر إصدار.");
        setUpdateAvailable(false);
      }
    } catch (e) {
      setUpdateStatus("خطأ أثناء التحقق: " + e);
    }
  };

  const handleDownloadUpdate = async () => {
    setDownloading(true);
    setUpdateStatus("جارٍ التنزيل...");
    try {
      const update = await check();
      if (update) {
        let downloaded = 0;
        let contentLength: number | undefined = 0;
        await update.downloadAndInstall((event: any) => {
          switch (event.event) {
            case 'Started':
              contentLength = event.data.contentLength;
              setUpdateStatus(`بدأ التنزيل...`);
              break;
            case 'Progress':
              downloaded += event.data.chunkLength;
              const percent = contentLength ? Math.round((downloaded / contentLength) * 100) : 0;
              setUpdateStatus(`جاري التحميل: ${percent}%`);
              break;
            case 'Finished':
              setUpdateStatus('اكتمل التنزيل. جارٍ إعادة التشغيل...');
              break;
          }
        });
        await relaunch();
      }
    } catch (e) {
      setUpdateStatus("خطأ أثناء التنزيل: " + e);
      setDownloading(false);
    }
  };

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
        <h3 className="section-label">
          السحابة (Supabase) {!isMaster && <span className="optional-badge">(اختياري)</span>}
        </h3>
        <div className="settings-card cloud-card">
          <div className="share-config-box">
            <h4 className="card-sub-label">إعداد سريع (مشاركة)</h4>
            <div className="share-actions">
              <button 
                className="secondary-btn small"
                onClick={() => {
                  const data = btoa(`${config.supabase_url || ''}|${config.supabase_anon_key || ''}`);
                  navigator.clipboard.writeText(data);
                  alert('تم نسخ كود الإعداد! أرسله لمن تريد مشاركة المزامنة معه.');
                }}
              >
                نسخ كود الإعداد
              </button>
              <button 
                className="secondary-btn small"
                onClick={() => {
                  const code = prompt('أدخل كود الإعداد هنا:');
                  if (code) {
                    try {
                      const [url, key] = atob(code).split('|');
                      if (url && key) {
                        updateConfig({ ...config, supabase_url: url, supabase_anon_key: key });
                        alert('تم استيراد الإعدادات بنجاح!');
                      }
                    } catch (e) {
                      alert('كود غير صالح!');
                    }
                  }
                }}
              >
                استيراد من كود
              </button>
            </div>
          </div>

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
              onClick={syncSupabaseNow} 
              disabled={syncingCloud || !config.supabase_url}
            >
              {syncingCloud ? 'جارٍ المزامنة...' : 'مزامنة مع السحابة الآن'}
            </button>
          )}
          {cloudSyncError && <p className="error-text">{cloudSyncError}</p>}
          {syncError && !cloudSyncError && <p className="error-text">{syncError}</p>}
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
              {config.local_sync_enabled && (
                <div className="ip-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: serverRunning ? 'var(--accent)' : '#888',
                        boxShadow: serverRunning ? '0 0 6px var(--accent)' : 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: serverRunning ? 'var(--accent)' : 'var(--text-dim)' }}>
                      {serverRunning ? 'الخادم يعمل' : 'الخادم غير نشط'}
                    </span>
                  </div>
                  {localIp && (
                    <>
                      <p>عنوان الجهاز الحالي:</p>
                      <code className="ip-display">{localIp}</code>
                      <p className="hint-text">أدخل هذا العنوان في إعدادات الهاتف للمزامنة المباشرة.</p>
                    </>
                  )}
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
                onClick={syncLocalNow} 
                disabled={syncingLocal || !config.local_hub_ip}
              >
                {syncingLocal ? 'جارٍ المزامنة...' : 'مزامنة مع الكمبيوتر الآن'}
              </button>
              {localSyncError && <p className="error-text" style={{ marginTop: '8px' }}>{localSyncError}</p>}
            </div>
          )}
        </div>
      </div>

      {/* ─── Maintenance Section ─── */}
      <div className="settings-section">
        <h3 className="section-label">صيانة البيانات</h3>
        <div className="settings-card maintenance-card">
          <p className="field-desc">إذا وجدت قصائد مكررة بسبب المزامنة، يمكنك دمجها هنا.</p>
          <button 
            className="secondary-btn" 
            onClick={async () => {
              const removed = await deduplicate();
              setDedupCount(removed);
              alert(removed > 0 ? `تم حذف ${removed} من القصائد المكررة.` : 'لم يتم العثور على تكرار.');
            }}
            disabled={syncingLocal || syncingCloud}
          >
            تنظيف البيانات المكررة
          </button>
          {dedupCount !== null && dedupCount > 0 && (
            <p className="hint-text success">تم تنظيف {dedupCount} تكرار بنجاح.</p>
          )}
        </div>
      </div>

      {/* ─── App Updates Section ─── */}
      <div className="settings-section">
        <h3 className="section-label">تحديث التطبيق</h3>
        <div className="settings-card update-card">
          <p className="field-desc">الإصدار الحالي: {version}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {!isDesktop ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-dim)' }}>
                  تحديثات التطبيق التلقائية متاحة لأجهزة الكمبيوتر فقط.
                </p>
                <a 
                  href="https://github.com/MohammedNaser28/diwan/releases" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="secondary-btn"
                  style={{ display: 'inline-block', width: '100%', textDecoration: 'none', textAlign: 'center' }}
                >
                  تحميل أحدث ملف APK (GitHub)
                </a>
              </div>
            ) : (
              <>
                {!updateAvailable ? (
                  <button className="secondary-btn" onClick={handleCheckUpdate} disabled={updateStatus === "جارٍ التحقق من التحديثات..."}>
                    التحقق من وجود تحديثات
                  </button>
                ) : (
                  <button className="primary-btn" onClick={handleDownloadUpdate} disabled={downloading}>
                    {downloading ? "جارٍ التنزيل..." : "تنزيل وتثبيت التحديث الآن"}
                  </button>
                )}

                {updateStatus && (
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: updateStatus.includes('خطأ') ? 'var(--red)' : 'var(--accent)',
                    textAlign: 'center',
                    marginTop: '8px'
                  }}>
                    {updateStatus}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
