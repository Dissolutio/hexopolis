import { PlacementUnit } from 'game/types'
import React from 'react'
import {
  GiDiabloSkull,
  GiNinjaArmor,
  GiButterfly,
  GiFairyWings,
  GiWingedEmblem,
  GiMissileMech,
} from 'react-icons/gi'

const playerIconColors: { [key: string]: string } = {
  '0': 'var(--bee-yellow)',
  '1': 'var(--butterfly-purple)',
}
type UnitIconTypes = {
  armyCardID: string
  iconPlayerID?: String
  hexSize?: number
  iconProps?: {
    x: string
    y: string
  }
}
export const UnitIcon: React.FC<UnitIconTypes> = ({
  armyCardID,
  hexSize,
  iconProps,
  iconPlayerID,
}) => {
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
      return <GiDiabloSkull {...gameIconProps} />
    case 'hs1001':
      return <GiMissileMech {...gameIconProps} />
    case 'hs1002':
      return <GiNinjaArmor {...gameIconProps} />
    default:
      return null
  }
}

export const CardUnitIcon = ({ unit }: { unit: PlacementUnit }) => {
  return (
    <UnitIcon
      armyCardID={unit.armyCardID}
      iconPlayerID={unit.playerID}
      iconProps={{
        x: '50',
        y: '50',
      }}
    />
  )
}
