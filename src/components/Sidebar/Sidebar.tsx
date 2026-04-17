import type { FC } from 'react';
import './Sidebar.css';

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
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo-container">
        <div className="logo-main">
          ديوان
        </div>
        <div className="logo-sub">
          diwan · poetry vault
        </div>
      </div>

      {/* Section label */}
      <p className="nav-label">
        التنقل
      </p>

      {/* Navigation */}
      <nav className="nav-list">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.label;
          return (
            <button
              key={item.label}
              onClick={() => onSectionChange?.(item.label)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="nav-indicator" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sync badge */}
      <div className="sync-container">
        <div className="sync-content">
          <div className={`sync-dot ${syncing ? 'syncing' : ''}`} />
          <span className="sync-text">
            {syncing ? 'جارٍ المزامنة...' : `متزامن · ${lastSynced || 'الآن'}`}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;