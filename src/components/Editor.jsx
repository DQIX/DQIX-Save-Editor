import { useContext } from "react"
import "./Editor.scss"
import { SaveManagerContext } from "../SaveManagerContext"
import SaveManager from "../saveManager"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)
  console.log(save)

  return (
    <>
      <ul>
        {Array.from({ length: save.getCharacterCount() }, (_, i) => (
          <li key={i}>
            <h2
              onClick={e => {
                save.writeCharacterName(i, "bob")
                setSave(new SaveManager(save.buffer))
              }}
            >
              {save.getCharacterName(i)} {i >= save.getStandbyCount() ? "(party)" : ""}
            </h2>
          </li>
        ))}
      </ul>
      <button
        onClick={e => {
          let buf = save.download()
        }}
      >
        export
      </button>
    </>
  )
}
