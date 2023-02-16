export interface GameState {
  gameArmyCards: GameArmyCard[]
  killedArmyCards: GameArmyCard[]
  gameUnits: GameUnits
  // killedUnits is updated when units die, and when units are resurrected/cloned
  killedUnits: GameUnits
  // annihilatedUnits would be units that were never killed, because they were never placed on the map (in placement, no room in start zone)
  // annihilatedUnits: GameUnits
  players: PlayerState
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
  unitsAttacked: { [attackingUnitID: string]: string[] }
  // These 2 booleans are for shuffling the stage of the current player, so say, if finn dies, after placing his spirit the activePlayers can be updated to the right thing (w/e current player was doing before finn died)
  isCurrentPlayerAttacking: boolean
  // unitsKilled does not get erased or updated when killed units are resurrected/cloned
  unitsKilled: UnitsKilled
  gameLog: string[]
  /* 
    START 
    Tracks the data passed from 
    1. clicking a `moveRange.disengage` hex in UI while moving
    to
    2. the bgio-move `disengagementSwipe`
   */
  disengagesAttempting: undefined | DisengageAttempt
  /* END */

  /* 
    START
     tracks for a unit who has survived a disengage with unit(s) and should now have its move range adjusted. Should be reset (every move?)
   */
  disengagedUnitIds: string[]
  /* END */
  waterCloneRoll?: WaterCloneRoll
  waterClonesPlaced: WaterClonesPlaced
  // This is an array of gameCardIDs, it gets added to whenever a grenade gets thrown, and then at end of turn, in game.ts file,  we can mark that card true for hasThrownGrenade
  grenadesThrown: string[]
  // this marks grimnak as having chomped
  chompsAttempted: string[]
  // this marks negoksa as having attempted mind shackle
  mindShacklesAttempted: string[]
  // this is used to track results of Tarn Viking Warrior berserker charges
  berserkerChargeRoll: BerserkerChargeRoll | undefined
  berserkerChargeSuccessCount: number
  // Stage queue: This is how, when Mimring kills many units that cause different stages to happen, we track the order of those stages
  stageQueue: StageQueueItem[]
}
export type SetupData = {
  numPlayers: number
  scenarioName: string
  withPrePlacedUnits: boolean
}
export type StageQueueItem = {
  stage: string
  playerID: string
}

// PlayersState keys are playerIDS, players only see their slice of it at G.players
export type GameMap = {
  boardHexes: BoardHexes
  startZones: StartZones
  hexMap: HexMap
}
export type HexMap = {
  mapShape: string // 'hexagon' | 'rectangle'
  mapName: string
  mapSize: number // for hexagon shaped maps
  mapHeight: number // for rectangle shaped maps
  mapWidth: number // for rectangle shaped maps
  hexSize: number
  flat: boolean
  // from hexxaform below: mapId so when we have multiple maps we can switch between them, hexSize so we can scale the map
  mapId: string
}
export enum MapShapes {
  hexagon = 'hexagon',
  orientedRectangle = 'orientedRectangle', // rectangle tilted 45 degrees
  rectangle = 'rectangle',
}
export type Point = {
  x: number
  y: number
}
export type HexCoordinates = {
  q: number
  r: number
  s: number
}
export type Orientation = {
  f0: number
  f1: number
  f2: number
  f3: number
  b0: number
  b1: number
  b2: number
  b3: number
  startAngle: number
}
export type BoardHex = HexCoordinates & {
  id: string
  occupyingUnitID: string
  isUnitTail: boolean
  altitude: number
  startzonePlayerIDs: string[]
  terrain: string
}
export type BoardHexes = {
  [key: string]: BoardHex
}
export type BoardHexesUnitDeployment = {
  [boardHexId: string]: {
    occupyingUnitID: string
    isUnitTail: boolean
  }
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
  image: string
  // CURRENTLY, THESE ARE OMITTED UNTIL WE USE THEM
  // setWave: string
  // portraitPattern: string
}
export type GameArmyCardsState = {
  [gameArmyCardId: string]: GameArmyCard
}
export type GameArmyCard = ArmyCard & {
  playerID: string
  gameCardID: string
  cardQuantity: number
  // this is for the airborn elite ability, which is a one time use
  hasThrownGrenade?: boolean
}

export type GameUnit = {
  unitID: string
  playerID: string
  gameCardID: string
  armyCardID: string
  wounds: number
  movePoints: number
  moveRange: MoveRange
  is2Hex: boolean
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
  [hexID: string]: {
    fromHexID: string
    fromCost: number
    movePointsLeft: number
    disengagedUnitIDs: string[]
    engagedUnitIDs: string[]
    fallDamage?: number
    isSafe?: boolean
    isEngage?: boolean
    isDisengage?: boolean
    isGrappleGun?: boolean
  }
}

export type DisengageAttempt = {
  unit: GameUnit
  endHexID: string
  endFromHexID: string
  movePointsLeft: number
  fallDamage: number
  defendersToDisengage: GameUnit[]
}
export type UnitsCloning = {
  // The units that are cloning, and the valid hex IDs they can clone onto
  clonerID: string
  clonerHexID: string
  tails: string[]
}[]
export type WaterClonesPlaced = {
  clonedID: string
  hexID: string
  clonerID: string
}[]
// this is what the server will send to the client
export type WaterCloneRoll = {
  diceRolls: { [gameUnitID: string]: number }
  threshholds: { [gameUnitID: string]: number }
  cloneCount: number
  placements: {
    // placements tell us where the clones are cloning "from" and the tails are where they could be placed
    [gameUnitID: string]: {
      clonerID: string
      clonerHexID: string
      tails: string[]
    }
  }
}
// for secret state
export type PlayerState = {
  [playerID: string]: {
    orderMarkers: PlayerOrderMarkers
  }
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
      unitsAttacked?: {}
      players?: PlayerState
    }
  | undefined
export type MapOptions = {
  mapSize: number
  gameUnits?: GameUnits | undefined
  withPrePlacedUnits?: boolean
  // flat-top, or pointy-top hexes
  flat?: boolean
}
export type RangeScan = {
  isInRange: boolean
  isMelee: boolean
  isRanged: boolean
}
export type StringKeyedObj = {
  [key: string]: string
}
export type LayoutDimension = {
  size: Point
  orientation: Orientation
  origin: Point
  spacing: number
}

export type HexNeighborsWithDirections = { [hexID: string]: number }

export type PossibleFireLineAttack = {
  affectedUnitIDs: string[]
  clickableHexID: string
  direction: number
  line: BoardHex[]
}
export type PossibleExplosionAttack = {
  clickableHexID: string
  clickableHexUnitID: string
  affectedUnitIDs: string[]
  affectedHexIDs: string[]
}
export type PossibleChomp = {
  chompingUnitID: string
  targetHexID: string
  isSquad: boolean
}
export type BerserkerChargeRoll = {
  roll: number
  isSuccessful: boolean
}
export type UnitsKilled = { [unitID: string]: string[] }
