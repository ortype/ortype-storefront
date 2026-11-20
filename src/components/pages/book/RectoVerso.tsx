import SharedBookPageContent, {
  type BookPageContentProps,
} from '@/components/book/book-page-content'
import { useFont } from '@/components/pages/fonts/FontContainer'
import { useDimensions } from '../fonts/contexts/dimensionsContext'

type BookPageProps = Pick<
  BookPageContentProps,
  'page' | 'defaultVariantId'
> & {
  label?: string
}

// Explicit-layout seam for specimens: reuse authored book typography without
// inheriting legacy module sizing or overflow/page-pair state.
export function BookPageContent(props: Omit<BookPageContentProps, 'font'>) {
  const font = useFont()
  return font ? <SharedBookPageContent {...props} font={font} /> : null
}

// Legacy callers retain context sizing, fixed header spacing and entry reveals.
const RectoVerso = (props: BookPageProps) => {
  const layout = useDimensions()
  return <BookPageContent {...props} layout={layout} />
}

export default RectoVerso
