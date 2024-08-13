'use client'
import config from '@/sanity.config'
import { PortableText } from '@portabletext/react'
import BookModule from './Book'

const components = {
  types: {
    'module.book': (props) => <BookModule {...props} />,
  },
}

const Modules = ({ value }) => {
  return (
    <PortableText
      value={value}
      components={components}
      onMissingComponent={false}
      {...config}
    />
  )
}

export default Modules
