import type { FC } from 'react';
import { useState } from 'react';
import { useDbPath } from '../../hooks/useDbPath';
import { usePlatform } from '../../hooks/usePlatform';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddClick: () => void;
}

const Topbar: FC<TopbarProps> = ({ searchQuery, onSearchChange, onAddClick }) => {
  const { isDesktop, ready } = usePlatform();
  const { dbPath, changing, changeLocation, error } = useDbPath();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-border/50 bg-bg z-10 gap-4 max-[560px]:px-4">
      {/* Logo — mobile only */}
      <div className="hidden max-[560px]:block font-amiri text-2xl text-gold tracking-wide shrink-0">
        ديوان
      </div>

      {/* Search + actions */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex-1 max-w-[440px]">
          <svg
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="w-full bg-surface border border-border/50 rounded-xl pr-10 pl-4 py-2.5 text-text text-[14px] font-sans rtl outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-gold/40 focus:bg-surface max-[560px]:w-full"
            placeholder="ابحث في الأبيات..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="بحث"
          />
        </div>

        {/* Settings gear — desktop only */}
        {ready && isDesktop && (
          <div className="relative">
            <button
              className={`w-9 h-9 rounded-xl border cursor-pointer flex items-center justify-center transition-all duration-200
                ${settingsOpen
                  ? 'bg-gold/10 border-gold/40 text-gold'
                  : 'bg-surface border-border/50 text-text-dim hover:bg-gold/10 hover:border-gold/40 hover:text-gold'
                }`}
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="إعدادات قاعدة البيانات"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {settingsOpen && (
              <div
                className="absolute top-[calc(100%+10px)] left-0 min-w-[290px] bg-[#161d2a] border border-[#252f40]/60 rounded-2xl p-5 rtl z-[200] shadow-[0_12px_48px_rgba(0,0,0,0.6)] animate-[panel-slide_0.2s_ease-out]"
                role="dialog"
                aria-label="إعدادات"
              >
                <p className="text-[11px] text-text-dim mb-3 uppercase tracking-widest font-sans">
                  موقع قاعدة البيانات
                </p>
                <div className="bg-bg border border-border/50 rounded-lg p-3 mb-4">
                  <span className="text-[11px] text-text ltr block overflow-hidden text-ellipsis font-mono">
                    {dbPath || '—'}
                  </span>
                </div>
                {error && <p className="text-[11px] text-danger mb-3">{error}</p>}
                <button
                  className="w-full bg-gold border-none rounded-xl py-2.5 text-[13px] text-bg font-medium cursor-pointer transition-opacity duration-200 hover:opacity-90 font-sans"
                  onClick={changeLocation}
                  disabled={changing}
                >
                  {changing ? 'جارٍ التغيير...' : 'تغيير الموقع'}
                </button>
                <p className="text-[10px] text-text-muted mt-3 leading-relaxed font-sans">
                  يتم نسخ الملف إلى المجلد الجديد تلقائيًا
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add poem button */}
        <button
          className="w-10 h-10 rounded-full bg-gold border-none cursor-pointer flex items-center justify-center shrink-0 transition-all duration-150 hover:scale-[1.07] hover:bg-gold-hover"
          onClick={onAddClick}
          aria-label="إضافة بيت جديد"
          title="إضافة بيت جديد"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true" className="w-[18px] h-[18px] stroke-bg stroke-[2.5] fill-none">
            <line x1="9" y1="3" x2="9" y2="15" />
            <line x1="3" y1="9" x2="15" y2="9" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Topbar;