import { useContext } from "react"

import "./Editor.scss"

import { EditorUiContext, tabs } from "../EditorUiContext"

export default props => {
  let { state } = useContext(EditorUiContext)

  const Component = tabs[state.tab].component
  return <Component />
}
