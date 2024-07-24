import { useContext } from "react"
import { SaveManagerContext } from "../../SaveManagerContext"

import "./HexEditor.scss"

import Card from "../atoms/Card"
import Input from "../atoms/Input"

function toHexChar(b) {
  if (
    (b > 47 && b < 58) ||
    b == 32 ||
    b == 13 ||
    (b > 64 && b < 91) ||
    (b > 95 && b < 112) ||
    (b > 185 && b < 193) ||
    (b > 218 && b < 223)
  ) {
    return String.fromCharCode(b)
  } else {
    return "."
  }
}

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)
  console.log(save.buffer.map)

  //   const subLength = save.buffer.length
  const subLength = 800

  return (
    <div className="hex-root">
      <Card className="hex-editor">
        <div className="hex">
          {Array.from({ length: subLength }, (_, i) => {
            const b = save.buffer[i]

            return (
              <Input type="text" value={b.toString(16).padStart(2, "0")} size={2} maxlength={2} />
            )
          })}
        </div>
        <div className="ascii">
          {Array.from({ length: subLength }, (_, i) => {
            const b = save.buffer[i]

            return <span>{toHexChar(b) || "."}</span>
          })}
        </div>
      </Card>
    </div>
  )
}
// b.toString(16).padStart(2, "0")
