import body from '@/sanity/schemas/objects/body'
import { defineField } from 'sanity'

const defaults = { nonTextBehavior: 'remove' }

// @TODO: move to a utils folder
// and export default anon function
function blocksToText(blocks = [], opts = {}) {
  if (typeof blocks === 'string') {
    return blocks
  }

  const options = Object.assign({}, defaults, opts)
  return blocks
    .map((block) => {
      if (block._type !== 'block' || !block.children) {
        return options.nonTextBehavior === 'remove'
          ? ''
          : `[${block._type} block]`
      }

      return block.children.map((child) => child.text).join('')
    })
    .join('\n\n')
}

export default {
  name: 'module.content',
  title: 'Content',
  type: 'object',
  fields: [defineField({ name: 'body', type: body.name })],
  preview: {
    select: {
      body: 'body',
    },
    prepare(selection) {
      const { body, title } = selection
      return {
        title: 'Rich text',
        subtitle: body && blocksToText(body),
      }
    },
  },
}
