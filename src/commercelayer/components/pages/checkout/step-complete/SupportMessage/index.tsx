import { Flex } from '@chakra-ui/react'
import { Trans } from 'react-i18next'

interface Props {
  supportPhone?: string
  supportEmail?: string
}

export const SupportMessage: React.FC<Props> = ({
  supportPhone,
  supportEmail,
}) => {
  const setI18nKey = () => {
    if (supportPhone && supportEmail) {
      return 'stepComplete.fullSupport'
    }
    if (!supportPhone && supportEmail) {
      return 'stepComplete.supportEmail'
    }
    if (supportPhone && !supportEmail) {
      return 'stepComplete.supportPhone'
    }
  }

  if (!supportPhone && !supportEmail) {
    return <></>
  }

  return (
    <Flex>
      <Trans
        i18nKey={setI18nKey()}
        values={{ email: supportEmail, phone: supportPhone }}
        components={{
          WrapperStyle: (
            <strong className="text-black border-b border-gray-300 cursor-pointer" />
          ),
          WrapperEmail: (
            <a
              data-testid="support-email-link"
              href={`mailto:${supportEmail}`}
            />
          ),
          WrapperPhone: (
            <a
              data-testid="support-phone-link"
              href={`tel:${supportPhone && supportPhone.replace(/\s+/g, '')}`}
            />
          ),
        }}
      />
    </Flex>
  )
}
