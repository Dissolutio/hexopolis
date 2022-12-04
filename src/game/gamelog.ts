export type GameLogMessage = {
  type: string // 'roundBegin' 'attack'
  id: string // round1:orderMarker1:unit1:attack3 => r1:om1:p1u1_hs1008:a3
  // attack related ones below
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
  // roundBegin related ones below
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
    // switch (gameLog.type) {
    //   case 'attack':
    //     return JSON.stringify(gameLog)
    //   case 'roundBegin':
    //     return JSON.stringify(gameLog)
    //   default:
    //     return ''
    // }
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
        const attackMsgText = `${unitName} attacked ${defenderUnitName} for ${wounds} wounds (${skulls} skulls, ${shields} shields)`
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
