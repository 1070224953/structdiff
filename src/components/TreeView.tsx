import type { DiffEntry, DiffStatus } from '../lib/diff';
import { countByStatus } from '../lib/diff';
import TreeNode from './TreeNode';

interface Props {
  entries: DiffEntry[];
}

function statusLabel(s: DiffStatus): string {
  switch (s) {
    case 'added': return 'Added';
    case 'removed': return 'Removed';
    case 'changed': return 'Changed';
    case 'unchanged': return 'Unchanged';
  }
}

export default function TreeView({ entries }: Props) {
  const counts = countByStatus(entries);
  const total = counts.added + counts.removed + counts.changed;
  const statuses: DiffStatus[] = ['added', 'removed', 'changed'];

  if (total === 0) {
    return (
      <div className="tree-empty">
        <p>No differences found. The two inputs are identical.</p>
      </div>
    );
  }

  return (
    <div className="tree-view">
      <div className="tree-summary">
        {statuses.map(s => counts[s] > 0 && (
          <span key={s} className={`summary-badge ${s}`}>
            {counts[s]} {statusLabel(s)}
          </span>
        ))}
        <span className="summary-total">{total} total changes</span>
      </div>
      <div className="tree-container">
        {entries.map((entry, i) => (
          <TreeNode key={`${entry.key}-${i}`} entry={entry} depth={0} />
        ))}
      </div>
    </div>
  );
}
