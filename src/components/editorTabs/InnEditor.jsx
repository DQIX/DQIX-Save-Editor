import { useContext, useState } from "react"
import { SaveManagerContext } from "../../SaveManagerContext"

import gameData from "../../game/data"

import "./InnEditor.scss"

import Card from "../atoms/Card"
import Input from "../atoms/Input"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)
  let [guest, setGuest] = useState(0)

  return (
    <div className="inn-root">
      <div className="sidebar">
        <Card label="canvased guests:" className="guest-list canvased-guests">
          <ul>
            {Array.from({ length: 30 }, (_, i) => (
              <li key={i} className={i == guest ? "active" : ""} onClick={_ => setGuest(i)}>
                {save.getCanvasedGuestName(i) || "\u00A0"}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="grid"></div>
    </div>
  )
}
