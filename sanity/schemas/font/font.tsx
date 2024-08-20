import { BookIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

// import productImage from '../productImage'
import variant from './variant'

// @TODO: Only allow creation via the API (not through the Studio UI)

const GROUPS = [
  {
    default: true,
    name: 'presentation',
    title: 'Presentation',
  },
  {
    name: 'fontFileSync',
    title: 'Font file sync',
  },
  {
    name: 'seo',
    title: 'SEO',
  },
]

export default defineType({
  name: 'font',
  title: 'Font',
  description: '',
  type: 'document',
  groups: GROUPS,
  // icon: MdShoppingCart,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
      group: 'fontFileSync',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      readOnly: true,
      validation: (rule) => rule.required(),
      group: 'fontFileSync',
    }),
    defineField({
      name: 'isVisible',
      title: 'Visible',
      description:
        'Set to visible when font should be displayed on the front-end',
      type: 'boolean',
      initialValue: false,
      group: 'presentation',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'presentation',
    }),
    // Modules
    {
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [
        // { type: 'module.callout' },
        defineField({
          name: 'module.book',
          title: 'Book',
          type: 'object',
          fields: [
            defineField({
              name: 'book',
              title: 'Book',
              type: 'reference',
              weak: true,
              to: [{ type: 'book' }],
              validation: (Rule) => Rule.required(),
              options: {
                disableNew: true,
                filter: ({ document }) => ({
                  filter: 'fontId == $fontId',
                  params: {
                    fontId: document._id.replace('drafts.', ''),
                  },
                }),
              },
              preview: {
                title: 'name',
              },
            }),
            // @TODO: is it possible to select from bookRef.snapshots here?
            defineField({
              name: 'config',
              title: 'Config',
              type: 'object',
              fields: [
                defineField({
                  type: 'string',
                  name: 'display',
                  title: 'Display options',
                  initialValue: 'verso',
                  options: {
                    layout: 'radio',
                    direction: 'horizontal',
                    list: [
                      { title: 'Verso', value: 'verso' },
                      { title: 'Recto', value: 'recto' },
                    ],
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              moduleTitle: 'book.name',
              config: 'config',
            },
            prepare(selection) {
              const { moduleTitle, config } = selection
              return {
                media: <BookIcon />,
                subtitle: `Display as '${config.display}'`,
                title: `Layout: '${moduleTitle}'`,
              }
            },
          },
        }),
      ],
      group: 'presentation',
    },
    defineField({
      name: 'price',
      title: 'Family price (cents)',
      description: 'E.g. 9000 for €90.00',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'compareAt',
      title: 'Compare at price (cents)',
      description: 'Calculated by size of family (for display purposes)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'uid',
      title: 'UID',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
      group: 'fontFileSync',
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
      group: 'fontFileSync',
    }),
    defineField({
      name: 'modifiedAt',
      title: 'Modified at',
      type: 'datetime',
      validation: (rule) => rule.required(),
      readOnly: true,
      group: 'fontFileSync',
    }),
    /*defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'reference',
          // to: { type: productImage.name },
        },
      ],
      // validation: (rule) => rule.required(),
    }),*/
    defineField({
      name: 'styleGroups',
      title: 'Style groups',
      type: 'array',
      group: 'presentation',
      of: [
        {
          type: 'object',
          name: 'group',
          title: 'Group',
          fields: [
            {
              title: 'Name',
              name: 'groupName',
              type: 'string',
            },
            {
              name: 'variants',
              title: 'Variants',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  weak: true,
                  options: {
                    filter: ({ document, parent, parentPath }) => {
                      const group = document.styleGroups?.filter(
                        (group) => group._key === parentPath[1]?._key
                      )[0]
                      return {
                        // filtering by the groups `groupName`
                        filter:
                          '!(_id in $selected) && uid match $groupName && !(uid match "*Italic") && parentUid == $parentUid',
                        params: {
                          groupName: group.groupName
                            ? `*${group.groupName}`
                            : `${document.name}*`,
                          parentUid: document.uid,
                          selected: parent
                            .map((item) => item._ref)
                            .filter(Boolean),
                        },
                      }
                    },
                  },
                  to: { type: variant.name },
                },
              ],
            },
            {
              name: 'italicVariants',
              title: 'Italic Variants',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  weak: true,
                  options: {
                    filter: ({ document, parent, parentPath }) => {
                      const group = document.styleGroups?.filter(
                        (group) => group._key === parentPath[1]._key
                      )[0]
                      // console.log('groupName: ', parentPath[1]._key, groupName)
                      /*
                      parentPath = [
                          "styleGroups",
                          {
                              "_key": "471ab5cf0a3d"
                          },
                          "italicVariants"
                        ]
                        // 1. How to use parentPath array to dig into 
                        // document.styleGroups.filter(group => group._key === parentPath[1]._key)?.groupName
                        // 2. How to use the resulting `groupName` to filter the 
                        
                      */
                      return {
                        // @TODO: for some reason the `selected` filter does not prevent duplicates in the search
                        filter:
                          '!(_id in $selected) && uid match $groupName && uid match "*Italic" && parentUid == $parentUid',
                        params: {
                          groupName: group.groupName
                            ? `*${group.groupName}`
                            : `${document.name}*`,
                          parentUid: document.uid, // we use the parentId on the reference and match it to the document uid
                          selected: parent
                            .map((item) => item._ref)
                            .filter(Boolean),
                        },
                      }
                    },
                  },
                  to: { type: variant.name },
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      of: [
        {
          type: 'reference',
          weak: true,
          to: { type: variant.name },
        },
      ],
      // validation: (rule) => rule.required(),
      group: 'fontFileSync',
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
      group: 'fontFileSync',
    }),
  ],
  preview: {
    select: {
      title: `name`,
      subtitle: `slug.current`,
      media: 'images.0.images',
      isVisible: 'isVisible',
    },
    prepare({ title, subtitle, media, isVisible }) {
      return {
        title: title,
        subtitle: `/${subtitle} ${isVisible ? '[Visible]' : '[Hidden]'}`,
        media: media,
      }
    },
  },
})

/*
// @TODO: use sanity/icons to display visible/hidden with `media` property
prepare({ title, summary, status }) {
      const EMOJIS = {
        open: '🎫',
        resolved: '✅',
        cancelled: '🚫'
      }
      return {
        title: title,
        subtitle: summary,
        media: <span style={{fontSize: '1.5rem'}}>{status ? EMOJIS[status] : '🎫'}</span>
      }
    }
*/
