import { useContext, useRef } from "react"

import "./FileUpload.scss"
import { SaveManagerContext } from "../SaveManagerContext.jsx"
import SaveManager, { STATE_LOADING } from "../saveManager.js"

export default props => {
  const parentRef = useRef(null)
  const fileInputRef = useRef(null)

  let { save, setSave, updateSave } = useContext(SaveManagerContext)

  return (
    <div id="upload" ref={parentRef}>
      <h1>DQIX Editor</h1>
      <h2>To start, drag and drop your save file into the browser</h2>
      <p>
        Please note this editor is still in pre-alpha, if you run into any bugs feel free to share
        in the discord
      </p>
      <input
        type="file"
        id="file-input"
        accept=".sav"
        ref={fileInputRef}
        onDragOver={() => parentRef.current.classList.add("drag-over")}
        onDragLeave={() => parentRef.current.classList.remove("drag-over")}
        onDrop={e => {
          parentRef.current.classList.remove("drag-over")
        }}
      />
      <div className="buttons">
        <button id="input" onClick={() => fileInputRef.current.click()}>
          Choose a file
        </button>
        <button id="demo" onClick={e => loadDemoFile(e, save, updateSave, setSave)}>
          Load the demo file
        </button>
      </div>
    </div>
  )
}

function loadDemoFile(e, save, updateSave, setSave) {
  updateSave({
    state: STATE_LOADING,
  })
  save.loadDemo().then(res => {
    setSave(new SaveManager(res))
  })
}
