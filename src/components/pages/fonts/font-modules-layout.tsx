'use client'

import TesterModule from '@/components/modules/Tester'
import { useMemo } from 'react'
import { SpreadStateProvider } from './contexts/spreadStateContext'
import type {
  FontModule,
  FontSection,
  TesterModuleValue,
} from './font-sections'
import LegacyModulesContainer from './legacy-modules-container'

function isTester(entry: FontModule): entry is TesterModuleValue {
  return entry._type === 'tester' || entry._type === 'module.tester'
}

export default function FontModulesLayout({
  modules,
  sections,
  isDraftMode,
}: {
  modules: FontModule[]
  sections: FontSection[]
  isDraftMode: boolean
}) {
  const runs = useMemo(() => {
    const result: Array<
      | { kind: 'tester'; module: TesterModuleValue; key: string }
      | { kind: 'legacy'; modules: FontModule[]; key: string }
    > = []
    for (const entry of modules) {
      if (isTester(entry)) {
        result.push({ kind: 'tester', module: entry, key: entry._key })
      } else {
        const previous = result[result.length - 1]
        if (previous?.kind === 'legacy') previous.modules.push(entry)
        else
          result.push({ kind: 'legacy', modules: [entry], key: entry._key })
      }
    }
    return result
  }, [modules])

  return (
    <SpreadStateProvider initialItems={modules}>
      {runs.map((run) =>
        run.kind === 'tester' ? (
          <TesterModule
            key={run.key}
            value={run.module}
            section={sections.find(
              (section) => section.targetKey === run.key
            )}
            isDraftMode={isDraftMode}
          />
        ) : (
          <LegacyModulesContainer
            key={run.key}
            modules={run.modules}
            sections={sections}
            isDraftMode={isDraftMode}
            sharedSpreadState
          />
        )
      )}
    </SpreadStateProvider>
  )
}
