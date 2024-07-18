import { useContext } from "react"

import "./Editor.scss"

import { SaveManagerContext } from "../SaveManagerContext"
import { EditorUiContext } from "../EditorUiContext"
import CharacterEditor from "./editor_tabs/CharacterEditor"
import ItemEditor from "./editor_tabs/ItemEditor"
import { PARTY_TAB, ITEMS_TAB } from "../EditorUiContext"

export default props => {
  let { save } = useContext(SaveManagerContext)
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

      <button
        onClick={e => {
          save.download()
        }}
      >
        export
      </button>
    </>
  )
}
