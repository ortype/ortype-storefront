'use client'
import { CogIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

import ArrayMemberPreview from './ArrayMemberPreview'
import OpenGraphInput from './OpenGraphInput'

const GROUPS = [
  {
    default: true,
    name: 'global',
    title: 'Global',
  },
  {
    name: 'fonts',
    title: 'Fonts',
  },
  {
    name: 'licenses',
    title: 'License Metrics',
  },
  {
    name: 'discounts',
    title: 'Discounts',
  },
  {
    name: 'labels',
    title: 'Buy & Cart Labels',
  },
]

const labelWithInfo = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    options: { collapsible: true, collapsed: false },
    fields: [
      defineField({ name: 'label', title: 'Label', type: 'string' }),
      defineField({
        name: 'info',
        title: 'Info popup',
        description: 'Optional text shown in the info tooltip',
        type: 'text',
        rows: 3,
      }),
    ],
    preview: {
      select: { title: 'label', subtitle: 'info' },
      prepare(selection) {
        const { title, subtitle } = selection
        return {
          title: title || '(no label)',
          subtitle: subtitle || undefined,
        }
      },
    },
  })

export default defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  groups: GROUPS,
  preview: { select: { title: 'title', subtitle: 'description' } },
  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  fields: [
    defineField({
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      group: 'global',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description:
        'Used both for the <meta> description tag for SEO, and the blog subheader.',
      title: 'Descriprion',
      type: 'array',
      group: 'global',
      of: [
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              defineField({
                type: 'object',
                name: 'link',
                fields: [
                  {
                    type: 'string',
                    name: 'href',
                    title: 'URL',
                    validation: (rule) => rule.required(),
                  },
                ],
              }),
            ],
          },
        }),
      ],
      validation: (rule) => rule.max(155).required(),
    }),
    defineField({
      name: 'groupings',
      title: 'Font Style Groups',
      description: 'Used to organize large font families',
      type: 'array',
      group: 'fonts',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      description:
        'Used for social media previews when linking to the index page.',
      type: 'object',
      group: 'global',
      /*components: {
        input: OpenGraphInput as any,
      },*/
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'sizes',
      title: 'Company sizes',
      type: 'array',
      description: 'Define your company size tiers',
      validation: (rule) => rule.required(),
      group: 'licenses',
      of: [
        {
          type: 'object',
          name: 'size',
          title: 'Company Size',
          fields: [
            {
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'e.g. "small" all lowercase used for data',
              validation: (rule) => rule.required(),
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'The label we use in the UI',
              validation: (rule) => rule.required(),
            },
            {
              name: 'modifier',
              title: 'Modifier',
              type: 'number',
              validation: (rule) => rule.required(),
              description:
                'price modifier that this size multiplies the base price by',
              // 0.1 to infinity
            },
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'modifier',
            },
            prepare(selection) {
              const { title, subtitle } = selection
              return {
                title: title,
                subtitle: `Modifier: ${subtitle}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'media',
      title: 'Media types',
      type: 'array',
      group: 'licenses',
      validation: (rule) => rule.required(),
      of: [
        defineField({
          type: 'object',
          name: 'type',
          title: 'Media type',
          description: 'e.g. Desktop / Print',
          fields: [
            defineField({
              name: 'value',
              title: 'Base Price',
              type: 'number',
              description: 'The base price of this "media type" in cents',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'The label we use in the UI',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value',
            },
            prepare(selection) {
              const { title, subtitle } = selection
              return {
                title: title,
                subtitle: `Base price: ${subtitle / 100} EUR`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'buyPage',
      title: 'Buy page labels',
      description: 'Editable labels and info popups for the /buy page',
      type: 'object',
      group: 'labels',
      options: { collapsible: true, collapsed: false },
      fields: [
        labelWithInfo('licenseHolder', 'License owner'),
        labelWithInfo('licenseType', 'License type'),
        labelWithInfo('companySize', 'Company size'),
        labelWithInfo('fonts', 'Fonts'),
      ],
    }),
    defineField({
      name: 'cartPage',
      title: 'Cart page labels',
      description: 'Editable labels and info popups for the /cart page',
      type: 'object',
      group: 'labels',
      options: { collapsible: true, collapsed: false },
      fields: [
        labelWithInfo('licenseHolder', 'License holder'),
        labelWithInfo('companySize', 'Company size'),
        labelWithInfo('fonts', 'Fonts'),
        labelWithInfo('licenseType', 'License type'),
        labelWithInfo('price', 'Price'),
        labelWithInfo('addMoreStyles', 'Add more styles'),
        labelWithInfo('bundleHint', 'Bundle discount hint'),
      ],
    }),
  ],
})
