import React from 'react'
import { IconBaseProps } from 'react-icons'
import {
  GiDiabloSkull,
  GiNinjaArmor,
  GiMissileMech,
  GiAlienStare,
  GiAlliedStar,
  GiWalkingTurret,
  GiSadCrab,
  GiArcher,
  GiPistolGun,
  GiVikingHelmet,
  GiNinjaHeroicStance,
  GiLeeEnfield,
  GiSverdIFjell,
  GiVikingShield,
  GiAngelOutfit,
  GiSpikedDragonHead,
  GiDinosaurRex,
} from 'react-icons/gi'

const playerIconColors: { [key: string]: string } = {
  '0': 'var(--bee-yellow)',
  '1': 'var(--butterfly-purple)',
}
type Props = IconBaseProps & {
  armyCardID: string
  iconPlayerID?: String
  hexSize?: number
  iconProps?: {
    x: string
    y: string
  }
}
export const UnitIcon = ({
  armyCardID,
  iconPlayerID,
  hexSize,
  iconProps,
  ...rest
}: Props) => {
  if (!armyCardID) {
    return null
  }

  const iconSize = hexSize || 10
  const iconXShift = iconSize / -2
  const iconYShift = iconSize / -1.5
  const gameIconProps = {
    x: iconProps?.x ?? `${iconXShift}px`,
    y: iconProps?.x ?? `${iconYShift}px`,
    style: {
      fill: `${playerIconColors?.[iconPlayerID as string] ?? 'var(--white)'}`,
      fontSize: iconProps?.x ?? `${iconSize}px`,
    },
    ...rest,
  }

  switch (armyCardID) {
    case 'hs1000':
      // marro warriors
      return <GiDiabloSkull {...gameIconProps} />
    case 'hs1001':
      // deathwalker 9000
      return <GiMissileMech {...gameIconProps} />
    case 'hs1002':
      // izumi samurai
      return <GiNinjaArmor {...gameIconProps} />
    case 'hs1003':
      // sgt drake
      return <GiAlliedStar {...gameIconProps} />
    case 'hs1004':
      // syvarris
      return <GiArcher {...gameIconProps} />
    case 'hs1005':
      // krav maga agents
      return <GiPistolGun {...gameIconProps} />
    case 'hs1006':
      // tarn viking warriors
      return <GiVikingHelmet {...gameIconProps} />
    case 'hs1007':
      // agent carr
      return <GiNinjaHeroicStance {...gameIconProps} />
    case 'hs1008':
      // zettian guard
      return <GiWalkingTurret {...gameIconProps} />
    case 'hs1009':
      // airborne elite
      return <GiLeeEnfield {...gameIconProps} />
    case 'hs1010':
      // finn the viking champion
      return <GiSverdIFjell {...gameIconProps} />
    case 'hs1011':
      // thorgrim the viking champion
      return <GiVikingShield {...gameIconProps} />
    case 'hs1012':
      // raelin the kyrie warrior
      return <GiAngelOutfit {...gameIconProps} />
    case 'hs1013':
      // mimring
      return <GiSpikedDragonHead {...gameIconProps} />
    case 'hs1014':
      // negoksa
      return <GiAlienStare {...gameIconProps} />
    case 'hs1015':
      // grimnak
      return <GiDinosaurRex {...gameIconProps} />
    case 'hs1185':
      // mezzodemon
      return <GiSadCrab {...gameIconProps} />
    default:
      return null
  }
}

export const PlacementCardUnitIcon = ({
  armyCardID,
  playerID,
}: {
  armyCardID: string
  playerID: string
}) => {
  return (
    <UnitIcon
      armyCardID={armyCardID}
      iconPlayerID={playerID}
      iconProps={{
        x: '50',
        y: '50',
      }}
    />
  )
}
export const PlaceOrderMarkersArmyCardUnitIcon = ({
  armyCardID,
  playerID,
}: {
  armyCardID: string
  playerID: string
}) => {
  return (
    <UnitIcon
      armyCardID={armyCardID}
      iconPlayerID={playerID}
      iconProps={{
        x: '25',
        y: '25',
      }}
    />
  )
}
