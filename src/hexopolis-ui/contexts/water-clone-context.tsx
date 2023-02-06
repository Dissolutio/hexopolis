import { createContext, PropsWithChildren, useContext } from 'react'

const WaterCloneContext = createContext<WaterCloneContextValue | undefined>(
  undefined
)

type WaterCloneContextValue = {
  coolValue: string
}

export const WaterCloneContextProvider = ({ children }: PropsWithChildren) => {
  const coolValue = 'cool'
  return (
    <WaterCloneContext.Provider
      value={{
        coolValue,
      }}
    >
      {children}
    </WaterCloneContext.Provider>
  )
}

export const useWaterCloneContext = () => {
  const context = useContext(WaterCloneContext)
  if (context === undefined) {
    throw new Error(
      'useWaterCloneContext must be used within a WaterCloneContextProvider'
    )
  }
  return context
}
