import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.scss"
// import { SaveManagerContextProvider } from "./SaveManagerContext.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <SaveManagerContextProvider> */}
    <App />
    {/* </SaveManagerContextProvider> */}
  </React.StrictMode>
)
