import { forwardRef, type HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  errorMessage?: string
}

export const InputValidationError = forwardRef<HTMLDivElement, Props>(
  ({ errorMessage = '', ...props }, ref): JSX.Element => {
    return (
      <>
        <div
          {...props}
          ref={ref}
          className='flex items-center gap-1 text-red-400 font-bold mt-2'
        >
          <div className='text-sm'>{errorMessage}</div>
        </div>
      </>
    )
  }
)
