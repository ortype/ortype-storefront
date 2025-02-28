import body from '@/sanity/schemas/font/blocks/body'
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
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'body', type: body.name }),
    defineField({
      name: 'centered',
      title: 'Center text',
      type: 'boolean',
    }),
    defineField({
      name: 'overflowCol',
      title: 'Overflow into columns',
      description:
        'Content overflow is handled by a overlay, unless this is ticked, then it flows content across a spread',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      moduleTitle: 'title',
      body: 'body',
    },
    prepare(selection) {
      const { body, moduleTitle } = selection
      return {
        title: moduleTitle || '',
        subtitle: body && blocksToText(body),
      }
    },
  },
}
