import { Roll } from './rollInitiative'
import { omToString, playerIDDisplay } from './transformers'

export type GameLogMessage = {
  type: string // gameLogTypes
  id: string // formatted for attacks & moves, just plain round number for roundBegin, tbd how helpful it is
  // for noUnitsOnTurn
  playerID?: string
  cardNameWithNoUnits?: string
  currentOrderMarker?: string
  isNoCard?: boolean
  // attack logs below
  unitID?: string
  unitName?: string
  targetHexID?: string
  defenderUnitName?: string
  attackRolled?: number
  defenseRolled?: number
  skulls?: number
  shields?: number
  wounds?: number
  isFatal?: boolean
  counterStrikeWounds?: number
  isFatalCounterStrike?: boolean
  isStealthDodge?: boolean
  // roundBegin
  initiativeRolls?: Roll[][]
  // move logs
  unitSingleName?: string
  startHexID?: string
  endHexID?: string
  isGrappleGun?: boolean
  // disengage attempts
  unitIdsToAttemptToDisengage?: string[]
  // berserker charge logs, most generic roll format
  roll?: number
  isRollSuccessful?: boolean
  rollThreshold?: number
  // water clone
  cloneCount?: number
  rollsAndThreshholds?: number[][]
  // chomp
  isChompSuccessful?: boolean
  chompRoll?: number
  unitChompedName?: string
  unitChompedSingleName?: string
  isChompedUnitSquad?: boolean
}
export const gameLogTypes = {
  noUnitsOnTurn: 'noUnitsOnTurn',
  move: 'move',
  attack: 'attack',
  roundBegin: 'roundBegin',
  disengageAttempt: 'disengageAttempt',
  disengageSwipeDenied: 'disengageSwipeDenied',
  disengageSwipeMiss: 'disengageSwipeMiss',
  disengageSwipeFatal: 'disengageSwipeFatal',
  disengageSwipeNonFatal: 'disengageSwipeNonFatal',
  waterClone: 'waterClone',
  chomp: 'chomp',
  mindShackle: 'mindShackle',
  berserkerCharge: 'berserkerCharge',
}

export type GameLogMessageDecoded = GameLogMessage & {
  msg: string
}

