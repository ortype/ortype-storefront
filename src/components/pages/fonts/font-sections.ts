import type { Font } from '@/types'

type QueryFontModule = NonNullable<Font['modules']>[number]
// Sanity TypeGen currently reports the schema type, not the array member's
// alias. Existing documents use aliases (including "feature", not "features").
type WithMemberAlias<T> = T extends { _type: `module.${infer Name}` }
  ? Omit<T, '_type'> & { _type: Name extends 'features' ? 'feature' : Name }
  : never
export type FontModule = QueryFontModule | WithMemberAlias<QueryFontModule>
export type TesterModuleValue = Extract<
  FontModule,
  { _type: 'tester' | 'module.tester' }
>
export type SectionLinkModule = Extract<
  FontModule,
  { _type: 'sectionLink' | 'module.sectionLink' }
>

const pageTypes = new Set([
  'styles',
  'info',
  'content',
  'book',
  'feature',
  'features',
  'tester',
])

export const isFontPageModule = (module: FontModule) =>
  pageTypes.has(module._type.replace(/^module\./, ''))

export function getFontSections(modules: readonly FontModule[]) {
  return modules.flatMap((module, index) => {
    const target = modules[index + 1]
    if (
      (module._type !== 'sectionLink' &&
        module._type !== 'module.sectionLink') ||
      !module.label?.trim() ||
      !target ||
      !isFontPageModule(target)
    ) {
      return []
    }

    return [
      {
        marker: module,
        targetKey: target._key,
        id: `font-section-${module._key}`,
      },
    ]
  })
}

export type FontSection = ReturnType<typeof getFontSections>[number]
