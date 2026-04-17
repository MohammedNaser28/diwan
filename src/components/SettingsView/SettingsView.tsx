import type { FC } from 'react';
import { useDbPath } from '../../hooks/useDbPath';
import { usePlatform } from '../../hooks/usePlatform';
import { usePoemVault } from '../../hooks/usePoemVault';
import './SettingsView.css';

const SettingsView: FC = () => {
  const { isDesktop, ready } = usePlatform();
  const { dbPath, changing, changeLocation, error: dbError } = useDbPath();
  const { syncNow, syncing, syncError, isSyncConfigured } = usePoemVault();

  if (!ready) return null;

  return (
    <div className="settings-view">
      <h2 className="settings-title">الإعدادات</h2>
      
      <div className="settings-section">
        <h3 className="section-label">قاعدة البيانات</h3>
        
        {isDesktop ? (
          <div className="db-location-card">
            <div className="db-info">
              <p className="db-path-label">موقع الملف الحالي:</p>
              <div className="db-path-box">
                <code className="db-path-text">{dbPath || '—'}</code>
              </div>
            </div>

            {dbError && <p className="db-error">{dbError}</p>}

            <div className="db-actions">
              <button
                className="db-change-btn"
                onClick={changeLocation}
                disabled={changing}
              >
                {changing ? 'جارٍ التغيير...' : 'تغيير موقع الحفظ'}
              </button>
              <p className="db-hint">
                سيتم نقل ملف البيانات `diwan.db` إلى المجلد الجديد الذي تختاره تلقائيًا.
              </p>
            </div>
          </div>
        ) : (
          <div className="mobile-notice">
            <p>يتم إدارة قاعدة البيانات تلقائيًا على هذا الجهاز.</p>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="section-label">النسخ الاحتياطي (Supabase)</h3>
        <div className="cloud-backup-card">
          {isSyncConfigured ? (
            <>
              <p className="cloud-desc">
                قم بمزامنة بياناتك مع Supabase للحفاظ عليها والوصول إليها من أجهزة أخرى.
              </p>
              
              {syncError && <p className="cloud-error">{syncError}</p>}
              
              <button
                className="cloud-sync-btn"
                onClick={syncNow}
                disabled={syncing}
              >
                {syncing ? 'جارٍ المزامنة...' : 'مزامنة مع Supabase الآن'}
              </button>
            </>
          ) : (
            <div className="cloud-setup-notice">
              <p className="cloud-desc">النسخ الاحتياطي السحابي غير مفعل.</p>
              <p className="cloud-hint">
                لتفعيل المزامنة، قم بإنشاء ملف `.env` في مجلد `src-tauri` يحتوي على مفاتيح Supabase الخاصة بك.
              </p>
            </div>
          )}
          
          <p className="cloud-hint">
            تأكد من إعداد متغيرات البيئة `SUPABASE_URL` و `SUPABASE_ANON_KEY` بشكل صحيح.
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-label">حول ديوان</h3>
        <div className="about-card">
          <p className="version-text">الإصدار 0.1.0</p>
          <p className="about-desc">
            مساحة خاصة لحفظ وجمع أبيات الشعر العربي المفضلة، مصممة بجمالية كلاسيكية وتجربة عصرية.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
