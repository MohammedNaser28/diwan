import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';
import type { Poem } from '../../types/poem';

interface TicketCardProps {
  poem: Poem;
  onEdit: (poem: Poem) => void;
  onDelete: (id: string) => void;
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

const TicketCard: FC<TicketCardProps> = ({ poem, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [faved, setFaved] = useState(false);
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
    setFaved((v) => !v);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
  }

  return (
    <article
      className="group bg-surface rounded-2xl overflow-hidden border border-border flex flex-col cursor-pointer transition-all duration-200 relative hover:border-gold/30 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      onDoubleClick={handleDoubleClick}
    >
      {/* clipboard toast */}
      {copied && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-white text-sm z-20 pointer-events-none border border-gold/40 animate-[toast-in_0.3s_ease]"
          aria-live="polite"
        >
          ✓ تم النسخ
        </div>
      )}

      {/* favourite button — top left */}
      <button
        className="absolute top-3.5 left-3.5 z-10 w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={handleFav}
        aria-label={faved ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
      >
        <svg
          viewBox="0 0 24 24"
          width="16" height="16"
          fill={faved ? '#c9a84c' : 'none'}
          stroke={faved ? '#c9a84c' : '#3d4d62'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={heartAnim ? 'heart-pop' : ''}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* 3-dots menu — top right */}
      <div ref={menuRef} className="absolute top-4 right-4 z-10">
        <button
          className={`w-8 h-8 flex items-center justify-center bg-transparent border-none text-text-dim cursor-pointer rounded-lg transition-all duration-200
            ${menuOpen ? 'opacity-100 bg-white/5 text-text' : 'opacity-0 group-hover:opacity-100 hover:bg-white/5 hover:text-text'}`}
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
            className="absolute top-[calc(100%+6px)] right-0 bg-[#161c27] border border-border rounded-xl p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] min-w-[130px]"
            role="menu"
          >
            <button
              className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-transparent border-none text-text text-[13px] cursor-pointer rounded-lg font-sans text-right transition-colors duration-150 hover:bg-white/5 hover:text-gold"
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
              className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-transparent border-none text-text text-[13px] cursor-pointer rounded-lg font-sans text-right transition-colors duration-150 hover:bg-white/5 hover:text-danger"
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
      <div className="ticket-top-edge bg-bg h-6 relative shrink-0">
        <div className="w-6 h-6 rounded-full bg-bg border border-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2]" aria-hidden="true" />
      </div>
      <div className="border-t border-dashed border-border/60 mx-6" />

      {/* verse body */}
      <div className="px-7 pt-6 pb-5 flex-1 flex flex-col">
        <p className="font-amiri text-[1.15rem] text-verse leading-[2.4] text-right">
          {poem.text.split('\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </p>

        {poem.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-5">
            {poem.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center border rounded-full px-3.5 py-1 text-[12px] font-sans leading-none ${tagClass(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="border-t border-dashed border-border/60 mx-6" />
      <footer className="flex items-center justify-between px-7 py-4 gap-4">
        <span className="text-[14px] text-gold font-medium font-sans leading-none truncate">{poem.poet || '—'}</span>
        {poem.source && (
          <span className="text-[12px] text-text-muted ltr font-sans leading-none shrink-0 truncate max-w-[45%]">{poem.source}</span>
        )}
      </footer>

      {/* ticket punch bottom */}
      <div className="ticket-bottom-edge bg-bg h-6 relative shrink-0" aria-hidden="true" />
    </article>
  );
};

export default TicketCard;