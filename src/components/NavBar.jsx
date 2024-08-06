import { useContext } from "react"

import "./NavBar.scss"

import {
  EditorUiContext,
  tabs,
  DARK_THEME_NAME,
  LIGHT_THEME_NAME,
  LOAD_STATE_LOADED,
} from "../EditorUiContext"
import { SaveManagerContext } from "../SaveManagerContext"

import Button from "./atoms/Button"

export default props => {
  let { save } = useContext(SaveManagerContext)
  let { state, setTab, setTheme } = useContext(EditorUiContext)

  return (
    <nav>
      <ul
        style={{
          opacity: state.loadState == LOAD_STATE_LOADED ? 1 : 0,
          pointerEvents: state.loadState == LOAD_STATE_LOADED ? "auto" : "none",
        }}
      >
        {tabs
          .map((tab, i) =>
            tab.disabled ? null : (
              <li key={i} className={state.tab == i ? "active" : ""} onClick={e => setTab(i)}>
                {tab.name}
              </li>
            )
          )
          .filter(tab => tab)}
      </ul>

      <div>
        <Button
          className="export"
          style={{
            opacity: state.loadState == LOAD_STATE_LOADED ? 1 : 0,
            pointerEvents: state.loadState == LOAD_STATE_LOADED ? "auto" : "none",
          }}
          onClick={e => save.download()}
        >
          export
        </Button>

        <a href="https://github.com/dqix/editor" target="_blank" className="github-link"></a>
        <a
          className="theme-toggle"
          onClick={e => {
            setTheme(state.theme == DARK_THEME_NAME ? LIGHT_THEME_NAME : DARK_THEME_NAME)
          }}
        >
          {state.theme == DARK_THEME_NAME ? "☀️" : "🌒"}
        </a>
      </div>
    </nav>
  )
}
