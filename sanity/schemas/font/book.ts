import { defineField, defineType } from 'sanity'

/*
  - fontId
  - fontUid
  - bookLayoutId
  - title
  - snapshots: [
      spread: JSON stringified
      createdAt: date
    ]
  }
*/

// @TODO: disable create button in admin

export default defineType({
  name: 'book',
  title: 'Book',
  description: '',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'bookLayoutId',
      title: 'Book Layout ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'fontId',
      title: 'Font ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'fontUid',
      title: 'Font UID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'variantId',
      title: 'Variant ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'variantUid',
      title: 'Variant UID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'snapshots',
      title: 'Snapshots',
      type: 'array',
      of: [
        {
          name: 'snapshot',
          title: 'Snapshot',
          type: 'object',
          fields: [
            defineField({
              type: 'datetime',
              title: 'Created at',
              name: 'createdAt',
            }),
            defineField({
              type: 'string',
              title: 'Spread',
              name: 'spread',
            }),
          ],
        },
      ],
    }),
  ],
})
