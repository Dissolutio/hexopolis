import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import styled from 'styled-components'

import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { useUIContext, usePlacementContext } from '../contexts'
import { PlacementCardUnitIcon } from '../unit-icons'
import { PlacementUnit } from 'game/types'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { selectedTileStyle } from 'hexopolis-ui/layout/styles'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from './ConfirmOrResetButtons'
import { RedButton } from 'hexopolis-ui/layout/buttons'
import { selectGameCardByID } from 'game/selectors'

export const PlacementControls = () => {
  const { playerID } = useBgioClientInfo()
  const { placementReady, myStartZone, gameUnits, gameArmyCards } = useBgioG()
  const {
    moves: { confirmPlacementReady, deployUnits, deconfirmPlacementReady },
  } = useBgioMoves()
  const { placementUnits, editingBoardHexes, activeTailPlacementUnitID } =
    usePlacementContext()

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
    (isAllPlacementUnitsPlaced || isNoMoreEmptyStartZoneHexes) &&
    !activeTailPlacementUnitID &&
    !isReady
  const tailUnit = gameUnits[activeTailPlacementUnitID]
  const tailUnitName = selectGameCardByID(
    gameArmyCards,
    tailUnit?.gameCardID
  )?.name
  // once player has placed and confirmed, show waiting
  if (isReady) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <StyledControlsHeaderH2>
            Waiting for opponents to finish placing armies...
          </StyledControlsHeaderH2>
          <StyledButtonWrapper>
            <RedButton onClick={() => deconfirmPlacementReady({ playerID })}>
              Wait, go back!
            </RedButton>
          </StyledButtonWrapper>
        </motion.div>
      </AnimatePresence>
    )
  }
  // if player has placed a unit that is a 2-spacer, then we show UI for tail-placement
  if (activeTailPlacementUnitID) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* <StyledControlsHeaderH2>Phase: Placement</StyledControlsHeaderH2> */}
          {/* Keeping the UI bare here so the user does not get trapped by the limited interaction available in tail-placement */}
          <StyledControlsHeaderH2>
            Place the tail of your {tailUnitName} unit.
          </StyledControlsHeaderH2>
          {/* <PlacementUnitTiles /> */}
        </motion.div>
      </AnimatePresence>
    )
  }
  // return UI
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <StyledControlsHeaderH2>Phase: Placement</StyledControlsHeaderH2>
        <StyledControlsP>
          Your units have been placed in your start zone. You can select your
          units and move them to empty hexes, or replace other units. Players
          cannot see each others' units at this time. Once all players are
          ready, the game will begin!
        </StyledControlsP>
        {isShowingConfirm && (
          <ConfirmReady
            makeReady={makeReady}
            isNoMoreEmptyStartZoneHexes={isNoMoreEmptyStartZoneHexes}
            isAllPlacementUnitsPlaced={isAllPlacementUnitsPlaced}
          />
        )}
        <PlacementUnitTiles />
      </motion.div>
    </AnimatePresence>
  )
}

// CONFIRM READY
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
    <StyledConfirmDiv>
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
      <ConfirmOrResetButtons
        confirm={makeReady}
        reset={onResetPlacementState}
      />
    </StyledConfirmDiv>
  )
}
const StyledConfirmDiv = styled.div`
  padding: 10px;
  p {
    margin: 5px 0;
  }
`
// PLACEMENT UNIT TILES
const PlacementUnitTiles = () => {
  const { inflatedPlacementUnits } = usePlacementContext()
  const isLength = inflatedPlacementUnits.length > 0
  // render null if list is empty
  if (!isLength) {
    return null
  }
  return (
    <div
      style={{
        border: '1px solid var(--sub-white)',
        margin: '10px 0 0 0',
        padding: '5px',
      }}
    >
      <StyledControlsH3>Unplaced Units</StyledControlsH3>
      <StyledUl>
        <AnimatePresence>
          {inflatedPlacementUnits &&
            inflatedPlacementUnits.map((unit) => (
              <motion.li
                key={unit.unitID}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PlacementUnitTile key={unit.unitID} unit={unit} />
              </motion.li>
            ))}
        </AnimatePresence>
      </StyledUl>
    </div>
  )
}
const StyledUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  flex-grow: 1;
  list-style-type: none;
  margin: 0;
  padding: 0;
  li {
    padding: 0.3rem;
  }
`

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
    <StyledPlacementTileDiv
      key={unit.unitID}
      style={selectedStyle(unit.unitID)}
      onClick={onClick}
    >
      <PlacementCardUnitIcon
        armyCardID={unit.armyCardID}
        playerID={unit.playerID}
      />
      <span>{unit.singleName}</span>
    </StyledPlacementTileDiv>
  )
}
const StyledPlacementTileDiv = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding: 5px;
  border: 1px solid var(--player-color);
  border-radius: 5px;
  max-width: 100px;
  @media screen and (max-width: 1100px) {
    max-width: 50px;
    svg {
      font-size: 25px !important;
    }
    span {
      font-size: 0.6rem;
      text-align: center;
    }
  }
`
const StyledControlsH3 = styled.h3`
  text-align: center;
  font-size: 1.1rem;
  margin: 0 0 3px 0;
  @media screen and (max-width: 1100px) {
    font-size: 0.9rem;
  }
`
