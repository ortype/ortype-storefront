import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import type { LicenseSize } from '@/commercelayer/providers/Order'
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
import { Box, Button, Center, Container, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import LicenseOwnerRadio from './license-owner-radio'
import LicenseOwnerInput from './LicenseOwnerInput'

/**
 * Order-wide confirmation shown before applying a license size change when the
 * cart already has committed items. Cancel keeps the current size; Ok applies
 * the new size (pricing reconciles per-font on "Update cart" and at checkout).
 */
export default function EditLicenseMetricsDialog({
  label,
  info,
  setLicenseSize,
  isLicenseForClient,
}: {
  label?: string
  info?: string
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  isLicenseForClient: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <DialogRoot
      lazyMount
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size={'full'}
      motionPreset={'slide-in-bottom-custom'}
    >
      <DialogTrigger asChild>
        <Button
          variant="text"
          size="xs"
          fontSize="xs"
          px={2}
          py={1}
          h="auto"
          minH="auto"
        >
          {'Edit'}
        </Button>
      </DialogTrigger>
      <DialogContent backdrop borderRadius={0} bg={'transparent'} h={'100vh'}>
        <DialogBody overflow={'auto'}>
          <DialogTitle
            textAlign={'center'}
            fontSize={'2rem'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
            ml={{ base: '1rem', xl: '15rem', '3xl': '21rem' }}
            mr={{
              base: '1rem',
              lg: '15rem',
              xl: '15rem',
              '2xl': '17rem',
              '3xl': '21rem',
            }}
            pb={8}
            my={4}
            lineHeight={1}
          >
            {`Update license metrics`}
          </DialogTitle>
          <Container maxW={'30rem'}>
            <VStack gap={4}>
              <Box w={'full'}>
                <LicenseOwnerRadio label={label} info={info} />
                {isLicenseForClient && (
                  <Box my={2}>
                    <LicenseOwnerInput
                      label={'Company info'}
                      info={
                        'Please let us know the company name of your client, the typeface license owner.'
                      }
                    />
                  </Box>
                )}
              </Box>
              <LicenseSizeList
                label={label}
                info={info}
                setLicenseSize={setLicenseSize}
                // onResolved={(applied) => {
                //   if (applied) setOpen(false)
                // }}
              />
              <Button
                onClick={() => setOpen(false)}
                variant={'solid'}
                bg={'black'}
                color={'white'}
                borderRadius={'5rem'}
                size={'sm'}
                fontSize={'md'}
                _hover={{ bg: 'red' }}
              >
                {'Continue'}
              </Button>
            </VStack>
          </Container>
        </DialogBody>
        <Box position={'absolute'} top={3} left={3}>
          <DialogCloseTrigger
            position={'relative'}
            top={'auto'}
            right={'auto'}
          />
        </Box>
      </DialogContent>
    </DialogRoot>
  )
}
