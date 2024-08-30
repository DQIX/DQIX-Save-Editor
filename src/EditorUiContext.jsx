import { useState, createContext } from "react"
import ItemEditor from "./components/editorTabs/ItemEditor"
import CharacterEditor from "./components/editorTabs/CharacterEditor"
import InnEditor from "./components/editorTabs/InnEditor"
import MiscEditor from "./components/editorTabs/MiscEditor"
import DlcEditor from "./components/editorTabs/DlcEditor"
import HexEditor from "./components/editorTabs/HexEditor"
import GrottoEditor from "./components/editorTabs/GrottoEditor"
import QuestEditor from "./components/editorTabs/QuestEditor"

export const DARK_THEME_NAME = "dark"
const DARK_THEME_BG = "#11111b"
export const LIGHT_THEME_NAME = "light"
const LIGHT_THEME_BG = "#dce0e8"

export const tabs = [
  { name: "party", component: CharacterEditor },
  { name: "items", component: ItemEditor },
  { name: "inn", component: InnEditor },
  { name: "quests", component: QuestEditor },
  { name: "grottos", component: GrottoEditor },
  { name: "dlc", component: DlcEditor },
  { name: "misc", component: MiscEditor },
  { name: "hex", component: HexEditor, disabled: true },
]

const initialTab = 0

const initialTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? LIGHT_THEME_NAME : DARK_THEME_NAME)
document.documentElement.setAttribute("data-theme", initialTheme)
document
  .querySelector('meta[name="theme-color"]')
  .setAttribute("content", initialTheme == LIGHT_THEME_NAME ? LIGHT_THEME_BG : DARK_THEME_BG)

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
      document
        .querySelector('meta[name="theme-color"]')
        .setAttribute("content", theme == LIGHT_THEME_NAME ? LIGHT_THEME_BG : DARK_THEME_BG)
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
