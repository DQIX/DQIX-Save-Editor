import { useContext } from "react"

import "./Editor.scss"

import { EditorUiContext } from "../EditorUiContext"
import CharacterEditor from "./editor_tabs/CharacterEditor"
import ItemEditor from "./editor_tabs/ItemEditor"
import { PARTY_TAB, ITEMS_TAB } from "../EditorUiContext"

export default props => {
  let { state } = useContext(EditorUiContext)

  return (
    <>
      {(() => {
        switch (state.tab) {
          case PARTY_TAB: {
            return <CharacterEditor />
          }
          case ITEMS_TAB: {
            return <ItemEditor />
          }
        }
      })()}
    </>
  )
}
