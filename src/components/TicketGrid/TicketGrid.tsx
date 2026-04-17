import type { FC } from 'react';
import type { Poem } from '../../types/poem';
import TicketCard from '../TicketCard/TicketCard';

interface TicketGridProps {
  poems: Poem[];
  onAddClick: () => void;
  onEdit: (poem: Poem) => void;
  onDelete: (id: string) => void;
  /** Active filter tag — used for the empty filtered state message */
  activeTag?: string;
}

const TicketGrid: FC<TicketGridProps> = ({ poems, onAddClick, onEdit, onDelete, activeTag }) => {
  const isFiltered = activeTag && activeTag !== 'الكل';

  return (
    <main
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-bg max-[560px]:px-4"
      aria-label="مجموعة الأبيات"
    >
      {poems.map((poem) => (
        <TicketCard
          key={poem.id}
          poem={poem}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {/* empty filtered state — shown when a filter yields no results */}
      {poems.length === 0 && isFiltered && (
        <div className="col-span-full flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="w-12 h-12 rounded-full border border-dashed border-border/50 flex items-center justify-center mb-1" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3d4d62" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-[15px] text-text-dim font-sans">لا توجد أبيات بوسم «{activeTag}»</p>
          <p className="text-[13px] text-text-muted font-sans">أضف بيتًا جديدًا أو اختر تصنيفًا آخر</p>
        </div>
      )}

      {/* empty collection state */}
      {poems.length === 0 && !isFiltered && (
        <div className="col-span-full flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="font-amiri text-5xl text-gold/20 leading-none mb-2" aria-hidden="true">ديوان</div>
          <p className="text-[15px] text-text-dim font-sans">مجموعتك فارغة حتى الآن</p>
          <p className="text-[13px] text-text-muted font-sans">ابدأ بإضافة أول بيت إلى ديوانك</p>
          <button
            className="mt-2 px-5 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-[13px] font-sans cursor-pointer transition-all duration-200 hover:bg-gold/15 hover:border-gold/50"
            onClick={onAddClick}
          >
            إضافة بيت جديد
          </button>
        </div>
      )}

      {/* add-poem placeholder card — only show when there are existing poems */}
      {poems.length > 0 && (
        <button
          className="group bg-bg border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[240px] transition-all duration-200 hover:border-gold/50 hover:bg-gold/[0.02]"
          onClick={onAddClick}
          aria-label="إضافة بيت جديد"
        >
          <div
            className="w-12 h-12 rounded-full border border-dashed border-border/60 flex items-center justify-center transition-colors duration-200 group-hover:border-gold/50"
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 stroke-text-muted stroke-2 fill-none transition-colors duration-200 group-hover:stroke-gold">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
          </div>
          <span className="text-[14px] text-text-muted font-sans transition-colors duration-200 group-hover:text-gold">
            إضافة بيت جديد
          </span>
        </button>
      )}
    </main>
  );
};

export default TicketGrid;