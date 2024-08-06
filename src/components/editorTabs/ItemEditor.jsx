import { useContext, useState } from "react"

import "./ItemEditor.scss"

import { SaveManagerContext } from "../../SaveManagerContext"
import gameData from "../../game/data"

import { ItemIcon } from "../atoms/Icon"
import Card from "../atoms/Card"
import Input from "../atoms/Input"

const ItemCard = props => {
  let { save, updateSave } = useContext(SaveManagerContext)

  const items = props.items.filter(
    item =>
      props.filter[item.item_type] &&
      item.name.toLowerCase().includes(props.filter.name.toLowerCase())
  )

  return items.length ? (
    <Card
      label={props.label}
      style={{ gridColumnStart: 2, gridColumnEnd: 5 }}
      className="item-card"
    >
      <div className="item-grid">
        {items.map(item => (
          <div key={item.id}>
            <Input
              type="number"
              name={item.name}
              value={save.getItemCount(item.id)}
              min={0}
              max={99}
              size="3"
              onChange={e => {
                updateSave(save => {
                  save.setItemCount(item.id, e.target.value)
                })
              }}
            />
            <span>
              <ItemIcon icon={item.icon} />
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  ) : (
    ""
  )
}

export default props => {
  let [filter, setFilter] = useState({
    name: "",
    [gameData.ITEM_TYPE_TORSO]: true,
    [gameData.ITEM_TYPE_LEGS]: true,
    [gameData.ITEM_TYPE_ARM]: true,
    [gameData.ITEM_TYPE_FEET]: true,
    [gameData.ITEM_TYPE_HEAD]: true,
    [gameData.ITEM_TYPE_WEAPON]: true,
    [gameData.ITEM_TYPE_SHIELD]: true,
    [gameData.ITEM_TYPE_ACCESSORY]: true,
    [gameData.ITEM_TYPE_COMMON]: true,
    [gameData.ITEM_TYPE_IMPORTANT]: true,
  })

  return (
    <div className="items-root">
      <Card label="filter:" className="config sidebar">
        <Input
          type="text"
          placeholder="search"
          value={filter.name}
          onChange={e => setFilter({ ...filter, name: e.target.value })}
        />
        <br />
        {gameData.itemTypes.map(type => (
          <label htmlFor={`item-type-filter-${type}`} key={type}>
            <Input
              type="checkbox"
              checked={filter[type]}
              onChange={e => setFilter({ ...filter, [type]: e.target.checked })}
              id={`item-type-filter-${type}`}
              name={gameData.itemTypeNames[type]}
            />

            {gameData.itemTypeNames[type]}
          </label>
        ))}
      </Card>
      <div className="item-cards">
        {gameData.itemTypes.map(type => (
          <ItemCard
            key={type}
            filter={filter}
            label={gameData.itemTypeNames[type] + ":"}
            items={gameData.itemTables[type]}
          />
        ))}
      </div>
    </div>
  )
}
