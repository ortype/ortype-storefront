import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'productImage',
  title: 'Product Image',
  description: '',
  type: 'document',
  // icon: BsFillImageFill,
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
      name: 'images',
      title: 'Images',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: `name`,
      media: 'images'
    },
  },
})
