import { useContext, useRef } from "react"
import { Buffer } from "buffer"

import "./FileUpload.scss"
import { SaveManagerContext } from "../SaveManagerContext.jsx"
import SaveManager from "../saveManager.js"
import { EditorUiContext, LOAD_STATE_LOADED, LOAD_STATE_LOADING } from "../EditorUiContext.jsx"

export default props => {
  const parentRef = useRef(null)
  const fileInputRef = useRef(null)

  let { save, setSave, updateSave } = useContext(SaveManagerContext)
  let { setLoadState } = useContext(EditorUiContext)

  return (
    <div id="upload" ref={parentRef}>
      <h1>DQIX Editor</h1>
      <h2>To start, drag and drop your save file into the browser</h2>
      <p>
        Please note this editor is still in pre-alpha, if you run into any bugs feel free to open an
        issue
      </p>
      <input
        type="file"
        id="file-input"
        accept=".sav"
        ref={fileInputRef}
        onDragOver={() => parentRef.current.classList.add("drag-over")}
        onDragLeave={() => parentRef.current.classList.remove("drag-over")}
        onDrop={e => parentRef.current.classList.remove("drag-over")}
        onChange={async e => {
          updateSave({
            state: STATE_LOADING,
          })
          await e.target.files[0].arrayBuffer().then(res => {
            setSave(new SaveManager(new Buffer(res)))
          })
        }}
      />
      <div className="buttons">
        <button id="input" onClick={() => fileInputRef.current.click()}>
          Choose a file
        </button>
        <button id="demo" onClick={e => loadDemoFile(e, setLoadState, save, setSave)}>
          Load the demo file
        </button>
      </div>
    </div>
  )
}

function loadDemoFile(e, setLoadState, save, setSave) {
  setLoadState(LOAD_STATE_LOADING)

  save.loadDemo().then(res => {
    setSave(new SaveManager(res))
    setLoadState(LOAD_STATE_LOADED)
  })
}
