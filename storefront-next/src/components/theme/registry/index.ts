import { SectionSchema } from './types';
import { HeroSchema } from '../sections/hero/schema';
import { CategoriesGridSchema } from '../sections/categories_grid/schema';

// Central Registry — ThemeMaker and ThemeRenderer read from here
export const SectionRegistry: Record<string, SectionSchema> = {
  [HeroSchema.type]: HeroSchema,
  [CategoriesGridSchema.type]: CategoriesGridSchema,
};

export * from './types';
