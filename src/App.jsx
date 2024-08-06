import NavBar from "./components/NavBar.jsx"
import FileUpload from "./components/FileUpload.jsx"
import "./App.scss"
import { SaveManagerContext, useSaveManagerContext } from "./SaveManagerContext.jsx"
import Editor from "./components/Editor.jsx"
import Loading from "./components/Loading.jsx"

import {
  EditorUiContext,
  useEditorUiContext,
  LOAD_STATE_LOADED,
  LOAD_STATE_LOADING,
  LOAD_STATE_UNLOADED,
} from "./EditorUiContext.jsx"

function App() {
  let saveCtx = useSaveManagerContext()
  let editorCtx = useEditorUiContext()

  return (
    <SaveManagerContext.Provider value={saveCtx}>
      <EditorUiContext.Provider value={editorCtx}>
        <NavBar />
        {(() => {
          switch (editorCtx.state.loadState) {
            case LOAD_STATE_UNLOADED: {
              return <FileUpload />
            }
            case LOAD_STATE_LOADING: {
              return <Loading />
            }
            case LOAD_STATE_LOADED: {
              return <Editor />
            }
          }
        })()}
      </EditorUiContext.Provider>
    </SaveManagerContext.Provider>
  )
}

export default App
