export type SchemaInputType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'range'
  | 'color'
  | 'select'
  | 'boolean'
  | 'url'
  | 'image';

export interface SchemaInput {
  id: string; // The property key in the JSON, e.g. "overlayOpacity"
  type: SchemaInputType;
  label: string;
  default?: any;
  // Specific modifiers based on type
  options?: { value: string; label: string }[]; // for 'select'
  min?: number; // for 'number' or 'range'
  max?: number;
  step?: number;
}

export interface BlockSchema {
  type: string; // e.g. 'heading', 'button', 'image'
  name: string; // Human readable name
  settings: SchemaInput[];
  isRemovable?: boolean; // Default true
  isEditable?: boolean;  // Default true
}

export interface SectionVariant {
  value: string; // e.g. 'split', 'centered'
  label: string; // Human readable name
}

export interface SectionSchema {
  type: string; // e.g. 'hero', 'product_grid'
  name: string; // Human readable name
  version: number; // Schema versioning for future upgrades
  isRemovable?: boolean; // Default true
  isEditable?: boolean;  // Default true
  variants: SectionVariant[];
  defaultVariant: string; // Expected initial variant
  settings: SchemaInput[];
  blocks: BlockSchema[]; // The types of blocks this section allows
  maxBlocks?: number; // Total limit
  blockLimits?: Record<string, number>; // Limit per block type
  presets?: {
    // Defines what happens when "Add Section" is clicked
    name: string;
    variant: string;
    settings: Record<string, any>;
    blocks: { type: string; settings: Record<string, any> }[];
  }[];
}
