import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App.jsx"

import "@fontsource/atkinson-hyperlegible/400.css"
import "@fontsource/atkinson-hyperlegible/700.css"
import "./index.scss"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
