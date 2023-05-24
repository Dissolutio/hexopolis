import { ICoreHeroscapeCard } from './types'

export const testCards: ICoreHeroscapeCard[] = [
  {
    name: 'M1 Dummy',
    singleName: 'M1 Dummy',
    armyCardID: 'test001',
    image: 'syvarris.jpg',
    portraitPattern: 'syvarris-portrait',
    general: 'ullar',
    race: 'elf',
    type: 'unique hero',
    cardClass: 'dummy',
    personality: 'dumb',
    height: '4', // so that he can fall 4 altitude-levels in the move range test
    heightClass: 'medium',
    life: '1',
    move: '5',
    range: '1',
    attack: '3',
    defense: '3',
    points: '100',
    figures: '1',
    hexes: '1',
    setWave: 'Hexoscape Test',
    abilities: [],
  },
]