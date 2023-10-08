import { defineField, defineType } from 'sanity'

import productImage from '../productImage'
import variant from './variant'

// @TODO: Only allow creation via the API (not through the Studio UI)

export default defineType({
  name: 'font',
  title: 'Font',
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
      name: 'description',
      title: 'Description',
      type: 'text',
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
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: productImage.name },
        },
      ],
      // validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'styleGroups',
      title: 'Style groups',
      type: 'array',
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
      subtitle: `slug.current`,
      media: 'images.0.images',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title,
        subtitle: `/${subtitle}`,
        media: media,
      }
    },
  },
})
