"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSection = validateSection;
const registry_1 = require("./registry");
const blockRegistry_1 = require("./blockRegistry");
function validateSection(sectionData, schema = registry_1.SectionRegistry[sectionData.type]) {
    const errors = [];
    if (!schema) {
        return { isValid: true, errors: [] };
    }
    if (sectionData.variant) {
        const isValidVariant = schema.variants.some((v) => v.id === sectionData.variant);
        if (!isValidVariant) {
            errors.push({ type: 'invalid_variant', message: `الـ Variant '${sectionData.variant}' غير صالح لهذا القسم.` });
        }
    }
    const allowedBlocks = (0, blockRegistry_1.resolveSectionBlocks)(schema);
    if (allowedBlocks.length > 0 && sectionData.blocks) {
        const allowedTypes = new Set(allowedBlocks.map((block) => block.type));
        for (const block of sectionData.blocks) {
            if (!allowedTypes.has(block.type)) {
                errors.push({
                    type: 'invalid_block_type',
                    message: `البلوك '${block.type}' غير مسموح داخل القسم '${schema.type}'.`,
                });
            }
        }
    }
    const totalBlocks = sectionData.blocks?.length || 0;
    if (schema.maxBlocks !== undefined && totalBlocks > schema.maxBlocks) {
        errors.push({
            type: 'max_blocks_exceeded',
            message: `القسم يتخطى الحد الأقصى للبلوكات (${schema.maxBlocks}).`,
        });
    }
    if (schema.blockLimits && sectionData.blocks) {
        const counts = {};
        for (const block of sectionData.blocks) {
            counts[block.type] = (counts[block.type] || 0) + 1;
        }
        Object.entries(schema.blockLimits).forEach(([type, limit]) => {
            if ((counts[type] || 0) > limit) {
                errors.push({
                    type: 'block_limit_exceeded',
                    message: `تجاوزت الحد المسموح لعنصر '${type}' وهو ${limit}.`,
                });
            }
        });
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
