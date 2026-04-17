import type { FC } from 'react';
import type { Poem } from '../../types/poem';
import '../EntityList.css';

interface PoetsListProps {
  poems: Poem[];
}

const PoetsList: FC<PoetsListProps> = ({ poems }) => {
  const poetStats = poems.reduce((acc, poem) => {
    if (!poem.poet) return acc;
    acc[poem.poet] = (acc[poem.poet] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const poets = Object.entries(poetStats).sort((a, b) => b[1] - a[1]);

  return (
    <div className="entity-view">
      <h2 className="entity-title">قائمة الشعراء</h2>
      
      {poets.length === 0 ? (
        <div className="entity-empty">
          لا يوجد شعراء مضافين حتى الآن
        </div>
      ) : (
        <div className="entity-grid">
          {poets.map(([poet, count]) => (
            <div key={poet} className="entity-card">
              <span className="entity-name">{poet}</span>
              <span className="entity-badge">
                {count} {count === 1 ? 'بيت' : 'أبيات'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoetsList;
