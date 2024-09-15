import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import Card from "../atoms/Card"

import "./RecordsEditor.scss"
import Input from "../atoms/Input"

export default props => {
  let { save, updateSave } = useContext(SaveManagerContext)

  const [tab, setTab] = useState(0)
  const tabs = ["monsters", "wardrobe", "items", "alchenomicon", "accolades"]

  return (
    <div className="records-root">
      <Card label="records:" className="sidebar">
        <label>
          <span>
            <small>battle victories:</small>
          </span>
          <Input
            type="number"
            value={save.getBattleVictories()}
            onChange={e => {
              updateSave(save => {
                save.setBattleVictories(e.target.value)
              })
            }}
          />
        </label>
        <label>
          <span>
            <small>times alchemy performed:</small>
          </span>
          <Input
            type="number"
            value={save.getAlchemyCount()}
            onChange={e => {
              updateSave(save => {
                save.setAlchemyCount(e.target.value)
              })
            }}
          />
        </label>
        <label>
          <span>
            <small>accolades earnt:</small>
          </span>
          <Input
            type="number"
            value={save.getAccoladeCount()}
            onChange={e => {
              updateSave(save => {
                save.setAccoladeCount(e.target.value)
              })
            }}
          />
        </label>
        <label>
          <span>
            <small>quests completed:</small>
          </span>
          <Input
            type="number"
            value={save.getQuestsCompleted()}
            onChange={e => {
              updateSave(save => {
                save.setQuestsCompleted(e.target.value)
              })
            }}
          />
        </label>
        <label>
          <span>
            <small>grottos completed:</small>
          </span>
          <Input
            type="number"
            value={save.getGrottosCompleted()}
            onChange={e => {
              updateSave(save => {
                save.setGrottosCompleted(e.target.value)
              })
            }}
          />
        </label>
        <label>
          <span>
            <small>guests canvased:</small>
          </span>
          <Input
            type="number"
            value={save.getGuestsCanvased()}
            onChange={e => {
              updateSave(save => {
                save.setGuestsCanvased(e.target.value)
              })
            }}
          />
        </label>

        <label>
          <span>
            <small>defeated monster list completion:</small>
          </span>
          <span>{save.getMonsterCompletion()}%</span>
        </label>
        <label>
          <span>
            <small>wardrobe completion:</small>
          </span>
          <span>{save.getWardrobeCompletion()}%</span>
        </label>
        <label>
          <span>
            <small>item list completion:</small>
          </span>
          <span>{save.getItemCompletion()}%</span>
        </label>
        <label>
          <span>
            <small>alchenomicon completion:</small>
          </span>
          <span>{save.getAlchenomiconCompletion()}%</span>
        </label>
      </Card>
      <Card className="records">
        <div className="tab-header">
          {tabs.map((n, i) => (
            <a key={i} onClick={e => setTab(i)} className={tab == i && "active"}>
              {n}
            </a>
          ))}
        </div>
        <div className="tab-content">
          {(() => {
            switch (tab) {
              case 0:
                return <p>monsters</p>
              case 1:
                return <p>wardrobe</p>
              case 2:
                return <p>items</p>
              case 3:
                return <p>alchenomicon</p>
              case 4:
                return <p>accolades</p>
            }
          })()}
        </div>
      </Card>
    </div>
  )
}
