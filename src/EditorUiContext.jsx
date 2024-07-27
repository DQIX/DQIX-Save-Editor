import { useState, createContext } from "react"
import ItemEditor from "./components/editorTabs/ItemEditor"
import CharacterEditor from "./components/editorTabs/CharacterEditor"
import InnEditor from "./components/editorTabs/InnEditor"
import MiscEditor from "./components/editorTabs/MiscEditor"
import DlcEditor from "./components/editorTabs/DlcEditor"
import HexEditor from "./components/editorTabs/HexEditor"

export const DARK_THEME_NAME = "dark"
export const LIGHT_THEME_NAME = "light"

export const tabs = [
  { name: "party", component: CharacterEditor },
  { name: "items", component: ItemEditor },
  { name: "inn", component: InnEditor, disabled: true },
  { name: "dic", component: DlcEditor },
  { name: "misc", component: MiscEditor },
  { name: "hex", component: HexEditor, disabled: true },
]

const initialTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? LIGHT_THEME_NAME : DARK_THEME_NAME)
document.documentElement.setAttribute("data-theme", initialTheme)

export const EditorUiContext = createContext({
  tab: 3,
  theme: initialTheme,
})

export const useEditorUiContext = () => {
  const [state, setState] = useState({
    tab: 3,
    theme: initialTheme,
  })

  return {
    state,
    setState,
    setTheme: theme => {
      localStorage.setItem("theme", theme)
      document.documentElement.setAttribute("data-theme", theme)
      setState({ ...state, theme })
    },
    setTab: tab => {
      setState({ ...state, tab })
    },
  }
}
