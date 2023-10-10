import { playerColors } from 'hexopolis-ui/theme'
import React from 'react'
import { IconBaseProps } from 'react-icons'
import {
  GiTargetDummy,
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
  GiDragonHead,
  GiSauropodHead,
  GiSauropodSkeleton,
  GiSpaceSuit,
  GiWingedSword,
  GiCaduceus,
  GiSpartanHelmet,
  GiHornedReptile,
  GiVelociraptor,
  GiSnake,
  GiSpartan,
  GiDoubleShot,
  GiStrikingArrows,
  GiThornHelix,
  GiBoneKnife,
  GiAnubis,
  GiGiant,
  GiNinjaMask,
  GiStoneStack,
  GiSpiderEye,
  GiSpoon,
  GiWingCloak,
  GiWifiRouter,
  GiUfo,
  GiGriffinSymbol,
} from 'react-icons/gi'

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
      fill: `${playerColors?.[iconPlayerID as string] ?? 'var(--white)'}`,
      fontSize: iconProps?.x ?? `${iconSize}px`,
    },
    ...rest,
  }

  switch (armyCardID) {
    case 'test001':
      return <GiTargetDummy {...gameIconProps} />
    case 'test002':
      return <GiGiant {...gameIconProps} />
    case 'test003':
      return <GiSpoon {...gameIconProps} />
    case 'test004':
      return <GiWingCloak {...gameIconProps} />
    case 'test005':
      return <GiWifiRouter {...gameIconProps} />
    case 'test006':
      return <GiGriffinSymbol {...gameIconProps} />
    case 'test007':
      return <GiUfo {...gameIconProps} />
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
      return <GiDoubleShot {...gameIconProps} />
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
    case 'hs1016':
      // omnicron snipers
      return <GiSpaceSuit {...gameIconProps} />
    case 'hs1017':
      // taelord
      return <GiWingedSword {...gameIconProps} />
    case 'hs1018':
      // kelda
      return <GiCaduceus {...gameIconProps} />
    case 'hs1019':
      // marcus decimus gallus
      return <GiSpartanHelmet {...gameIconProps} />
    case 'hs1020':
      // venoc warlord
      return <GiHornedReptile {...gameIconProps} />
    case 'hs1021':
      // tornak
      return <GiVelociraptor {...gameIconProps} />
    case 'hs1022':
      // venoc vipers
      return <GiSnake {...gameIconProps} />
    case 'hs1023':
      // roman legionnaires
      return <GiSpartan {...gameIconProps} />
    case 'hs1024':
      // roman archers
      return <GiStrikingArrows {...gameIconProps} />
    case 'hs1025':
      // arrow gruts
      return <GiThornHelix {...gameIconProps} />
    case 'hs1026':
      // blade gruts
      return <GiBoneKnife {...gameIconProps} />
    case 'hs1027':
      // khosumet
      return <GiAnubis {...gameIconProps} />
    case 'hs1062':
      // charos
      return <GiDragonHead {...gameIconProps} />
    case 'hs1065':
      // subakna
      return <GiSauropodSkeleton {...gameIconProps} />
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
