import { useContext, useState } from "react"
import { SaveManagerContext } from "../../SaveManagerContext"
import SaveManager from "../../saveManager"

import gameData from "../../game/data"

import "./InnEditor.scss"

import Card from "../atoms/Card"
import Input from "../atoms/Input"
import TimeInput from "../atoms/TimeInput"
import { VocationIcon } from "../atoms/Icon"
import EquipmentCard from "./inputs/EquipmentCard"
import AppearanceCards from "./inputs/AppearanceCards"
import GenderToggle from "./inputs/GenderToggle"
import { VocationSelect } from "../atoms/IconSelect"

export default props => {
  let { save, updateSave } = useContext(SaveManagerContext)
  let [guest, setGuest] = useState(2)

  return (
    <div className="inn-root">
      <div className="sidebar">
        <Card label="inn level:" className="instance">
          <label>
            <Input
              type="number"
              min={0}
              max={6}
              size={4}
              value={save.getInnLevel()}
              onChange={e => {
                updateSave(save => {
                  save.setInnLevel(e.target.value)
                })
              }}
            />
          </label>
        </Card>
        <Card label="canvased guests:" className="guest-list canvased-guests">
          <ul>
            {Array.from({ length: 30 }, (_, i) => ({
              idx: save.getCanvasedGuestIndex(i),
              guest: i,
            }))
              .filter(guest => guest.idx != 0)
              .map((x, i) => (
                <li
                  key={i}
                  className={x.guest == guest ? "active" : ""}
                  onClick={_ => setGuest(x.guest)}
                >
                  {save.getCanvasedGuestName(x.guest) || "(unnamed)"}
                </li>
              ))}
          </ul>
        </Card>
      </div>
      <div className="guest-editor">
        <div className="guest-grid">
          <Card className="guest-header">
            <GenderToggle
              gender={save.getGuestGender(guest)}
              onChange={gender => {
                updateSave(save => {
                  save.setGuestGender(guest, gender)
                })
              }}
            />
            <VocationSelect
              id={save.getGuestVocation(guest)}
              onChange={e => {
                updateSave(save => {
                  save.setGuestVocation(guest, e.target.value)
                })
              }}
            />

            <Input
              type="text"
              value={save.getCanvasedGuestName(guest)}
              placeholder="name"
              onChange={e => {
                updateSave(save => {
                  save.setCanvasedGuestName(guest, e.target.value)
                })
              }}
              style={{ display: "inline-block", marginLeft: "1em" }}
            />
          </Card>
          <EquipmentCard
            i={guest}
            getter={(i, type) => {
              return save.getGuestEquipment(i, type)
            }}
            setter={(i, type, value) => {
              updateSave(save => {
                save.setGuestEquipment(i, type, value)
              })
            }}
          />
          <Card label="profile:" className="profile">
            <div>
              <label>
                <span>location:</span>
                <select
                  value={save.getCanvasedGuestOrigin(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setCanvasedGuestOrigin(guest, e.target.value)
                    })
                  }}
                >
                  {Object.entries(gameData.guestOrigins).map(([id, origin]) => (
                    <option value={id} key={id}>
                      {origin}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>birthday:</span>
                <TimeInput
                  value={save.getGuestBirthday(guest)}
                  onChange={time => {
                    updateSave(save => {
                      save.setGuestBirthday(guest, time)
                    })
                  }}
                  noHours
                />
                <label>
                  <span>secret:</span>
                  <Input
                    type="checkbox"
                    checked={save.isGuestAgeSecret(guest)}
                    onChange={e => {
                      updateSave(save => {
                        save.setGuestAgeSecret(guest, e.target.checked)
                      })
                    }}
                  />
                </label>
              </label>
              <label>
                <span>title:</span>
                <select
                  value={save.getCanvasedGuestTitle(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setCanvasedGuestTitle(guest, e.target.value)
                    })
                  }}
                >
                  {Object.entries(gameData.titles)
                    .filter(([_, title]) => title[save.getGuestGender(guest)])
                    .map(([id, title]) => (
                      <option value={id} key={id}>
                        {title[save.getGuestGender(guest)]}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>speech style:</span>
                <select
                  value={save.getCanvasedGuestSpeechStyle(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setCanvasedGuestSpeechStyle(guest, e.target.value)
                    })
                  }}
                >
                  {gameData.speechStyles.map((style, i) => (
                    <option key={i} value={i}>
                      {style}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>message:</span>
                <Input
                  type="text"
                  value={save.getGuestMessage(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestMessage(guest, e.target.value)
                    })
                  }}
                />
              </label>
              {/* <Textarea
                value={save.getGuestMessage(guest)}
                onChange={e => {
                  updateSave(save => {
                    })

                    save.setGuestMessage(guest, e.target.value)
                }}
              /> */}
            </div>
          </Card>
          <Card label="records:" className="records">
            <label>
              <span>battle victories:</span>
              <Input
                type="number"
                value={save.getGuestBattleVictories(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestBattleVictories(guest, e.target.value)
                  })
                }}
              />
            </label>
            <label>
              <span>times alchemy performed:</span>
              <Input
                type="number"
                value={save.getGuestAlchemyCount(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestAlchemyCount(guest, e.target.value)
                  })
                }}
              />
            </label>
            <label>
              <span>accolades earnt:</span>
              <Input
                type="number"
                value={save.getGuestAccoladeCount(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestAccoladeCount(guest, e.target.value)
                  })
                }}
              />
            </label>
            <label>
              <span>quests completed:</span>
              <Input
                type="number"
                value={save.getGuestQuestsCompleted(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestQuestsCompleted(guest, e.target.value)
                  })
                }}
              />
            </label>
            <label>
              <span>grottos completed:</span>
              <Input
                type="number"
                value={save.getGuestGrottosCompleted(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestGrottosCompleted(guest, e.target.value)
                  })
                }}
              />
            </label>
            <label>
              <span>guests canvased:</span>
              <Input
                type="number"
                value={save.getGuestGuestsCanvased(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestGuestsCanvased(guest, e.target.value)
                  })
                }}
              />
            </label>

            <label>
              <span>defeated monster list completion:</span>
              <Input
                type="number"
                value={save.getGuestMonsterCompletion(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestMonsterCompletion(guest, e.target.value)
                  })
                }}
                min={0}
                max={100}
                size={4}
              />
              %
            </label>
            <label>
              <span>wardrobe completion:</span>
              <Input
                type="number"
                value={save.getGuestWardrobeCompletion(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestWardrobeCompletion(guest, e.target.value)
                  })
                }}
                min={0}
                max={100}
                size={4}
              />
              %
            </label>
            <label>
              <span>item list completion:</span>
              <Input
                type="number"
                value={save.getGuestItemCompletion(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestItemCompletion(guest, e.target.value)
                  })
                }}
                min={0}
                max={100}
                size={4}
              />
              %
            </label>
            <label>
              <span>alchenomicon completion:</span>
              <Input
                type="number"
                value={save.getGuestAlchenomiconCompletion(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestAlchenomiconCompletion(guest, e.target.value)
                  })
                }}
                min={0}
                max={100}
                size={4}
              />
              %
            </label>
          </Card>

          <AppearanceCards
            gender={save.getGuestGender(guest)}
            getCharacterFace={() => {
              return save.getGuestFace(guest)
            }}
            setCharacterFace={v => {
              updateSave(save => {
                save.setGuestFace(guest, v)
              })
            }}
            getCharacterHairstyle={() => {
              return save.getGuestHairstyle(guest)
            }}
            setCharacterHairstyle={v => {
              updateSave(save => {
                save.setGuestHairstyle(guest, v)
              })
            }}
            getCharacterEyeColor={() => {
              return save.getGuestEyeColor(guest)
            }}
            setCharacterEyeColor={v => {
              updateSave(save => {
                save.setGuestEyeColor(guest, v)
              })
            }}
            getCharacterSkinColor={() => {
              return save.getGuestSkinColor(guest)
            }}
            setCharacterSkinColor={v => {
              updateSave(save => {
                save.setGuestSkinColor(guest, v)
              })
            }}
            getCharacterHairColor={() => {
              return save.getGuestHairColor(guest)
            }}
            setCharacterHairColor={v => {
              updateSave(save => {
                save.setGuestHairColor(guest, v)
              })
            }}
            getCharacterBodyTypeW={() => {
              return save.getGuestBodyTypeW(guest)
            }}
            getCharacterBodyTypeH={() => {
              return save.getGuestBodyTypeH(guest)
            }}
            setCharacterBodyType={(w, h) => {
              updateSave(save => {
                save.setGuestBodyTypeW(guest, w)
                save.setGuestBodyTypeH(guest, h)
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
