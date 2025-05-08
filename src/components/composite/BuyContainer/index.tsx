import { BuyProvider } from '@/commercelayer/providers/Buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Box, Button, Heading } from '@chakra-ui/react'
import { OrderContainer } from '@commercelayer/react-components'

interface Props {
  font: object
  children: JSX.Element[] | JSX.Element
}

const BuyContainer = ({ font, children }: Props): JSX.Element => {
  // const { isLoading, isInvalid } = useOrderContext()
  return (
    <DialogRoot size={'full'} lazyMount motionPreset="slide-in-bottom">
      <DialogTrigger asChild>
        <Button
          // @TODO: look into how to set this up in button.ts
          bg={'red'}
          color={'white'}
          pos={'fixed'}
          size={'md'}
          top={4}
          right={14}
          fontSize={'lg'}
          px={'0.75rem'}
          minW={'auto'}
          borderRadius={'3rem'}
          zIndex={'docked'}
        >{`Add to cart`}</Button>
      </DialogTrigger>
      <DialogContent bg={'white'}>
        <DialogHeader>
          <Button
            left={16}
            pos={'absolute'}
            p={2}
            variant={'square'}
            fontSize={'1.5rem'}
            lineHeight={'1.25rem'}
            h={11}
            className={font.defaultVariant?._id}
          >
            {font ? font.shortName : 'Type'}
          </Button>
          <Heading
            textAlign={'center'}
            size={'2xl'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
            mx={'auto'}
          >
            you or me or they are buying fonts
          </Heading>
        </DialogHeader>
        <DialogCloseTrigger insetStart={2} insetEnd={'auto'} />
        <DialogBody>
          <BuyProvider font={font}>{children}</BuyProvider>
        </DialogBody>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default BuyContainer
