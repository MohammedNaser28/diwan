import type { FC } from 'react';
import type { Poem } from '../../types/poem';
import TicketCard from '../TicketCard/TicketCard';
import styles from './TicketGrid.module.css';

interface TicketGridProps {
  poems: Poem[];
  onAddClick: () => void;
  onEdit: (poem: Poem) => void;
  onDelete: (id: string) => void;
}

const TicketGrid: FC<TicketGridProps> = ({ poems, onAddClick, onEdit, onDelete }) => (
  <main className={styles.grid} aria-label="مجموعة الأبيات">
    {poems.map((poem) => (
      <TicketCard
        key={poem.id}
        poem={poem}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}

    {/* add-poem placeholder */}
    <button className={styles.addCard} onClick={onAddClick} aria-label="إضافة بيت جديد">
      <div className={styles.addIcon} aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <line x1="8" y1="2" x2="8" y2="14" />
          <line x1="2" y1="8" x2="14" y2="8" />
        </svg>
      </div>
      <span className={styles.addLabel}>إضافة بيت جديد</span>
    </button>
  </main>
);

export default TicketGrid;
