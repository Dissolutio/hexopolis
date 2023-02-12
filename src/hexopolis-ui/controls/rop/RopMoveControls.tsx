import React from 'react'

import { usePlayContext } from '../../contexts'
import { useBgioEvents, useBgioG } from 'bgio-contexts'
import { UndoRedoButtons } from './UndoRedoButtons'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from '../ConfirmOrResetButtons'
import { uniq } from 'lodash'
import {
  FlyingUnitTextAndToggle,
  GrappleGunTextAndToggle,
} from './FlyingUnitTextAndToggle'
import { stageNames } from 'game/constants'
import { GreenButton } from 'hexopolis-ui/layout/buttons'
import {
  selectIfGameArmyCardHasAbility,
  selectIfGameArmyCardHasFlying,
} from 'game/selector/card-selectors'
import { AbilityReadout } from './FireLineSAControls'
import { AnimatePresence, motion } from 'framer-motion'
import { omToString } from 'game/transformers'

export const RopAttackMoveHeader = ({
  currentOrderMarker,
  revealedGameCardName,
}: {
  currentOrderMarker: number
  revealedGameCardName: string
}) => {
  const currentOrderText = omToString(currentOrderMarker.toString())
  return (
    <StyledControlsHeaderH2>{`Your #${currentOrderText}: ${revealedGameCardName}`}</StyledControlsHeaderH2>
  )
}

export const RopMoveControls = () => {
  const { unitsMoved, currentOrderMarker } = useBgioG()
  const { events } = useBgioEvents()
  const {
    selectedUnit,
    revealedGameCard,
    revealedGameCardUnitIDs,
    isGrappleGun,
  } = usePlayContext()
  const movedUnitsCount = uniq(unitsMoved).length
  const allowedMoveCount = revealedGameCard?.figures ?? 0
  const unitsAliveCount = revealedGameCardUnitIDs.length
  const { hasFlying, hasStealth } =
    selectIfGameArmyCardHasFlying(revealedGameCard)
  const hasChomp = selectIfGameArmyCardHasAbility('Chomp', revealedGameCard)
  const revealedGameCardName = revealedGameCard?.name ?? ''

  const movesAvailable =
    Math.min(allowedMoveCount, unitsAliveCount) - movedUnitsCount
  const isAllMovesUsed = movesAvailable <= 0
  const handleEndMovementClick = () => {
    // setSelectedUnitID('')
    events?.setStage?.(stageNames.attacking)
  }
  return (
    <div>
      <RopAttackMoveHeader
        currentOrderMarker={currentOrderMarker}
        revealedGameCardName={revealedGameCardName}
      />

      {unitsAliveCount === 0 ? (
        <StyledControlsP>
          All of your {revealedGameCardName} units have been destroyed.
        </StyledControlsP>
      ) : (
        <>
          <StyledControlsP style={{ color: 'var(--text-muted)' }}>
            {`${unitsAliveCount} unit${unitsAliveCount !== 1 ? 's' : ''}`}
          </StyledControlsP>
          <FlyingUnitTextAndToggle
            hasFlying={hasFlying}
            hasStealth={hasStealth}
            revealedGameCardName={revealedGameCardName}
          />
          <GrappleGunTextAndToggle revealedGameCard={revealedGameCard} />
          <AnimatePresence>
            {isGrappleGun && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AbilityReadout cardAbility={revealedGameCard?.abilities[1]} />
              </motion.div>
            )}
          </AnimatePresence>
          <StyledControlsP>
            Selected unit move points remaining:{' '}
            {/* grapple gun is just 0 or 1, but otherwise show the normal move point */}
            {isGrappleGun
              ? movedUnitsCount > 0
                ? '0'
                : '1'
              : selectedUnit?.movePoints ?? '-'}
          </StyledControlsP>
          <StyledControlsP>
            {movedUnitsCount} / {allowedMoveCount} units moved
          </StyledControlsP>

          <UndoRedoButtons />
          {hasChomp && (
            <StyledButtonWrapper>
              <GreenButton
                onClick={() => {
                  events?.setStage?.(stageNames.chomp)
                }}
              >
                Use Chomp
              </GreenButton>
            </StyledButtonWrapper>
          )}
        </>
      )}
      {unitsAliveCount === 0 ? (
        <StyledButtonWrapper>
          <GreenButton onClick={() => events?.endTurn?.()}>
            End Turn
          </GreenButton>
        </StyledButtonWrapper>
      ) : isAllMovesUsed ? (
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
