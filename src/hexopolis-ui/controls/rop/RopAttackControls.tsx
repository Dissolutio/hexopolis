import React from 'react'

import { usePlayContext } from '../../contexts'
import { useBgioEvents, useBgioG } from 'bgio-contexts'
import { StyledControlsP } from 'hexopolis-ui/layout/Typography'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from '../ConfirmOrResetButtons'
import { GreenButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { RopAttackMoveHeader } from './RopMoveControls'
import {
  selectGameArmyCardAttacksAllowed,
  selectHasSpecialAttack,
  selectIfGameArmyCardHasAbility,
} from 'game/selector/card-selectors'

export const RopAttackControls = () => {
  const { uniqUnitsMoved, unitsAttacked, currentOrderMarker } = useBgioG()
  const { events } = useBgioEvents()
  const {
    revealedGameCard,
    unitsWithTargets,
    countOfUnmovedFiguresThatCanAttack,
    attacksLeft,
  } = usePlayContext()
  const revealedGameCardName = revealedGameCard?.name ?? ''
  const { totalNumberOfAttacksAllowed } =
    selectGameArmyCardAttacksAllowed(revealedGameCard)
  const attacksUsed = Object.values(unitsAttacked).flat().length // TODO: attacksUsed will get weird because something like explosion attack might hit 8 people but only count as 1 attack
  const isAllAttacksUsed = attacksLeft <= 0
  const isNoAttacksUsed = attacksUsed <= 0

  const hasWaterClone = selectIfGameArmyCardHasAbility(
    'Water Clone',
    revealedGameCard
  )
  const hasChomp = selectIfGameArmyCardHasAbility('Chomp', revealedGameCard)
  const hasMindShackle = selectIfGameArmyCardHasAbility(
    'Mind Shackle 20',
    revealedGameCard
  )
  const { hasFireLine, hasExplosion, hasGrenade } =
    selectHasSpecialAttack(revealedGameCard)
  const hasBerserkerCharge = selectIfGameArmyCardHasAbility(
    'Berserker Charge',
    revealedGameCard
  )

  // Early return if no card is revealed, this should not happen!
  if (!revealedGameCard) {
    return null
  }

  const handleEndTurnButtonClick = () => {
    events?.endTurn?.()
  }
  const onClickUseWaterClone = () => {
    events?.setStage?.(stageNames.waterClone)
  }
  const goBackToMoveStage = () => {
    events?.setStage?.(stageNames.movement)
  }
  return (
    <>
      <RopAttackMoveHeader
        currentOrderMarker={currentOrderMarker}
        revealedGameCardName={revealedGameCardName}
      />

      <StyledControlsP>
        Units with targets in range: {unitsWithTargets}
      </StyledControlsP>

      <StyledControlsP>
        {attacksUsed} / {totalNumberOfAttacksAllowed} attacks used
      </StyledControlsP>

      <StyledControlsP>
        {`${uniqUnitsMoved.length} unit${
          uniqUnitsMoved.length !== 1 ? 's' : ''
        } moved`}
      </StyledControlsP>
      <StyledControlsP>
        {`${countOfUnmovedFiguresThatCanAttack} attack${
          countOfUnmovedFiguresThatCanAttack !== 1 ? 's' : ''
        } available for unmoved units`}
      </StyledControlsP>

      {isNoAttacksUsed && (
        <StyledButtonWrapper>
          <GreenButton onClick={goBackToMoveStage}>
            Go back to movement stage
          </GreenButton>
        </StyledButtonWrapper>
      )}

      {isNoAttacksUsed && hasWaterClone && (
        <StyledButtonWrapper>
          <GreenButton onClick={onClickUseWaterClone}>
            Use Water Clone
          </GreenButton>
        </StyledButtonWrapper>
      )}
      {isNoAttacksUsed && hasFireLine && (
        <StyledButtonWrapper>
          <GreenButton
            onClick={() => {
              events?.setStage?.(stageNames.fireLineSA)
            }}
          >
            Use Fire Line Special Attack
          </GreenButton>
        </StyledButtonWrapper>
      )}
      {isNoAttacksUsed && hasExplosion && (
        <StyledButtonWrapper>
          <GreenButton
            onClick={() => {
              events?.setStage?.(stageNames.explosionSA)
            }}
          >
            Use Explosion Special Attack
          </GreenButton>
        </StyledButtonWrapper>
      )}
      {isNoAttacksUsed && hasGrenade && (
        <StyledButtonWrapper>
          <GreenButton
            onClick={() => {
              events?.setStage?.(stageNames.grenadeSA)
            }}
          >
            Use Grenade Special Attack
          </GreenButton>
        </StyledButtonWrapper>
      )}
      {isNoAttacksUsed && hasBerserkerCharge && (
        <StyledButtonWrapper>
          <GreenButton
            onClick={() => {
              events?.setStage?.(stageNames.berserkerCharge)
            }}
          >
            Use Berserker Charge
          </GreenButton>
        </StyledButtonWrapper>
      )}
      {isNoAttacksUsed && hasChomp && (
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
      {isNoAttacksUsed && hasMindShackle && (
        <StyledButtonWrapper>
          <GreenButton
            onClick={() => {
              events?.setStage?.(stageNames.mindShackle)
            }}
          >
            Use Mind Shackle
          </GreenButton>
        </StyledButtonWrapper>
      )}

      {isAllAttacksUsed ? (
        <ConfirmOrResetButtons
          confirm={handleEndTurnButtonClick}
          confirmText={'All attacks used, end turn'}
          noResetButton
        />
      ) : isAllAttacksUsed ? (
        <ConfirmOrResetButtons
          confirm={handleEndTurnButtonClick}
          confirmText={'All attacks used, end turn'}
          noResetButton
        />
      ) : (
        <ConfirmOrResetButtons
          reset={handleEndTurnButtonClick}
          resetText={`End Turn, skip my ${attacksLeft} attack${
            attacksLeft !== 1 ? 's' : ''
          }`}
          noConfirmButton
        />
      )}
    </>
  )
}
