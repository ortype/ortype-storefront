import { Box, Button, Stack, Tag } from '@chakra-ui/react'
import React from 'react'
import { FilterItem } from './filter-item'

interface Category {
  slug: string
  title: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <Stack py={4} direction="row" gap={1} wrap="wrap" justifyContent={'center'}>
      <FilterItem
        active={selectedCategory === 'all'}
        onClick={
          selectedCategory === 'all' ? undefined : () => onCategoryChange('all')
        }
        size={'xl'}
        closeable={false}
      >
        {'All'}
      </FilterItem>
      {categories.map((category) => (
        <FilterItem
          key={category.slug}
          active={selectedCategory === category.slug}
          size={'xl'}
          onClick={() =>
            selectedCategory === category.slug
              ? onCategoryChange('all')
              : onCategoryChange(category.slug)
          }
          closeable={true}
        >
          {category.title}
        </FilterItem>
      ))}
    </Stack>
  )
}

export default CategoryFilter
