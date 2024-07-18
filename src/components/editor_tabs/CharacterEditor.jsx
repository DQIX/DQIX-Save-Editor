import { useContext } from "react"

import "./CharacterEditor.scss"

import SaveManager from "../../saveManager"
import TextInput from "../atoms/TextInput"
import { ItemIcon, VocationIcon } from "../atoms/Icon"
import { SaveManagerContext } from "../../SaveManagerContext"
import GameData from "../../game/data"
import ItemSelect from "../atoms/ItemSelect.jsx"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  return (
    <div>
      {Array.from({ length: save.getCharacterCount() }, (_, i) => (
        <div className="character-root" key={i}>
          <div className="character-header" style={{ gridArea: "1 / 1 / 2 / 5" }}>
            <VocationIcon icon={GameData.vocations[save.getCharacterVocation(i)].icon} />
            <TextInput
              value={save.getCharacterName(i)}
              onChange={e => {
                save.writeCharacterName(i, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
              style={{ display: "inline-block", marginLeft: "1em" }}
            />
          </div>
          <div
            className="item-list"
            style={{
              gridArea: "2 / 1 / 4 / 2",
            }}
          >
            <p>equipment:</p>
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
              items={GameData.torso_equipment}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_TORSO)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_TORSO, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.arm_equipment}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_ARM)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_ARM, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.leg_equipment}
              id={save.getCharacterEquipment(i, GameData.ITEM_TYPE_LEGS)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(i, GameData.ITEM_TYPE_LEGS, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={GameData.feet_equipment}
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
          </div>

          <div
            className="item-list"
            style={{
              gridArea: "2 / 2 / 4 / 3",
            }}
          >
            <p>held items:</p>
            {Array.from({ length: 8 }, (_, j) => (
              <ItemSelect
                key={j}
                items={GameData.everydayItems}
                id={save.getHeldItem(i, j)}
                nothingName={"---"}
                nothingValue={0xffff}
                onChange={e => {
                  save.setHeldItem(i, j, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
