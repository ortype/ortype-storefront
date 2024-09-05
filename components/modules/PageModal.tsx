import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import {
  Box,
  Button,
  Center,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ReactNode, useRef, useState } from 'react'
import { useFont } from '../pages/fonts/FontContainer'

export interface PageModal {
  children: ReactNode
  isEven: boolean
  // containerRef: ReactNode
}

export default function PageModal({
  children,
  isEven,
  containerRef,
}: PageModal) {
  const { pseudoPadding, padding, conversion } = useSpreadContainer()
  const font = useFont()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const btnRef = useRef(null)
  const initialRef = useRef(null)

  const [coords, setCoords] = useState({ x: 0, y: 0 })

  const closeModal = () => {
    onClose()
    containerRef.current.style.visibility = 'visible'
  }

  const openModal = () => {
    // Get button coordinates
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      // isEven
      const y = rect.height / 2 + rect.top
      if (isEven) {
        setCoords({ x: -rect.left, y })
      } else {
        setCoords({ x: rect.right, y })
      }
      // @NOTE: temp easy display none, but maybe it really does the trick
      containerRef.current.style.visibility = 'hidden'
      // Open the modal
      onOpen()
    }
  }

  return (
    <>
      <Center
        position={'absolute'}
        bottom={0}
        left={0}
        w={'100%'}
        height={64 * conversion + 'px'}
        background={'linear-gradient(to top, white, transparent)'}
        visibility={isOpen ? 'hidden' : 'visible'}
      >
        <Button
          fontSize={38 * conversion + 'px'}
          borderRadius={38 * conversion + 'px'}
          variant={'outline'}
          colorScheme={'brand'}
          fontWeight={'normal'}
          bg={'#000'}
          color={'#FFF'}
          borderWidth={'2px'}
          borderColor={'#000'}
          _hover={{
            textDecoration: 'none',
            bg: '#FFF',
            color: '#000',
            borderColor: '#000',
          }}
          ref={btnRef}
          onClick={openModal}
        >
          {'+'}
        </Button>
      </Center>
      <Modal
        // portalProps={{ containerRef }}
        onClose={closeModal}
        // initialFocusRef on something other than the close button
        initialFocusRef={initialRef}
        finalFocusRef={btnRef}
        isOpen={isOpen}
        scrollBehavior={'outside'}
        size={'xl'}
        motionPreset={'none'}
      >
        <ModalOverlay
          bg={'#000'}
          motionProps={{
            initial: 'initial',
            animate: 'animate',
            exit: 'exit',
            variants: {
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: {
                  opacity: { ease: 'linear', duration: 0.3 },
                },
              },
              exit: { opacity: 0 },
            },
          }}
        />
        <ModalContent
          as={motion.div}
          layout // @NOTE: not sure if this is needed
          display={'flex'}
          w={'42.5vw'}
          pos={'relative'}
          minH={'auto'}
          my={'auto'}
          borderRadius={'none'}
          maxW={'auto'}
          sx={{ transformOrigin: 'bottom' }}
          motionProps={{
            initial: 'initial',
            animate: 'animate',
            exit: 'exit',
            variants: {
              initial: { x: coords.x, y: coords.y, opacity: 0 },
              animate: {
                x: 0,
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.5,
                  type: 'spring',
                  opacity: { ease: 'easeInOut', duration: 0.5 },
                },
              },
              exit: { x: coords.x, y: coords.y, opacity: 0 },
            },
          }}
        >
          <Box
            flex={'1'}
            mb={padding}
            position="relative"
            style={{
              padding,
            }}
            ref={initialRef}
          >
            {children}
          </Box>
          <ModalCloseButton
            top={'-1.5rem'}
            right={'-6rem'}
            w={'4rem'}
            h={'4rem'}
            fontSize={'24px'}
            color={'#FFF'}
            zIndex={'popover'}
          />
        </ModalContent>
      </Modal>
    </>
  )
}
