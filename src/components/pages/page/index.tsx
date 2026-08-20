'use client'
import Body from '@/components/blocks/body'
import { Container, Heading } from '@chakra-ui/react'
import Head from 'next/head'

// import type { Page } from '@/types'

export interface PageProps {
  page: any
}

export function Page({ page }: PageProps) {
  return (
    <Container>
      <Body value={page.blockContent} />
    </Container>
  )
}

export default Page
