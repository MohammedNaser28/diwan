import type { FC } from 'react';

interface SidebarProps {
  syncing: boolean;
  lastSynced?: string;
  /** Currently active nav item label */
  activeSection?: string;
  onSectionChange?: (label: string) => void;
}

const NAV_ITEMS = [
  {
    label: 'كل الأبيات',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" />
      </svg>
    ),
  },
  {
    label: 'الشعراء',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="8" cy="5.5" r="2.5" />
        <path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      </svg>
    ),
  },
  {
    label: 'المصادر',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M3 2h8a1 1 0 0 1 1 1v11l-4-2-4 2V3a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  {
    label: 'المفضلة',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.9 3.4a3.6 3.6 0 0 0-5.1 0L8 4.2l-.8-.8A3.6 3.6 0 0 0 2.1 8.5l.7.7L8 14.5l5.2-5.3.7-.7a3.6 3.6 0 0 0 0-5.1z" />
      </svg>
    ),
  },
  {
    label: 'الإعدادات',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="8" cy="8" r="2" />
        <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" />
      </svg>
    ),
  },
];

const Sidebar: FC<SidebarProps> = ({
  syncing,
  lastSynced,
  activeSection = 'كل الأبيات',
  onSectionChange,
}) => {
  return (
    <aside className="w-[240px] bg-sidebar border-l border-border/50 flex flex-col py-6 shrink-0 h-screen sticky top-0 z-10 max-[560px]:hidden">
      {/* Logo */}
      <div className="px-6 pb-6 border-b border-border/50 mb-1">
        <div className="text-[2.1rem] font-bold text-gold tracking-wider font-amiri leading-none">
          ديوان
        </div>
        <div className="text-[10px] text-text-muted mt-1.5 font-sans ltr tracking-widest uppercase">
          diwan · poetry vault
        </div>
      </div>

      {/* Section label */}
      <p className="px-6 pt-4 pb-1 text-[10px] text-text-muted font-sans uppercase tracking-widest">
        التنقل
      </p>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.label;
          return (
            <button
              key={item.label}
              onClick={() => onSectionChange?.(item.label)}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-[13.5px] cursor-pointer transition-all duration-200 font-sans rounded-xl border-none w-full text-right
                ${isActive
                  ? 'text-gold bg-gold/[0.07] font-medium'
                  : 'text-text-dim bg-transparent hover:text-text hover:bg-white/[0.03]'
                }`}
            >
              <span className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-gold' : 'text-text-muted'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sync badge */}
      <div className="mx-4 mb-1 bg-sync-bg border border-sync-border rounded-xl p-3.5">
        <div className="flex items-center gap-2.5 text-[12px] font-sans">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${syncing ? 'bg-gold animate-[pulse-sync_2s_infinite]' : 'bg-sync'}`}
          />
          <span className="text-sync-text font-medium">
            {syncing ? 'جارٍ المزامنة...' : `متزامن · ${lastSynced || 'الآن'}`}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;