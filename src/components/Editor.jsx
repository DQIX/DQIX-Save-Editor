import { useContext } from "react"

import "./Editor.scss"

import TextInput from "./atoms/TextInput"
import { ItemIcon, VocationIcon } from "./atoms/Icon"
import { SaveManagerContext } from "../SaveManagerContext"
import SaveManager from "../saveManager"
import game_data from "../game/data"
import Select from "./atoms/Select"

const Equipped = props => {
  const selected = game_data.items[props.id]

  return (
    <div>
      <ItemIcon
        icon={selected?.icon}
        style={{
          marginRight: "8px",
          opacity: selected ? 1 : 0,
        }}
      />
      <select
        defaultValue={props.id}
        {...props}
        style={{
          width: "180px",
          marginBottom: "4px",
        }}
      >
        <option value={0xffffff}>Nothing equipped</option>
        {props.items.map(item => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  )
}

const WeaponEquipped = props => {
  const selected = game_data.items[props.id]

  return (
    <div>
      <ItemIcon
        icon={selected?.icon}
        style={{
          marginRight: "8px",
          opacity: selected ? 1 : 0,
        }}
      />
      <Select
        defaultValue={props.id}
        {...props}
        style={{
          width: "180px",
          marginBottom: "4px",
        }}
      >
        <option value={0xffff}>Nothing equipped</option>
        {Object.entries(game_data.weaponsTable).map(([key, list]) => (
          <optgroup label={key}>
            {list.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </div>
  )
}

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  return (
    <>
      <div
        style={{
          display: "flex",
        }}
      >
        {Array.from({ length: save.getCharacterCount() }, (_, i) => (
          <div key={i} style={{ margin: "30px" }}>
            <div style={{ marginBottom: "1em" }}>
              <VocationIcon icon={game_data.vocations[save.getCharacterVocation(i)].icon} />
              <TextInput
                value={save.getCharacterName(i)}
                onChange={e => {
                  save.writeCharacterName(i, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
                style={{ display: "inline-block", marginLeft: "1em" }}
              />
            </div>
            <WeaponEquipped
              items={game_data.weapons}
              id={save.getCharacterEquipment(i, game_data.ITEM_TYPE_WEAPON)}
              onChange={e => {
                save.setCharacterEquipment(i, game_data.ITEM_TYPE_WEAPON, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <Equipped
              items={game_data.shields}
              id={save.getCharacterEquipment(i, game_data.ITEM_TYPE_SHIELD)}
              onChange={e => {
                save.setCharacterEquipment(i, game_data.ITEM_TYPE_SHIELD, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <Equipped
              items={game_data.headEquipment}
              id={save.getCharacterEquipment(i, game_data.ITEM_TYPE_HEAD)}
              onChange={e => {
                save.setCharacterEquipment(i, game_data.ITEM_TYPE_HEAD, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <Equipped
              items={game_data.torso_equipment}
              id={save.getCharacterEquipment(i, game_data.ITEM_TYPE_TORSO)}
              onChange={e => {
                save.setCharacterEquipment(i, game_data.ITEM_TYPE_TORSO, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <Equipped
              items={game_data.arm_equipment}
              id={save.getCharacterEquipment(i, game_data.ITEM_TYPE_ARM)}
              onChange={e => {
                save.setCharacterEquipment(i, game_data.ITEM_TYPE_ARM, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <Equipped
              items={game_data.leg_equipment}
              id={save.getCharacterEquipment(i, game_data.ITEM_TYPE_LEGS)}
              onChange={e => {
                save.setCharacterEquipment(i, game_data.ITEM_TYPE_LEGS, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <Equipped
              items={game_data.feet_equipment}
              id={save.getCharacterEquipment(i, game_data.ITEM_TYPE_FEET)}
              onChange={e => {
                save.setCharacterEquipment(i, game_data.ITEM_TYPE_FEET, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <Equipped
              items={game_data.accessories}
              id={save.getCharacterEquipment(i, game_data.ITEM_TYPE_ACCESSORY)}
              onChange={e => {
                save.setCharacterEquipment(i, game_data.ITEM_TYPE_ACCESSORY, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={e => {
          save.download()
        }}
      >
        export
      </button>
    </>
  )
}
