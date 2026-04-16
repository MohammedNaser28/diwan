import type { FC } from 'react';
import type { Tag } from '../../types/poem';
import styles from './FilterRow.module.css';

interface FilterRowProps {
  tags: Tag[];
  activeTag: Tag;
  onChange: (tag: Tag) => void;
}

const FilterRow: FC<FilterRowProps> = ({ tags, activeTag, onChange }) => (
  <nav className={styles.filterRow} aria-label="تصفية حسب النوع">
    {tags.map((tag) => (
      <button
        key={tag}
        className={`${styles.tag}${activeTag === tag ? ` ${styles.active}` : ''}`}
        onClick={() => onChange(tag)}
        aria-pressed={activeTag === tag}
      >
        {tag}
      </button>
    ))}
  </nav>
);

export default FilterRow;
