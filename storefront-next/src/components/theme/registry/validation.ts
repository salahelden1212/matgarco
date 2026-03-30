import { SectionSchema } from './types';
import { SectionRegistry } from './index';

export interface ValidationError {
  type: 'max_blocks_exceeded' | 'block_limit_exceeded' | 'missing_required_setting' | 'invalid_variant';
  message: string;
}

export function validateSection(
  sectionData: any,
  schema: SectionSchema | undefined = SectionRegistry[sectionData.type]
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!schema) {
    return { isValid: true, errors: [] }; // Cannot validate custom or legacy sections tightly
  }

  // 1. Validate Variant
  if (sectionData.variant) {
    const isValidVariant = schema.variants.some((v) => v.value === sectionData.variant);
    if (!isValidVariant) {
      errors.push({ type: 'invalid_variant', message: `الـ Variant '${sectionData.variant}' غير صالح لهذا القسم.` });
    }
  }

  // 2. Validate Max Blocks
  const totalBlocks = sectionData.blocks?.length || 0;
  if (schema.maxBlocks !== undefined && totalBlocks > schema.maxBlocks) {
    errors.push({
      type: 'max_blocks_exceeded',
      message: `القسم يتخطى الحد الأقصى للبلوكات (${schema.maxBlocks}).`
    });
  }

  // 3. Validate Block Limits per Type
  if (schema.blockLimits && sectionData.blocks) {
    const counts: Record<string, number> = {};
    for (const block of sectionData.blocks) {
      counts[block.type] = (counts[block.type] || 0) + 1;
    }

    Object.entries(schema.blockLimits).forEach(([type, limit]) => {
      if ((counts[type] || 0) > limit) {
        errors.push({
          type: 'block_limit_exceeded',
          message: `تجاوزت الحد المسموح لعنصر '${type}' وهو ${limit}.`
        });
      }
    });
  }

  // (Optional) Validate Settings Types here in the future
  return {
    isValid: errors.length === 0,
    errors
  };
}
