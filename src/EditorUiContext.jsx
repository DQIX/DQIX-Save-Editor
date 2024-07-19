import { useState, createContext } from "react"

export const DARK_THEME_NAME = "dark"
export const LIGHT_THEME_NAME = "light"

export const PARTY_TAB = 1
export const ITEMS_TAB = 2

const initialTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? LIGHT_THEME_NAME : DARK_THEME_NAME)
document.documentElement.setAttribute("data-theme", initialTheme)

export const EditorUiContext = createContext({
  tab: ITEMS_TAB,
  theme: initialTheme,
})

export const useEditorUiContext = () => {
  const [state, setState] = useState({
    tab: ITEMS_TAB,
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
