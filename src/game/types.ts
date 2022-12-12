export interface GameState {
  initialArmyCards: GameArmyCard[]
  gameArmyCards: GameArmyCard[]
  gameUnits: GameUnits
  players: PlayersState
  hexMap: HexMap
  boardHexes: BoardHexes
  startZones: StartZones
  orderMarkers: OrderMarkers
  initiative: string[]
  currentRound: number
  currentOrderMarker: number
  placementReady: PlayerStateToggle
  orderMarkersReady: PlayerStateToggle
  roundOfPlayStartReady: PlayerStateToggle
  // rop game state below
  unitsMoved: string[] // unitsMoved is not unique ids; for now used to track # of moves used
  unitsAttacked: string[]
  unitsKilled: { [unitID: string]: string[] }
  gameLog: string[]
}
// for secret state
// PlayersState keys are playerIDS, players only see their slice of it at G.players
export type PlayersState = {
  [playerID: string]: {
    orderMarkers: PlayerOrderMarkers
  }
}
export type GameMap = {
  boardHexes: BoardHexes
  startZones: StartZones
  hexMap: HexMap
}
export type HexMap = {
  mapShape: string
  mapSize: number
  hexGridLayout: string
  hexHeight: number
  hexWidth: number
  flat: boolean
  withPrePlacedUnits: boolean
}
export type BoardHex = {
  id: string
  q: number
  r: number
  s: number
  occupyingUnitID: string
  altitude: number
}
export type BoardHexes = {
  [key: string]: BoardHex
}
export type StartZones = {
  [playerID: string]: string[] // boardHex IDs
}
export type ArmyCard = {
  name: string
  singleName: string
  armyCardID: string
  race: string
  life: number
  move: number
  range: number
  attack: number
  defense: number
  points: number
  figures: number
  hexes: number
  general: string
  type: string // unique common uncommon
  cardClass: string // warlord, soldier, beast etc
  personality: string // valiant, relentless etc
  height: number // 3-14
  heightClass: string // small medium large huge
  // CURRENTLY, THESE ARE OMITTED UNTIL WE USE THEM
  // setWave: string
  // abilities: CardAbility[]
  // image: string
  // portraitPattern: string
}
export type GameArmyCardsState = {
  [gameArmyCardId: string]: GameArmyCard
}
export type GameArmyCard = ArmyCard & {
  playerID: string
  gameCardID: string
  cardQuantity: number
}

export type GameUnit = {
  unitID: string
  playerID: string
  gameCardID: string
  armyCardID: string
  wounds: number
  movePoints: number
  moveRange: MoveRange
}

export type GameUnits = {
  [unitID: string]: GameUnit
}

export type PlacementUnit = GameUnit & {
  singleName: string
}

export type PlayerStateToggle = {
  [playerID: string]: boolean
}

export type MoveRange = {
  safe: string[]
  engage: string[]
  disengage: string[]
  denied: string[]
}
export type PlayerOrderMarkers = { [order: string]: string }

export type OrderMarker = {
  gameCardID: string
  order: string
}

export type OrderMarkers = {
  [playerID: string]: OrderMarker[]
}

export type DevGameOptions = BaseGameOptions &
  MapOptions & {
    withPrePlacedUnits?: boolean
  }

export type BaseGameOptions =
  | {
      placementReady?: PlayerStateToggle
      orderMarkersReady?: PlayerStateToggle
      roundOfPlayStartReady?: PlayerStateToggle
      currentRound?: number
      currentOrderMarker?: number
      orderMarkers?: OrderMarkers
      initiative?: string[]
      unitsMoved?: string[]
      unitsAttacked?: string[]
      players?: PlayersState
    }
  | undefined

export type MapOptions = {
  mapSize: number
  gameUnits?: GameUnits | undefined
  withPrePlacedUnits?: boolean
  // flat-top, or pointy-top hexes
  flat?: boolean
}

export type StringKeyedObj = {
  [key: string]: string
}
