import { useRef } from "react"
import gameData from "../../game/data"

import { ItemIcon, VocationIcon } from "../atoms/Icon"
import "./IconSelect.scss"

export const ItemSelect = props => {
  const selected = gameData.items[props.id]
  const selectRef = useRef(null)

  return (
    <label className="icon-select" onClick={e => selectRef.current.click()}>
      <ItemIcon
        icon={selected?.icon}
        style={{
          opacity: selected ? 1 : 0,
        }}
      />
      <select ref={selectRef} value={props.id} onChange={props.onChange} disabled={props.disabled}>
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
    </label>
  )
}

export const VocationSelect = props => {
  const selected = gameData.vocationTable[props.id]
  const selectRef = useRef(null)

  return (
    <label className="icon-select vocation-select" onClick={e => selectRef.current.click()}>
      <VocationIcon
        icon={selected?.icon}
        style={{
          opacity: selected ? 1 : 0,
        }}
      />
      <select ref={selectRef} value={props.id} onChange={props.onChange} disabled={props.disabled}>
        {gameData.vocations.map(v => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
    </label>
  )
}
