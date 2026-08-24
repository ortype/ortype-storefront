import settingsType from '@/sanity/schemas/settings'
import { TranslateIcon } from '@sanity/icons'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureResolver } from 'sanity/structure'
// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) => {
  const { context } = S
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
          .documentId(typeDef.name),
      )
  })

  const defaultListItems = S.documentTypeListItems().filter(
    (listItem) =>
      !['font', 'fontVariant', 'media.tag', 'media.folder', 'author'].includes(
        listItem.getId(),
      ) &&
      ![settingsType].find((singleton) => singleton.name === listItem.getId()),
  )

  return S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'font',
        title: 'Fonts',
        icon: TranslateIcon,
        S,
        context,
      }),
      ...singletonItems,
      S.divider(),
      ...defaultListItems,
    ])
}
