import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

// Refactor to the right action creators
const { Types, Creators } = createActions({
  startScan: null,
  endScan: null,
  setPeripherals: ['peripherals'],
  setAppState: ['appState']
})

export const BluetoothTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = {
  scanning: null,
  peripherals: new Map(),
  appState: ''
}

/* ------------- Reducers ------------- */

// export const start = (state) => state.merge({ scanning: true })
//
// export const end = (state) => state.merge({ scanning: false })
//
// export const peripheral = (state, { peripherals }) => state.merge({ peripherals })
//
// export const app = (state, { appState }) => state.merge({ appState })

export const start = (state) => Object.assign({}, state, {scanning: true})

export const end = (state) => Object.assign({}, state, {scanning: false})

export const peripheral = (state, { peripherals }) => {
  return Object.assign({}, state, {peripherals: new Map(peripherals)})
}

export const app = (state, { appState }) => Object.assign({}, state, {appState})

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.START_SCAN]: start,
  [Types.END_SCAN]: end,
  [Types.SET_PERIPHERALS]: peripheral,
  [Types.SET_APP_STATE]: app
})
