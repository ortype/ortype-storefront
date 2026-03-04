import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  PasswordInput,
  PasswordStrengthMeter,
} from '@/components/ui/password-input'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Field,
  Flex,
  Heading,
  Input,
  InputGroup,
  Stack,
} from '@chakra-ui/react'
import { useState } from 'react'

const inputProps = {
  variant: 'subtle' as const,
  size: 'lg' as const,
  fontSize: 'md',
  borderRadius: 0,
}

const ChangePassword = () => {
  const [editing, setEditing] = useState(false)
  return (
    <>
      <DialogRoot
        lazyMount
        open={editing}
        onOpenChange={(e) => setEditing(e.open)}
      >
        <DialogContent borderRadius={'2rem'}>
          <DialogHeader>
            <DialogTitle
              textAlign={'center'}
              fontSize={'2rem'}
              fontWeight={'normal'}
              textTransform={'uppercase'}
              mx={'auto'}
              pb={4}
            >
              {'Choose new password'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {
              // @TODO: like customer-details-form use react-hook-form
              // with FloatingLabelInput
              // Cancel / Save buttons
              // wired to updateCustomer
            }
            {/*
            <PasswordInput name="customerPassword" label="Password" />
            <PasswordInput
              name="customerConfirmPassword"
              label="Confirm Password"
            />
            <Box w={'50%'}>
              <PasswordStrengthMeter value={passwordStrength} py={1} />
            </Box>
            */}
            <Button
              variant={'outline'}
              bg={'white'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
              onClick={() => {
                setEditing(false)
              }}
              // disabled={isLocalLoader}
            >
              {'Cancel'}
            </Button>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
      <Field.Root w="full" pos="relative">
        <InputGroup
          attached
          w={'full'}
          flex="1"
          endElement={
            <Button
              onClick={() => {
                setEditing(true)
              }}
              size={'2xs'}
              bg={'white'}
              variant={'subtle'}
              borderRadius={'full'}
            >
              {'Change password'}
            </Button>
          }
        >
          <Input
            {...inputProps}
            value={'************'}
            readOnly
            css={{
              paddingTop: '3',
              paddingBottom: '1',
            }}
          />
        </InputGroup>
        <Field.Label
          css={{
            pos: 'absolute',
            bg: 'transparent',
            px: '0.05rem',
            top: '0',
            insetStart: '3',
            fontWeight: 'normal',
            pointerEvents: 'none',
            color: 'fg',
            fontSize: '2xs',
          }}
        >
          {'Password'}
        </Field.Label>
      </Field.Root>
    </>
  )
}

export default ChangePassword
