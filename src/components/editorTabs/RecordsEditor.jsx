import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import Card from "../atoms/Card"

import "./RecordsEditor.scss"
import Input from "../atoms/Input"
import data from "../../game/data"

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
        <>
          {(() => {
            switch (tab) {
              case 0:
                return (
                  <div className="monsters-tab tab-content">
                    <table>
                      <thead>
                        <tr>
                          <th>name</th>
                          <th>kills</th>
                          <th>drop a</th>
                          <th>drop b</th>
                          <th>eye for trouble</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.monsters.map((m, i) => (
                          <tr key={i}>
                            <td>{m}</td>
                            <td>
                              <Input
                                type="number"
                                value={save.getMonsterDefeatCount(i)}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setMonsterDefeatCount(i, e.target.value)
                                  })
                                }}
                                min="0"
                                max="999"
                                size="4"
                              />
                            </td>
                            <td>
                              <Input
                                type="number"
                                value={save.getMonsterCommonDropCount(i)}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setMonsterCommonDropCount(i, e.target.value)
                                  })
                                }}
                                min="0"
                                max="99"
                                size="3"
                              />
                            </td>
                            <td>
                              <Input
                                type="number"
                                value={save.getMonsterRareDropCount(i)}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setMonsterRareDropCount(i, e.target.value)
                                  })
                                }}
                                min="0"
                                max="99"
                                size="3"
                              />
                            </td>
                            <td>
                              <Input
                                type="checkbox"
                                checked={save.getMonsterUsedEyeForTrouble(i)}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setMonsterUsedEyeForTrouble(i, e.target.checked)
                                  })
                                }}
                              />
                            </td>
                            {/* <td>{save.getMonsterData(i).readU32LE(0) & 0xfe000000}</td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              case 1:
                return (
                  <div className="wardrobe-tab tab-content">
                    <p>wardrobe</p>
                  </div>
                )
              case 2:
                return (
                  <div className="items-tab tab-content">
                    <p>items</p>
                  </div>
                )
              case 3:
                return (
                  <div className="alchenomicon-tab tab-content">
                    <p>alchenomicon</p>
                  </div>
                )
              case 4:
                return (
                  <div className="accolades-tab tab-content">
                    <p>accolades</p>
                  </div>
                )
            }
          })()}
        </>
      </Card>
    </div>
  )
}
