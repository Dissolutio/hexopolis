import styled from 'styled-components'
import toast, { useToaster } from 'react-hot-toast/headless'
import { useBgioG } from 'bgio-contexts'
import { useEffect } from 'react'
import { useUIContext } from 'hexopolis-ui/contexts'
import {
  decodeGameLogMessage,
  GameLogMessageDecoded,
  gameLogTypes,
} from 'game/gamelog'
import { uniqBy } from 'lodash'
import { playerColors } from 'hexopolis-ui/theme'
import { playerIDDisplay } from 'game/transformers'

export const Notifications = () => {
  const { toasts, handlers } = useToaster()
  const toastsInReverse = [...toasts].reverse()
  const { gameLog } = useBgioG()
  const { startPause, endPause } = handlers
  const { indexOfLastShownToast, setIndexOfLastShownToast } = useUIContext()
  const gameLogMessages = gameLog.map((gameLogString) =>
    decodeGameLogMessage(gameLogString)
  )
  // Effect: update toasts with all the latest game log entries
  useEffect(() => {
    if (gameLog.length > indexOfLastShownToast) {
      for (let i = indexOfLastShownToast; i < gameLog.length; i++) {
        const gameLogString = gameLog[i]
        const gameLogMessage = decodeGameLogMessage(gameLogString)
        if (!gameLogMessage) {
          continue
        }
        const {
          type,
          id,
          // for noUnitsOnTurn
          playerID,
          currentOrderMarker,
          isNoCard,
          // attack logs below
          unitID,
          unitName,
          targetHexID,
          defenderUnitName,
          defenderSingleName,
          defenderPlayerID,
          attackRolled,
          defenseRolled,
          skulls,
          shields,
          wounds,
          isFatal,
          isFatalCounterStrike,
          isStealthDodge,
          counterStrikeWounds,
          // roundBegin
          initiativeRolls,
          // move logs
          unitSingleName,
          isGrappleGun,
          fallDamage,
          startHexID,
          endHexID,
          unitIdsToAttemptToDisengage,
          // berserker charge: most generic roll format
          roll,
          isRollSuccessful,
          rollThreshold,
          // water clone
          rollsAndThreshholds,
          cloneCount,
          // chomp
          isChompSuccessful,
          unitChompedName,
          unitChompedSingleName,
          isChompedUnitSquad,
          // placeAttackSpirit
          initialValue,
          newValue,
          msg,
        } = gameLogMessage
        const defaultDuration = 20000
        const moreRepetitiveMsgDuration = 5000
        switch (type) {
          case gameLogTypes.disengageSwipeFatal:
            toast(<GameLogDisplay gameLogMessage={gameLogMessage} />, {
              duration: defaultDuration,
              id: gameLogMessage?.id,
            })
            break
          case gameLogTypes.move:
            const diedFallingMsg = `${unitSingleName} was destroyed from falling damage! (${wounds} / ${fallDamage} possible wounds)`
            const fallButNoDamageMove = `${unitSingleName} jumped down a great distance! (${wounds} / ${fallDamage} possible wounds)`
            const woundedFallMove = `${unitSingleName} took falling damage while moving! (${wounds} wounds)`
            const grappleGunMoveMsg = `${unitSingleName} has moved with Grapple Gun`
            const moveMsgText = `${unitSingleName} is on the move`
            const moveMsg = isFatal
              ? diedFallingMsg
              : (wounds ?? 0) > 0
              ? woundedFallMove
              : (fallDamage ?? 0) > 0 && wounds === 0
              ? fallButNoDamageMove
              : isGrappleGun
              ? grappleGunMoveMsg
              : moveMsgText
            const duration =
              isFatal || (wounds ?? 0) > 0
                ? defaultDuration
                : moreRepetitiveMsgDuration
            toast(
              <span style={{ color: playerColors[playerID] }}>{moveMsg}</span>,
              {
                duration: duration,
                id: gameLogMessage?.id,
              }
            )
            break
          case gameLogTypes.theDropRoll:
            const theDropRollMsg = isRollSuccessful ? (
              <span style={{ color: playerColors[playerID] }}>
                {playerIDDisplay(playerID)} rolled for The Drop and succeeded! (
                {roll} / {rollThreshold}){' '}
              </span>
            ) : (
              <span style={{ color: playerColors[playerID] }}>
                {playerIDDisplay(playerID)} failed their roll for The Drop (
                {roll} / {rollThreshold}){' '}
              </span>
            )
            toast(theDropRollMsg, {
              duration: defaultDuration,
              id: gameLogMessage?.id,
            })
            break
          case gameLogTypes.mindShackle:
            const msgMindShackle = isRollSuccessful ? (
              <span style={{ color: playerColors[playerID] }}>
                {unitName} has Mind Shackled{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {defenderUnitName}
                </span>
                ! (rolled a {roll})
              </span>
            ) : (
              <span style={{ color: playerColors[playerID] }}>
                {unitName} attempted to Mind Shackle{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {defenderUnitName}
                </span>{' '}
                but only rolled a {roll} / {rollThreshold}
              </span>
            )
            toast(msgMindShackle, {
              duration: defaultDuration,
              id: gameLogMessage?.id,
            })
            break
          case gameLogTypes.chomp:
            const chompMsg = isChompSuccessful ? (
              <span style={{ color: playerColors[playerID] }}>
                Grimnak Chomped{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {isChompedUnitSquad ? unitChompedSingleName : unitChompedName}
                </span>
                ! {isChompedUnitSquad ? '' : `(rolled a ${roll})`}
              </span>
            ) : (
              <span style={{ color: playerColors[playerID] }}>
                Grimnak attempted to Chomp{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {unitChompedName}
                </span>{' '}
                but only rolled a {roll} / {rollThreshold}
              </span>
            )
            toast(chompMsg, {
              duration: defaultDuration,
              id: gameLogMessage?.id,
            })
            break
          case gameLogTypes.attack:
            const isCounterStrike = (counterStrikeWounds ?? 0) > 0
            const counterStrikeMsg = isFatalCounterStrike ? (
              <span style={{ color: playerColors[playerID] }}>
                {unitName} attacked{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {defenderUnitName}
                </span>{' '}
                ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled}{' '}
                shields) and was defeated by counter strike!
              </span>
            ) : (
              <span style={{ color: playerColors[playerID] }}>
                {unitName} attacked{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {defenderUnitName}
                </span>{' '}
                ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled}{' '}
                shields) and was hit by counter strike for {counterStrikeWounds}{' '}
                wounds!
              </span>
            )
            const stealthDodgeMsgText = (
              <span style={{ color: playerColors[playerID] }}>
                {unitName} attacked{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {defenderUnitName}
                </span>{' '}
                ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled}{' '}
                shields), but the attack was evaded with Stealth Dodge!
              </span>
            )

            const attackMsgText = isFatal ? (
              <span style={{ color: playerColors[playerID] }}>
                {unitName} destroyed{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {defenderUnitName}
                </span>{' '}
                with a {wounds}-wound attack ({skulls}/{attackRolled} skulls,{' '}
                {shields}/{defenseRolled} shields)
              </span>
            ) : (
              <span style={{ color: playerColors[playerID] }}>
                {unitName} attacked{' '}
                <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
                  {defenderUnitName}
                </span>{' '}
                for {wounds} wounds ({skulls}/{attackRolled} skulls, {shields}/
                {defenseRolled} shields)
              </span>
            )
            const attackToast = isCounterStrike
              ? counterStrikeMsg
              : isStealthDodge
              ? stealthDodgeMsgText
              : attackMsgText
            toast(attackToast, {
              duration: defaultDuration,
              id: gameLogMessage?.id,
            })
            break
          default:
            toast(
              <span
                style={{ color: playerColors[playerID] }}
              >{`${gameLogMessage.msg}`}</span>,
              {
                duration: defaultDuration,
                id: gameLogMessage?.id,
              }
            )
        }
      }
    }
    setIndexOfLastShownToast(gameLog.length)
  }, [gameLog, indexOfLastShownToast, setIndexOfLastShownToast, toasts.length])

  // UNCOMMENT THIS FOR DEBUGGING: This will show all the game log messages from G
  return (
    <StyledDiv onMouseEnter={startPause} onMouseLeave={endPause}>
      {gameLogMessages.map((gameLogObj) => {
        if (!gameLogObj) return null
        return (
          <div key={gameLogObj.id}>
            <GameLogDisplay gameLogMessage={gameLogObj} />
          </div>
        )
      })}
    </StyledDiv>
  )

  // This will show disappearing toasts
  // return (
  //   <StyledDiv onMouseEnter={startPause} onMouseLeave={endPause}>
  //     {uniqBy(toastsInReverse, (t) => t.id).map((toast) => {
  //       return (
  //         <div
  //           key={toast.id}
  //           style={{
  //             transition: 'all 0.5s ease-out',
  //             opacity: toast.visible ? 1 : 0,
  //           }}
  //         >
  //           {toast.message as string}
  //         </div>
  //       )
  //     })}
  //   </StyledDiv>
  // )
}

const GameLogDisplay = ({
  gameLogMessage,
}: {
  gameLogMessage: GameLogMessageDecoded
}) => {
  const {
    type,
    // for noUnitsOnTurn
    playerID,
    // attack logs below
    unitName,
    defenderUnitName,
    defenderSingleName,
    defenderPlayerID,
    attackRolled,
    defenseRolled,
    skulls,
    shields,
    wounds,
    isFatal,
    isFatalCounterStrike,
    isStealthDodge,
    counterStrikeWounds,
    // roundBegin
    // move logs
    unitSingleName,
    isGrappleGun,
    fallDamage,
    // berserker charge: most generic roll format
    roll,
    isRollSuccessful,
    rollThreshold,
    // chomp
    isChompSuccessful,
    unitChompedName,
    unitChompedSingleName,
    isChompedUnitSquad,
    msg,
  } = gameLogMessage
  switch (type) {
    case gameLogTypes.disengageSwipeFatal:
      const disengageSwipeFatalMsgText = `${defenderSingleName} was defeated while disengaging from `
      return (
        <>
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {disengageSwipeFatalMsgText}
            <span style={{ color: playerColors[playerID] }}>
              {unitSingleName}
            </span>
            !
          </span>
        </>
      )
    case gameLogTypes.disengageSwipeNonFatal:
      const disengageSwipeNonFatalMsgText = `${unitSingleName} took a swipe at `
      return (
        <>
          <span style={{ color: playerColors[playerID] }}>
            {disengageSwipeNonFatalMsgText}
            <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
              {defenderSingleName}
            </span>
            {`! (${wounds} wounds)`}
          </span>
        </>
      )
    case gameLogTypes.move:
      const diedFallingMsg = `${unitSingleName} was destroyed from falling damage! (${wounds} / ${fallDamage} possible wounds)`
      const fallButNoDamageMove = `${unitSingleName} jumped down a great distance! (${wounds} / ${fallDamage} possible wounds)`
      const woundedFallMove = `${unitSingleName} took falling damage while moving! (${wounds} wounds)`
      const grappleGunMoveMsg = `${unitSingleName} has moved with Grapple Gun`
      const moveMsgText = `${unitSingleName} is on the move`
      const moveMsg = isFatal
        ? diedFallingMsg
        : (wounds ?? 0) > 0
        ? woundedFallMove
        : (fallDamage ?? 0) > 0 && wounds === 0
        ? fallButNoDamageMove
        : isGrappleGun
        ? grappleGunMoveMsg
        : moveMsgText
      return <span style={{ color: playerColors[playerID] }}>{moveMsg}</span>
    case gameLogTypes.theDropRoll:
      const theDropRollMsg = isRollSuccessful ? (
        <span style={{ color: playerColors[playerID] }}>
          {playerIDDisplay(playerID)} rolled for The Drop and succeeded! ({roll}{' '}
          / {rollThreshold}){' '}
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          {playerIDDisplay(playerID)} failed their roll for The Drop ({roll} /{' '}
          {rollThreshold}){' '}
        </span>
      )
      return theDropRollMsg
    case gameLogTypes.mindShackle:
      const msgMindShackle = isRollSuccessful ? (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} has Mind Shackled{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderUnitName}
          </span>
          ! (rolled a {roll})
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attempted to Mind Shackle{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderUnitName}
          </span>{' '}
          but only rolled a {roll} / {rollThreshold}
        </span>
      )
      return msgMindShackle
    case gameLogTypes.chomp:
      const chompMsg = isChompSuccessful ? (
        <span style={{ color: playerColors[playerID] }}>
          Grimnak Chomped{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {isChompedUnitSquad ? unitChompedSingleName : unitChompedName}
          </span>
          ! {isChompedUnitSquad ? '' : `(rolled a ${roll})`}
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          Grimnak attempted to Chomp{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {unitChompedName}
          </span>{' '}
          but only rolled a {roll} / {rollThreshold}
        </span>
      )
      return chompMsg
    case gameLogTypes.attack:
      const isCounterStrike = (counterStrikeWounds ?? 0) > 0
      const counterStrikeMsg = isFatalCounterStrike ? (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attacked{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled} shields)
          and was defeated by counter strike!
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attacked{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled} shields)
          and was hit by counter strike for {counterStrikeWounds} wounds!
        </span>
      )
      const stealthDodgeMsgText = (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attacked{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          ({skulls}/{attackRolled} skulls, {shields}/{defenseRolled} shields),
          but the attack was evaded with Stealth Dodge!
        </span>
      )

      const attackMsgText = isFatal ? (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} destroyed{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          with a {wounds}-wound attack ({skulls}/{attackRolled} skulls,{' '}
          {shields}/{defenseRolled} shields)
        </span>
      ) : (
        <span style={{ color: playerColors[playerID] }}>
          {unitName} attacked{' '}
          <span style={{ color: playerColors[defenderPlayerID ?? ''] }}>
            {defenderSingleName}
          </span>{' '}
          for {wounds} wounds ({skulls}/{attackRolled} skulls, {shields}/
          {defenseRolled} shields)
        </span>
      )
      const attackToast = isCounterStrike
        ? counterStrikeMsg
        : isStealthDodge
        ? stealthDodgeMsgText
        : attackMsgText
      return attackToast
    default:
      return <span style={{ color: playerColors[playerID] }}>{`${msg}`}</span>
  }
}

const StyledDiv = styled.div`
  position: absolute;
  bottom: 12px;
  left: Min(10%, 600px);
  /* width: 300px; */
  font-size: 0.8rem;
  @media screen and (max-width: 1100px) {
    font-size: 0.7rem;
  }
`
