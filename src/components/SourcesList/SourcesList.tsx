import type { FC } from 'react';
import type { Poem } from '../../types/poem';
import '../EntityList.css';

interface SourcesListProps {
  poems: Poem[];
}

const SourcesList: FC<SourcesListProps> = ({ poems }) => {
  const sourceStats = poems.reduce((acc, poem) => {
    if (!poem.source) return acc;
    acc[poem.source] = (acc[poem.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sources = Object.entries(sourceStats).sort((a, b) => b[1] - a[1]);

  return (
    <div className="entity-view">
      <h2 className="entity-title">قائمة المصادر</h2>
      
      {sources.length === 0 ? (
        <div className="entity-empty">
          لا توجد مصادر مضافة حتى الآن
        </div>
      ) : (
        <div className="entity-grid">
          {sources.map(([source, count]) => (
            <div key={source} className="entity-card">
              <span className="entity-name">{source}</span>
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

export default SourcesList;
