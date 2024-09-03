import SpecialFeatures from '@/sanity/components/SpecialFeatures'

/*{
  name: 'catBreed',
  title: 'Cat Breed',
  type: 'string',
  options: {
    list: [],
    url: 'https://catfact.ninja/breeds',
    formatResponse: (json) =>
      json.data.map(({breed}) => ({
        title: breed,
        value: breed.toLowerCase().split(' ').join('-'),
      })),
  },
  components: {
    input: AsyncSelect,
  },
},*/

import { BookIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default {
  name: 'module.features',
  title: 'Special Features',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
    }),
    defineField({
      type: 'array',
      name: 'features',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          fields: [
            defineField({
              type: 'string',
              name: 'tag',
              title: 'Select feature',
              components: { input: SpecialFeatures },
              options: {
                list: [],
                format: (data) =>
                  data?.map(({ name, tag }) => ({
                    title: name,
                    value: tag,
                  })),
              },
            }),
            defineField({
              type: 'string',
              name: 'title',
            }),
            defineField({
              type: 'string',
              name: 'example',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      moduleTitle: 'label',
      config: 'config',
    },
    prepare(selection) {
      const { moduleTitle, config } = selection
      return {
        // media: <BookIcon />,
        // subtitle: `Display as '${config.display}'`,
        title: `Special Features: '${moduleTitle}'`,
      }
    },
  },
}
