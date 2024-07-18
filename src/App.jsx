import NavBar from "./components/NavBar.jsx"
import FileUpload from "./components/FileUpload.jsx"
import "./App.scss"
import { SaveManagerContext, useSaveManagerContext } from "./SaveManagerContext.jsx"
import Editor from "./components/Editor.jsx"
import Loading from "./components/Loading.jsx"
import { STATE_LOADED, STATE_LOADING, STATE_NULL } from "./saveManager.js"
import { EditorUiContext, useEditorUiContext } from "./EditorUiContext.jsx"

function App() {
  let saveCtx = useSaveManagerContext()
  let editorCtx = useEditorUiContext()

  return (
    <SaveManagerContext.Provider value={saveCtx}>
      <EditorUiContext.Provider value={editorCtx}>
        <NavBar />
        {(() => {
          switch (saveCtx.save.state) {
            case STATE_NULL: {
              return <FileUpload />
            }
            case STATE_LOADING: {
              return <Loading />
            }
            case STATE_LOADED: {
              return <Editor />
            }
          }
        })()}
      </EditorUiContext.Provider>
    </SaveManagerContext.Provider>
  )
}

export default App
