import { PlacementUnit } from 'game/types'
import React from 'react'
import {
  GiDiabloSkull,
  GiNinjaArmor,
  GiMissileMech,
  GiAlienStare,
  GiAlliedStar,
} from 'react-icons/gi'

const playerIconColors: { [key: string]: string } = {
  '0': 'var(--bee-yellow)',
  '1': 'var(--butterfly-purple)',
}
type Props = {
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
    case 'hs1014':
      // negoksa
      return <GiAlienStare {...gameIconProps} />
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
