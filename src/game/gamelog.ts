import { Roll } from './rollInitiative'

export type GameLogMessage = {
  type: string // 'roundBegin' 'attack'
  id: string // formatted for attacks, just plain round number for roundBegin, tbd how helpful it is

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

  // roundBegin logs below
  initiativeRolls?: Roll[][]
}
export const gameLogTypes = {
  move: 'move',
  attack: 'attack',
  roundBegin: 'roundBegin',
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
    } = gameLog
    switch (type) {
      case gameLogTypes.attack:
        const attackMsgText = `${unitName} attacked ${defenderUnitName} for ${wounds} wounds (${skulls}/${attackRolled} skulls, ${shields}/${defenseRolled} shields)`
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
          msg: attackMsgText,
        }
      case gameLogTypes.roundBegin:
        const roundBeginMsgText = `Round ${id} has begun!`
        return {
          type,
          id, // id is the round number, for roundBegin log types
          msg: roundBeginMsgText,
        }
      default:
        break
    }
    // const gameLogHumanFriendly = `${unitName} attacked ${defenderUnitName} for ${wounds} wounds (${skulls} skulls, ${shields} shields)`
    // return {
    //   type,
    //   id,
    //   unitID,
    //   unitName,
    //   targetHexID,
    //   defenderUnitName,
    //   attackRolled,
    //   defenseRolled,
    //   skulls,
    //   shields,
    //   wounds,
    //   isFatal,
    //   msg: gameLogHumanFriendly,
    // }
  } catch (error) {
    console.error('🚀 ~ file: gamelog.ts ~ decodeGameLogMessage ~ error', error)
    return undefined
  }
}
