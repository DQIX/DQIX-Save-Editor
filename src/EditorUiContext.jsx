import { useState, createContext } from "react"
import ItemEditor from "./components/editorTabs/ItemEditor"
import CharacterEditor from "./components/editorTabs/CharacterEditor"
import InnEditor from "./components/editorTabs/InnEditor"
import MiscEditor from "./components/editorTabs/MiscEditor"
import DlcEditor from "./components/editorTabs/DlcEditor"
import HexEditor from "./components/editorTabs/HexEditor"
import GrottoEditor from "./components/editorTabs/GrottoEditor"

export const DARK_THEME_NAME = "dark"
export const LIGHT_THEME_NAME = "light"

export const tabs = [
  { name: "party", component: CharacterEditor },
  { name: "items", component: ItemEditor },
  { name: "inn", component: InnEditor },
  { name: "grottos", component: GrottoEditor, disabled: true },
  { name: "dlc", component: DlcEditor },
  { name: "misc", component: MiscEditor },
  { name: "hex", component: HexEditor, disabled: true },
]

const initialTab = 0

const initialTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? LIGHT_THEME_NAME : DARK_THEME_NAME)
document.documentElement.setAttribute("data-theme", initialTheme)

export const LOAD_STATE_UNLOADED = 0
export const LOAD_STATE_LOADING = 1
export const LOAD_STATE_LOADED = 2

export const EditorUiContext = createContext({
  loadState: LOAD_STATE_UNLOADED,
  tab: initialTab,
  theme: initialTheme,
})

export const useEditorUiContext = () => {
  const [state, setState] = useState({
    loadState: LOAD_STATE_UNLOADED,
    tab: initialTab,
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
    setLoadState: loadState => {
      setState({ ...state, loadState })
    },
  }
}
