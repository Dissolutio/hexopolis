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
  {
    name: 'M3 Dummy GhostWalker',
    singleName: 'M3 Dummy GhostWalker',
    armyCardID: 'test003',
    image: 'agentcarr.jpg',
    portraitPattern: 'agentcarr-portrait',
    general: 'vydar',
    race: 'human',
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
    abilities: [
      {
        name: 'Phantom Walk',
        desc: 'This Dummy can move through all figures and is never attacked when leaving an engagement..',
      },
    ],
  },
  {
    name: 'M2 Big Dummy',
    singleName: 'M2 Big Dummy',
    armyCardID: 'test002',
    image: 'torkulna.jpg',
    portraitPattern: 'torkulna-portrait',
    general: 'utgar',
    race: 'marro',
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
    hexes: '2',
    setWave: 'Hexoscape Test',
    abilities: [],
  },
  {
    name: 'Dummy Stealth Flyer',
    singleName: 'Dummy Stealth Flyer',
    armyCardID: 'test005',
    image: 'taelordthekyriewarrior.jpg',
    portraitPattern: 'taelordthekyriewarrior-portrait',
    general: 'utgar',
    race: 'kyrie',
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
    abilities: [
      {
        name: 'Stealth Flying',
        desc: "When counting spaces for Dummy Stealth Flyer's movement, ignore elevations. Dummy Stealth Flyer may fly over water without stopping, pass over figures without becoming engaged, and fly over obstacles such as ruins. When Dummy Stealth Flyer starts to fly, if she is engaged she will not take any leaving engagement attacks.",
      },
    ],
  },
  {
    name: 'Dummy Flyer',
    singleName: 'Dummy Flyer',
    armyCardID: 'test004',
    image: 'concanthekyriewarrior.jpg',
    portraitPattern: 'concanthekyriewarrior-portrait',
    general: 'vydar',
    race: 'kyrie',
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
    abilities: [
      {
        name: 'Flying',
        desc: "When counting spaces for Dummy Flyer's movement, ignore elevations. Dummy Flyer may fly over water without stopping, pass over figures without becoming engaged, and fly over obstacles such as ruins. When Dummy Flyer starts to fly, if she is engaged she will take any leaving engagement attacks.",
      },
    ],
  },
]
