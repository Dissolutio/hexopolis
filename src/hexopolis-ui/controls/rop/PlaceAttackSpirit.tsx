import {
  useBgioCtx,
  useBgioEvents,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { selectHexForUnit, selectValidTailHexes } from 'game/selectors'
import { GameUnit, UnitsCloning } from 'game/types'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { UndoRedoButtons } from './UndoRedoButtons'
import { useMemo } from 'react'
import { playerIDDisplay } from 'game/transformers'
import { finnID } from 'game/setup/unitGen'
import { startsWith } from 'lodash'

export const PlaceAttackSpiritControls = () => {
  const { events } = useBgioEvents()
  const { myCards, gameArmyCards } = useBgioG()
  const myUniqueCards = myCards?.filter((c) => startsWith(c.type, 'unique'))
  console.log(
    '🚀 ~ file: PlaceAttackSpirit.tsx:27 ~ PlaceAttackSpiritControls ~ myUniqueCards',
    myUniqueCards
  )
  const finnsCard = gameArmyCards?.find((c) => c.armyCardID === finnID)
  /* RENDER
    0. You have placed the attack spirit, confirm
    1. Here are your unique cards, select one, then confirm
    */

  //    0. You have placed the attack spirit, confirm
  if (false) {
    return (
      <>
        <StyledControlsHeaderH2></StyledControlsHeaderH2>
        <StyledControlsP></StyledControlsP>
      </>
    )
  }
  // 1. Here are your unique cards, select one, then confirm
  return (
    <>
      <StyledControlsHeaderH2>
        Place Finn's Attack Spirit
      </StyledControlsHeaderH2>
      <StyledControlsP
        style={{ color: 'var(--text-muted)', maxWidth: '800px' }}
      >{`${finnsCard?.abilities?.[1].name}: ${finnsCard?.abilities?.[1].desc}`}</StyledControlsP>
      <StyledControlsP style={{ maxWidth: '800px' }}>
        Your unique army cards are below, select one to give the Attack Spirit
        (+1 attack)
      </StyledControlsP>
    </>
  )
}
export const IdlePlaceAttackSpiritControls = () => {
  const { gameArmyCards } = useBgioG()
  const { activePlayers } = useBgioCtx()
  const finnsCard = gameArmyCards?.find((c) => c.armyCardID === finnID)
  const playerPlacingSpirit =
    Object.keys(activePlayers ?? {}).find(
      (k) => activePlayers?.[k] === stageNames.placingAttackSpirit
    ) ?? ''
  return (
    <>
      <StyledControlsHeaderH2>{`${playerIDDisplay(
        playerPlacingSpirit
      )} is choosing a target for Finn's Attack Spirit`}</StyledControlsHeaderH2>
      <StyledControlsP
        style={{ color: 'var(--text-muted)', maxWidth: '800px' }}
      >{`${finnsCard?.abilities?.[1].name}: ${finnsCard?.abilities?.[1].desc}`}</StyledControlsP>
    </>
  )
}
