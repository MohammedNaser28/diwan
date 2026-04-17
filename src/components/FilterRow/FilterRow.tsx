import type { FC } from 'react';
import type { Tag } from '../../types/poem';

interface FilterRowProps {
  tags: Tag[];
  activeTag: Tag;
  onChange: (tag: Tag) => void;
}

const FilterRow: FC<FilterRowProps> = ({ tags, activeTag, onChange }) => (
  <nav
    className="filter-scroll flex gap-2 px-6 py-3 border-b border-border/50 overflow-x-auto bg-bg sticky top-0 z-5 max-[560px]:px-4"
    aria-label="تصفية حسب النوع"
  >
    {tags.map((tag) => (
      <button
        key={tag}
        className={`rounded-full px-3.5 py-1 text-xs whitespace-nowrap cursor-pointer transition-all duration-150 font-sans border
          ${activeTag === tag
            ? 'bg-active-tag-bg border-gold text-gold'
            : 'bg-surface border-border/50 text-text-dim hover:border-hover-bg hover:text-text'
          }`}
        onClick={() => onChange(tag)}
        aria-pressed={activeTag === tag}
      >
        {tag}
      </button>
    ))}
  </nav>
);

export default FilterRow;
