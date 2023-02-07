import { Roll } from './rollInitiative'

export type GameLogMessage = {
  type: string // 'roundBegin' 'attack'
  id: string // formatted for attacks & moves, just plain round number for roundBegin, tbd how helpful it is

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

  // roundBegin logs below
  initiativeRolls?: Roll[][]

  // move logs below
  // unitID?: string
  unitSingleName?: string
  startHexID?: string
  endHexID?: string
  // disengage attempts below
  unitIdsToAttemptToDisengage?: string[]
}
export const gameLogTypes = {
  move: 'move',
  attack: 'attack',
  roundBegin: 'roundBegin',
  disengageAttempt: 'disengageAttempt',
  disengageSwipeDenied: 'disengageSwipeDenied',
  disengageSwipeMiss: 'disengageSwipeMiss',
  disengageSwipeFatal: 'disengageSwipeFatal',
  disengageSwipeNonFatal: 'disengageSwipeNonFatal',
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
      // moves
      unitSingleName,
      startHexID,
      endHexID,
      // disengage attempts
      // unitID,
      // endHexID,
      // unitSingleName,
      unitIdsToAttemptToDisengage,
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
      case gameLogTypes.move:
        const moveMsgText = `${unitSingleName} is on the move`
        return {
          type,
          id,
          msg: moveMsgText,
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
