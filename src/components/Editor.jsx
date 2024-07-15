import { useContext } from "react"
import "./Editor.scss"
import { SaveManagerContext } from "../SaveManagerContext"

export default props => {
  let { save } = useContext(SaveManagerContext)

  return Array.from({ length: save.getCharacterCount() }, (_, i) => (
    <div key={i}>
      <h1>{save.getCharacterName(i)}</h1>
    </div>
  ))
}
