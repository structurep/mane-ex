"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "mane-compare";
const MAX_COMPARE = 3;

export interface CompareItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

// ─── Module-level store ──────────────────────

let items: CompareItem[] = [];
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    items = raw ? JSON.parse(raw) : [];
  } catch {
    items = [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn());
}

// ─── Public API ──────────────────────────────

export function addToCompare(item: CompareItem): boolean {
  if (items.length >= MAX_COMPARE) return false;
  if (items.some((i) => i.id === item.id)) return false;
  items = [...items, item];
  persist();
  return true;
}

export function removeFromCompare(id: string) {
  items = items.filter((i) => i.id !== id);
  persist();
}

export function toggleCompare(item: CompareItem): boolean {
  if (items.some((i) => i.id === item.id)) {
    removeFromCompare(item.id);
    return false;
  }
  return addToCompare(item);
}

export function clearCompare() {
  items = [];
  persist();
}

export function isInCompare(id: string): boolean {
  return items.some((i) => i.id === id);
}

// ─── React hook ──────────────────────────────

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): CompareItem[] {
  return items;
}

function getServerSnapshot(): CompareItem[] {
  return [];
}

let loaded = false;

export function useCompareStore(): CompareItem[] {
  // Load from localStorage once on first client render
  if (typeof window !== "undefined" && !loaded) {
    load();
    loaded = true;
  }
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
