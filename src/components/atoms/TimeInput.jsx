import "./TimeInput.scss"

import Input from "./Input"
import Button from "./Button"

import {
  getDayFromTime,
  getHourFromTime,
  getMonthFromTime,
  getYearFromTime,
  updateDayFromTime,
  updateHourFromTime,
  updateMonthFromTime,
  updateYearFromTime,
  timeFromDateObject,
} from "../../game/time"

export default props => (
  <div className="time-input">
    {props.label}
    <label>
      <Input
        type="number"
        value={getDayFromTime(props.value)}
        onChange={e => {
          props.onChange && props.onChange(updateDayFromTime(props.value, e.target.value))
        }}
        min={1}
        max={31}
        size={3}
      />
    </label>
    /
    <label>
      <Input
        type="number"
        value={getMonthFromTime(props.value)}
        onChange={e => {
          props.onChange && props.onChange(updateMonthFromTime(props.value, e.target.value))
        }}
        min={1}
        max={12}
        size={3}
      />
    </label>
    /
    <label>
      <Input
        type="number"
        value={getYearFromTime(props.value)}
        onChange={e => {
          props.onChange && props.onChange(updateYearFromTime(props.value, e.target.value))
        }}
        min={0}
        max={4095}
        size={5}
      />
    </label>
    :
    <label>
      <Input
        type="number"
        value={getHourFromTime(props.value)}
        onChange={e => {
          props.onChange && props.onChange(updateHourFromTime(props.value, e.target.value))
        }}
        min={0}
        max={23}
        size={3}
      />
    </label>
    <Button
      onClick={e => {
        props.onChange && props.onChange(timeFromDateObject(new Date()))
      }}
    >
      today
    </Button>
  </div>
)
