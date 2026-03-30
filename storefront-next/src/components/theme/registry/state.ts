 import { SectionRegistry } from './index';
import { SectionSchema } from './types';
import { validateSection } from './validation';

// Unique ID Generator
export const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ThemeState {
  sectionIds: string[]; // Order of sections
  sectionsById: Record<string, any>; // Normalized O(1) lookup
  isDirty?: boolean; // Track if there are unsaved changes
}

export interface EditorState {
  editingState: ThemeState;
  previewState: ThemeState; // Often mirrors editingState but can be decoupled for live preview features
  lastSavedState?: ThemeState;
}

// ─── Normalize / Denormalize ─────────────────────────────────────────────────
export function normalizeThemeData(rawSections: any[] = []): ThemeState {
  const state: ThemeState = { sectionIds: [], sectionsById: {}, isDirty: false };
  for (const s of rawSections) {
    const id = s.id || generateId('sec');
    state.sectionIds.push(id);
    state.sectionsById[id] = { ...s, id };
  }
  return state;
}

export function denormalizeThemeData(state: ThemeState): any[] {
  return state.sectionIds.map((id) => state.sectionsById[id]);
}

// ─── Actions ─────────────────────────────────────────────────────────────────
export function addSection(state: ThemeState, type: string): ThemeState {
  const schema: SectionSchema | undefined = SectionRegistry[type];
  if (!schema) return state;

  const preset = schema.presets?.[0]; // Usually default starter layout
  const newSection = {
    id: generateId('sec'),
    type,
    schemaVersion: schema.version, // Track which version this section was built with
    variant: preset?.variant || schema.defaultVariant,
    settings: preset?.settings || {},
    blocks: preset?.blocks?.map(b => ({
      ...b,
      id: generateId('blk')
    })) || []
  };

  return {
    sectionIds: [...state.sectionIds, newSection.id],
    sectionsById: { ...state.sectionsById, [newSection.id]: newSection },
    isDirty: true
  };
}

export type UpdaterFn<T> = (prev: T) => T;

export function updateSection(state: ThemeState, sectionId: string, updates: any | UpdaterFn<any>): ThemeState {
  const section = state.sectionsById[sectionId];
  if (!section) return state;

  // Resolve updater function or merge object
  const nextSection = typeof updates === 'function' ? updates(section) : { ...section, ...updates };

  // Run validation
  const { isValid, errors } = validateSection(nextSection);
  if (!isValid) {
    console.warn('Validation Failed:', ...errors);
    return state; // Prevent invalid updates
  }

  return {
    ...state,
    sectionsById: {
      ...state.sectionsById,
      [sectionId]: nextSection
    },
    isDirty: true
  };
}

export function removeSection(state: ThemeState, sectionId: string): ThemeState {
  const nextSectionsById = { ...state.sectionsById };
  delete nextSectionsById[sectionId];

  return {
    sectionIds: state.sectionIds.filter(id => id !== sectionId),
    sectionsById: nextSectionsById
  };
}

// ─── Block Level Actions ─────────────────────────────────────────────────────
export function addBlock(state: ThemeState, sectionId: string, blockType: string): ThemeState {
  const section = state.sectionsById[sectionId];
  if (!section) return state;

  const schema = SectionRegistry[section.type];
  const defaultBlockSettings = schema?.blocks.find(b => b.type === blockType)?.settings.reduce((acc, curr) => {
    acc[curr.id] = curr.default;
    return acc;
  }, {} as any) || {};

  const newBlock = {
    id: generateId('blk'),
    type: blockType,
    settings: defaultBlockSettings
  };

  const nextSection = {
    ...section,
    blocks: [...(section.blocks || []), newBlock]
  };

  // Enforce validation before committing block addition
  const { isValid, errors } = validateSection(nextSection);
  if (!isValid) {
      console.warn('Cannot add block:', errors[0].message);
      return state; // Prevent addition
  }

  return {
    ...state,
    sectionsById: {
      ...state.sectionsById,
      [sectionId]: nextSection
    }
  };
}
