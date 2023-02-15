import { selectGameCardByID } from 'game/selectors'
import { GameArmyCard, GameUnit } from 'game/types'
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
export const UnitLifeText = ({
  unit,
  card,
  hexSize,
}: {
  unit: GameUnit
  card: GameArmyCard
  hexSize: number
}) => {
  const unitLifeLeft = card.life - unit.wounds
  return (
    <>
      <HexText
        hexSize={hexSize}
        y={0}
        x={hexSize * -0.6}
        style={{ fill: 'var(--neon-red)' }}
      >
        {unitLifeLeft.toString()}
      </HexText>
    </>
  )
}
