import type { FC } from 'react';
import './StatsRow.css';

interface StatsRowProps {
  poemCount: number;
  poetCount: number;
  sourceCount: number;
  tagCount: number;
  /** When a filter is active, show the filtered count alongside total */
  filteredCount?: number;
  activeTag?: string;
}

const StatsRow: FC<StatsRowProps> = ({
  poemCount,
  poetCount,
  sourceCount,
  tagCount,
  filteredCount,
  activeTag,
}) => {
  const stats = [
    { num: poemCount, label: 'بيت' },
    { num: poetCount, label: 'شاعر' },
    { num: sourceCount, label: 'مصدر' },
    { num: tagCount, label: 'وسم' },
  ];

  const showFilterBadge = activeTag && activeTag !== 'الكل' && filteredCount !== undefined;

  return (
    <div className="stats-row">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`stat-item ${i !== stats.length - 1 ? 'bordered' : ''}`}
        >
          <div className="stat-num">
            {stat.num}
          </div>
          <div className="stat-label">
            {stat.label}
          </div>
        </div>
      ))}

      {/* contextual filter badge — only when a non-default filter is active */}
      {showFilterBadge && (
        <div className="stat-filter-badge">
          <span className="stat-filter-text">عرض</span>
          <span className="stat-filter-num-gold">{filteredCount}</span>
          <span className="stat-filter-text">من</span>
          <span className="stat-filter-num-dim">{poemCount}</span>
        </div>
      )}
    </div>
  );
};

export default StatsRow;