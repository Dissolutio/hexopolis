import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

import {
  GiAutoRepair,
  GiCardPick,
  GiChatBubble,
  GiConsoleController,
} from 'react-icons/gi'
import { Controls } from './Controls'
import { ChatInput, ChatList } from './Chat'

type Tab = {
  title: string
  id: string
  icon: JSX.Element
  color: string
}
const tabs: Tab[] = [
  {
    title: 'Command',
    id: 'tab1',
    icon: <GiConsoleController />,
    color: '#5d5dff',
  },
  {
    title: 'Scout',
    id: 'tab2',
    icon: <GiCardPick />,
    color: '#67bb67',
  },
  {
    title: 'Repair',
    id: 'tab3',
    icon: <GiAutoRepair />,
    color: '#63a7c7',
  },
  {
    title: 'Chat',
    id: 'tab4',
    icon: <GiChatBubble />,
    color: '#f56868',
  },
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
            >
              {tab.icon}
              <motion.span variants={tabTextVariant}>{tab.title}</motion.span>
            </StyledClickableButtonThing>
          </StyledMotionLi>
        ))}
      </StyledLinkList>
      {activeTabIndex === 0 && <Controls />}
      {activeTabIndex === 1 && <div>Army Cards! With Order Markers!</div>}
      {activeTabIndex === 2 && <div>Big whoop!</div>}
      {activeTabIndex === 3 && (
        <>
          <h3>Chats</h3>
          <ChatList />
          <ChatInput />
        </>
      )}
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
  text-decoration: none;
  padding: 16px;
  display: flex;
  align-items: center;
  font-size: 20px;
  overflow: hidden;
  position: relative;
  svg {
    height: 30px;
    width: 30px;
    min-width: 30px;
    stroke: var(--player-color);
    fill: var(--player-color);
    transition: fill 0.5s ease;
  }
  span {
    font-weight: 700;
    margin-left: 10px;
    transition: color 0.5s ease;
  }
`
const StyledLinkList = styled.ul`
  padding: 0;
  margin: 0 auto 20px;
  list-style: none;
  max-width: 400px;
  display: flex;
  justify-content: space-between;
`
