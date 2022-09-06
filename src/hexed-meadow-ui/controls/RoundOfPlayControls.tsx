import React from 'react'
import styled from 'styled-components'
import {
  HiOutlineArrowCircleLeft,
  HiOutlineArrowCircleRight,
} from 'react-icons/hi'

import { useMoves, useG, usePlayContext } from '../contexts'
import { RopArmyCardsList } from './RopArmyCardsList'

export const RopIdleControls = () => {
  const { currentOrderMarker } = useG()
  const { revealedGameCard } = usePlayContext()
  return (
    <>
      <h2>
        {`Opponent's #${currentOrderMarker + 1} is ${
          revealedGameCard?.name ?? '...'
        }`}
      </h2>
    </>
  )
}

export const RopMoveControls = () => {
  const { unitsMoved, currentOrderMarker } = useG()
  const { moves, undo, redo } = useMoves()
  const { revealedGameCard } = usePlayContext()

  const { endCurrentMoveStage } = moves

  // handlers
  const handleEndMovementClick = () => {
    endCurrentMoveStage()
  }
  return (
    <>
      <h2>{`Your #${currentOrderMarker + 1}: ${
        revealedGameCard?.name ?? ''
      }`}</h2>
      <p>
        You have moved {unitsMoved.length} / {revealedGameCard?.figures ?? 0}{' '}
        units{' '}
      </p>
      <ButtonWrapper>
        <button onClick={handleEndMovementClick}>END MOVE</button>
        <span>
          <button onClick={undo}>
            <HiOutlineArrowCircleLeft />
            <span>UNDO</span>
          </button>
          <button onClick={redo}>
            <HiOutlineArrowCircleRight />
            REDO
          </button>
        </span>
      </ButtonWrapper>
      <RopArmyCardsList />
    </>
  )
}

export const RopAttackControls = () => {
  const { unitsAttacked, currentOrderMarker } = useG()
  const { moves } = useMoves()
  const { endCurrentPlayerTurn } = moves

  const { revealedGameCard } = usePlayContext()

  const handleEndTurnButtonClick = () => {
    endCurrentPlayerTurn()
  }
  return (
    <>
      <h2>{`Your #${currentOrderMarker + 1}: ${
        revealedGameCard?.name ?? ''
      }`}</h2>
      <p>
        You have used {unitsAttacked.length} / {revealedGameCard?.figures ?? 0}{' '}
        attacks{' '}
      </p>
      <ButtonWrapper>
        <button onClick={handleEndTurnButtonClick}>END TURN</button>
      </ButtonWrapper>
      <RopArmyCardsList />
    </>
  )
}

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 26px;
`
