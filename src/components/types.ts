import type { DiffStatus } from '../lib/diff';

export interface TreeNodeData {
  key: string;
  status: DiffStatus;
  leftValue?: unknown;
  rightValue?: unknown;
  children: TreeNodeData[];
  depth: number;
}
