import { useState } from 'react';
import type { DiffEntry, DiffStatus } from '../lib/diff';

function statusColor(s: DiffStatus): string {
  switch (s) {
    case 'added': return '#22c55e';
    case 'removed': return '#ef4444';
    case 'changed': return '#eab308';
    case 'unchanged': return '#6b7280';
  }
}

function statusBg(s: DiffStatus): string {
  switch (s) {
    case 'added': return 'rgba(34,197,94,0.08)';
    case 'removed': return 'rgba(239,68,68,0.08)';
    case 'changed': return 'rgba(234,179,8,0.08)';
    case 'unchanged': return 'transparent';
  }
}

function formatValue(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') {
    if (v.length > 80) return v.slice(0, 80) + '…';
    return v;
  }
  if (typeof v === 'object') {
    return JSON.stringify(v).slice(0, 80) + '…';
  }
  return String(v);
}

function isExpandable(v: unknown): boolean {
  return v !== null && typeof v === 'object';
}

interface Props {
  entry: DiffEntry;
  depth: number;
}

export default function TreeNode({ entry, depth }: Props) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = entry.children.length > 0;
  const expandable = hasChildren || isExpandable(entry.leftValue) || isExpandable(entry.rightValue);

  return (
    <div className="tree-node" style={{ marginLeft: depth * 20 }}>
      <div
        className="tree-row"
        style={{ backgroundColor: statusBg(entry.status) }}
        onClick={() => expandable && setExpanded(!expanded)}
      >
        <span className="tree-indicator">
          {expandable ? (expanded ? '▾' : '▸') : <span style={{ width: 14, display: 'inline-block' }} />}
        </span>
        <span className="tree-dot" style={{ backgroundColor: statusColor(entry.status) }} />
        <span className="tree-key">{entry.key}</span>
        {entry.status === 'changed' && (
          <>
            <span className="tree-value old">{formatValue(entry.leftValue)}</span>
            <span className="tree-arrow">→</span>
            <span className="tree-value new">{formatValue(entry.rightValue)}</span>
          </>
        )}
        {(entry.status === 'added' || entry.status === 'unchanged') && entry.rightValue !== undefined && (
          <span className="tree-value new">{formatValue(entry.rightValue)}</span>
        )}
        {entry.status === 'removed' && entry.leftValue !== undefined && (
          <span className="tree-value old">{formatValue(entry.leftValue)}</span>
        )}
        <span className="tree-badge" style={{ color: statusColor(entry.status) }}>
          {entry.status}
        </span>
      </div>
      {expanded && entry.children.map((child, i) => (
        <TreeNode key={`${child.key}-${i}`} entry={child} depth={depth + 1} />
      ))}
    </div>
  );
}
