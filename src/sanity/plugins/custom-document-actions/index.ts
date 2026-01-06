import {
  definePlugin,
  DocumentActionComponent,
  DocumentActionsResolver,
} from 'sanity'
import { VimeoMetadataAction } from './vimeo-metadata'

// Document types that may contain video modules
const VIDEO_DOCUMENT_TYPES = [
  'font',      // Has headerVideo field and modules
  'page',      // May have modules with videos
  'post',      // May have content with videos
]

export const resolveDocumentActions: DocumentActionsResolver = (prev, { schemaType }) => {
  // Replace default publish action with VimeoMetadataAction for video-containing documents
  if (VIDEO_DOCUMENT_TYPES.includes(schemaType)) {
    return prev.map((originalAction) =>
      originalAction.action === 'publish'
        ? (VimeoMetadataAction as DocumentActionComponent)
        : originalAction
    )
  }

  return prev
}

export const customDocumentActions = definePlugin({
  name: 'custom-document-actions',
  document: {
    actions: resolveDocumentActions,
  },
})
