import { Outlines } from '@react-three/drei'
import { Color } from 'three'
import React from 'react'

export const OutlineHighlight = ({
  highlightColor,
}: {
  highlightColor: string
}) => {
  return highlightColor ? (
    <Outlines
      thickness={0.1}
      color={new Color(highlightColor)}
      screenspace={false}
      opacity={1}
      transparent={false}
      angle={15}
    />
  ) : (
    <></>
  )
}
