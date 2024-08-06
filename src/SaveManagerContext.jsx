import { useReducer, createContext, useState } from "react"
import SaveManager from "./saveManager"

export const SaveManagerContext = createContext(new SaveManager(null))

export const useSaveManagerContext = () => {
  const [state, setState] = useState(new SaveManager(null))

  // let state = new SaveManager(null)
  const [, update] = useReducer(x => x + 1, 0)

  return {
    save: state,
    update,
    updateSave: callback => {
      callback(state)
      state.buffer.commitActions()
      update()
    },
    setSave: value => {
      setState(value)
      update()
    },
  }
}
