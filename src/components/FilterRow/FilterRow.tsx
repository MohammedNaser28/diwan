import type { FC } from 'react';
import type { Tag } from '../../types/poem';

interface FilterRowProps {
  tags: Tag[];
  activeTag: Tag;
  onChange: (tag: Tag) => void;
  /** Optional: count of poems per tag so pills can show a badge */
  counts?: Partial<Record<Tag, number>>;
}

/** Return the CSS class for an active filter pill, matching the tag's semantic color */
function activeClass(tag: Tag): string {
  const map: Record<string, string> = {
    الكل: 'bg-gold/10 border-gold/50 text-gold',
    فخر: 'bg-[rgba(201,168,76,0.12)]  border-[rgba(201,168,76,0.30)]  text-[#c9a84c]',
    حكمة: 'bg-[rgba(29,158,117,0.12)]  border-[rgba(29,158,117,0.28)]  text-[#3abf8f]',
    رثاء: 'bg-[rgba(216,90,48,0.12)]   border-[rgba(216,90,48,0.28)]   text-[#d87040]',
    حنين: 'bg-[rgba(127,119,221,0.12)] border-[rgba(127,119,221,0.28)] text-[#a09de0]',
    هجاء: 'bg-[rgba(212,83,126,0.12)]  border-[rgba(212,83,126,0.28)]  text-[#d4537e]',
    غزل: 'bg-[rgba(240,149,175,0.12)] border-[rgba(240,149,175,0.28)] text-[#e8859e]',
  };
  return map[tag] ?? 'bg-gold/10 border-gold/50 text-gold';
}

const FilterRow: FC<FilterRowProps> = ({ tags, activeTag, onChange, counts }) => (
  <nav
    className="filter-scroll flex gap-2 px-8 py-3.5 border-b border-border/50 overflow-x-auto bg-bg sticky top-0 z-[5] max-[560px]:px-4"
    aria-label="تصفية حسب النوع"
  >
    {tags.map((tag) => {
      const isActive = activeTag === tag;
      const count = counts?.[tag];
      return (
        <button
          key={tag}
          className={`rounded-full px-4 py-1.5 text-[13px] font-sans whitespace-nowrap cursor-pointer transition-all duration-150 border leading-none flex items-center gap-1.5
            ${isActive
              ? `${activeClass(tag)} font-medium`
              : 'bg-surface border-border/50 text-text-dim hover:border-border hover:text-text'
            }`}
          onClick={() => onChange(tag)}
          aria-pressed={isActive}
        >
          {tag}
          {count !== undefined && count > 0 && (
            <span
              className={`text-[10px] rounded-full px-1.5 py-0.5 leading-none tabular-nums transition-colors duration-150
                ${isActive ? 'bg-white/10' : 'bg-white/[0.04] text-text-muted'}`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </nav>
);

export default FilterRow;