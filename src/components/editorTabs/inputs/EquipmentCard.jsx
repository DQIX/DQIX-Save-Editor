import Card from "../../atoms/Card"
import { ItemSelect } from "../../atoms/IconSelect"
import gameData from "../../../game/data"

import "./EquipmentCard.scss"

export default props => (
  <Card label="equipment:" className="equipment-card">
    <ItemSelect
      items={gameData.weaponsTable}
      nothingName={"Nothing Equipped"}
      nothingValue={0xffff}
      id={props.getter(props.i, gameData.ITEM_TYPE_WEAPON)}
      onChange={e => {
        props.setter(props.i, gameData.ITEM_TYPE_WEAPON, e.target.value)
      }}
    />
    <ItemSelect
      items={gameData.shields}
      id={props.getter(props.i, gameData.ITEM_TYPE_SHIELD)}
      nothingName={"Nothing Equipped"}
      nothingValue={0xffff}
      onChange={e => {
        props.setter(props.i, gameData.ITEM_TYPE_SHIELD, e.target.value)
      }}
    />
    <ItemSelect
      items={gameData.headEquipment}
      id={props.getter(props.i, gameData.ITEM_TYPE_HEAD)}
      nothingName={"Nothing Equipped"}
      nothingValue={0xffff}
      onChange={e => {
        props.setter(props.i, gameData.ITEM_TYPE_HEAD, e.target.value)
      }}
    />
    <ItemSelect
      items={gameData.torsoEquipment}
      id={props.getter(props.i, gameData.ITEM_TYPE_TORSO)}
      nothingName={"Nothing Equipped"}
      nothingValue={0xffff}
      onChange={e => {
        props.setter(props.i, gameData.ITEM_TYPE_TORSO, e.target.value)
      }}
    />
    <ItemSelect
      items={gameData.armEquipment}
      id={props.getter(props.i, gameData.ITEM_TYPE_ARM)}
      nothingName={"Nothing Equipped"}
      nothingValue={0xffff}
      onChange={e => {
        props.setter(props.i, gameData.ITEM_TYPE_ARM, e.target.value)
      }}
    />
    <ItemSelect
      items={gameData.legEquipment}
      id={props.getter(props.i, gameData.ITEM_TYPE_LEGS)}
      nothingName={"Nothing Equipped"}
      nothingValue={0xffff}
      onChange={e => {
        props.setter(props.i, gameData.ITEM_TYPE_LEGS, e.target.value)
      }}
    />
    <ItemSelect
      items={gameData.feetEquipment}
      id={props.getter(props.i, gameData.ITEM_TYPE_FEET)}
      nothingName={"Nothing Equipped"}
      nothingValue={0xffff}
      onChange={e => {
        props.setter(props.i, gameData.ITEM_TYPE_FEET, e.target.value)
      }}
    />
    <ItemSelect
      items={gameData.accessories}
      id={props.getter(props.i, gameData.ITEM_TYPE_ACCESSORY)}
      nothingName={"Nothing Equipped"}
      nothingValue={0xffff}
      onChange={e => {
        props.setter(props.i, gameData.ITEM_TYPE_ACCESSORY, e.target.value)
      }}
    />
  </Card>
)
