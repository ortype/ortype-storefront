import type { Settings } from 'CustomApp'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { useIdentityContext } from '@/commercelayer/providers/identity'
import { Container, Flex, Heading, Text } from '@chakra-ui/react'

type Props = Pick<Settings, 'logoUrl' | 'companyName'>

function CustomerHeader({ logoUrl, companyName }: Props): JSX.Element {
  const { t } = useTranslation()
  const { customer } = useIdentityContext()
  const email = customer?.email as string

  return (
    <Container>
      <Flex justifyContent={'space-between'} p={5}>
        <Heading>{t('header.title')}</Heading>
        <Flex alignItems={'center'}>
          <Text size={'sm'}>{email}</Text>
        </Flex>
      </Flex>
    </Container>
  )
}

export default CustomerHeader
