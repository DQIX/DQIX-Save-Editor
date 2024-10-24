import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import Card from "../atoms/Card"

import "./RecordsEditor.scss"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import data from "../../game/data"
import { ItemIcon } from "../atoms/Icon"

const QuestTimeInput = props => {
  const year = 2000 + (props.value & 0x7f)
  const month = (props.value & 0x780) >> 7
  const day = (props.value & 0xf800) >> 11
  const hour = (props.value & 0x1f0000) >> 16
  const minute = (props.value & 0x7e00000) >> 21

  const constructTime = (yr, mon, day, hr, min) => {
    return (
      ((yr - 2000) & 0x7f) |
      ((mon << 7) & 0x780) |
      ((day << 11) & 0xf800) |
      ((hr << 16) & 0x1f0000) |
      ((min << 21) & 0x7e00000)
    )
  }

  return (
    <div>
      <Input
        type="number"
        value={day}
        min={1}
        max={31}
        size={3}
        onChange={e =>
          props.onChange && props.onChange(constructTime(year, month, e.target.value, hour, minute))
        }
      />
      /
      <Input
        type="number"
        value={month}
        min={1}
        max={12}
        size={3}
        onChange={e =>
          props.onChange && props.onChange(constructTime(year, e.target.value, day, hour, minute))
        }
      />
      /
      <Input
        type="number"
        value={year}
        min={2000}
        max={2128}
        size="6"
        onChange={e =>
          props.onChange && props.onChange(constructTime(e.target.value, month, day, hour, minute))
        }
      />{" "}
      <Input
        type="number"
        value={hour}
        min={0}
        max={23}
        size="3"
        onChange={e =>
          props.onChange && props.onChange(constructTime(year, month, day, e.target.value, minute))
        }
      />
      :
      <Input
        type="number"
        value={minute}
        min={0}
        max={60}
        size="3"
        onChange={e =>
          props.onChange && props.onChange(constructTime(year, month, day, hour, e.target.value))
        }
      />
    </div>
  )
}
export default props => {
  let { save, updateSave } = useContext(SaveManagerContext)

  const [tab, setTab] = useState(0)
  const tabs = ["monsters", "wardrobe", "items", "quests", "accolades"]

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
          <span>{save.getAccoladeCount()}</span>
        </label>
        <label>
          <span>
            <small>quests completed:</small>
          </span>
          <span>{save.getQuestsCompleted()}</span>
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
                          <th>defeated</th>
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
                    <table>
                      <thead>
                        <tr>
                          <th>name</th>
                          <th>found</th>
                          <th>name</th>
                          <th>found</th>
                          <th>
                            <Button
                              onClick={e => {
                                updateSave(save => {
                                  const checked = !save.isWardrobeItemFound(
                                    data.wardrobeItems[0].wardrobeIdx
                                  )
                                  for (const w of data.wardrobeItems) {
                                    save.setWardrobeItemFound(w.wardrobeIdx, checked)
                                  }
                                })
                              }}
                            >
                              toggle all
                            </Button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: data.wardrobeItems.length / 2 }).map((_, i) => (
                          <tr key={i}>
                            <td>
                              <ItemIcon icon={data.wardrobeItems[i * 2 + 0].icon} />
                              {data.wardrobeItems[i * 2 + 0].name}
                            </td>
                            <td>
                              <Input
                                type="checkbox"
                                checked={save.isWardrobeItemFound(
                                  data.wardrobeItems[i * 2 + 0].wardrobeIdx
                                )}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setWardrobeItemFound(
                                      data.wardrobeItems[i * 2 + 0].wardrobeIdx,
                                      e.target.checked
                                    )
                                  })
                                }}
                              />
                            </td>
                            <td>
                              <ItemIcon icon={data.wardrobeItems[i * 2 + 1].icon} />
                              {data.wardrobeItems[i * 2 + 1].name}
                            </td>
                            <td>
                              <Input
                                type="checkbox"
                                checked={save.isWardrobeItemFound(
                                  data.wardrobeItems[i * 2 + 1].wardrobeIdx
                                )}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setWardrobeItemFound(
                                      data.wardrobeItems[i * 2 + 1].wardrobeIdx,
                                      e.target.checked
                                    )
                                  })
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              case 2:
                return (
                  <div className="items-tab tab-content">
                    <table>
                      <thead>
                        <tr>
                          <th>name</th>
                          <th>found</th>
                          <th>name</th>
                          <th>found</th>
                          <th>
                            <Button
                              onClick={e => {
                                updateSave(save => {
                                  const checked = !save.isItemFound(data.standardItems[0].itemIdx)
                                  for (const i of data.standardItems) {
                                    save.setItemFound(i.itemIdx, checked)
                                  }
                                })
                              }}
                            >
                              toggle all
                            </Button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: data.standardItems.length / 2 }).map((_, i) => (
                          <tr key={i}>
                            <td>
                              <ItemIcon icon={data.standardItems[i * 2 + 0].icon} />
                              {data.standardItems[i * 2 + 0].name}
                            </td>
                            <td>
                              <Input
                                type="checkbox"
                                checked={save.isItemFound(data.standardItems[i * 2 + 0].itemIdx)}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setItemFound(
                                      data.standardItems[i * 2 + 0].itemIdx,
                                      e.target.checked
                                    )
                                  })
                                }}
                              />
                            </td>
                            <td>
                              <ItemIcon icon={data.standardItems[i * 2 + 1].icon} />
                              {data.standardItems[i * 2 + 1].name}
                            </td>
                            <td>
                              <Input
                                type="checkbox"
                                checked={save.isItemFound(data.standardItems[i * 2 + 1].itemIdx)}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setItemFound(
                                      data.standardItems[i * 2 + 1].itemIdx,
                                      e.target.checked
                                    )
                                  })
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              //FIXME: idfk
              // case 3:
              //   return (
              //     <div className="alchenomicon-tab tab-content">
              //       <table>
              //         <thead>
              //           <tr>
              //             <th>name</th>
              //             <th>learned</th>
              //             <th>made</th>
              //             <th>name</th>
              //             <th>learned</th>
              //             <th>made</th>
              //           </tr>
              //         </thead>
              //         <tbody>
              //           {Array.from({ length: data.alchenomiconItems.length / 2 }).map((_, i) => (
              //             <tr key={i}>
              //               <td>
              //                 <ItemIcon icon={data.alchenomiconItems[i * 2 + 0].icon} />
              //                 {data.alchenomiconItems[i * 2 + 0].name}
              //               </td>
              //               <td>
              //                 <Input
              //                   type="checkbox"
              //                   checked={save.isItemFound(
              //                     data.alchenomiconItems[i * 2 + 0].itemIdx
              //                   )}
              //                   onChange={e => {
              //                     updateSave(save => {
              //                       save.setItemFound(
              //                         data.alchenomiconItems[i * 2 + 0].itemIdx,
              //                         e.target.checked
              //                       )
              //                     })
              //                   }}
              //                 />
              //               </td>
              //               <td>
              //                 <Input
              //                   type="checkbox"
              //                   checked={save.isItemFound(
              //                     data.alchenomiconItems[i * 2 + 0].itemIdx
              //                   )}
              //                   onChange={e => {
              //                     updateSave(save => {
              //                       save.setItemFound(
              //                         data.alchenomiconItems[i * 2 + 0].itemIdx,
              //                         e.target.checked
              //                       )
              //                     })
              //                   }}
              //                 />
              //               </td>
              //               <td>
              //                 <ItemIcon icon={data.alchenomiconItems[i * 2 + 1].icon} />
              //                 {data.alchenomiconItems[i * 2 + 1].name}
              //               </td>
              //               <td>
              //                 <Input
              //                   type="checkbox"
              //                   checked={save.isItemFound(
              //                     data.alchenomiconItems[i * 2 + 1].itemIdx
              //                   )}
              //                   onChange={e => {
              //                     updateSave(save => {
              //                       save.setItemFound(
              //                         data.alchenomiconItems[i * 2 + 1].itemIdx,
              //                         e.target.checked
              //                       )
              //                     })
              //                   }}
              //                 />
              //               </td>
              //               <td>
              //                 <Input
              //                   type="checkbox"
              //                   checked={save.isItemFound(
              //                     data.alchenomiconItems[i * 2 + 1].itemIdx
              //                   )}
              //                   onChange={e => {
              //                     updateSave(save => {
              //                       save.setItemFound(
              //                         data.alchenomiconItems[i * 2 + 1].itemIdx,
              //                         e.target.checked
              //                       )
              //                     })
              //                   }}
              //                 />
              //               </td>
              //             </tr>
              //           ))}
              //         </tbody>
              //       </table>
              //     </div>
              //   )
              case 3:
                return (
                  <div className="quests-tab tab-content">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>name</th>
                          <th>unlocked</th>
                          <th>status</th>
                          <th>date (d/m/y h:m)</th>
                          <th>
                            <Button
                              onClick={e => {
                                updateSave(save => {
                                  for (const q of gameData.quests) {
                                    if (q.dlc) {
                                      save.setDlcQuestUnlocked(q.id, true)
                                    }
                                  }
                                })
                              }}
                            >
                              unlock all
                            </Button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameData.orderedQuests.map(q => (
                          <tr key={q.id}>
                            <td>{q.number}</td>
                            <td>{q.name}</td>
                            <td>
                              <Input
                                type="checkbox"
                                disabled={!q.dlc}
                                checked={!q.dlc || save.getDlcQuestUnlocked(q.id)}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setDlcQuestUnlocked(q.id, e.target.checked)
                                  })
                                }}
                              />
                            </td>
                            <td>
                              {/* <QuestStatusIcon icon={save.getQuestStatus(q.id)} /> */}
                              <select
                                value={save.getQuestStatus(q.id)}
                                onChange={e => {
                                  updateSave(save => {
                                    save.setQuestStatus(q.id, e.target.value)
                                  })
                                }}
                                disabled={
                                  save.getQuestStatus(q.id) == gameData.QUEST_STATUS_IN_PROGRESS
                                }
                              >
                                {Object.entries(gameData.questStatusNames).map(([status, name]) => (
                                  <option
                                    key={status}
                                    value={status}
                                    disabled={status == gameData.QUEST_STATUS_IN_PROGRESS}
                                  >
                                    {name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <QuestTimeInput
                                value={save.getQuestTime(q.id)}
                                onChange={time => {
                                  updateSave(save => {
                                    save.setQuestTime(q.id, time)
                                  })
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )

              case 4:
                return (
                  <div className="accolades-tab tab-content">
                    <table>
                      <thead>
                        <tr>
                          {/* <th>#</th> */}
                          <th>accolade</th>
                          <th>unlocked</th>
                          <th>
                            <Button
                              onClick={e => {
                                const checked = !save.isAccoladeUnlocked(3)
                                updateSave(save => {
                                  gameData.accolades
                                    .filter(a => a.name[save.getProfileGender()] && !a.firstClear)
                                    .forEach(a => {
                                      save.setAccoladeUnlocked(a.id, checked)
                                    })
                                })
                              }}
                            >
                              unlock all
                            </Button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameData.accolades
                          .filter(a => a.name[save.getProfileGender()])
                          .map((a, i) => (
                            <tr key={a.id}>
                              {/* <td>{i + 1}</td> */}
                              <td>{a.name[save.getProfileGender()]}</td>
                              <td>
                                <Input
                                  type="checkbox"
                                  checked={save.isAccoladeUnlocked(a.id)}
                                  onChange={e => {
                                    updateSave(save => {
                                      if (a.firstClear) {
                                        data.accolades
                                          .filter(a => a.firstClear)
                                          .forEach(a => {
                                            save.setAccoladeUnlocked(a.id, false)
                                          })
                                      }
                                      //TODO: also change the firstclear data when i get to that...
                                      save.setAccoladeUnlocked(a.id, e.target.checked)
                                    })
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )
            }
          })()}
        </>
      </Card>
    </div>
  )
}
