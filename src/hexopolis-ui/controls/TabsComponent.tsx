import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

import {
  Gi3DHammer,
  GiAutoRepair,
  GiBookPile,
  GiCardPick,
  GiChatBubble,
  GiConsoleController,
} from 'react-icons/gi'
import { Controls } from './Controls'
import { Chat } from './Chat'
import { Armies } from './Armies'
import { GameLog } from '../game-log/GameLog'

type Tab = {
  title: string
  id: string
  icon: JSX.Element
}
const tabs: Tab[] = [
  {
    title: 'Controls',
    id: 'tab1',
    icon: <GiConsoleController />,
  },
  {
    title: 'Armies',
    id: 'tab2',
    icon: <GiCardPick />,
  },
  {
    title: 'Chat',
    icon: <GiChatBubble />,
    id: 'tab3',
  },
  {
    title: 'Game Log',
    icon: <GiBookPile />,
    id: 'tab4',
  },
  // {
  //   title: 'Settings',
  //   id: 'tab4',
  //   icon: <GiAutoRepair />,
  // },
]

enum tabVariantNames {
  active = 'active',
  inactive = 'inactive',
}
const tabVariant = {
  [tabVariantNames.active]: {
    width: '55%',
    transition: {
      type: 'tween',
      duration: 0.4,
    },
  },
  [tabVariantNames.inactive]: {
    width: '15%',
    transition: {
      type: 'tween',
      duration: 0.4,
    },
  },
}
const tabTextVariant = {
  [tabVariantNames.active]: {
    opacity: 1,
    x: 0,
    display: 'block',
    transition: {
      type: 'tween',
      duration: 0.3,
      delay: 0.3,
    },
  },
  [tabVariantNames.inactive]: {
    opacity: 0,
    x: -30,
    transition: {
      type: 'tween',
      duration: 0.3,
      delay: 0.1,
    },
    transitionEnd: { display: 'none' },
  },
}

const ActiveTabView = ({ activeTabIndex }: { activeTabIndex: number }) => {
  return (
    <>
      {activeTabIndex === 0 && <Controls />}
      {activeTabIndex === 1 && <Armies />}
      {activeTabIndex === 2 && <Chat />}
      {activeTabIndex === 3 && <GameLog />}
    </>
  )
}

export const TabsComponent = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  return (
    <StyledTabsComponent>
      <StyledLinkList role="tablist">
        {tabs.map((tab, index) => (
          <StyledMotionLi
            key={tab.id}
            className={`tab ${activeTabIndex === index ? 'active' : ''}`}
            role="presentation"
            variants={tabVariant}
            animate={
              activeTabIndex === index
                ? tabVariantNames.active
                : tabVariantNames.inactive
            }
          >
            <StyledClickableButtonThing
              onClick={() => setActiveTabIndex(index)}
              title={tab.title}
            >
              {tab.icon}
              <motion.span variants={tabTextVariant}>{tab.title}</motion.span>
            </StyledClickableButtonThing>
          </StyledMotionLi>
        ))}
      </StyledLinkList>
      <ActiveTabView activeTabIndex={activeTabIndex} />
    </StyledTabsComponent>
  )
}
const StyledTabsComponent = styled.div`
  li.active::before {
    background: var(--success-green);
  }
`
const StyledMotionLi = styled(motion.li)`
  position: relative;
  &::before {
    content: '';
    width: 100%;
    height: 100%;
    opacity: 0.2;
    position: absolute;
    border-radius: var(--border-radius);
    background: none;
    transition: background 0.5s ease;
  }
`
const StyledClickableButtonThing = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  overflow: hidden;
  font-size: 1.3rem;
  text-decoration: none;
  cursor: pointer;
  @media screen and (max-width: 1100px) {
    padding: 8px;
    font-size: 1rem;
  }
  @media screen and (max-width: 600px) {
    padding: 6px;
    font-size: 0.8rem;
  }
  svg {
    height: 30px;
    width: 30px;
    min-width: 30px;
    stroke: var(--player-color);
    fill: var(--player-color);
    transition: fill 0.5s ease;
    @media screen and (max-width: 1100px) {
      height: 23px;
      width: 23px;
      min-width: 23px;
    }
    @media screen and (max-width: 600px) {
      height: 18px;
      width: 18px;
      min-width: 18px;
    }
  }
  span {
    margin-left: 10px;
    font-weight: 700;
    transition: color 0.5s ease;
    @media screen and (max-width: 1100px) {
      margin-left: 8px;
    }
    @media screen and (max-width: 600px) {
      margin-left: 6px;
    }
  }
`
const StyledLinkList = styled.ul`
  display: flex;
  justify-content: space-between;
  padding: 0;
  margin: 0 auto 20px;
  max-width: 400px;
  list-style: none;
`
