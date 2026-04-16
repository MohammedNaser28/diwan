import type { FC } from 'react';
import styles from './Topbar.module.css';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddClick: () => void;
}

const Topbar: FC<TopbarProps> = ({ searchQuery, onSearchChange, onAddClick }) => (
  <header className={styles.topbar}>
    <div className={styles.logo}>ديوان</div>

    <div className={styles.right}>
      <input
        className={styles.searchInput}
        placeholder="ابحث في الأبيات..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="بحث"
      />
      <button
        className={styles.addBtn}
        onClick={onAddClick}
        aria-label="إضافة بيت جديد"
        title="إضافة بيت جديد"
      >
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <line x1="9" y1="3" x2="9" y2="15" />
          <line x1="3" y1="9" x2="15" y2="9" />
        </svg>
      </button>
    </div>
  </header>
);

export default Topbar;
