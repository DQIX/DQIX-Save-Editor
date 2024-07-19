import { useContext } from "react"

import "./NavBar.scss"

import {
  PARTY_TAB,
  EditorUiContext,
  ITEMS_TAB,
  MISC_TAB,
  DARK_THEME_NAME,
  LIGHT_THEME_NAME,
} from "../EditorUiContext"
import { SaveManagerContext } from "../SaveManagerContext"
import { STATE_LOADED } from "../saveManager"

export default props => {
  let { save } = useContext(SaveManagerContext)
  let { state, setTab, setTheme } = useContext(EditorUiContext)

  return (
    <nav>
      <ul
        style={{
          opacity: save.state == STATE_LOADED ? 1 : 0,
          pointerEvents: save.state == STATE_LOADED ? "auto" : "none",
        }}
      >
        <li className={state.tab == PARTY_TAB ? "active" : ""} onClick={e => setTab(PARTY_TAB)}>
          party
        </li>
        <li className={state.tab == ITEMS_TAB ? "active" : ""} onClick={e => setTab(ITEMS_TAB)}>
          items
        </li>
        <li className={state.tab == MISC_TAB ? "active" : ""} onClick={e => setTab(MISC_TAB)}>
          misc
        </li>
      </ul>

      <div>
        <button
          className="export"
          style={{
            opacity: save.state == STATE_LOADED ? 1 : 0,
            pointerEvents: save.state == STATE_LOADED ? "auto" : "none",
          }}
          onClick={e => save.download()}
        >
          export
        </button>
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
