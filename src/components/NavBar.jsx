import { useContext } from "react"

import "./NavBar.scss"

import { EditorUiContext, tabs, DARK_THEME_NAME, LIGHT_THEME_NAME } from "../EditorUiContext"
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
