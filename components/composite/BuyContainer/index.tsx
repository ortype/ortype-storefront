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
import { Button, Heading } from '@chakra-ui/react'
import { OrderContainer } from '@commercelayer/react-components'

interface Props {
  font: object
  children: JSX.Element[] | JSX.Element
}

const BuyContainer = ({ font, children }: Props): JSX.Element => {
  // const { isLoading, isInvalid } = useOrderContext()
  return (
    <DialogRoot
      size={'full'}
      placement="center"
      lazyMount
      motionPreset="slide-in-bottom"
      modal
    >
      <DialogTrigger asChild>
        <Button
          bg={'green'}
          size={'xl'}
          textTransform={'uppercase'}
          width={'full'}
        >{`Buy`}</Button>
      </DialogTrigger>
      <DialogContent bg={'white'}>
        <DialogHeader>
          <Heading
            textAlign={'center'}
            size={'2xl'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            you or me or they are buying fonts
          </Heading>
        </DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          <BuyProvider font={font}>{children}</BuyProvider>
        </DialogBody>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default BuyContainer
