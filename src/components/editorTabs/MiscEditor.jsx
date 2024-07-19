import { useContext } from "react"

import "./MiscEditor.scss"

import { SaveManagerContext } from "../../SaveManagerContext"
import Card from "../atoms/Card"
import Input from "../atoms/Input"
import SaveManager from "../../saveManager"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  return (
    <div className="misc-root">
      <Card label="gold:" className="gold">
        <div>
          <label htmlFor="hand-gold">on hand:</label>
          <Input
            id="hand-gold"
            type="number"
            defaultValue={save.getGoldOnHand()}
            onBlur={e => {
              save.setGoldOnHand(e.target.value)
              setSave(new SaveManager(save.buffer))
            }}
          />
          <label htmlFor="hand-gold">g</label>
          <label htmlFor="bank-gold">in bank:</label>
          <Input
            id="bank-gold"
            type="number"
            defaultValue={save.getGoldInBank()}
            onBlur={e => {
              save.setGoldInBank(e.target.value)
              setSave(new SaveManager(save.buffer))
            }}
          />
          <label htmlFor="bank-gold">g</label>
        </div>
        <p>note that the bank can only be interacted with in units of 1000 in game.</p>
      </Card>
    </div>
  )
}
