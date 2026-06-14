import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, GripVertical, Settings2, LayoutPanelLeft } from 'lucide-react';
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SectionRegistry,
  resolveSectionBlocks,
  normalizeThemeData,
  denormalizeThemeData,
  addSection,
  updateSection,
  removeSection,
  addBlock,
} from '../../../packages/theme-engine/src';
import type { SchemaInput, ThemeState } from '../../../packages/theme-engine/src';

interface Props {
  sections: any[];
  onChange: (newSections: any[]) => void;
}

interface SortableBlockCardProps {
  blockId: string;
  children: (dragHandleProps: { attributes: any; listeners: any }) => React.ReactNode;
}

function SortableBlockCard({ blockId, children }: SortableBlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: blockId });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'opacity-70' : ''}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

export default function SectionsPanel({ sections, onChange }: Props) {
  const [state, setState] = useState<ThemeState>(() => normalizeThemeData(sections));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync if external data changes initially
  useEffect(() => {
    setState(normalizeThemeData(sections));
  }, [sections]);

  const commitState = (newState: ThemeState) => {
    setState(newState);
    onChange(denormalizeThemeData(newState));
  };

  const handleAddSection = (type: string) => {
    const newState = addSection(state, type);
    commitState(newState);
    setShowAddMenu(false);
    // Expand the last added section
    const newId = newState.sectionIds[newState.sectionIds.length - 1];
    setExpandedId(newId);
  };

  const handleUpdateSection = (id: string, updates: any) => {
    const newState = updateSection(state, id, updates);
    commitState(newState);
  };

  const handleRemoveSection = (id: string) => {
    const newState = removeSection(state, id);
    commitState(newState);
  };

  const handleAddBlock = (sectionId: string, blockType: string) => {
    const newState = addBlock(state, sectionId, blockType);
    commitState(newState);
  };

  const handleRemoveBlock = (sectionId: string, blockId: string) => {
    commitState(updateSection(state, sectionId, (prev: any) => ({
      ...prev,
      blocks: prev.blocks.filter((b: any) => b.id !== blockId)
    })));
  };

  const handleBlockDragEnd = (sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const section = state.sectionsById[sectionId];
    const blocks = Array.isArray(section?.blocks) ? section.blocks : [];
    const oldIndex = blocks.findIndex((block: any) => block.id === active.id);
    const newIndex = blocks.findIndex((block: any) => block.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    commitState(
      updateSection(state, sectionId, (prev: any) => ({
        ...prev,
        blocks: arrayMove(prev.blocks || [], oldIndex, newIndex),
      }))
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIds = [...state.sectionIds];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= newIds.length) return;
    [newIds[index], newIds[swap]] = [newIds[swap], newIds[index]];
    commitState({ ...state, sectionIds: newIds, isDirty: true });
  };

  // Render Dynamic Input
  const renderInput = (input: SchemaInput, value: any, onChangeFn: (val: any) => void) => {
    const v = value !== undefined ? value : input.default;
    const inputClasses = "w-full text-xs px-3 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition duration-150 font-bold text-slate-700 shadow-sm";

    if (input.type === 'color') {
      return (
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-xl border border-slate-250 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50 shadow-xs cursor-pointer hover:border-slate-350 transition-colors">
            <input 
              type="color" 
              value={v || '#ffffff'} 
              onChange={e => onChangeFn(e.target.value)} 
              className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0 scale-150" 
            />
            <div className="w-5 h-5 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: v || '#ffffff' }} />
          </div>
          <input 
            type="text" 
            value={v || ''} 
            onChange={e => onChangeFn(e.target.value)} 
            placeholder="#ffffff"
            className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-slate-700 bg-white shadow-xs" 
          />
        </div>
      );
    }
    if (input.type === 'select') {
      return (
        <div className="relative">
          <select 
            value={v} 
            onChange={e => onChangeFn(e.target.value)} 
            className={`${inputClasses} appearance-none pr-8 pl-3`}
          >
            {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {/* Note: since this page uses RTL Cairo, chevron is on the left */}
            <ChevronDown size={14} />
          </div>
        </div>
      );
    }
    if (input.type === 'range') {
      const isPx = input.id.toLowerCase().includes('width') || input.id.toLowerCase().includes('size') || input.id.toLowerCase().includes('padding') || input.id.toLowerCase().includes('margin');
      return (
        <div className="flex items-center gap-3">
          <input 
            type="range" 
            min={input.min || 0} 
            max={input.max || 100} 
            step={input.step || 1} 
            value={v} 
            onChange={e => onChangeFn(Number(e.target.value))} 
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
          />
          <span className="text-xs font-bold font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md shrink-0 shadow-xs border border-indigo-100">
            {v}{isPx ? 'px' : ''}
          </span>
        </div>
      );
    }
    if (input.type === 'textarea') {
      return (
        <textarea
          value={v ?? ''}
          onChange={(e) => onChangeFn(e.target.value)}
          rows={3}
          className={`${inputClasses} resize-y min-h-[60px] font-medium`}
        />
      );
    }
    if (input.type === 'toggle' || input.type === 'boolean') {
      const isChecked = !!v;
      return (
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onChangeFn(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-slate-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-700">{isChecked ? 'مفعل' : 'غير مفعل'}</span>
        </label>
      );
    }
    if (input.type === 'number') {
      return (
        <input
          type="number"
          min={input.min}
          max={input.max}
          step={input.step || 1}
          value={v ?? ''}
          onChange={(e) => onChangeFn(e.target.value === '' ? '' : Number(e.target.value))}
          className={inputClasses}
        />
      );
    }
    if (input.type === 'image') {
      const isUrl = typeof v === 'string' && v.startsWith('http');
      return (
        <div className="space-y-2">
          <input 
            type="url" 
            value={v ?? ''} 
            onChange={e => onChangeFn(e.target.value)} 
            placeholder="رابط الصورة (URL)"
            className={inputClasses} 
          />
          {isUrl && (
            <div className="relative w-20 h-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shadow-sm transition-all duration-300 hover:border-indigo-300 shrink-0">
              <img src={v} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      );
    }

    const htmlInputType = input.type === 'url' ? 'url' : 'text';
    return (
      <input 
        type={htmlInputType} 
        value={v ?? ''} 
        onChange={e => onChangeFn(e.target.value)} 
        className={inputClasses} 
      />
    );
  };

  return (
    <div className="space-y-3 font-cairo">
      {state.sectionIds.map((id, index) => {
        const section = state.sectionsById[id];
        const schema = SectionRegistry[section.type];
        if (!schema) return null; // Fallback missing
        const sectionBlockSchemas = resolveSectionBlocks(schema);

        const isExpanded = expandedId === id;

        return (
          <div key={id} className={`border rounded-2xl bg-white shadow-xs overflow-hidden transition-all duration-200 ${isExpanded ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md shadow-indigo-500/5' : 'border-slate-200'}`}>
            
            {/* Header */}
            <div 
              onClick={() => setExpandedId(isExpanded ? null : id)} 
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <GripVertical size={16} className="text-slate-300 cursor-grab hover:text-slate-500 shrink-0 transition-colors" />
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <LayoutPanelLeft size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-800 truncate">{schema.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono font-bold truncate">type: {schema.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col">
                  <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }} disabled={index === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-20 active:scale-75 transition-transform"><ChevronUp size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }} disabled={index === state.sectionIds.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-20 active:scale-75 transition-transform"><ChevronDown size={14} /></button>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180 text-indigo-600 font-bold' : ''}`} 
                />
              </div>
            </div>

            {/* Body (Settings + Blocks) */}
            {isExpanded && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-5 animate-in slide-in-from-top-1 duration-150">
                
                {/* Variant Selection */}
                {schema.variants && schema.variants.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-600 block">شكل التصميم (Layout Variant)</label>
                    <div className="relative">
                      <select 
                        value={section.variant || schema.defaultVariant} 
                        onChange={(e) => handleUpdateSection(id, { variant: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700 appearance-none shadow-sm"
                      >
                        {schema.variants.map(v => (
                          <option key={v.id} value={v.id}>{v.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings */}
                {schema.settings && schema.settings.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1"><Settings2 size={12}/> الإعدادات الأساسية</h5>
                    <div className="space-y-3">
                      {schema.settings.map(input => (
                        <div key={input.id} className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">{input.label}</label>
                          {renderInput(input, section.settings?.[input.id], (val) => {
                            handleUpdateSection(id, (prev: any) => ({
                              ...prev,
                              settings: { ...prev.settings, [input.id]: val }
                            }));
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blocks */}
                {sectionBlockSchemas.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">مكونات القسم (Blocks)</h5>
                    
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleBlockDragEnd(id, event)}>
                      <SortableContext items={(section.blocks || []).map((block: any) => block.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2.5">
                          {section.blocks?.map((block: any, bIdx: number) => {
                            const blockSchema = sectionBlockSchemas.find(b => b.type === block.type);
                            if (!blockSchema) return null;

                            return (
                              <SortableBlockCard key={block.id} blockId={block.id}>
                                {({ attributes, listeners }) => (
                                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <button
                                          {...attributes}
                                          {...listeners}
                                          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
                                          title="اسحب لإعادة الترتيب"
                                        >
                                          <GripVertical size={14} />
                                        </button>
                                        <span className="text-xs font-black text-slate-800 truncate">{blockSchema.name}</span>
                                      </div>
                                      <button onClick={() => handleRemoveBlock(id, block.id)} className="text-red-400 hover:text-red-600 transition-colors p-0.5 shrink-0"><Trash2 size={14}/></button>
                                    </div>
                                    <div className="space-y-3 border-t border-slate-50 pt-2.5">
                                      {blockSchema.settings.map(input => (
                                        <div key={input.id} className="space-y-1">
                                          <label className="block text-[11px] font-bold text-slate-600">{input.label}</label>
                                          {renderInput(input, block.settings?.[input.id], (val) => {
                                            handleUpdateSection(id, (prev: any) => {
                                              const newBlocks = [...prev.blocks];
                                              newBlocks[bIdx] = { ...newBlocks[bIdx] };
                                              newBlocks[bIdx].settings = { ...newBlocks[bIdx].settings, [input.id]: val };
                                              return { ...prev, blocks: newBlocks };
                                            });
                                          })}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </SortableBlockCard>
                            );
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {/* Add Block Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {sectionBlockSchemas.map(allowedBlock => {
                        const currentCount = section.blocks?.filter((b:any) => b.type === allowedBlock.type).length || 0;
                        const limit = schema.blockLimits?.[allowedBlock.type] ?? (schema.maxBlocks || Infinity);
                        const canAdd = currentCount < limit;

                        return (
                          <button 
                            key={allowedBlock.type}
                            onClick={() => handleAddBlock(id, allowedBlock.type)}
                            disabled={!canAdd}
                            className="text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50 hover:border-slate-350 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                          >
                            <Plus size={12}/> إضافة {allowedBlock.name}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                )}

                {/* Danger Zone */}
                <div className="pt-3.5 border-t border-red-100 flex justify-end">
                   <button onClick={() => handleRemoveSection(id)} className="text-xs font-bold text-red-650 hover:text-red-750 flex items-center gap-1 active:scale-95 transition-all">
                     <Trash2 size={13} /> حذف هذا القسم
                   </button>
                </div>
                
              </div>
            )}
          </div>
        );
      })}

      {/* --- Add New Section Button --- */}
      <div className="pt-4 space-y-3">
         <button 
           onClick={() => setShowAddMenu(!showAddMenu)} 
           className="w-full py-4 border-2 border-dashed border-slate-350 rounded-2xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-650 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
         >
           <Plus size={18} /> {showAddMenu ? 'إغلاق قائمة الأقسام' : 'إضافة قسم جديد'}
         </button>

         {showAddMenu && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1">الأقسام المتاحة للتفعيل</div>
              <div className="grid grid-cols-1 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                {Object.values(SectionRegistry).map(schema => (
                  <button 
                    key={schema.type} 
                    onClick={() => handleAddSection(schema.type)}
                    className="w-full text-right p-3 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-xl group transition-all flex items-center justify-between shadow-xs hover:shadow-sm"
                  >
                     <div className="flex flex-col items-start min-w-0">
                       <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{schema.name}</span>
                       <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">{schema.type}</span>
                     </div>
                     <Plus size={14} className="text-slate-400 group-hover:text-indigo-600 group-hover:rotate-90 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
         )}
      </div>

    </div>
  );
}
