import { useLayoutContext, calculateCoordinates } from './HexgridLayout'
import { BoardHex } from 'game/types'
import { useBgioG } from 'bgio-contexts'
import { HexText } from './HexText'

type Props = {
  hex: BoardHex
}
export function MapHexGlyph(props: Props) {
  const { hex } = props
  const {
    hexMap: { glyphs, hexSize },
  } = useBgioG()
  const { layout } = useLayoutContext()
  const isGlyph = !!glyphs[hex.id]
  // EARLY RETURN: NO GLYPH
  if (!isGlyph) {
    return null
  }

  const angle = layout.flat ? 0 : Math.PI / 6
  const cornerCoords = calculateCoordinates(layout.size.x / 2, angle)
  const points = cornerCoords.map((point) => `${point.x},${point.y}`).join(' ')
  const isGlyphRevealed = !!glyphs[hex.id]?.isRevealed
  const glyphText = isGlyphRevealed ? glyphs[hex.id]?.glyphID : '?'
  return (
    <g transform={`translate(0, -2)`}>
      <polygon className={'hex-glyph'} points={points} />
      <HexText
        style={{
          fontSize: `${hexSize / 50}em`,
        }}
        hexSize={hexSize}
      >
        {glyphText}
      </HexText>
    </g>
  )
}
