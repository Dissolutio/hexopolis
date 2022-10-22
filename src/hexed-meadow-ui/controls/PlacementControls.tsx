import React from 'react'
import { useUIContext, usePlacementContext } from '../contexts'
import { CardUnitIcon } from '../unit-icons'
import { ArmyListStyle } from '../layout'
import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'

export const PlacementControls = () => {
  const { playerID } = useBgioClientInfo()
  const { placementReady } = useBgioG()
  const { moves } = useBgioMoves()
  const { selectedUnitID } = useUIContext()
  const { placementUnits, onClickPlacementUnit } = usePlacementContext()

  const { confirmPlacementReady } = moves
  const isReady = placementReady[playerID] === true
  const makeReady = () => {
    confirmPlacementReady({ playerID })
  }
  const selectedStyle = (unitID: string) => {
    if (selectedUnitID === unitID) {
      return {
        boxShadow: `0 0 2px var(--white)`,
        border: `1px solid var(--white)`,
      }
    } else {
      return {}
    }
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
      <h2>Place each unit in your start zone.</h2>
      <ul>
        {placementUnits &&
          placementUnits.map((unit) => (
            <li key={unit.unitID}>
              <button
                style={selectedStyle(unit.unitID)}
                onClick={() => onClickPlacementUnit?.(unit.unitID)}
              >
                <CardUnitIcon unit={unit} />
                <span>{unit.name}</span>
              </button>
            </li>
          ))}
      </ul>
    </ArmyListStyle>
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
