import type { FC } from 'react';

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
    <div className="flex items-stretch border-t border-border/50 bg-bg max-[560px]:justify-around">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex-1 flex flex-col items-center py-5 gap-1 ${i !== stats.length - 1 ? 'border-l border-border/30' : ''}`}
        >
          <div className="text-[1.75rem] text-gold font-sans font-semibold leading-none tabular-nums">
            {stat.num}
          </div>
          <div className="text-[11px] text-text-muted font-sans tracking-wide">
            {stat.label}
          </div>
        </div>
      ))}

      {/* contextual filter badge — only when a non-default filter is active */}
      {showFilterBadge && (
        <div className="flex items-center px-5 border-l border-border/30 gap-2 shrink-0">
          <span className="text-[11px] text-text-muted font-sans">عرض</span>
          <span className="text-[13px] text-gold font-medium font-sans tabular-nums">{filteredCount}</span>
          <span className="text-[11px] text-text-muted font-sans">من</span>
          <span className="text-[13px] text-text-dim font-sans tabular-nums">{poemCount}</span>
        </div>
      )}
    </div>
  );
};

export default StatsRow;