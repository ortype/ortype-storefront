/*
import {useState, useEffect} from 'react'

const AsyncSelect = (props) => {
  const [listItems, setListItems] = useState([])
  const {schemaType, renderDefault} = props
  const {options} = schemaType
  const {url, formatResponse} = options

  useEffect(() => {
    const getCats = async () =>
      fetch(url)
        .then((res) => res.json())
        .then(formatResponse)
        .then(setListItems)

    getCats()
  }, [url, formatResponse])

  return renderDefault({
    ...props,
    schemaType: {...schemaType, options: {...options, list: listItems}},
  })
}
export default AsyncSelect
*/

// in v3
import { useFormValue } from 'sanity'

function SpecialFeatures(props) {
  const features = useFormValue([`features`])
  const { schemaType, renderDefault } = props
  const { options } = schemaType
  const { format } = options
  const listItems = format(features)
  return renderDefault({
    ...props,
    schemaType: { ...schemaType, options: { ...options, list: listItems } },
  })
}

export default SpecialFeatures
