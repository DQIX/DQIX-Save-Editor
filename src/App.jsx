import { useContext, useState } from "react"
import NavBar from "./components/NavBar.jsx"
import FileUpload from "./components/FileUpload.jsx"
import "./App.scss"
import { SaveManagerContext, useSaveManagerContext } from "./SaveManagerContext.jsx"

function App() {
  let { save } = useSaveManagerContext()
  return (
    <>
      <NavBar />
      {!save.loaded() ? <FileUpload /> : <h1>loaded</h1>}
    </>
  )
}

export default App
