import React from 'react'
import styled from 'styled-components'

import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { useUIContext, usePlacementContext } from '../contexts'
import { PlacementCardUnitIcon } from '../unit-icons'
import { PlacementUnit } from 'game/types'
import { StyledPlacementControlsWrapper } from './StyledPlacementControlsWrapper'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexed-meadow-ui/layout/Typography'

export const PlacementControls = () => {
  const { playerID } = useBgioClientInfo()
  const { placementReady, myStartZone } = useBgioG()
  const { moves } = useBgioMoves()
  const { deployUnits } = moves
  const { placementUnits, editingBoardHexes } = usePlacementContext()

  const { confirmPlacementReady } = moves
  const isReady = placementReady[playerID] === true
  const makeReady = () => {
    deployUnits(editingBoardHexes)
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
    return (
      <StyledPlacementControlsWrapper>
        <StyledControlsHeaderH2>
          Waiting for opponents to finish placing armies...
        </StyledControlsHeaderH2>
      </StyledPlacementControlsWrapper>
    )
  }
  // return UI
  return (
    <StyledPlacementControlsWrapper>
      <StyledControlsHeaderH2>Phase: Placement</StyledControlsHeaderH2>
      {!isShowingConfirm && (
        <StyledControlsP>
          Select your units and place them within your start zone. Once all
          players are ready, the game will begin!
        </StyledControlsP>
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
      {isNoMoreEmptyStartZoneHexes && (
        <StyledControlsP>Your start zone is full.</StyledControlsP>
      )}
      {isAllPlacementUnitsPlaced && (
        <StyledControlsP>All of your units are placed.</StyledControlsP>
      )}
      <StyledControlsP>Please confirm, this placement is OK?</StyledControlsP>
      {!isAllPlacementUnitsPlaced && (
        <StyledControlsP style={{ color: 'var(--error-red)' }}>
          Some of your units will not be placed! (See those units below)
        </StyledControlsP>
      )}
      <div />
      <button
        onClick={makeReady}
        style={{
          display: 'inline-block',
          marginTop: '20px',
          fontSize: '0.8rem',
          color: 'var(--success-green)',
          border: '1px solid var(--success-green)',
        }}
      >
        Confirm Placement
      </button>
      <button
        onClick={onResetPlacementState}
        style={{
          display: 'inline-block',
          marginTop: '20px',
          fontSize: '0.8rem',
          color: 'var(--error-red)',
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
  const isLength = inflatedPlacementUnits.length > 0
  // render null if list is empty
  if (!isLength) {
    return null
  }
  return (
    <>
      <StyledControlsH3>Unplaced Units:</StyledControlsH3>
      <ul>
        {inflatedPlacementUnits &&
          inflatedPlacementUnits.map((unit) => (
            <PlacementUnitTile key={unit.unitID} unit={unit} />
          ))}
      </ul>
    </>
  )
}
export const selectedTileStyle = {
  boxShadow: `0 0 2px var(--white)`,
  border: `1px solid var(--white)`,
  backgroundColor: `var(--selected-green)`,
}
const PlacementUnitTile = ({ unit }: { unit: PlacementUnit }) => {
  const { selectedUnitID } = useUIContext()
  const { onClickPlacementUnit } = usePlacementContext()
  const onClick = () => {
    onClickPlacementUnit?.(unit.unitID)
  }
  const selectedStyle = (unitID: string) => {
    if (selectedUnitID === unitID) {
      return selectedTileStyle
    } else {
      return {}
    }
  }
  return (
    <li key={unit.unitID}>
      <button style={selectedStyle(unit.unitID)} onClick={onClick}>
        <PlacementCardUnitIcon
          armyCardID={unit.armyCardID}
          playerID={unit.playerID}
        />
        <span>{unit.name}</span>
      </button>
    </li>
  )
}

const StyledControlsH3 = styled.h3`
  font-size: 1.1rem;
  @media screen and (max-width: 1100px) {
    font-size: 0.9rem;
  }
`
