import styled from 'styled-components'
import toast, { useToaster } from 'react-hot-toast/headless'
import { useBgioG } from 'bgio-contexts'
import { useEffect } from 'react'
import { useUIContext } from 'hexopolis-ui/contexts'
import { decodeGameLogMessage, gameLogTypes } from 'game/gamelog'
import { uniqBy } from 'lodash'
import { playerColors } from 'hexopolis-ui/theme'

export const Notifications = () => {
  const { toasts, handlers } = useToaster()
  const toastsInReverse = [...toasts].reverse()
  const { gameLog } = useBgioG()
  const { startPause, endPause } = handlers
  const { indexOfLastShownToast, setIndexOfLastShownToast } = useUIContext()

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
          chompRoll,
          unitChompedName,
          unitChompedSingleName,
          isChompedUnitSquad,
          // placeAttackSpirit
          initialValue,
          newValue,
          msg,
        } = gameLogMessage
        switch (type) {
          case gameLogTypes.move:
            toast(
              <span style={{ color: playerColors[playerID] }}>
                {gameLogMessage?.msg ?? ''}
              </span>,
              {
                duration: 5000,
                id: gameLogMessage?.id,
              }
            )
            break
          case gameLogTypes.attack:
            const isCounterStrike = counterStrikeWounds ?? 0 > 0
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
              duration: 20000,
              id: gameLogMessage?.id,
            })
            break
          default:
            toast(
              <span style={{ color: playerColors[playerID] }}>{`${msg}`}</span>,
              {
                duration: 20000,
                id: gameLogMessage?.id,
              }
            )
        }
      }
    }
    setIndexOfLastShownToast(gameLog.length)
  }, [gameLog, indexOfLastShownToast, setIndexOfLastShownToast, toasts.length])

  // UNCOMMENT THIS FOR DEBUGGING: This will show all the game log messages from G
  // return (
  //   <StyledDiv onMouseEnter={startPause} onMouseLeave={endPause}>
  //     {gameLogMessages.map((gameLogObj) => {
  //       if (!gameLogObj) return null
  //       return <div key={gameLogObj.id}>{gameLogObj.msg}</div>
  //     })}
  //   </StyledDiv>
  // )

  return (
    <StyledDiv onMouseEnter={startPause} onMouseLeave={endPause}>
      {uniqBy(toastsInReverse, (t) => t.id).map((toast) => {
        return (
          <div
            key={toast.id}
            style={{
              transition: 'all 0.5s ease-out',
              opacity: toast.visible ? 1 : 0,
            }}
          >
            {toast.message as string}
          </div>
        )
      })}
    </StyledDiv>
  )
}

const StyledDiv = styled.div`
  position: absolute;
  bottom: 12px;
  left: Min(10%, 600px);
  /* width: 300px; */
  font-size: 0.8rem;
`
