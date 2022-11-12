import React from 'react'

import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { useUIContext, usePlacementContext } from '../contexts'
import { ArmyListStyle } from '../layout'
import { CardUnitIcon } from '../unit-icons'
import { PlacementUnit } from 'game/types'

export const PlacementControls = () => {
  const { playerID } = useBgioClientInfo()
  const { placementReady, myStartZone } = useBgioG()
  const { moves } = useBgioMoves()
  const { placementUnits, editingBoardHexes } = usePlacementContext()

  const { confirmPlacementReady } = moves
  const isReady = placementReady[playerID] === true
  const makeReady = () => {
    confirmPlacementReady({ playerID })
  }
  const filledHexesCount = Object.keys(editingBoardHexes).length
  const startZoneHexesCount = myStartZone.length
  const isNoMoreEmptyStartZoneHexes = filledHexesCount === startZoneHexesCount
  const isAllPlacementUnitsPlaced = placementUnits?.length === 0
  const isShowingConfirm =
    (isAllPlacementUnitsPlaced || isNoMoreEmptyStartZoneHexes) && !isReady
  // once player has placed and confirmed, show waiting
  if (isReady) {
    return <WaitingForOpponent />
  }
  // return UI
  return (
    <ArmyListStyle>
      <h2>Phase: Placement</h2>
      <p>
        Select your units and place them within your start zone. Once all
        players are ready, the game will begin!
      </p>
      {isShowingConfirm && (
        <ConfirmReady
          makeReady={makeReady}
          isNoMoreEmptyStartZoneHexes={isNoMoreEmptyStartZoneHexes}
          isAllPlacementUnitsPlaced={isAllPlacementUnitsPlaced}
        />
      )}
      <PlacementUnitTiles />
    </ArmyListStyle>
  )
}

const ConfirmReady = ({
  makeReady,
  isNoMoreEmptyStartZoneHexes,
  isAllPlacementUnitsPlaced,
}: {
  makeReady: () => void
  isNoMoreEmptyStartZoneHexes: boolean
  isAllPlacementUnitsPlaced: boolean
}) => {
  return (
    <>
      {isNoMoreEmptyStartZoneHexes && <p>Your start zone is full.</p>}
      {isAllPlacementUnitsPlaced && <p>All of your units are placed.</p>}
      <p>Please confirm, this placement is OK?</p>
      <button onClick={makeReady}>CONFIRM PLACEMENT</button>
      {!isAllPlacementUnitsPlaced && (
        <p style={{ color: 'red' }}>Some of your units will not be placed!</p>
      )}
    </>
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

const WaitingForOpponent = () => {
  return (
    <ArmyListStyle>
      <p>Waiting for opponents to finish placing armies...</p>
    </ArmyListStyle>
  )
}
