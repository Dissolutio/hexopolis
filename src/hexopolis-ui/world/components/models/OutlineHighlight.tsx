import { Outlines } from '@react-three/drei'
import { Color } from 'three'
import React from 'react'
import { GameUnit } from 'game/types'
import { useBgioCtx } from 'bgio-contexts'
import { useUIContext } from 'hexopolis-ui/contexts'

export const OutlineHighlight = ({ gameUnit }: { gameUnit: GameUnit }) => {
  const { unitID } = gameUnit
  const { isPlacementPhase, isRoundOfPlayPhase } = useBgioCtx()
  const { selectedUnitID } = useUIContext()

  const isSelectedUnitHex =
    selectedUnitID && unitID && selectedUnitID === unitID
  const getHighlightColor = () => {
    if (isSelectedUnitHex) {
      return 'white'
    }
    return ''
  }
  const highlightColor = getHighlightColor()
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
