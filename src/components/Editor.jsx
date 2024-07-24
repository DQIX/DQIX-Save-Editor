import { useContext } from "react"

import "./Editor.scss"

import CharacterEditor from "./editorTabs/CharacterEditor"
import ItemEditor from "./editorTabs/ItemEditor"
import MiscEditor from "./editorTabs/MiscEditor"
import HexEditor from "./editorTabs/HexEditor"
import { EditorUiContext, PARTY_TAB, ITEMS_TAB, MISC_TAB, HEX_TAB } from "../EditorUiContext"

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
          case MISC_TAB: {
            return <MiscEditor />
          }
          case HEX_TAB: {
            return <HexEditor />
          }
        }
      })()}
    </>
  )
}
