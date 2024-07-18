import { useState, createContext } from "react"

export const PARTY_TAB = 1
export const ITEMS_TAB = 2

export const EditorUiContext = createContext({
  tab: ITEMS_TAB,
})

export const useEditorUiContext = () => {
  const [state, setState] = useState({
    tab: PARTY_TAB,
  })

  return {
    state,
    setState,
    setTab: tab => {
      setState({ ...state, tab })
    },
  }
}
