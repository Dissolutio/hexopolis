import React from 'react'
import styled from 'styled-components'

import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { useUIContext, usePlacementContext } from '../contexts'
import { CardUnitIcon } from '../unit-icons'
import { PlacementUnit } from 'game/types'
import { StyledPlacementControlsWrapper } from './StyledPlacementControlsWrapper'

export const PlacementControls = () => {
  const { playerID } = useBgioClientInfo()
  const { placementReady, myStartZone } = useBgioG()
  const { moves } = useBgioMoves()
  const { deployUnits } = moves
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
    <StyledPlacementControlsWrapper>
      <StyledControlsHeaderH2>Phase: Placement</StyledControlsHeaderH2>
      {!isShowingConfirm && (
        <p>
          Select your units and place them within your start zone. Once all
          players are ready, the game will begin!
        </p>
      )}
      {isShowingConfirm && (
        <ConfirmReady
          makeReady={makeReady}
          isNoMoreEmptyStartZoneHexes={isNoMoreEmptyStartZoneHexes}
          isAllPlacementUnitsPlaced={isAllPlacementUnitsPlaced}
        />
      )}
      <PlacementUnitTiles />
    </StyledPlacementControlsWrapper>
  )
}
const StyledControlsHeaderH2 = styled.h2`
  font-size: 1.3rem;
  margin: 0;
  text-align: center;
`
const ConfirmReady = ({
  makeReady,
  isNoMoreEmptyStartZoneHexes,
  isAllPlacementUnitsPlaced,
}: {
  makeReady: () => void
  isNoMoreEmptyStartZoneHexes: boolean
  isAllPlacementUnitsPlaced: boolean
}) => {
  const { onResetPlacementState } = usePlacementContext()
  return (
    <>
      {isNoMoreEmptyStartZoneHexes && <p>Your start zone is full.</p>}
      {isAllPlacementUnitsPlaced && <p>All of your units are placed.</p>}
      <p>Please confirm, this placement is OK?</p>
      {!isAllPlacementUnitsPlaced && (
        <p style={{ color: 'var(--error-red)' }}>
          Some of your units will not be placed! (See those units below)
        </p>
      )}
      <button
        onClick={makeReady}
        style={{
          color: 'var(--success-green)',
          marginTop: '20px',
          border: '1px solid var(--success-green)',
        }}
      >
        CONFIRM PLACEMENT
      </button>
      <button
        onClick={onResetPlacementState}
        style={{
          color: 'var(--error-red)',
          marginTop: '20px',
          border: '1px solid var(--error-red)',
        }}
      >
        No, start over...
      </button>
    </>
  )
}

const PlacementUnitTiles = () => {
  const { inflatedPlacementUnits } = usePlacementContext()
  return (
    <>
      <h3>Unplaced Units:</h3>
      <ul>
        {inflatedPlacementUnits &&
          inflatedPlacementUnits.map((unit) => (
            <PlacementUnitTile key={unit.unitID} unit={unit} />
          ))}
      </ul>
    </>
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
    <StyledPlacementControlsWrapper>
      <p>Waiting for opponents to finish placing armies...</p>
    </StyledPlacementControlsWrapper>
  )
}
