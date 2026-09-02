'use client'
import { Box, Tabs } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'

export interface ListTableToggleProps {
  value: string
  handleValueChange: (nextValue: string) => void
  allChildrenLoaded: boolean
}

export default function ListTableToggle({
  value,
  handleValueChange,
  allChildrenLoaded,
}: ListTableToggleProps) {
  return (
    <Box pos={'fixed'} bottom={4} right={4}>
      <AnimatePresence mode='wait'>
        {allChildrenLoaded && (
          <motion.div
            key='list-table-toggle'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
              delay: 0.5,
            }}
          >
            <Tabs.Root
              size={'sm'}
              value={value}
              defaultValue={'list'}
              variant={'enclosed'}
              onValueChange={(e) => handleValueChange(e.value)}
            >
              <Tabs.List>
                <Tabs.Trigger value='list'>List</Tabs.Trigger>
                <Tabs.Trigger value='table'>Table</Tabs.Trigger>
                <Tabs.Indicator />
              </Tabs.List>
            </Tabs.Root>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}