export const encodeGameLogMessage = (gameLog: GameLogMessage): string => {
  try {
    return JSON.stringify(gameLog)
  } catch (error) {
    console.error('🚀 ~ file: gamelog.ts ~ encodeGameLogMessage ~ error', error)
    return ''
  }
}
export const decodeGameLogMessage = (
  logMessage: string
): GameLogMessageDecoded | undefined => {
  try {
    const gameLog = JSON.parse(logMessage)
    const {
      type,
      id,
      // for noUnitsOnTurn
      playerID,
      cardNameWithNoUnits,
      currentOrderMarker,
      isNoCard,
      // NO UNITS ON TURN
      // attack logs below
      unitID,
      unitName,
      targetHexID,
      defenderUnitName,
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
    } = gameLog
    switch (type) {
      case gameLogTypes.attack:
        const isCounterStrike = counterStrikeWounds > 0
        const counterStrikeMsg = isFatalCounterStrike
          ? `${unitName} attacked ${defenderUnitName} (${skulls}/${attackRolled} skulls, ${shields}/${defenseRolled} shields) and was defeated by counter strike!`
          : `${unitName} attacked ${defenderUnitName} (${skulls}/${attackRolled} skulls, ${shields}/${defenseRolled} shields) and was hit by counter strike for ${counterStrikeWounds} wounds!`
        const stealthDodgeMsgText = `${unitName} attacked ${defenderUnitName} (${skulls}/${attackRolled} skulls, ${shields}/${defenseRolled} shields), but the attack was evaded with Stealth Dodge!`

        const attackMsgText = isFatal
          ? `${unitName} destroyed ${defenderUnitName} with a ${wounds}-wound attack (${skulls}/${attackRolled} skulls, ${shields}/${defenseRolled} shields)`
          : `${unitName} attacked ${defenderUnitName} for ${wounds} wounds (${skulls}/${attackRolled} skulls, ${shields}/${defenseRolled} shields)`
        return {
          type,
          id,
          unitID,
          unitName,
          targetHexID,
          defenderUnitName,
          attackRolled,
          defenseRolled,
          skulls,
          shields,
          wounds,
          isFatal,
          msg: isCounterStrike
            ? counterStrikeMsg
            : isStealthDodge
            ? stealthDodgeMsgText
            : attackMsgText,
        }
      case gameLogTypes.roundBegin:
        // TODO display initiative rolls
        const roundBeginMsgText = `Round ${id} has begun!`
        return {
          type,
          id,
          msg: roundBeginMsgText,
        }
      case gameLogTypes.waterClone:
        const isWaterCloneSuccessful = cloneCount > 0
        const waterCloneSuccessMsg = `${unitName} have cloned ${cloneCount} more ${unitName}! (rolled ${rollsAndThreshholds
          .map((rat: number[][]) => rat.join('/'))
          .join(', ')})`
        const waterCloneFailureMsg = `${unitName} have failed their WaterClone roll (rolled ${rollsAndThreshholds
          .map((rat: number[][]) => rat.join('/'))
          .join(', ')})`
        return {
          type,
          id,
          msg: isWaterCloneSuccessful
            ? waterCloneSuccessMsg
            : waterCloneFailureMsg,
        }
      case gameLogTypes.berserkerCharge:
        const msgBerserkerChargeSuccess = `${unitName} move again with Berserker Charge! (rolled ${roll}/${rollThreshold})`
        const msgBerserkerChargeFailure = `${unitName} have failed their Berserker Charge roll (rolled ${roll}/${rollThreshold})`
        return {
          type,
          id,
          msg: isRollSuccessful
            ? msgBerserkerChargeSuccess
            : msgBerserkerChargeFailure,
        }
      case gameLogTypes.noUnitsOnTurn:
        const msgNoUnitsOnTurn = isNoCard
          ? `${playerIDDisplay(
              playerID
            )} has no army card for order #${omToString(currentOrderMarker)}`
          : `${playerIDDisplay(
              playerID
            )} has no units left for ${cardNameWithNoUnits}, and skips their turn for order #${omToString(
              currentOrderMarker
            )}`
        return {
          type,
          id,
          msg: msgNoUnitsOnTurn,
        }
      case gameLogTypes.chomp:
        const msggg = isChompSuccessful
          ? `Grimnak chomped ${
              isChompedUnitSquad ? unitChompedSingleName : unitChompedName
            }! ${isChompedUnitSquad ? '' : `(rolled a ${chompRoll})`}`
          : `Grimnak attempted to chomp ${unitChompedName}, but only rolled a ${chompRoll}`
        return {
          type,
          id,
          msg: msggg,
        }
      case gameLogTypes.mindShackle:
        const msgMindShackle = isRollSuccessful
          ? `Ne-gok-sa has Mind Shackled ${defenderUnitName}! (rolled a ${roll})`
          : `Ne-gok-sa attempted to Mind Shackle ${defenderUnitName}, but only rolled a ${roll}`
        return {
          type,
          id,
          msg: msgMindShackle,
        }
      case gameLogTypes.move:
        const moveMsgText = `${unitSingleName} is on the move`
        const grappleGunMoveMsg = `${unitSingleName} has moved with Grapple Gun`
        return {
          type,
          id,
          msg: isGrappleGun ? grappleGunMoveMsg : moveMsgText,
        }
      case gameLogTypes.disengageAttempt:
        const disengageAttemptMsgText = `${unitSingleName} is attempting to disengage from ${
          unitIdsToAttemptToDisengage.length
        } unit${unitIdsToAttemptToDisengage.length === 1 ? 's' : ''}`
        return {
          type,
          id,
          msg: disengageAttemptMsgText,
        }
      case gameLogTypes.disengageSwipeFatal:
        const disengageSwipeFatalMsgText = `A unit was defeated while disengaging!`
        return {
          type,
          id,
          msg: disengageSwipeFatalMsgText,
        }
      case gameLogTypes.disengageSwipeNonFatal:
        const disengageSwipeNonFatalMsgText = `A unit was wounded while disengaging!`
        return {
          type,
          id,
          msg: disengageSwipeNonFatalMsgText,
        }
      case gameLogTypes.disengageSwipeDenied:
        const disengageSwipeDeniedMsgText = `A unit denied their disengagement swipe!`
        return {
          type,
          id,
          msg: disengageSwipeDeniedMsgText,
        }
      case gameLogTypes.disengageSwipeMiss:
        const disengageSwipeMissMsgText = `A unit missed their disengagement swipe!`
        return {
          type,
          id,
          msg: disengageSwipeMissMsgText,
        }
      default:
        break
    }
  } catch (error) {
    console.error('🚀 ~ file: gamelog.ts ~ decodeGameLogMessage ~ error', error)
    return undefined
  }
}
