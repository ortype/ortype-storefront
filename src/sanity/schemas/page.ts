import { defineField, defineType } from 'sanity'
import blockContent from './blockContent'

const page = {
  name: 'page',
  title: 'Page',
  type: 'document',
  // groups: [
  //   {
  //     default: true,
  //     name: 'editorial',
  //     title: 'Editorial',
  //   },
  //   {
  //     name: 'seo',
  //     title: 'SEO',
  //   },
  // ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    // Body
    // {
    //   name: 'body',
    //   title: 'Body',
    //   type: 'body',
    //   group: 'editorial'
    // },
    defineField({
      name: blockContent.name,
      title: 'Content',
      type: 'blockContent',
      // group: 'editorial',
    }),
    // Modules
    {
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [
        // { type: 'module.callout' },
        // { type: 'module.carousel' },
        // { type: 'module.grid' },
        // { type: 'module.gallery' },
        // { type: 'module.heading' },
        // { type: 'module.image' },
        // { type: 'module.richText' },
        // { type: 'module.video' }
      ],
      // group: 'editorial',
    },
    // SEO
    /*{
      name: 'seo',
      title: 'SEO',
      type: 'seo.page',
      group: 'seo'
    }*/
  ],
  preview: {
    select: {
      title: 'title',
      // subtitle: 'heroText',
      // media: 'mainImage'
    },
  },
}

export default page
