import { Box } from '@chakra-ui/react'
import { getTesterSizes } from '../tester-sizing'

const Bullet = ({ delay }) => {
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
        // ...getTesterSizes(table),
        fontSize: `4rem`,
        lineHeight: `8rem`,
      }}
    >
      <Bullet delay={500} />
      <Bullet delay={1000} />
      <Bullet delay={1500} />
    </Box>
    <Box h={'2rem'} />
  </>
)

export default TypingIndicator
