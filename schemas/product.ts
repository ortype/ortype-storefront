import { defineField, defineType } from 'sanity'
import productImage from './productImage'

export default defineType({
  name: 'product',
  title: 'Product',
  description: '',
  type: 'document',
  // icon: MdShoppingCart,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
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
      // validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'uid',
      title: 'UID',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: {type: productImage.name },
        },
      ],
      // validation: (rule) => rule.required(),
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
