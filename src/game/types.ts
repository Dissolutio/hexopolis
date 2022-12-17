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
  /* 
    START 
    Tracks the data passed from 
    1. clicking a `moveRange.disengage` hex in UI while moving
    to
    2. the bgio-move `disengagementSwipe`
   */
  disengagesAttempting:
    | undefined
    | { unit: GameUnit; defendersToDisengage: GameUnit[]; endHexID: string }
  /* END */

  /* 
    START
     tracks for a unit who has survived a disengage with unit(s) and should now have its move range adjusted. Should be reset (every move?)
   */
  disengagedUnitIds: string[]
  /* END */
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
  hexHeight: number
  hexWidth: number
  flat: boolean
  // from hexxaform below: mapId so when we have multiple maps we can switch between them, hexSize so we can scale the map
  mapId: string
  hexSize: number
}
export enum MapShapes {
  hexagon = 'hexagon',
  orientedRectangle = 'orientedRectangle', // rectangle tilted 45 degrees
  rectangle = 'rectangle',
}

export type BoardHex = {
  id: string
  q: number
  r: number
  s: number
  occupyingUnitID: string
  altitude: number
  startzonePlayerIDs: string[]
  terrain: string
}
export type BoardHexes = {
  [key: string]: BoardHex
}
export type StartZones = {
  [playerID: string]: string[] // boardHex IDs
}
export interface ICoreHeroscapeCard {
  name: string
  singleName: string
  armyCardID: string
  race: string
  life: string
  move: string
  range: string
  attack: string
  defense: string
  height: string
  heightClass: string
  points: string
  figures: string
  hexes: string
  image: string
  portraitPattern: string
  general:
    | 'jandar'
    | 'utgar'
    | 'ullar'
    | 'vydar'
    | 'einar'
    | 'aquilla'
    | 'valkrill'
  type: string
  cardClass: string
  personality: string
  setWave: string
  abilities: CardAbility[]
}
export type CardAbility = {
  name: string
  desc: string
  isAfterMove?: boolean
}
export type ArmyCard = {
  abilities: CardAbility[]
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
export type PlayerIdToUnitsMap = { [playerID: string]: GameUnit[] }
