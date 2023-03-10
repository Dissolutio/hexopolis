import { selectGameCardByID } from 'game/selectors'
import { GameArmyCard, GameUnit, Point } from 'game/types'
import React from 'react'
import { HexText } from './HexText'

type Props = {
  hexSize: number
  text: string
  textLine2?: string
}

export const HexIDText = ({ hexSize, text, textLine2 }: Props) => {
  return (
    <>
      <HexText
        hexSize={hexSize}
        className="maphex_altitude-text"
        y={hexSize * 0.6}
      >
        {text.toString()}
      </HexText>
      {textLine2 && (
        <HexText
          hexSize={hexSize}
          className="maphex_altitude-text"
          y={hexSize * 0.8}
        >
          {textLine2.toString()}
        </HexText>
      )}
    </>
  )
}
export const HexGlyph = ({
  hexSize,
  position,
}: {
  hexSize: number
  position: Point
}) => {
  return (
    <>
      <HexText
        hexSize={hexSize}
        y={position.y}
        x={position.x}
        style={{
          fill: 'var(--life-red)',
          fontWeight: '900',
        }}
      >
        GLYPHY
      </HexText>
    </>
  )
}
export const UnitLifeText = ({
  unit,
  card,
  hexSize,
  position,
}: {
  unit: GameUnit
  card: GameArmyCard
  hexSize: number
  position: Point
}) => {
  const unitLifeLeft = card.life - unit.wounds
  return (
    <>
      <HexText
        hexSize={hexSize}
        y={position.y}
        x={position.x}
        style={{
          fill: 'var(--life-red)',
          fontWeight: '900',
        }}
      >
        {unitLifeLeft.toString()}
      </HexText>
    </>
  )
}
