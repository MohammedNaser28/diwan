import type { FC } from 'react';
import './Topbar.css';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddClick: () => void;
}

const Topbar: FC<TopbarProps> = ({ searchQuery, onSearchChange, onAddClick }) => {
  return (
    <header className="topbar">
      {/* Logo — mobile only */}
      <div className="topbar-logo">
        ديوان
      </div>

      {/* Search + actions */}
      <div className="topbar-actions">
        <div className="search-container">
          <svg
            className="search-icon"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            placeholder="ابحث في الأبيات..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="بحث"
          />
        </div>

        {/* Add poem button */}
        <button
          className="add-btn"
          onClick={onAddClick}
          aria-label="إضافة بيت جديد"
          title="إضافة بيت جديد"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true" className="add-icon">
            <line x1="9" y1="3" x2="9" y2="15" />
            <line x1="3" y1="9" x2="15" y2="9" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Topbar;