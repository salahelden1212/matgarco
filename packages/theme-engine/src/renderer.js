"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRenderableSection = normalizeRenderableSection;
exports.normalizeRenderableSections = normalizeRenderableSections;
exports.normalizeRenderablePages = normalizeRenderablePages;
const registry_1 = require("./registry");
function normalizeRenderableSection(rawSection) {
    const resolvedId = rawSection?.id ?? `section-${Math.random().toString(36).slice(2, 8)}`;
    const resolvedType = rawSection?.type ?? rawSection?.id ?? 'custom';
    const schema = registry_1.SectionRegistry[resolvedType];
    const preset = schema?.presets?.[0];
    const rawBlocks = rawSection?.blocks ?? preset?.blocks ?? [];
    return {
        id: resolvedId,
        type: resolvedType,
        enabled: rawSection?.enabled ?? true,
        variant: rawSection?.variant ?? schema?.defaultVariant,
        settings: {
            ...(preset?.settings ?? {}),
            ...(rawSection?.settings ?? rawSection?.config ?? {}),
        },
        blocks: Array.isArray(rawBlocks)
            ? rawBlocks.map((block, index) => ({
                id: block?.id ?? `${resolvedId}-blk-${index + 1}`,
                type: block?.type,
                settings: block?.settings ?? {},
            }))
            : [],
    };
}
function normalizeRenderableSections(rawSections = [], options = {}) {
    const excludeTypes = new Set(options.excludeTypes || []);
    return rawSections
        .map(normalizeRenderableSection)
        .filter((section) => !excludeTypes.has(section.type));
}
function normalizeRenderablePages(rawPages, options = {}) {
    const fallbackPages = options.fallbackPages || {};
    const sourcePages = rawPages && typeof rawPages === 'object' ? rawPages : fallbackPages;
    const pageKeys = new Set([...Object.keys(fallbackPages), ...Object.keys(sourcePages)]);
    const normalized = {};
    for (const pageKey of pageKeys) {
        const sourcePage = sourcePages[pageKey] || {};
        const fallbackPage = fallbackPages[pageKey] || {};
        const sourceSections = Array.isArray(sourcePage.sections) ? sourcePage.sections : undefined;
        const fallbackSections = Array.isArray(fallbackPage.sections) ? fallbackPage.sections : [];
        normalized[pageKey] = {
            ...fallbackPage,
            ...sourcePage,
            sections: normalizeRenderableSections(sourceSections ?? fallbackSections),
        };
    }
    if (!normalized.home && fallbackPages.home) {
        normalized.home = {
            ...fallbackPages.home,
            sections: normalizeRenderableSections(fallbackPages.home.sections || []),
        };
    }
    return normalized;
}
