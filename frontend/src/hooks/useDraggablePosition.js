import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_PREFIX = 'hazel-draggable-pos:';

/** Persisted viewport position with pointer drag (hold + move). */
export function useDraggablePosition(storageKey, defaultPos = { x: 24, y: null, corner: 'bl' }) {
  const key = `${STORAGE_PREFIX}${storageKey}`;
  const [pos, setPos] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return defaultPos;
  });
  const dragging = useRef(false);
  const moved = useRef(false);
  const start = useRef({ x: 0, y: 0, left: 0, top: 0 });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(pos));
    } catch {
      /* ignore */
    }
  }, [key, pos]);

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    dragging.current = true;
    moved.current = false;
    start.current = {
      x: e.clientX,
      y: e.clientY,
      left: rect.left,
      top: rect.top,
    };
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) moved.current = true;
    const w = e.currentTarget.offsetWidth || 64;
    const h = e.currentTarget.offsetHeight || 80;
    const left = Math.min(window.innerWidth - w - 8, Math.max(8, start.current.left + dx));
    const top = Math.min(window.innerHeight - h - 8, Math.max(8, start.current.top + dy));
    setPos({ x: left, y: top, corner: 'custom' });
  }, []);

  const onPointerUp = useCallback((e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const didDrag = useCallback(() => moved.current, []);

  const resetPosition = useCallback(() => setPos(defaultPos), [defaultPos]);

  const style =
    pos.corner === 'custom' && pos.y != null
      ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
      : { left: pos.x ?? 24, bottom: pos.y ?? 96, right: 'auto', top: 'auto' };

  return { pos, style, onPointerDown, onPointerMove, onPointerUp, didDrag, resetPosition };
}