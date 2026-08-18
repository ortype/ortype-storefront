import { Box } from '@chakra-ui/react'

const Bullet = ({ delay }: { delay: string }) => {
  return (
    <Box
      as={'span'}
      padding={'0 1px'}
      opacity={0.5}
      animation={'pulse'}
      animationDuration={'2000ms'}
      animationTimingFunction={'linear'}
      animationDelay={delay}
      animationIterationCount={'infinite'}
    >
      &bull;
    </Box>
  )
}

const TypingIndicator = ({ table }) => (
  <>
    <Box
      as={'span'}
      css={{
        textAlign: `center`,
        boxSizing: `border-box`,
        padding: 0,
        background: `transparent`,
        border: `none`,
        width: `100%`,
        display: `block`,
        fontSize: `4rem`,
        lineHeight: `8rem`,
      }}
    >
      <Bullet delay={'0ms'} />
      <Bullet delay={'250ms'} />
      <Bullet delay={'500ms'} />
    </Box>
    <Box h={'2rem'} />
  </>
)

export default TypingIndicator
