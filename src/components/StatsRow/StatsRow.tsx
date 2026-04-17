import type { FC } from 'react';

interface StatsRowProps {
  poemCount: number;
  poetCount: number;
  sourceCount: number;
  tagCount: number;
}

const StatsRow: FC<StatsRowProps> = ({ poemCount, poetCount, sourceCount, tagCount }) => {
  return (
    <div className="flex gap-6 px-6 py-4 border-t border-border/50 bg-bg max-[560px]:gap-4 max-[560px]:px-4 max-[560px]:justify-around">
      {[
        { num: poemCount, label: 'بيت' },
        { num: poetCount, label: 'شاعر' },
        { num: sourceCount, label: 'مصدر' },
        { num: tagCount, label: 'وسوم' },
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-lg text-gold font-sans font-medium">{stat.num}</div>
          <div className="text-[10px] text-text-muted font-sans mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;
