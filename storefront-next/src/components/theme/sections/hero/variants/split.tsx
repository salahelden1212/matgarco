import React from 'react';
import { HeroProps } from '../index';

export default function HeroSplit({ settings, blocks }: HeroProps) {
  const {
    backgroundImage = '',
    height = 'medium',
  } = settings;

  const minHeight = height === 'small' ? '400px' : height === 'fullscreen' ? '100vh' : '650px';

  return (
    <section 
      className="relative w-full overflow-hidden bg-slate-50 flex items-center"
      style={{ minHeight }}
    >
      <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12">
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          {blocks.map((block) => {
            if (block.type === 'heading') {
              const Tag = block.settings.size || 'h1';
              const sizeClass = Tag === 'h1' ? 'text-4xl md:text-6xl font-black' : Tag === 'h2' ? 'text-3xl md:text-4xl font-bold' : 'text-2xl font-bold';
              return (
                <Tag key={block.id} className={`${sizeClass} text-slate-800 leading-tight`}>
                  {block.settings.text}
                </Tag>
              );
            }
            if (block.type === 'subtext') {
              return (
                <p key={block.id} className="text-lg text-slate-500 leading-relaxed max-w-xl">
                  {block.settings.text}
                </p>
              );
            }
            if (block.type === 'button') {
              const isOutline = block.settings.style === 'outline';
              return (
                <a 
                  key={block.id} 
                  href={block.settings.link || '#'} 
                  className={`inline-block px-8 py-3.5 font-bold rounded-lg transition-all ${
                    isOutline 
                      ? 'border-2 border-slate-300 text-slate-700 hover:bg-slate-100' 
                      : 'bg-[var(--primary)] text-white hover:opacity-90 shadow-lg'
                  }`}
                >
                  {block.settings.label}
                </a>
              );
            }
            return null;
          })}
        </div>
        
        {/* Image Content */}
        <div className="flex-1 w-full flex justify-center mt-8 md:mt-0">
          {backgroundImage ? (
             <img 
                src={backgroundImage} 
                className="w-full max-w-lg object-cover rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
                alt="Hero banner layout image"
             />
          ) : (
            <div className="w-full max-w-lg aspect-square bg-slate-200 rounded-2xl flex items-center justify-center border-4 border-dashed border-slate-300">
               <span className="text-slate-400 font-bold">مكان الصورة (Image Placeholder)</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
