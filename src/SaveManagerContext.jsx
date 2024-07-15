import { useState, createContext } from "react"
import SaveManager from "./saveManager"

export const SaveManagerContext = createContext(new SaveManager(null))

export const useSaveManagerContext = () => {
  const [state, setState] = useState(new SaveManager(null))

  return {
    save: state,
    setSave: value => {
      setState(value)
    },
    updateSave: newState => {
      setState({ ...state, ...newState })
    },
  }
}
