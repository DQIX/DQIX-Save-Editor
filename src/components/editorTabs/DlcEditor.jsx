import { useContext } from "react"

import "./DlcEditor.scss"

import gameData from "../../game/data"
import Card from "../atoms/Card"
import Input from "../atoms/Input"
import SaveManager from "../../saveManager"
import { SaveManagerContext } from "../../SaveManagerContext"

export default props => {
  const { save, setSave } = useContext(SaveManagerContext)

  return (
    <div className="dlc-root">
      <Card label="special guests:" className="special-guests">
        <div>
          {gameData.specialGuests.map((name, i) => (
            <label key={i}>
              <Input
                type="checkbox"
                checked={save.isSpecialGuestVisiting(i)}
                onChange={e => {
                  save.setSpecialGuestVisiting(i, e.target.checked)
                  setSave(new SaveManager(save.buffer))
                }}
              />
              {name}
            </label>
          ))}
        </div>
      </Card>
      {/* <Card label="dqvc:" className="dqvc"></Card> */}

      {/* TODO: */}
      {/* <Card label="unlock:" className="unlock">
        // - unlock dlc all quests
        // - set all special guests to be visiting
        <button>unlock all</button>
        // - give all dlc exclusive items?
        <button>unlock all with items</button>
      </Card> */}
    </div>
  )
}
