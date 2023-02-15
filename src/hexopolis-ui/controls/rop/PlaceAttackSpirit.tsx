import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { startsWith } from 'lodash'
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
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { playerIDDisplay } from 'game/transformers'
import { Army } from '../Armies'
import { finnID } from 'game/setup/unit-gen'

export const PlaceAttackSpiritControls = () => {
  const { myAliveCards, gameArmyCards, killedArmyCards } = useBgioG()
  const {
    moves: { placeAttackSpirit },
  } = useBgioMoves()
  const { playerID } = useBgioClientInfo()
  const myAliveUniqueCards = myAliveCards?.filter((c) =>
    startsWith(c.type, 'unique')
  )
  const finnsCard = [...gameArmyCards, ...killedArmyCards]?.find(
    (c) => c.armyCardID === finnID
  )
  const [receiverGameCardID, setReceiverGameCardID] = useState<string>('')
  const receiverGameCard = gameArmyCards?.find(
    (gc) => gc.gameCardID === receiverGameCardID
  )
  const onClickCard = (clickedCardID: string) => {
    setReceiverGameCardID(clickedCardID)
  }
  const onClickConfirm = () => {
    placeAttackSpirit({ gameCardID: receiverGameCardID })
  }

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
      <AnimatePresence initial={false}>
        {receiverGameCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StyledButtonWrapper>
              <GreenButton onClick={onClickConfirm}>
                {`Confirm: ${receiverGameCard.name} shall inherit the Attack Spirit`}
              </GreenButton>
            </StyledButtonWrapper>
          </motion.div>
        )}
      </AnimatePresence>
      <Army
        playerID={playerID}
        cards={myAliveUniqueCards}
        onClickCard={onClickCard}
        selectedID={receiverGameCardID}
      />
    </>
  )
}
export const IdlePlaceAttackSpiritControls = () => {
  const { gameArmyCards, killedArmyCards } = useBgioG()
  const { activePlayers } = useBgioCtx()
  const finnsCard = [...gameArmyCards, ...killedArmyCards]?.find(
    (c) => c.armyCardID === finnID
  )
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
