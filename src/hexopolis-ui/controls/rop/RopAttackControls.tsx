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
  selectIfGameArmyCardHasAbility,
} from 'game/selector/card-selectors'

export const RopAttackControls = () => {
  const { uniqUnitsMoved, unitsAttacked, currentOrderMarker } = useBgioG()
  const { events } = useBgioEvents()
  const { revealedGameCard, unitsWithTargets, freeAttacksAvailable } =
    usePlayContext()
  const revealedGameCardName = revealedGameCard?.name ?? ''
  const hasWaterClone = (revealedGameCard?.abilities ?? []).some(
    (ability) => ability.name === 'Water Clone'
  )
  const getHasSpecialAttack = () => {
    return {
      hasFireLine: revealedGameCard
        ? selectIfGameArmyCardHasAbility(
            'Fire Line Special Attack',
            revealedGameCard
          )
        : false,
      hasExplosion: revealedGameCard
        ? selectIfGameArmyCardHasAbility(
            'Explosion Special Attack',
            revealedGameCard
          )
        : false,
      hasGrenade:
        revealedGameCard && !revealedGameCard.hasThrownGrenade
          ? selectIfGameArmyCardHasAbility(
              'Grenade Special Attack',
              revealedGameCard
            )
          : false,
    }
  }
  const { hasFireLine, hasExplosion, hasGrenade } = getHasSpecialAttack()
  // Early return if no card is revealed, this should not happen!
  if (!revealedGameCard) {
    return null
  }
  const { totalNumberOfAttacksAllowed } =
    selectGameArmyCardAttacksAllowed(revealedGameCard)

  const attacksUsed = Object.values(unitsAttacked).flat().length
  const handleEndTurnButtonClick = () => {
    events?.endTurn?.()
  }
  const attacksLeft = totalNumberOfAttacksAllowed - attacksUsed
  const isAllAttacksUsed = attacksLeft <= 0
  const isNoAttacksUsed = attacksUsed <= 0
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
        {`${freeAttacksAvailable} attack${
          freeAttacksAvailable !== 1 ? 's' : ''
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

      {isAllAttacksUsed ? (
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
