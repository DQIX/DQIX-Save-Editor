import { useContext, useState } from "react"
import NavBar from "./components/NavBar.jsx"
import FileUpload from "./components/FileUpload.jsx"
import "./App.scss"
import { SaveManagerContext, useSaveManagerContext } from "./SaveManagerContext.jsx"
import Editor from "./components/Editor.jsx"
import { STATE_LOADED, STATE_LOADING, STATE_NULL } from "./saveManager.js"

function App() {
  let saveCtx = useSaveManagerContext()

  return (
    <SaveManagerContext.Provider value={saveCtx}>
      <NavBar />
      {(() => {
        switch (saveCtx.save.state) {
          case STATE_NULL:
            {
              return <FileUpload />
            }
            break
          case STATE_LOADING:
            {
              return <h1>loading...</h1>
            }
            break
          case STATE_LOADED:
            {
              return <Editor />
            }
            break
        }
      })()}
    </SaveManagerContext.Provider>
  )
}

export default App
