import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';
import type { Poem } from '../../types/poem';
import './TicketCard.css';

interface TicketCardProps {
  poem: Poem;
  onEdit: (poem: Poem) => void;
  onDelete: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, isCurrentlyFavorite: boolean) => void;
}

/** Map known Arabic tag names → CSS class suffix. Falls back to 'default'. */
function tagClass(tag: string): string {
  const map: Record<string, string> = {
    فخر: 'fakhr',
    حكمة: 'hikma',
    رثاء: 'ritha',
    حنين: 'hanin',
    هجاء: 'hejaa',
    غزل: 'ghazal',
  };
  return `tag-${map[tag] ?? 'default'}`;
}

const TicketCard: FC<TicketCardProps> = ({ 
  poem, 
  onEdit, 
  onDelete,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  function handleDoubleClick() {
    const content = `${poem.text}\n— ${poem.poet}`;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  function handleMenuToggle(e: MouseEvent) {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  }

  function handleEdit(e: MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit(poem);
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(poem.id);
  }

  function handleFav(e: MouseEvent) {
    e.stopPropagation();
    onToggleFavorite?.(poem.id, isFavorite);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
  }

  return (
    <article
      className="ticket-card group"
      onDoubleClick={handleDoubleClick}
    >
      {/* clipboard toast */}
      {copied && (
        <div
          className="toast"
          aria-live="polite"
        >
          ✓ تم النسخ
        </div>
      )}

      {/* favourite button — top left */}
      <button
        className="fav-btn"
        onClick={handleFav}
        aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
      >
        <svg
          viewBox="0 0 24 24"
          width="16" height="16"
          fill={isFavorite ? '#c9a84c' : 'none'}
          stroke={isFavorite ? '#c9a84c' : '#3d4d62'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={heartAnim ? 'heart-pop' : ''}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* 3-dots menu — top right */}
      <div ref={menuRef} className="menu-container">
        <button
          className={`menu-btn ${menuOpen ? 'open' : ''}`}
          onClick={handleMenuToggle}
          aria-label="خيارات البيت"
        >
          <svg width="15" height="15" viewBox="0 0 4 16" fill="currentColor">
            <circle cx="2" cy="2" r="1.5" />
            <circle cx="2" cy="8" r="1.5" />
            <circle cx="2" cy="14" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="menu-dropdown"
            role="menu"
          >
            <button
              className="menu-item"
              onClick={handleEdit}
              role="menuitem"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              تعديل
            </button>
            <button
              className="menu-item danger"
              onClick={handleDelete}
              role="menuitem"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              حذف
            </button>
          </div>
        )}
      </div>

      {/* ticket punch top */}
      <div className="ticket-top-edge ticket-punch-top">
        <div className="punch-hole-top" aria-hidden="true" />
      </div>
      <div className="ticket-divider" />

      {/* verse body */}
      <div className="verse-body">
        <p className="verse-text">
          {poem.text.split('\n').map((line, i) => (
            <span key={i} className="verse-line">{line}</span>
          ))}
        </p>

        {poem.tags.length > 0 && (
          <div className="tag-list">
            {poem.tags.map((tag) => (
              <span
                key={tag}
                className={`tag-badge ${tagClass(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="ticket-divider" />
      <footer className="ticket-footer">
        <span className="poet-name">{poem.poet || '—'}</span>
        {poem.source && (
          <span className="source-name">{poem.source}</span>
        )}
      </footer>

      {/* ticket punch bottom */}
      <div className="ticket-bottom-edge ticket-punch-bottom" aria-hidden="true" />
    </article>
  );
};

export default TicketCard;