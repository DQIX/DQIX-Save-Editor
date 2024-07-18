import gameData from "../../game/data"

import { ItemIcon } from "../atoms/Icon"
import "./ItemSelect.scss"

export default props => {
  const selected = gameData.items[props.id]

  return (
    <div className="item-select">
      <ItemIcon
        icon={selected?.icon}
        style={{
          opacity: selected ? 1 : 0,
        }}
      />
      <select defaultValue={props.id} onChange={props.onChange} disabled={props.disabled}>
        <option value={props.nothingValue || 0xffffff}>{props.nothingName}</option>
        {Array.isArray(props.items)
          ? props.items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))
          : Object.entries(props.items).map(([key, items]) => (
              <optgroup key={key} label={key}>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
      </select>
    </div>
  )
}
