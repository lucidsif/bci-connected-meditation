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

console.log(Types, Creators)

export const BluetoothTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  scanning: null,
  peripherals: new Map(),
  appState: ''
})

/* ------------- Reducers ------------- */

// request the avatar for a user
export const request = (state, { username }) =>
  state.merge({ fetching: true, username, avatar: null })

// successful avatar lookup
export const success = (state, action) => {
  const { avatar } = action
  return state.merge({ fetching: false, error: null, avatar })
}

// failed to get the avatar
export const failure = (state) =>
  state.merge({ fetching: false, error: true, avatar: null })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.USER_REQUEST]: request,
  [Types.USER_SUCCESS]: success,
  [Types.USER_FAILURE]: failure
})
