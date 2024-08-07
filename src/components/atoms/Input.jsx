import { useState } from "react"
import "./Input.scss"

export default props => {
  // if (props.type == "number") {
  //   let [value, setValue] = useState(props.value)

  //   return (
  //     <input
  //       {...props}
  //       value={value}
  //       onChange={e => {
  //         setValue(e.target.value)
  //       }}
  //       onBlur={e => {
  //         if (value === undefined || value === "") {
  //           setValue(props.value)
  //         } else {
  //           props.onChange && props.onChange(e)
  //         }
  //       }}
  //     />
  //   )
  // } else {
  return <input {...props} />
  // }
}
