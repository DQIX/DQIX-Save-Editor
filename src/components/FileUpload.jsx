import { useContext, useRef } from "react"

import "./FileUpload.scss"
import { SaveManagerContext, useSaveManagerContext } from "../SaveManagerContext.jsx"

export default props => {
  const parentRef = useRef(null)
  const fileInputRef = useRef(null)

  let { save, updateSave } = useSaveManagerContext()

  return (
    <div id="upload" ref={parentRef}>
      <h1>DQIX Editor</h1>
      <h2>To start, drag and drop your save file into the browser</h2>
      <input
        type="file"
        id="file-input"
        accept=".sav"
        ref={fileInputRef}
        onDragOver={() => parentRef.current.classList.add("drag-over")}
        onDragLeave={() => parentRef.current.classList.remove("drag-over")}
        onDrop={e => {
          parentRef.current.classList.remove("drag-over")
          console.log(e)
        }}
      />
      <div className="buttons">
        <button id="input" onClick={() => fileInputRef.current.click()}>
          Or choose a file
        </button>
        <button id="demo" onClick={e => loadDemoFile(e, save)}>
          Or load the demo file
        </button>
      </div>
    </div>
  )
}

function loadDemoFile(e, save) {
  save.loadDemo()
}
