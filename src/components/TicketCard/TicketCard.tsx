import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';
import type { Poem } from '../../types/poem';
import styles from './TicketCard.module.css';

interface TicketCardProps {
  poem: Poem;
  onEdit: (poem: Poem) => void;
  onDelete: (id: string) => void;
}

const TicketCard: FC<TicketCardProps> = ({ poem, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* close dropdown when clicking outside */
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

  /* double-click → copy verse to clipboard */
  function handleDoubleClick() {
    const content = `${poem.text}\n— ${poem.poet}`;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
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

  return (
    <article className={styles.ticket} onDoubleClick={handleDoubleClick}>
      {/* ── clipboard toast ── */}
      {copied && (
        <div className={styles.toast} aria-live="polite">
          <span className={styles.toastLabel}>✓ تم النسخ</span>
        </div>
      )}

      {/* ── 3-dots menu ── */}
      <div ref={menuRef}>
        <button
          className={`${styles.menuBtn}${menuOpen ? ` ${styles.open}` : ''}`}
          onClick={handleMenuToggle}
          aria-label="خيارات البيت"
          title="خيارات"
        >
          {/* vertical ellipsis */}
          <svg width="14" height="14" viewBox="0 0 4 16" fill="currentColor">
            <circle cx="2" cy="2"  r="1.5" />
            <circle cx="2" cy="8"  r="1.5" />
            <circle cx="2" cy="14" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className={styles.dropdown} role="menu">
            <button className={styles.dropItem} onClick={handleEdit} role="menuitem">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              تعديل
            </button>
            <button
              className={`${styles.dropItem} ${styles.danger}`}
              onClick={handleDelete}
              role="menuitem"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

      {/* ── torn top ── */}
      <div className={styles.ticketTop}>
        <div className={styles.ticketHole} aria-hidden="true" />
      </div>

      <hr className={styles.divider} />

      {/* ── body ── */}
      <div className={styles.ticketBody}>
        <p className={styles.quoteText}>{poem.text}</p>

        {poem.tags.length > 0 && (
          <div className={styles.ticketTags}>
            {poem.tags.map((tag) => (
              <span key={tag} className={styles.tTag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      <hr className={styles.divider} />

      {/* ── footer ── */}
      <footer className={styles.ticketFooter}>
        <span className={styles.poet}>{poem.poet || '—'}</span>
        {poem.source && <span className={styles.source}>{poem.source}</span>}
      </footer>

      {/* ── torn bottom ── */}
      <div className={styles.ticketBottom} aria-hidden="true" />
    </article>
  );
};

export default TicketCard;
