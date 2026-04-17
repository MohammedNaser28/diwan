import type { FC } from 'react';
import type { Tag } from '../../types/poem';
import './FilterRow.css';

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
    الكل: 'tag-default',
    فخر: 'tag-fakhr',
    حكمة: 'tag-hikma',
    رثاء: 'tag-ritha',
    حنين: 'tag-hanin',
    هجاء: 'tag-hejaa',
    غزل: 'tag-ghazal',
  };
  return map[tag] ?? 'tag-default';
}

const FilterRow: FC<FilterRowProps> = ({ tags, activeTag, onChange, counts }) => (
  <nav
    className="filter-row filter-scroll"
    aria-label="تصفية حسب النوع"
  >
    {tags.map((tag) => {
      const isActive = activeTag === tag;
      const count = counts?.[tag];
      return (
        <button
          key={tag}
          className={`filter-pill ${isActive ? `active ${activeClass(tag)}` : ''}`}
          onClick={() => onChange(tag)}
          aria-pressed={isActive}
        >
          {tag}
          {count !== undefined && count > 0 && (
            <span className="filter-badge">
              {count}
            </span>
          )}
        </button>
      );
    })}
  </nav>
);

export default FilterRow;