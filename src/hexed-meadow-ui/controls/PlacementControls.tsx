import React from 'react'

import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { useUIContext, usePlacementContext } from '../contexts'
import { ArmyListStyle } from '../layout'
import { CardUnitIcon } from '../unit-icons'
import { PlacementUnit } from 'game/types'

export const PlacementControls = () => {
  const { playerID } = useBgioClientInfo()
  const { placementReady } = useBgioG()
  const { moves } = useBgioMoves()
  const { placementUnits } = usePlacementContext()

  const { confirmPlacementReady } = moves
  const isReady = placementReady[playerID] === true
  const makeReady = () => {
    confirmPlacementReady({ playerID })
  }
  // RETURN CONFIRM DONE
  if (placementUnits?.length === 0 && !isReady) {
    return <ConfirmReady makeReady={makeReady} />
  }
  // RETURN WAITING
  if (isReady) {
    return <WaitingForOpponent />
  }
  // RETURN PLACEMENT UI
  return (
    <ArmyListStyle>
      <h2>Phase: Placement</h2>
      <p>
        Place all of your units into your start zone. You can move and swap your
        units within your start zone.
      </p>
      <p>Once all players are ready, the game will begin!</p>
      <PlacementUnitTiles />
    </ArmyListStyle>
  )
}
const PlacementUnitTiles = () => {
  const { inflatedPlacementUnits } = usePlacementContext()
  return (
    <ul>
      {inflatedPlacementUnits &&
        inflatedPlacementUnits.map((unit) => (
          <PlacementUnitTile key={unit.unitID} unit={unit} />
        ))}
    </ul>
  )
}
const PlacementUnitTile = ({ unit }: { unit: PlacementUnit }) => {
  const { selectedUnitID } = useUIContext()
  const { onClickPlacementUnit } = usePlacementContext()
  const onClick = () => {
    onClickPlacementUnit?.(unit.unitID)
  }
  const selectedStyle = (unitID: string) => {
    if (selectedUnitID === unitID) {
      return {
        boxShadow: `0 0 2px var(--white)`,
        border: `1px solid var(--white)`,
        backgroundColor: `green`,
      }
    } else {
      return {}
    }
  }
  return (
    <li key={unit.unitID}>
      <button style={selectedStyle(unit.unitID)} onClick={onClick}>
        <CardUnitIcon unit={unit} />
        <span>{unit.name}</span>
      </button>
    </li>
  )
}
const ConfirmReady = ({ makeReady }: { makeReady: () => void }) => {
  return (
    <ArmyListStyle>
      <p>Done placing your units?</p>
      <button onClick={makeReady}>CONFIRM PLACEMENT</button>
    </ArmyListStyle>
  )
}
const WaitingForOpponent = () => {
  return (
    <ArmyListStyle>
      <p>Waiting for opponents to finish placing armies...</p>
    </ArmyListStyle>
  )
}
