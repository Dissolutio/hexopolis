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
import { thorgrimID } from 'game/setup/unitGen'
import { Army } from '../Armies'

export const PlaceArmorSpiritControls = () => {
  const { myAliveCards, gameArmyCards, killedArmyCards } = useBgioG()
  const {
    moves: { placeArmorSpirit },
  } = useBgioMoves()
  const { playerID } = useBgioClientInfo()
  const myAliveUniqueCards = myAliveCards?.filter((c) =>
    startsWith(c.type, 'unique')
  )
  const thorgrimsCard = [...gameArmyCards, ...killedArmyCards]?.find(
    (c) => c.armyCardID === thorgrimID
  )
  const [receiverGameCardID, setReceiverGameCardID] = useState<string>('')
  const receiverGameCard = gameArmyCards?.find(
    (gc) => gc.gameCardID === receiverGameCardID
  )
  const onClickCard = (clickedCardID: string) => {
    setReceiverGameCardID(clickedCardID)
  }
  const onClickConfirm = () => {
    placeArmorSpirit({ gameCardID: receiverGameCardID })
  }

  return (
    <>
      <StyledControlsHeaderH2>
        Place Finn's Attack Spirit
      </StyledControlsHeaderH2>
      <StyledControlsP
        style={{ color: 'var(--text-muted)', maxWidth: '800px' }}
      >{`${thorgrimsCard?.abilities?.[1].name}: ${thorgrimsCard?.abilities?.[1].desc}`}</StyledControlsP>
      <StyledControlsP style={{ maxWidth: '800px' }}>
        Your unique army cards are below, select one to give the Armor Spirit
        (+1 defense)
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
                {`Confirm: ${receiverGameCard.name} shall inherit the Armor Spirit`}
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
export const IdlePlaceArmorSpiritControls = () => {
  const { gameArmyCards } = useBgioG()
  const { activePlayers } = useBgioCtx()
  const thorgrimsCard = gameArmyCards?.find((c) => c.armyCardID === thorgrimID)
  const playerPlacingSpirit =
    Object.keys(activePlayers ?? {}).find(
      (k) => activePlayers?.[k] === stageNames.placingArmorSpirit
    ) ?? ''
  return (
    <>
      <StyledControlsHeaderH2>{`${playerIDDisplay(
        playerPlacingSpirit
      )} is choosing a target for Thorgrim's Armor Spirit`}</StyledControlsHeaderH2>
      <StyledControlsP
        style={{ color: 'var(--text-muted)', maxWidth: '800px' }}
      >{`${thorgrimsCard?.abilities?.[0].name}: ${thorgrimsCard?.abilities?.[0].desc}`}</StyledControlsP>
    </>
  )
}
