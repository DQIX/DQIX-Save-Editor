import { useContext } from "react"

import "./NavBar.scss"

import { PARTY_TAB, EditorUiContext, ITEMS_TAB } from "../EditorUiContext"
import { SaveManagerContext } from "../SaveManagerContext"
import { STATE_LOADED } from "../saveManager"

export default props => {
  let { save } = useContext(SaveManagerContext)
  let { state, setTab } = useContext(EditorUiContext)

  return (
    <nav>
      <ul
        style={{
          opacity: save.state == STATE_LOADED ? 1 : 0,
        }}
      >
        <li className={state.tab == PARTY_TAB ? "active" : ""} onClick={e => setTab(PARTY_TAB)}>
          party
        </li>
        <li className={state.tab == ITEMS_TAB ? "active" : ""} onClick={e => setTab(ITEMS_TAB)}>
          items
        </li>
      </ul>

      <p>:)</p>
    </nav>
  )
}
