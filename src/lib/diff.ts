import { normalize } from './parser';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  path: string[];
  key: string;
  status: DiffStatus;
  leftValue?: unknown;
  rightValue?: unknown;
  children: DiffEntry[];
}

// Flatten object to path->value map, with array identity matching
function flatten(
  obj: unknown,
  prefix: string[] = []
): Map<string, { value: unknown; path: string[] }> {
  const map = new Map<string, { value: unknown; path: string[] }>();

  if (obj === null || typeof obj !== 'object') {
    map.set(prefix.join('/'), { value: obj, path: [...prefix] });
    return map;
  }

  if (Array.isArray(obj)) {
    map.set(prefix.join('/'), { value: obj, path: [...prefix] });
    obj.forEach((item, i) => {
      const childPath = [...prefix, String(i)];
      const childMap = flatten(item, childPath);
      childMap.forEach((v, k) => map.set(k, v));
    });
    return map;
  }

  map.set(prefix.join('/'), { value: obj, path: [...prefix] });
  for (const [key, val] of Object.entries(obj)) {
    const childPath = [...prefix, key];
    const childMap = flatten(val, childPath);
    childMap.forEach((v, k) => map.set(k, v));
  }
  return map;
}

export function computeDiff(left: unknown, right: unknown): DiffEntry[] {
  const leftMap = flatten(left);
  const rightMap = flatten(right);

  const allPaths = new Set([...leftMap.keys(), ...rightMap.keys()]);

  // Build path-based entries
  const pathEntries: Map<string, DiffEntry> = new Map();

  for (const rawPath of allPaths) {
    const leftEntry = leftMap.get(rawPath);
    const rightEntry = rightMap.get(rawPath);
    const path = (leftEntry || rightEntry)!.path;
    const key = path[path.length - 1] || '(root)';

    let status: DiffStatus;
    if (!leftEntry) {
      status = 'added';
    } else if (!rightEntry) {
      status = 'removed';
    } else if (normalize(leftEntry.value) !== normalize(rightEntry.value)) {
      status = 'changed';
    } else {
      status = 'unchanged';
    }

    pathEntries.set(rawPath, {
      path,
      key,
      status,
      leftValue: leftEntry?.value,
      rightValue: rightEntry?.value,
      children: [],
    });
  }

  // Build tree from flat entries
  const roots: DiffEntry[] = [];

  for (const entry of pathEntries.values()) {
    if (entry.path.length <= 1) {
      roots.push(entry);
    } else {
      const parentPath = entry.path.slice(0, -1).join('/');
      const parent = pathEntries.get(parentPath);
      if (parent) {
        // Only add children that aren't "unchanged" intermediate nodes
        // or always add them so the tree structure is preserved
        parent.children.push(entry);
      } else {
        roots.push(entry);
      }
    }
  }

  // Sort children by key
  const sortChildren = (entries: DiffEntry[]) => {
    entries.sort((a, b) => a.key.localeCompare(b.key));
    entries.forEach(e => sortChildren(e.children));
  };
  sortChildren(roots);

  // Filter: remove unchanged leaf entries to reduce noise
  // But keep unchanged intermediate nodes if they have changed children
  const filterNoise = (entries: DiffEntry[]): DiffEntry[] => {
    return entries
      .filter(e => {
        if (e.status === 'unchanged' && e.children.length === 0) return false;
        return true;
      })
      .map(e => ({
        ...e,
        children: filterNoise(e.children),
      }));
  };

  return filterNoise(roots);
}

export function countByStatus(entries: DiffEntry[]): Record<DiffStatus, number> {
  const counts: Record<DiffStatus, number> = { added: 0, removed: 0, changed: 0, unchanged: 0 };
  const walk = (items: DiffEntry[]) => {
    for (const e of items) {
      counts[e.status]++;
      walk(e.children);
    }
  };
  walk(entries);
  return counts;
}
