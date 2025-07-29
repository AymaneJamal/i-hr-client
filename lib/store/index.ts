// lib/store/index.ts

import authReducer from "./auth-slice"

// Simple store implementation without Redux Toolkit
const createStore = (reducer: any) => {
  let state: any
  const listeners: any[] = []

  const getState = () => state

  const dispatch = (action: any) => {
    state = reducer(state, action)
    listeners.forEach(listener => listener())
    return action
  }

  const subscribe = (listener: any) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Initialize state
  dispatch({ type: '@@INIT' })

  return { getState, dispatch, subscribe }
}

// Enhanced store with thunk support
const createStoreWithThunk = (reducer: any) => {
  const store = createStore(reducer)
  const originalDispatch = store.dispatch

  const dispatch = (action: any) => {
    if (typeof action === 'function') {
      return action(dispatch, store.getState)
    }
    return originalDispatch(action)
  }

  return {
    ...store,
    dispatch
  }
}

const rootReducer = (state: any, action: any) => ({
  auth: authReducer(state?.auth, action)
})

export const store = createStoreWithThunk(rootReducer)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch