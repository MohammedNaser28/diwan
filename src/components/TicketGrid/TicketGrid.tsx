import type { FC } from 'react';
import type { Poem } from '../../types/poem';
import TicketCard from '../TicketCard/TicketCard';
import './TicketGrid.css';

interface TicketGridProps {
  poems: Poem[];
  onAddClick: () => void;
  onEdit: (poem: Poem) => void;
  onDelete: (id: string) => void;
  /** Active filter tag — used for the empty filtered state message */
  activeTag?: string;
  favorites?: string[];
  onToggleFavorite?: (id: string, isCurrentlyFavorite: boolean) => void;
}

const TicketGrid: FC<TicketGridProps> = ({ 
  poems, 
  onAddClick, 
  onEdit, 
  onDelete, 
  activeTag,
  favorites = [],
  onToggleFavorite
}) => {
  const isFiltered = activeTag && activeTag !== 'الكل';

  return (
    <main
      className="ticket-grid"
      aria-label="مجموعة الأبيات"
    >
      {poems.map((poem) => (
        <TicketCard
          key={poem.id}
          poem={poem}
          onEdit={onEdit}
          onDelete={onDelete}
          isFavorite={favorites.includes(poem.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}

      {/* empty filtered state — shown when a filter yields no results */}
      {poems.length === 0 && isFiltered && (
        <div className="empty-state">
          <div className="empty-icon-box" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3d4d62" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="empty-msg-main">لا توجد أبيات بوسم «{activeTag}»</p>
          <p className="empty-msg-sub">أضف بيتًا جديدًا أو اختر تصنيفًا آخر</p>
        </div>
      )}

      {/* empty collection state */}
      {poems.length === 0 && !isFiltered && (
        <div className="empty-state">
          <div className="empty-logo" aria-hidden="true">ديوان</div>
          <p className="empty-msg-main">مجموعتك فارغة حتى الآن</p>
          <p className="empty-msg-sub">ابدأ بإضافة أول بيت إلى ديوانك</p>
          <button
            className="empty-add-btn"
            onClick={onAddClick}
          >
            إضافة بيت جديد
          </button>
        </div>
      )}

      {/* add-poem placeholder card — only show when there are existing poems */}
      {poems.length > 0 && (
        <button
          className="placeholder-card"
          onClick={onAddClick}
          aria-label="إضافة بيت جديد"
        >
          <div
            className="placeholder-icon-box"
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" className="placeholder-icon">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
          </div>
          <span className="placeholder-text">
            إضافة بيت جديد
          </span>
        </button>
      )}
    </main>
  );
};

export default TicketGrid;