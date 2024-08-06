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

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)
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
                save.setInnLevel(e.target.value)
                setSave(new SaveManager(save.buffer))
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
                  {save.getCanvasedGuestName(x.guest) || "\u00A0"}
                </li>
              ))}
          </ul>
        </Card>
      </div>
      <div className="guest-editor">
        <div className="guest-grid">
          <Card className="guest-header">
            <VocationIcon icon={gameData.vocationTable[save.getGuestVocation(guest)].icon} />
            <Input
              type="text"
              value={save.getCanvasedGuestName(guest)}
              placeholder="name"
              onChange={e => {
                save.setCanvasedGuestName(guest, e.target.value)
                setSave(new SaveManager(save.buffer))
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
              save.setGuestEquipment(i, type, value)
              setSave(new SaveManager(save.buffer))
            }}
          />
          <Card label="profile:" className="profile">
            <div>
              <label>
                <span>location:</span>
                <select
                  value={save.getCanvasedGuestOrigin(guest)}
                  onChange={e => {
                    save.setCanvasedGuestOrigin(guest, e.target.value)
                    setSave(new SaveManager(save.buffer))
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
                    save.setGuestBirthday(guest, time)
                    setSave(new SaveManager(save.buffer))
                  }}
                  noHours
                />
                <label>
                  <span>secret:</span>
                  <Input
                    type="checkbox"
                    checked={save.isGuestAgeSecret(guest)}
                    onChange={e => {
                      save.setGuestAgeSecret(guest, e.target.checked)
                      setSave(new SaveManager(save.buffer))
                    }}
                  />
                </label>
              </label>
              <label>
                <span>title:</span>
                <select
                  value={save.getCanvasedGuestTitle(guest)}
                  onChange={e => {
                    save.setCanvasedGuestTitle(guest, e.target.value)
                    setSave(new SaveManager(save.buffer))
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
                    save.setCanvasedGuestSpeechStyle(guest, e.target.value)
                    setSave(new SaveManager(save.buffer))
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
                    save.setGuestMessage(guest, e.target.value)
                    setSave(new SaveManager(save.buffer))
                  }}
                />
              </label>
              {/* <Textarea
                value={save.getGuestMessage(guest)}
                onChange={e => {
                  save.setGuestMessage(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
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
                  save.setGuestBattleVictories(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
            <label>
              <span>times alchemy performed:</span>
              <Input
                type="number"
                value={save.getGuestAlchemyCount(guest)}
                onChange={e => {
                  save.setGuestAlchemyCount(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
            <label>
              <span>accolades earnt:</span>
              <Input
                type="number"
                value={save.getGuestAccoladeCount(guest)}
                onChange={e => {
                  save.setGuestAccoladeCount(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
            <label>
              <span>quests completed:</span>
              <Input
                type="number"
                value={save.getGuestQuestsCompleted(guest)}
                onChange={e => {
                  save.setGuestQuestsCompleted(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
            <label>
              <span>grottos completed:</span>
              <Input
                type="number"
                value={save.getGuestGrottosCompleted(guest)}
                onChange={e => {
                  save.setGuestGrottosCompleted(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
            <label>
              <span>guests canvased:</span>
              <Input
                type="number"
                value={save.getGuestGuestsCanvased(guest)}
                onChange={e => {
                  save.setGuestGuestsCanvased(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>

            <label>
              <span>defeated monster list completion:</span>
              <Input
                type="number"
                value={save.getGuestMonsterCompletion(guest)}
                onChange={e => {
                  save.setGuestMonsterCompletion(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
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
                  save.setGuestWardrobeCompletion(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
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
                  save.setGuestItemCompletion(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
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
                  save.setGuestAlchenomiconCompletion(guest, e.target.value)
                  setSave(new SaveManager(save.buffer))
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
              save.setGuestFace(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterHairstyle={() => {
              return save.getGuestHairstyle(guest)
            }}
            setCharacterHairstyle={v => {
              save.setGuestHairstyle(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterEyeColor={() => {
              return save.getGuestEyeColor(guest)
            }}
            setCharacterEyeColor={v => {
              save.setGuestEyeColor(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterSkinColor={() => {
              return save.getGuestSkinColor(guest)
            }}
            setCharacterSkinColor={v => {
              save.setGuestSkinColor(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterHairColor={() => {
              return save.getGuestHairColor(guest)
            }}
            setCharacterHairColor={v => {
              save.setGuestHairColor(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterBodyTypeW={() => {
              return save.getGuestBodyTypeW(guest)
            }}
            getCharacterBodyTypeH={() => {
              return save.getGuestBodyTypeH(guest)
            }}
            setCharacterBodyTypeW={v => {
              save.setGuestBodyTypeW(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            setCharacterBodyTypeH={v => {
              save.setGuestBodyTypeH(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
          />
        </div>
      </div>
    </div>
  )
}
