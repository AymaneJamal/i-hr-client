"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { store } from "@/lib/store"
import { AuthProvider } from "@/components/auth/auth-provider"

// Simple Redux context implementation
const ReduxContext = createContext<any>(null)

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [state, forceUpdate] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      forceUpdate()
    })
    return unsubscribe
  }, [])

  const contextValue = {
    state: store.getState(),
    dispatch: store.dispatch
  }

  return (
    <ReduxContext.Provider value={contextValue}>
      {children}
    </ReduxContext.Provider>
  )
}

export function useDispatch() {
  const context = useContext(ReduxContext)
  return context.dispatch
}

export function useSelector(selector: any) {
  const context = useContext(ReduxContext)
  return selector(context.state)
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReduxProvider>
  )
}