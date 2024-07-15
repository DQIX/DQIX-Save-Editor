import { useContext, useState, createContext } from "react"
import SaveManager from "./saveManager"

export const SaveManagerContext = createContext(null)

export const useSaveManagerContext = () => {
  const [state, setState] = useState(new SaveManager(null))

  return {
    save: state,
    updateSave: newState => {
      setState({ ...state, ...newState })
    },
  }
}
