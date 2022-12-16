import React from 'react'

import { usePlayContext, useUIContext } from '../contexts'
import {
  useBgioClientInfo,
  useBgioCtx,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
import { UndoRedoButtons } from './rop/UndoRedoButtons'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexed-meadow-ui/layout/Typography'
import { ConfirmOrResetButtons } from './ConfirmOrResetButtons'
import { uniq } from 'lodash'
import { GreenButton, RedButton } from 'hexed-meadow-ui/layout/buttons'
import { selectGameCardByID } from 'game/selectors'
import { playerIDDisplay } from 'game/transformers'
import { PlayerIdToUnitsMap } from 'game/types'
import { RopAttackControls } from './rop/RopAttackControls'
import { WaterCloneControls } from './rop/WaterCloneControls'

export const RoundOfPlayControls = () => {
  const { ctx } = useBgioCtx()
  const {
    isIdleStage,
    isMovementStage,
    isWaitingForDisengagementSwipeStage,
    isDisengagementSwipeStage,
    isAttackingStage,
    isWaterCloneStage,
  } = ctx
  const { showDisengageConfirm } = usePlayContext()
  if (showDisengageConfirm) {
    return <RopConfirmDisengageAttemptControls />
  }
  if (isIdleStage) {
    return (
      <>
        <RopIdleControls />
      </>
    )
  }
  if (isMovementStage) {
    return (
      <>
        <RopMoveControls />
      </>
    )
  }
  if (isAttackingStage) {
    return (
      <>
        <RopAttackControls />
      </>
    )
  }
  if (isWaitingForDisengagementSwipeStage) {
    return (
      <>
        <RopWaitingForDisengageControls />
      </>
    )
  }
  if (isDisengagementSwipeStage) {
    return (
      <>
        <RopDisengagementSwipeControls />
      </>
    )
  }
  if (isWaterCloneStage) {
    return (
      <>
        <WaterCloneControls />
      </>
    )
  }
  return <></>
}

export const RopIdleControls = () => {
  const { currentOrderMarker } = useBgioG()
  const { revealedGameCard } = usePlayContext()
  return (
    <>
      <StyledControlsHeaderH2>
        {`Opponent's #${currentOrderMarker + 1} is ${
          revealedGameCard?.name ?? '...'
        }`}
      </StyledControlsHeaderH2>
    </>
  )
}

export const RopMoveControls = () => {
  const { unitsMoved, currentOrderMarker } = useBgioG()
  const { moves } = useBgioMoves()
  const { revealedGameCard, revealedGameCardUnitIDs } = usePlayContext()
  const { setSelectedUnitID } = useUIContext()
  const movedUnitsCount = uniq(unitsMoved).length
  const allowedMoveCount = revealedGameCard?.figures ?? 0
  const unitsAliveCount = revealedGameCardUnitIDs.length
  const movesAvailable =
    Math.min(allowedMoveCount, unitsAliveCount) - movedUnitsCount
  const isAllMovesUsed = movesAvailable <= 0
  const { endCurrentMoveStage } = moves

  const handleEndMovementClick = () => {
    setSelectedUnitID('')
    endCurrentMoveStage()
  }
  return (
    <div>
      <StyledControlsHeaderH2>{`Your #${
        {
          0: '1',
          1: '2',
          2: '3',
        }[currentOrderMarker]
      }: ${revealedGameCard?.name ?? ''}`}</StyledControlsHeaderH2>
      <StyledControlsP>
        You have used {movedUnitsCount} / {allowedMoveCount} moves
      </StyledControlsP>
      {unitsAliveCount < allowedMoveCount && (
        <StyledControlsP>
          {`You only have ${unitsAliveCount} ${
            revealedGameCard?.name ?? ''
          } left`}
        </StyledControlsP>
      )}

      <UndoRedoButtons />
      {isAllMovesUsed ? (
        <ConfirmOrResetButtons
          confirm={handleEndMovementClick}
          confirmText={'End move, begin attack'}
          noResetButton
        />
      ) : (
        <ConfirmOrResetButtons
          reset={handleEndMovementClick}
          resetText={`End Move, skip ${movesAvailable} available move${
            movesAvailable > 1 ? 's' : ''
          }, begin attack`}
          noConfirmButton
        />
      )}
    </div>
  )
}

const RopConfirmDisengageAttemptControls = () => {
  const { confirmDisengageAttempt, cancelDisengageAttempt } = usePlayContext()
  return (
    <>
      <StyledControlsHeaderH2>
        Confirm you want to disengage:
      </StyledControlsHeaderH2>
      <ConfirmOrResetButtons
        confirm={confirmDisengageAttempt}
        confirmText={`Yes, disengage them!`}
        reset={cancelDisengageAttempt}
        resetText={`No, we will find another way...`}
      />
    </>
  )
}

const RopWaitingForDisengageControls = () => {
  const { disengagesAttempting, gameArmyCards, gameUnits } = useBgioG()
  const unit = disengagesAttempting?.unit
  const unitCard = selectGameCardByID(gameArmyCards, unit?.gameCardID ?? '')
  // const unitName = unitCard?.name ?? ''
  const unitSingleName = unitCard?.singleName ?? ''
  // const endHexID = disengagesAttempting?.endHexID ?? ''
  const defendersToDisengage = disengagesAttempting?.defendersToDisengage ?? []

  const swipingPlayerIdsToUnitsMap: PlayerIdToUnitsMap =
    defendersToDisengage.reduce((prev: PlayerIdToUnitsMap, curr) => {
      const unit = gameUnits[curr.unitID]
      return {
        ...prev,
        [curr.playerID]: [...(prev?.[curr?.playerID ?? ''] ?? []), unit],
      }
    }, {})
  const playersWithSwipingUnits: string[] = Object.keys(
    swipingPlayerIdsToUnitsMap
  )
  return (
    <>
      <StyledControlsHeaderH2>Attempting disengage</StyledControlsHeaderH2>
      <ul>
        {playersWithSwipingUnits.map((playerID) => {
          return (
            <li key={playerID}>
              {`Player ${playerID} gets to swipe your ${unitSingleName} as it attempts to disengage their ${
                swipingPlayerIdsToUnitsMap[playerID].length
              } unit${
                swipingPlayerIdsToUnitsMap[playerID].length !== 1 ? 's' : ''
              }`}
            </li>
          )
        })}
      </ul>
    </>
  )
}

const RopDisengagementSwipeControls = () => {
  const { disengagesAttempting, gameArmyCards, disengagedUnitIds } = useBgioG()
  const {
    moves: { takeDisengagementSwipe },
  } = useBgioMoves()
  const { playerID } = useBgioClientInfo()
  const defendersToDisengage = disengagesAttempting?.defendersToDisengage ?? []
  const unitAttempting = disengagesAttempting?.unit
  const unitAttemptingCard = selectGameCardByID(
    gameArmyCards,
    unitAttempting?.gameCardID ?? ''
  )
  if (!disengagesAttempting || !unitAttempting || !unitAttemptingCard) {
    ;<>
      <StyledControlsHeaderH2>
        Disengagement swipe loading...
      </StyledControlsHeaderH2>
    </>
  }
  const unitAttemptingPlayerID = unitAttempting?.playerID ?? ''
  const myFiguresThatGetASwipe = defendersToDisengage.filter(
    (u) => u.playerID === playerID
  )
  const transformedMyFiguresThatGetASwipe = myFiguresThatGetASwipe.map((u) => {
    const card = selectGameCardByID(gameArmyCards, u.gameCardID)
    return {
      ...u,
      singleName: card?.singleName ?? '',
    }
  })
  return (
    <>
      <StyledControlsHeaderH2>
        {`${playerIDDisplay(
          unitAttemptingPlayerID
        )} is attempting to disengage your units, so they can move away`}
      </StyledControlsHeaderH2>
      <StyledControlsP>
        {`Each of the units below may take a swipe at ${unitAttemptingCard?.singleName}
         to wound them as they disengage. For each unit below, either confirm or deny your attacks, until 
         they are all done or ${unitAttemptingCard?.singleName} is destroyed`}
      </StyledControlsP>
      <ul>
        {transformedMyFiguresThatGetASwipe
          .filter((u) => !disengagedUnitIds.includes(u.unitID))
          .map((unit) => {
            return (
              <li key={unit.unitID}>
                Unit: {unit.singleName}
                <GreenButton
                  onClick={() =>
                    takeDisengagementSwipe({
                      unitID: unit.unitID,
                      isTaking: true,
                    })
                  }
                >
                  Take swipe
                </GreenButton>
                <RedButton
                  onClick={() =>
                    takeDisengagementSwipe({
                      unitID: unit.unitID,
                      isTaking: false,
                    })
                  }
                >
                  Deny
                </RedButton>
              </li>
            )
          })}
      </ul>
    </>
  )
}
