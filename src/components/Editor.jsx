import { useContext } from "react"

import "./Editor.scss"

import TextInput from "./atoms/TextInput"
import { ItemIcon, VocationIcon } from "./atoms/Icon"
import { SaveManagerContext } from "../SaveManagerContext"
import { EditorUiContext } from "../EditorUiContext"
import SaveManager from "../saveManager"
import game_data from "../game/data"
import Select from "./atoms/Select"
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
