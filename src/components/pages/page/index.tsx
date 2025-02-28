'use client'
import Body from '@/components/blocks/body'
import { Container, Heading } from '@chakra-ui/react'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import Head from 'next/head'

// import type { Page } from '@/types'

export interface PageProps {
  page: any
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function Page({ page, encodeDataAttribute }: PageProps) {
  return (
    <Container>
      <Body value={page.blockContent} />
    </Container>
  )
}

export default Page
