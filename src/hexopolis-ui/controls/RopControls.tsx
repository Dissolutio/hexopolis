import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { usePlayContext } from '../contexts'
import {
  useBgioClientInfo,
  useBgioCtx,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from './ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { selectGameCardByID } from 'game/selectors'
import { playerIDDisplay } from 'game/transformers'
import { RopAttackControls } from './rop/RopAttackControls'
import { WaterCloneControls } from './rop/WaterCloneControls'
import { RopMoveControls } from './rop/RopMoveControls'
import {
  IdlePlaceAttackSpiritControls,
  PlaceAttackSpiritControls,
} from './rop/PlaceAttackSpirit'
import {
  IdlePlaceArmorSpiritControls,
  PlaceArmorSpiritControls,
} from './rop/PlaceArmorSpirit'
import { FireLineControls } from './rop/FireLineSAControls'
import { ExplosionSAControls } from './rop/ExplosionSAControls'
import { GameUnit } from 'game/types'
import { GrenadeSAControls } from './rop/GrenadeSAControls'
import { ChompControls } from './rop/ChompControls'
import { BerserkerChargeControls } from './rop/BerserkerChargeControls'
import { MindShackleControls } from './rop/MindShackleControls'

type PlayerIdToUnitsMap = { [playerID: string]: GameUnit[] }

export const RopControls = () => {
  const {
    isIdleStage,
    isMovementStage,
    isWaitingForDisengagementSwipeStage,
    isDisengagementSwipeStage,
    isAttackingStage,
    isWaterCloneStage,
    isPlacingAttackSpiritStage,
    isIdlePlacingAttackSpiritStage,
    isPlacingArmorSpiritStage,
    isIdlePlacingArmorSpiritStage,
    isChompStage,
    isBerserkerStage,
    isMindShackleStage,
    isFireLineSAStage,
    isExplosionSAStage,
    isGrenadeSAStage,
  } = useBgioCtx()
  const { showDisengageConfirm, fallHexID } = usePlayContext()
  if (showDisengageConfirm) {
    // also shows fall damage info aside the disengagement info
    return <RopConfirmDisengageAttemptControls />
  } else if (fallHexID) {
    return <RopConfirmFallDamageControls />
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
  if (isPlacingAttackSpiritStage) {
    return (
      <>
        <PlaceAttackSpiritControls />
      </>
    )
  }
  if (isIdlePlacingAttackSpiritStage) {
    return (
      <>
        <IdlePlaceAttackSpiritControls />
      </>
    )
  }
  if (isPlacingArmorSpiritStage) {
    return (
      <>
        <PlaceArmorSpiritControls />
      </>
    )
  }
  if (isIdlePlacingArmorSpiritStage) {
    return (
      <>
        <IdlePlaceArmorSpiritControls />
      </>
    )
  }
  if (isChompStage) {
    return (
      <>
        <ChompControls />
      </>
    )
  }
  if (isBerserkerStage) {
    return (
      <>
        <BerserkerChargeControls />
      </>
    )
  }
  if (isMindShackleStage) {
    return (
      <>
        <MindShackleControls />
      </>
    )
  }
  if (isFireLineSAStage) {
    return (
      <>
        <FireLineControls />
      </>
    )
  }
  if (isExplosionSAStage) {
    return (
      <>
        <ExplosionSAControls />
      </>
    )
  }
  if (isGrenadeSAStage) {
    return (
      <>
        <GrenadeSAControls />
      </>
    )
  }
  return <></>
}

const RopIdleControls = () => {
  const { currentOrderMarker } = useBgioG()
  const { currentPlayer } = useBgioCtx()
  const { revealedGameCard } = usePlayContext()
  return (
    <>
      <StyledControlsHeaderH2 style={{ color: 'var(--muted-text)' }}>
        {`${playerIDDisplay(currentPlayer)} order #${currentOrderMarker + 1}: ${
          revealedGameCard?.name ?? '...'
        }`}
      </StyledControlsHeaderH2>
    </>
  )
}

const RopConfirmDisengageAttemptControls = () => {
  const {
    disengageAttempt,
    cancelDisengageAttempt,
    confirmDisengageAttempt,
    selectedUnitMoveRange,
  } = usePlayContext()
  const { gameArmyCards } = useBgioG()
  if (!disengageAttempt) return null
  const { unit, defendersToDisengage } = disengageAttempt
  const fallDamage =
    selectedUnitMoveRange?.[disengageAttempt.endHexID]?.fallDamage ?? 0
  const myUnitCard = selectGameCardByID(gameArmyCards, unit?.gameCardID ?? '')
  const myUnitName = myUnitCard?.name ?? ''
  const unitsThatGetASwipe = defendersToDisengage.map((u) => {
    const card = selectGameCardByID(gameArmyCards, u.gameCardID)
    return {
      ...u,
      singleName: card?.singleName ?? '',
    }
  })
  return (
    <>
      <StyledControlsHeaderH2>
        {`Confirm you want ${myUnitName} to disengage ${
          unitsThatGetASwipe.length
        } units? (${unitsThatGetASwipe.map((u) => u.singleName).join(', ')})`}
        {fallDamage > 0 && ` and risk ${fallDamage} wounds from fall damage?`}
      </StyledControlsHeaderH2>
      <ConfirmOrResetButtons
        confirm={cancelDisengageAttempt}
        confirmText={`No, we will find another way...`}
        reset={confirmDisengageAttempt}
        resetText={`Yes, disengage them! ${
          fallDamage > 0 && `And risk ${fallDamage} wounds from fall damage!`
        }`}
      />
    </>
  )
}

const RopConfirmFallDamageControls = () => {
  const {
    confirmFallDamageMove,
    cancelFallDamageMove,
    fallHexID,
    selectedUnitMoveRange,
  } = usePlayContext()
  const fallDamage = selectedUnitMoveRange?.[fallHexID]?.fallDamage ?? 0
  // const myUnitName = myUnitCard?.name ?? ''
  return (
    <>
      <StyledControlsHeaderH2>
        {`Confirm you want to risk ${fallDamage} wounds from fall damage?`}
      </StyledControlsHeaderH2>
      <ConfirmOrResetButtons
        confirm={cancelFallDamageMove}
        confirmText={`No, we will find another way...`}
        reset={confirmFallDamageMove}
        resetText={`It's not that high! (Confirm risk of ${fallDamage} wounds)`}
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
      {playersWithSwipingUnits.map((playerID) => {
        return (
          <StyledControlsP key={playerID}>
            {`${playerIDDisplay(
              playerID
            )} gets to swipe your ${unitSingleName} as it attempts to disengage their ${
              swipingPlayerIdsToUnitsMap[playerID].length
            } unit${
              swipingPlayerIdsToUnitsMap[playerID].length !== 1 ? 's' : ''
            }`}
          </StyledControlsP>
        )
      })}
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
      <AnimatePresence>
        {transformedMyFiguresThatGetASwipe
          .filter((u) => !disengagedUnitIds.includes(u.unitID))
          .map((unit) => {
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={unit.unitID}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0.5rem',
                }}
              >
                <h5>Unit: {unit.singleName}</h5>
                <GreenButton
                  onClick={() =>
                    takeDisengagementSwipe({
                      unitID: unit.unitID,
                      isTaking: true,
                    })
                  }
                >
                  Swipe them!
                </GreenButton>
                <RedButton
                  onClick={() =>
                    takeDisengagementSwipe({
                      unitID: unit.unitID,
                      isTaking: false,
                    })
                  }
                >
                  Let them go...
                </RedButton>
              </motion.div>
            )
          })}
      </AnimatePresence>
    </>
  )
}
