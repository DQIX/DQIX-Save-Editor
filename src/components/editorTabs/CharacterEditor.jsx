import { useContext, useState } from "react"

import "./CharacterEditor.scss"

import SaveManager from "../../saveManager.js"
import Input from "../atoms/Input.jsx"
import { ItemIcon, VocationIcon } from "../atoms/Icon.jsx"
import { SaveManagerContext } from "../../SaveManagerContext.jsx"
import GameData from "../../game/data.js"
import ItemSelect from "../atoms/ItemSelect.jsx"
import Card from "../atoms/Card.jsx"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)
  let [character, setCharacter] = useState(save.getStandbyCount())

  return (
    <div className="character-root">
      <Card label="characters:" className="character-list">
        <p>
          <small>party:</small>
        </p>
        <ul>
          {Array.from({ length: save.getPartyCount() }, (_, i) => {
            const hero = i == 0
            i += save.getStandbyCount()
            return (
              <li className={i == character ? "active" : ""} onClick={_ => setCharacter(i)}>
                {save.getCharacterName(i)} <span>{hero && "🪽"}</span>
              </li>
            )
          })}
        </ul>
        <p>
          <small>inn:</small>
        </p>
        <ul>
          {Array.from({ length: save.getStandbyCount() }, (_, i) => (
            <li className={i == character ? "active" : ""} onClick={_ => setCharacter(i)}>
              {save.getCharacterName(i)}
            </li>
          ))}
        </ul>
      </Card>

      <div className="character-editor">
        <Card className="character-header">
          <VocationIcon icon={GameData.vocationTable[save.getCharacterVocation(character)].icon} />
          <Input
            type="text"
            value={save.getCharacterName(character)}
            onChange={e => {
              save.writeCharacterName(character, e.target.value)
              setSave(new SaveManager(save.buffer))
            }}
            style={{ display: "inline-block", marginLeft: "1em" }}
          />
        </Card>
        <div className="character-grid">
          <Card label="equipment:" className="item-list">
            <ItemSelect
              items={GameData.weaponsTable}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              id={save.getCharacterEquipment(character, GameData.ITEM_TYPE_WEAPON)}
              onChange={e => {
                save.setCharacterEquipment(character, GameData.ITEM_TYPE_WEAPON, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.shields}
              id={save.getCharacterEquipment(character, GameData.ITEM_TYPE_SHIELD)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, GameData.ITEM_TYPE_SHIELD, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.headEquipment}
              id={save.getCharacterEquipment(character, GameData.ITEM_TYPE_HEAD)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, GameData.ITEM_TYPE_HEAD, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.torsoEquipment}
              id={save.getCharacterEquipment(character, GameData.ITEM_TYPE_TORSO)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, GameData.ITEM_TYPE_TORSO, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.armEquipment}
              id={save.getCharacterEquipment(character, GameData.ITEM_TYPE_ARM)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, GameData.ITEM_TYPE_ARM, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.legEquipment}
              id={save.getCharacterEquipment(character, GameData.ITEM_TYPE_LEGS)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, GameData.ITEM_TYPE_LEGS, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.feetEquipment}
              id={save.getCharacterEquipment(character, GameData.ITEM_TYPE_FEET)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, GameData.ITEM_TYPE_FEET, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.accessories}
              id={save.getCharacterEquipment(character, GameData.ITEM_TYPE_ACCESSORY)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, GameData.ITEM_TYPE_ACCESSORY, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
          </Card>

          <Card
            label="held items:"
            className={`item-list ${save.inParty(character) ? "" : "disabled"}`}
          >
            {Array.from({ length: 8 }, (_, j) => (
              <ItemSelect
                key={j}
                items={GameData.everydayItems}
                id={save.getHeldItem(character, j)}
                nothingName={"---"}
                nothingValue={0xffff}
                disabled={!save.inParty(character)}
                onChange={e => {
                  save.setHeldItem(character, j, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
