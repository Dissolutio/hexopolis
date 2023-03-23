import { Roll } from './rollInitiative'
import { omToString, playerIDDisplay } from './transformers'

export type GameLogMessage = {
  type: string // gameLogTypes
  id: string // formatted for attacks & moves, just plain round number for roundBegin, tbd how helpful it is
  // for noUnitsOnTurn
  playerID: string
  currentOrderMarker?: string
  isNoCard?: boolean
  // attack logs below (as much re-used as possible)
  unitID?: string
  unitName?: string
  targetHexID?: string
  defenderUnitName?: string
  defenderSingleName?: string
  defenderPlayerID?: string
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
  fallDamage?: number
  revealedGlyphID?: string
  reclaimedGlyphID?: string
  // disengage attempts
  unitIdsToAttemptToDisengage?: string[]
  // berserker charge logs, most generic roll format
  roll?: number
  isRollSuccessful?: boolean
  rollThreshold?: number
  // water clone
  cloneCount?: number
  rollsAndThreshholds?: number[][]
  possibleRevivals?: number
  // chomp
  isChompSuccessful?: boolean
  unitChompedName?: string
  unitChompedSingleName?: string
  isChompedUnitSquad?: boolean
  // place spirits
  initialValue?: number
  newValue?: number
}
export const gameLogTypes = {
  theDropRoll: 'theDropRoll',
  noUnitsOnTurn: 'noUnitsOnTurn',
  move: 'move',
  attack: 'attack',
  roundBegin: 'roundBegin',
  disengageAttempt: 'disengageAttempt',
  disengageSwipeDenied: 'disengageSwipeDenied',
  disengageSwipeMiss: 'disengageSwipeMiss',
  disengageSwipeFatal: 'disengageSwipeFatal',
  disengageSwipeNonFatal: 'disengageSwipeNonFatal',
  placeAttackSpirit: 'placeAttackSpirit',
  waterClone: 'waterClone',
  chomp: 'chomp',
  mindShackle: 'mindShackle',
  berserkerCharge: 'berserkerCharge',
  glyphReveal: 'glyphReveal',
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
      startHexID,
      endHexID,
      isFallDamage,
      unitIdsToAttemptToDisengage,
      // berserker charge: most generic roll format
      roll,
      isRollSuccessful,
      rollThreshold,
      // water clone
      rollsAndThreshholds,
      cloneCount,
      possibleRevivals,
      // chomp
      isChompSuccessful,
      unitChompedName,
      unitChompedSingleName,
      isChompedUnitSquad,
      // placeAttackSpirit
      initialValue,
      newValue,
    } = gameLog
    const basic = {
      type,
      id,
      playerID,
    }
    switch (type) {
      case gameLogTypes.attack:
        return {
          ...gameLog,
        }
      case gameLogTypes.glyphReveal:
        return {
          ...gameLog,
        }
      case gameLogTypes.roundBegin:
        // TODO display initiative rolls
        const roundBeginMsgText = `Round ${id} has begun!`
        return {
          ...basic,
          msg: roundBeginMsgText,
        }
      case gameLogTypes.placeAttackSpirit:
        return {
          ...basic,
          msg: `${playerIDDisplay(
            playerID
          )} has placed Finn's Attack Spirit on ${unitName}, raising their attack from ${initialValue} to ${newValue}!`,
        }
      case gameLogTypes.theDropRoll:
        return {
          ...gameLog,
        }
      case gameLogTypes.waterClone:
        const isWaterCloneSuccessful = cloneCount > 0
        const maxPossibleClones = Math.min(possibleRevivals, cloneCount)
        const waterCloneSuccessMsg = `${unitName} succeeded their Water Clone roll ${cloneCount} time${
          cloneCount === 1 ? '' : 's'
        }, to bring back ${maxPossibleClones} warrior${
          maxPossibleClones === 1 ? '' : 's'
        }! (rolled ${rollsAndThreshholds
          .map((rat: number[][]) => rat.join('/'))
          .join(', ')})`
        const waterCloneFailureMsg = `${unitName} have failed their WaterClone roll (rolled ${rollsAndThreshholds
          .map((rat: number[][]) => rat.join('/'))
          .join(', ')})`
        return {
          ...basic,
          msg: isWaterCloneSuccessful
            ? waterCloneSuccessMsg
            : waterCloneFailureMsg,
        }
      case gameLogTypes.berserkerCharge:
        const msgBerserkerChargeSuccess = `${unitName} move again with Berserker Charge! (rolled ${roll}/${rollThreshold})`
        const msgBerserkerChargeFailure = `${unitName} have failed their Berserker Charge roll (rolled ${roll}/${rollThreshold})`
        return {
          ...basic,
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
            )} has no units left for ${unitName}, and skips their turn for order #${omToString(
              currentOrderMarker
            )}`
        return {
          ...basic,
          msg: msgNoUnitsOnTurn,
        }
      case gameLogTypes.chomp:
        return {
          ...gameLog,
        }
      case gameLogTypes.mindShackle:
        return {
          ...gameLog,
        }
      case gameLogTypes.move:
        return {
          ...gameLog,
        }
      case gameLogTypes.disengageAttempt:
        const disengageAttemptMsgText = `${unitSingleName} is attempting to disengage from ${
          unitIdsToAttemptToDisengage.length
        } unit${unitIdsToAttemptToDisengage.length === 1 ? '' : 's'}`
        return {
          ...basic,
          msg: disengageAttemptMsgText,
        }
      case gameLogTypes.disengageSwipeFatal:
        return {
          ...gameLog,
        }
      case gameLogTypes.disengageSwipeNonFatal:
        return {
          ...gameLog,
        }
      case gameLogTypes.disengageSwipeDenied:
        const disengageSwipeDeniedMsgText = `${unitSingleName} denied their disengagement swipe!`
        return {
          ...basic,
          msg: disengageSwipeDeniedMsgText,
        }
      case gameLogTypes.disengageSwipeMiss:
        const disengageSwipeMissMsgText = `${unitSingleName} missed their disengagement swipe!`
        return {
          ...basic,
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
