import settingsType from '@/sanity/schemas/settings'
import type { StructureResolver } from 'sanity/structure'
// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) => {
  // Goes through all of the singletons that were provided and translates them into something the
  // Desktool can understand
  const singletonItems = [settingsType].map((typeDef) => {
    return S.listItem()
      .title(typeDef.title!)
      .icon(typeDef.icon)
      .child(
        S.editor()
          .id(typeDef.name)
          .schemaType(typeDef.name)
          .documentId(typeDef.name)
      )
  })

  // The default root list items (except custom ones)
  const defaultListItems = S.documentTypeListItems().filter(
    (listItem) =>
      ![settingsType].find((singleton) => singleton.name === listItem.getId())
  )

  return S.list()
    .title('Content')
    .items([...singletonItems, S.divider(), ...defaultListItems])
}
