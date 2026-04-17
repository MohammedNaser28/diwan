import type { FC } from 'react';
import type { Poem } from '../../types/poem';
import TicketCard from '../TicketCard/TicketCard';

interface TicketGridProps {
  poems: Poem[];
  onAddClick: () => void;
  onEdit: (poem: Poem) => void;
  onDelete: (id: string) => void;
}

const TicketGrid: FC<TicketGridProps> = ({ poems, onAddClick, onEdit, onDelete }) => (
  <main
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 px-6 bg-bg max-[560px]:px-4"
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

    {/* add-poem placeholder */}
    <button
      className="group bg-bg border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2.5 cursor-pointer min-h-[180px] transition-colors duration-150 hover:border-gold"
      onClick={onAddClick}
      aria-label="إضافة بيت جديد"
    >
      <div className="w-9 h-9 rounded-full border border-dashed border-hover-bg flex items-center justify-center transition-colors duration-150 group-hover:border-gold" aria-hidden="true">
        <svg viewBox="0 0 16 16" className="w-4 h-4 stroke-text-muted stroke-2 fill-none transition-colors duration-150 group-hover:stroke-gold">
          <line x1="8" y1="2" x2="8" y2="14" />
          <line x1="2" y1="8" x2="14" y2="8" />
        </svg>
      </div>
      <span className="text-xs text-text-muted transition-colors duration-150 group-hover:text-gold">
        إضافة بيت جديد
      </span>
    </button>
  </main>
);

export default TicketGrid;
