import { useContext } from "react"

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

  return (
    <div>
      {Array.from({ length: save.getCharacterCount() }, (_, i) => (
        <div className="character-root" key={i}>
          <Card className="character-header" style={{ gridArea: "1 / 1 / 2 / 5" }}>
            <VocationIcon icon={GameData.vocations[save.getCharacterVocation(i)].icon} />
            <Input
              type="text"
              value={save.getCharacterName(i)}
              onChange={e => {
                save.writeCharacterName(i, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
              style={{ display: "inline-block", marginLeft: "1em" }}
            />
          </Card>
          <Card
            label="equipment:"
            className="item-list"
            style={{
              gridArea: "2 / 1 / 4 / 2",
            }}
          >
            <ItemSelect
              items={GameData.weaponsTable}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_WEAPON)}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_WEAPON, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.shields}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_SHIELD)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_SHIELD, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.headEquipment}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_HEAD)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_HEAD, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.torsoEquipment}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_TORSO)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_TORSO, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.armEquipment}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_ARM)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_ARM, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.legEquipment}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_LEGS)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_LEGS, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.feetEquipment}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_FEET)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_FEET, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.accessories}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_ACCESSORY)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_ACCESSORY, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
          </Card>

          <Card
            label="held items:"
            className={`item-list ${save.inParty(i) ? "" : "disabled"}`}
            style={{
              gridArea: "2 / 2 / 4 / 3",
            }}
          >
            {Array.from({ length: 8 }, (_, j) => (
              <ItemSelect
                key={j}
                items={GameData.everydayItems}
                id={save.getHeldItem(i, j)}
                nothingName={"---"}
                nothingValue={0xffff}
                disabled={!save.inParty(i)}
                onChange={e => {
                  save.setHeldItem(i, j, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}
