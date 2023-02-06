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
