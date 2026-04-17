import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';
import type { Poem } from '../../types/poem';

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
    <article
      className="group bg-surface rounded-xl overflow-hidden border border-border/50 flex flex-col cursor-pointer transition-all duration-150 relative hover:border-hover-bg hover:-translate-y-0.5"
      onDoubleClick={handleDoubleClick}
    >
      {/* ── clipboard toast ── */}
      {copied && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-sm px-4 py-2 rounded-full text-white text-xs z-20 pointer-events-none border border-gold/50 animate-[toast-in_0.3s_ease]"
          aria-live="polite"
        >
          <span>✓ تم النسخ</span>
        </div>
      )}

      {/* ── 3-dots menu ── */}
      <div ref={menuRef}>
        <button
          className={`absolute top-[18px] right-3 bg-transparent border-none text-[#4a5568] cursor-pointer p-1 rounded z-5 transition-opacity duration-200
            ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={handleMenuToggle}
          aria-label="خيارات البيت"
          title="خيارات"
        >
          <svg width="14" height="14" viewBox="0 0 4 16" fill="currentColor">
            <circle cx="2" cy="2" r="1.5" />
            <circle cx="2" cy="8" r="1.5" />
            <circle cx="2" cy="14" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute top-[45px] right-3 bg-[#1c212b] border border-border/50 rounded-lg p-1 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-w-[100px]" role="menu">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 bg-transparent border-none text-text text-xs cursor-pointer rounded font-sans text-right hover:bg-white/5 hover:text-gold"
              onClick={handleEdit}
              role="menuitem"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              تعديل
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 bg-transparent border-none text-text text-xs cursor-pointer rounded font-sans text-right hover:bg-white/5 hover:text-danger"
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

      {/* ── DESIGN: TORN TOP ── */}
      <div className="ticket-top-edge bg-bg h-3.5 relative">
        <div className="w-3.5 h-3.5 rounded-full bg-bg border border-border/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2]" aria-hidden="true" />
      </div>

      <hr className="border-none border-t-[1.5px] border-dashed border-border mx-4" />

      {/* ── body ── */}
      <div className="px-4 pt-4 pb-3 flex-1 flex flex-col gap-2.5">
        <p className="font-amiri text-sm text-verse leading-[1.9] text-right z-[1]">
          {poem.text.split('\n').map((line, i) => (
            <span key={i}>{line}<br/></span>
          ))}
        </p>

        {poem.tags.length > 0 && (
          <div className="flex gap-[5px] flex-wrap mt-2.5">
            {poem.tags.map((tag) => (
              <span key={tag} className="bg-tag-bg border border-tag-border rounded-[10px] px-2 py-0.5 text-[10px] text-tag-text font-sans">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <hr className="border-none border-t-[1.5px] border-dashed border-border mx-4" />

      {/* ── DESIGN: FOOTER ── */}
      <footer className="flex items-center justify-between px-4 pb-3.5">
        <span className="text-[11px] text-gold font-medium font-sans">{poem.poet || '—'}</span>
        {poem.source && <span className="text-[10px] text-text-muted ltr font-sans">{poem.source}</span>}
      </footer>

      {/* ── DESIGN: TORN BOTTOM ── */}
      <div className="ticket-bottom-edge bg-bg h-3.5 relative" aria-hidden="true" />
    </article>
  );
};

export default TicketCard;
