import { useState, useMemo, useEffect } from 'react';
import { parse } from '../lib/parser';
import { computeDiff } from '../lib/diff';
import type { DiffEntry } from '../lib/diff';
import EditorPanel from './EditorPanel';
import TreeView from './TreeView';

const DEMO_LEFT = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    env: staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: main
          image: my-app:1.0.0
          ports:
            - containerPort: 8080
          resources:
            limits:
              cpu: "1"
              memory: "512Mi"`;

const DEMO_RIGHT = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    env: production
    team: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: main
          image: my-app:2.0.0
          ports:
            - containerPort: 8080
            - containerPort: 9090
          resources:
            limits:
              cpu: "2"
              memory: "1Gi"`;

export default function DiffView() {
  const [left, setLeft] = useState(DEMO_LEFT);
  const [right, setRight] = useState(DEMO_RIGHT);
  const [error, setError] = useState('');

  const leftParse = useMemo(() => parse(left), [left]);
  const rightParse = useMemo(() => parse(right), [right]);

  useEffect(() => {
    if (left.trim() && !leftParse.ok) {
      setError('Left: ' + leftParse.error);
    } else if (right.trim() && !rightParse.ok) {
      setError('Right: ' + rightParse.error);
    } else {
      setError('');
    }
  }, [leftParse, rightParse, left, right]);

  const entries: DiffEntry[] = useMemo(() => {
    if (leftParse.ok && rightParse.ok) {
      return computeDiff(leftParse.data, rightParse.data);
    }
    return [];
  }, [leftParse, rightParse]);

  const bothReady = leftParse.ok && rightParse.ok;

  return (
    <div className="diff-view">
      <div className="toolbar">
        <h1 className="title">StructDiff</h1>
        <span className="subtitle">Semantic diff for structured data</span>
        <div className="toolbar-actions">
          <span className="format-badge">{leftParse.ok ? leftParse.format : '?'}</span>
          <span className="format-sep">vs</span>
          <span className="format-badge">{rightParse.ok ? rightParse.format : '?'}</span>
          <button
            className="clear-btn"
            onClick={() => { setLeft(''); setRight(''); setError(''); }}
          >
            Clear
          </button>
        </div>
        {(leftParse.ok && leftParse.hint) || (rightParse.ok && rightParse.hint) ? (
          <div className="hint-bar">
            {leftParse.ok && leftParse.hint && <span className="hint-item">Left: {leftParse.hint}</span>}
            {rightParse.ok && rightParse.hint && <span className="hint-item">Right: {rightParse.hint}</span>}
          </div>
        ) : null}
      </div>
      <div className="editors">
        <EditorPanel
          label="Original"
          value={left}
          onChange={setLeft}
        />
        <div className="editors-divider" />
        <EditorPanel
          label="Modified"
          value={right}
          onChange={setRight}
        />
      </div>
      {error && <div className="global-error">{error}</div>}
      {bothReady && <TreeView entries={entries} />}
      {!bothReady && !error && (
        <div className="hero-hint">
          <p>Paste JSON or YAML into both panels to see a structural diff.</p>
          <p className="hero-sub">All processing happens locally in your browser.</p>
        </div>
      )}
    </div>
  );
}
