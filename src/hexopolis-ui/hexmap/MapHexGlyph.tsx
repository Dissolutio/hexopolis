import { getHexagonSvgPolygonPoints } from './getHexagonSvgPolygonPoints'
import { BoardHex } from 'game/types'
import { useBgioG } from 'bgio-contexts'
import { HexText } from './HexText'
import { selectGlyphForHex } from 'game/selectors'
import { powerGlyphs } from 'game/glyphs'
import { SVG_HEX_APOTHEM, SVG_HEX_RADIUS } from 'app/constants'

type Props = {
  hex: BoardHex
}
export function MapHexGlyph(props: Props) {
  const { hex } = props
  const {
    hexMap: { glyphs, hexSize },
  } = useBgioG()
  const glyphOnHex = selectGlyphForHex({ hexID: hex.id, glyphs })

  // EARLY RETURN: NO GLYPH
  if (!glyphOnHex) {
    return null
  }

  // const angle = layout.flat ? 0 : Math.PI / 6
  const cornerCoords = getHexagonSvgPolygonPoints()
  const points = cornerCoords.map((point) => `${point.x},${point.y}`).join(' ')
  const isGlyphRevealed = glyphOnHex.isRevealed
  const canonicalGlyph = powerGlyphs[glyphOnHex.glyphID]
  const glyphShortName = canonicalGlyph?.shortName || ''
  const glyphText = isGlyphRevealed ? glyphShortName : '?'
  return (
    <g>
      <polygon transform={`translate(2.5, 0) scale(0.7)`} className={'hex-glyph'} points={points} />
      <HexText
        style={{
          fontSize: isGlyphRevealed ? `${hexSize / 80}em` : `${hexSize / 50}em`,
          transform: isGlyphRevealed
            ? `translate(0, -${hexSize / 5}em)`
            : 'translate(0, 0)',
        }}
        x={SVG_HEX_APOTHEM}
        y={SVG_HEX_RADIUS}
        hexSize={hexSize}
      >
        {glyphText}
      </HexText>
    </g>
  )
}
