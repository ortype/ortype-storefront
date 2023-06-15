import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

interface Props {
  steps: Array<SingleStepEnum>
  onStepChange: (stepIndex: SingleStepEnum) => void
  activeStep: SingleStepEnum
  lastActivable: SingleStepEnum
}

export const StepNav: React.FC<Props> = ({
  steps,
  onStepChange,
  activeStep,
  lastActivable,
}) => {
  const { t } = useTranslation()

  return (
    <Breadcrumb
      separator={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3 mx-3 fill-current"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      }
    >
      {(steps || []).map((step, index) => {
        const isActive = step === activeStep
        const isLocked =
          lastActivable !== 'Complete' &&
          steps.indexOf(step) > steps.indexOf(lastActivable)
        return (
          <BreadcrumbItem
            isCurrentPage={isActive}
            key={index}
            isLocked={isLocked}
          >
            <BreadcrumbLink
              href="#"
              color={isActive ? '#000' : '#979393'}
              textDecoration={isActive ? 'underline' : 'none'}
              onClick={() => {
                if (!isLocked) {
                  onStepChange(step)
                }
              }}
            >
              {t(`step${step}.title`)}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}
