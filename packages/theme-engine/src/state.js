"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = void 0;
exports.normalizeThemeData = normalizeThemeData;
exports.denormalizeThemeData = denormalizeThemeData;
exports.addSection = addSection;
exports.updateSection = updateSection;
exports.removeSection = removeSection;
exports.addBlock = addBlock;
exports.moveBlock = moveBlock;
const registry_1 = require("./registry");
const blockRegistry_1 = require("./blockRegistry");
const validation_1 = require("./validation");
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
exports.generateId = generateId;
function normalizeThemeData(rawSections = []) {
    const state = { sectionIds: [], sectionsById: {}, isDirty: false };
    for (const s of rawSections) {
        const id = s.id || (0, exports.generateId)('sec');
        state.sectionIds.push(id);
        state.sectionsById[id] = { ...s, id };
    }
    return state;
}
function denormalizeThemeData(state) {
    return state.sectionIds.map((id) => state.sectionsById[id]);
}
function addSection(state, type) {
    const schema = registry_1.SectionRegistry[type];
    if (!schema)
        return state;
    const preset = schema.presets?.[0];
    const newSection = {
        id: (0, exports.generateId)('sec'),
        type,
        schemaVersion: schema.version,
        variant: preset?.variant || schema.defaultVariant,
        settings: preset?.settings || {},
        blocks: preset?.blocks?.map((b) => ({
            ...b,
            id: (0, exports.generateId)('blk'),
        })) || [],
    };
    return {
        sectionIds: [...state.sectionIds, newSection.id],
        sectionsById: { ...state.sectionsById, [newSection.id]: newSection },
        isDirty: true,
    };
}
function updateSection(state, sectionId, updates) {
    const section = state.sectionsById[sectionId];
    if (!section)
        return state;
    const nextSection = typeof updates === 'function' ? updates(section) : { ...section, ...updates };
    const { isValid } = (0, validation_1.validateSection)(nextSection);
    if (!isValid) {
        return state;
    }
    return {
        ...state,
        sectionsById: {
            ...state.sectionsById,
            [sectionId]: nextSection,
        },
        isDirty: true,
    };
}
function removeSection(state, sectionId) {
    const nextSectionsById = { ...state.sectionsById };
    delete nextSectionsById[sectionId];
    return {
        sectionIds: state.sectionIds.filter((id) => id !== sectionId),
        sectionsById: nextSectionsById,
        isDirty: true,
    };
}
function addBlock(state, sectionId, blockType) {
    const section = state.sectionsById[sectionId];
    if (!section)
        return state;
    const schema = registry_1.SectionRegistry[section.type];
    const blockSchema = (0, blockRegistry_1.resolveBlockSchema)(schema, blockType);
    if (!blockSchema)
        return state;
    const defaultBlockSettings = (0, blockRegistry_1.buildBlockDefaultSettings)(blockSchema);
    const newBlock = {
        id: (0, exports.generateId)('blk'),
        type: blockType,
        settings: defaultBlockSettings,
    };
    const nextSection = {
        ...section,
        blocks: [...(section.blocks || []), newBlock],
    };
    const { isValid } = (0, validation_1.validateSection)(nextSection);
    if (!isValid) {
        return state;
    }
    return {
        ...state,
        sectionsById: {
            ...state.sectionsById,
            [sectionId]: nextSection,
        },
        isDirty: true,
    };
}
function moveBlock(state, sectionId, blockId, direction) {
    const section = state.sectionsById[sectionId];
    if (!section || !Array.isArray(section.blocks) || section.blocks.length < 2)
        return state;
    const currentIndex = section.blocks.findIndex((block) => block.id === blockId);
    if (currentIndex === -1)
        return state;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= section.blocks.length)
        return state;
    const reorderedBlocks = [...section.blocks];
    [reorderedBlocks[currentIndex], reorderedBlocks[targetIndex]] = [reorderedBlocks[targetIndex], reorderedBlocks[currentIndex]];
    const nextSection = {
        ...section,
        blocks: reorderedBlocks,
    };
    const { isValid } = (0, validation_1.validateSection)(nextSection);
    if (!isValid)
        return state;
    return {
        ...state,
        sectionsById: {
            ...state.sectionsById,
            [sectionId]: nextSection,
        },
        isDirty: true,
    };
}
