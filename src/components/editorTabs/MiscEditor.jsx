import { useContext } from "react"

import "./MiscEditor.scss"

import { SaveManagerContext } from "../../SaveManagerContext"
import Card from "../atoms/Card"
import Input from "../atoms/Input"
import SaveManager from "../../saveManager"

import gameData from "../../game/data"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  return (
    <div className="misc-root">
      <Card label="play time:">todo</Card>
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
        <p>
          <small>note that the bank can only be interacted with in units of 1000 in game.</small>
        </p>
      </Card>
      <Card label="party tricks:" className="party-tricks">
        <div>
          {(() => {
            return gameData.partyTricks
              .slice(gameData.LEARNABLE_PARTY_TRICK_START, gameData.LEARNABLE_PARTY_TRICK_END)
              .map((name, i) => (
                <div>
                  <Input
                    type="checkbox"
                    defaultChecked={save.getPartyTrickLearned(i)}
                    onChange={e => {
                      save.setPartyTrickLearned(i, e.target.checked)
                      setSave(new SaveManager(save.buffer))
                    }}
                  />
                  <span>{name}</span>
                </div>
              ))
          })()}
        </div>
      </Card>
      <Card label="mini medals:" className="mini-medals">
        <Input
          type="number"
          style={{
            fontSize: "2.5em",
            width: "100%",
          }}
          defaultValue={save.getMiniMedals()}
          onChange={e => {
            save.setMiniMedals(e.target.value)
            setSave(new SaveManager(save.buffer))
          }}
        />
        <p>
          <small>counts all medals given to Cap'n Max Meddlin'</small>
        </p>
      </Card>
      <Card label="flags:" className="flags">
        todo
      </Card>
    </div>
  )
}
