import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'fontVariant',
  title: 'Variant',
  description: '',
  type: 'document',
  // icon: MdShoppingCart,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'optionName',
      title: 'Option name',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (cents)',
      description: 'E.g. 9000 for €90.00',
      type: 'number',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'uid',
      title: 'UID',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'parentUid',
      title: 'Parent UID',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'index',
      title: 'Index',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'metafields',
      title: 'Metafields',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'metafield',
          title: 'Metafield',
          preview: {
            select: {
              title: `key`,
              subtitle: `value`,
            },
          },
          fields: [
            defineField({
              name: 'key',
              title: 'Key',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: `name`,
      subtitle: `optionName`,
      slug: 'slug.current',
    },
    prepare({ title, subtitle, slug }) {
      return {
        title: title,
        subtitle: `/${slug}`,
      }
    },
  },
})
