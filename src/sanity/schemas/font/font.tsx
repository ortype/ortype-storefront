import moduleBook from '@/sanity/schemas/objects/modules/book'
import moduleContent from '@/sanity/schemas/objects/modules/content'
import moduleFeatures from '@/sanity/schemas/objects/modules/features'
import moduleInfo from '@/sanity/schemas/objects/modules/info'
import moduleStyles from '@/sanity/schemas/objects/modules/styles'
import moduleTester from '@/sanity/schemas/objects/modules/tester'
import { BookIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
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
      name: 'shortName',
      title: 'Short name',
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
    {
      name: 'defaultVariant',
      title: 'Default variant',
      type: 'reference',
      weak: true,
      group: 'presentation',
      to: [{ type: 'fontVariant' }],
      validation: (Rule) => Rule.required(),
      options: {
        disableNew: true,
        filter: ({ document }) => ({
          filter: 'parentUid == $parentUid',
          params: {
            // fontId: document._id.replace('drafts.', ''),
            parentUid: document.uid,
          },
        }),
      },
      preview: {
        title: 'name',
      },
    },
    // Modules
    {
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [
        // Item of type 'object' not valid for this list, must be type array
        defineArrayMember({ type: moduleContent.name, name: 'content' }),
        defineArrayMember({ type: moduleBook.name, name: 'book' }),
        // @TODO: rename to 'features'?
        defineArrayMember({ type: moduleFeatures.name, name: 'feature' }),
        defineArrayMember({ type: moduleInfo.name, name: 'info' }),
        defineArrayMember({ type: moduleStyles.name, name: 'styles' }),
        defineArrayMember({ type: moduleTester.name, name: 'tester' }),
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
              description: '',
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
                    disableNew: true,
                    filter: ({ document, parent, parentPath }) => {
                      const group = document.styleGroups?.filter(
                        (group) => group._key === parentPath[1]?._key
                      )[0]
                      let filter =
                        '!(_id in $selected) && uid match $groupName && !(uid match "*Italic") && parentUid == $parentUid'
                      if (group.groupName == 'Standard') {
                        filter =
                          '!(_id in $selected) && !(uid match "*Italic") && parentUid == $parentUid'
                      }
                      return {
                        // filtering by the groups `groupName`
                        filter,
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
              description:
                'This list is filtered by variants that contain the word "Italic"',
              of: [
                {
                  type: 'reference',
                  weak: true,
                  options: {
                    disableNew: true,
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
                      let filter =
                        '!(_id in $selected) && uid match $groupName && uid match "*Italic" && parentUid == $parentUid'
                      if (group.groupName == 'Standard') {
                        filter =
                          '!(_id in $selected) && uid match "*Italic" && parentUid == $parentUid'
                      }
                      return {
                        // @TODO: for some reason the `selected` filter does not prevent duplicates in the search
                        filter,
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
      name: 'features',
      title: 'Features',
      type: 'array',
      group: 'fontFileSync',
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          fields: [
            defineField({
              type: 'string',
              name: 'tag',
            }),
            defineField({
              type: 'string',
              name: 'name',
            }),
            defineField({
              type: 'string',
              name: 'css',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      group: 'fontFileSync',
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'language',
          fields: [
            defineField({
              type: 'string',
              name: 'html',
            }),
            defineField({
              type: 'string',
              name: 'name',
            }),
            defineField({
              type: 'string',
              name: 'ot',
            }),
          ],
        }),
      ],
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
