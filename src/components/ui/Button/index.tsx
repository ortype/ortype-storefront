import styled, { css } from 'styled-components'
import tw from 'twin.macro'

export const ButtonCss = css`
  ${tw`inline-flex items-center justify-center w-full p-3 text-xs font-extrabold text-base bg-gray-200 border border-black rounded-md transition duration-300 ease-in hover:opacity-80 disabled:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 lg:w-48 cursor-pointer disabled:cursor-default`}
`

export const ButtonWrapper = styled.div`
  ${tw`flex justify-end `}
`

export const Button = styled.button`
  ${ButtonCss}
`
