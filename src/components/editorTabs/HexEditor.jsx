import { forwardRef, useContext, useMemo, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import gameData from "../../game/data"

import "./HexEditor.scss"

import Card from "../atoms/Card"
import Input from "../atoms/Input"
import { ItemIcon } from "../atoms/Icon"
import Virtualizer from "../containers/Virtualizer"

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

const annotations = [
  {
    name: "magic number",
    begin: 0,
    length: 15,
  },
]

const Row = props => {
  return (
    <div className="row" style={{ ...props.style }}>
      <div className="offset">
        <span>{props.i.toString(16).padStart(8, 0)}</span>
      </div>
      <div className="hex">
        {Array.from({ length: props.length }, (_, i) => {
          const b = props.buffer[props.i + i]
          return (
            <Input
              key={i}
              type="text"
              value={b.toString(16).padStart(2, "0")}
              onChange={e => {
                //TODO: write
              }}
              onFocus={e => {
                props.select && props.select(props.i + i)
              }}
              size={2}
              maxLength={2}
              className={props.i + i === props.selected ? "selected" : ""}
            />
          )
        })}
      </div>
      <div className="ascii">
        {Array.from({ length: props.length }, (_, i) => {
          const b = props.buffer[props.i + i]
          return <span key={i}>{toHexChar(b) || "."}</span>
        })}
      </div>
    </div>
  )
}

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  let [selected, setSelected] = useState(null)

  const rowLen = 16

  return (
    <div className="hex-root">
      <Card className="hex-editor">
        <div className="row header">
          <div className="offset" style={{ opacity: 0 }}>
            <span>00000000</span>
          </div>
          <div className="hex">
            {Array.from({ length: rowLen }, (_, i) => {
              return <Input key={i} type="text" value={i.toString(16).padStart(2, "0")} disabled />
            })}
          </div>
          <div className="ascii">
            <p
              style={{
                position: "absolute",
                margin: 0,
              }}
            >
              decoded:
            </p>
            <span
              style={{
                opacity: 0,
                pointerEvents: "none",
                marginLeft: "0",
              }}
            >
              DRAGON QUEST IX.
            </span>
          </div>
        </div>
        <Virtualizer overscan={200} height={(save.buffer.length / rowLen) * 30}>
          {Array.from({
            length: save.buffer.length / rowLen,
          }).map((_, i) => (
            <Row
              key={i}
              style={{
                position: "absolute",
                top: i * 30,
                height: 30,
              }}
              buffer={save.buffer}
              length={rowLen}
              i={i * rowLen}
              select={i => setSelected(i)}
              selected={selected}
            />
          ))}
        </Virtualizer>
      </Card>
      <Card label="inspector: " className="info">
        {typeof selected == "number" && (
          <table>
            <tr>
              <td>byte offset: </td>
              <td>
                0x{selected.toString(16).padStart(8, "0")} ({selected})
              </td>
            </tr>
            <tr>
              <td>binary: </td>
              <td>{save.buffer[selected].toString(2).padStart(8, "0")}</td>
            </tr>
            <tr>
              <td>octal: </td>
              <td>{save.buffer[selected].toString(8).padStart(3, "0")}</td>
            </tr>
            <tr>
              <td>hex: </td>
              <td>{save.buffer[selected].toString(16).padStart(2, "0")}</td>
            </tr>
            <tr>
              <td>u8: </td>
              <td>{save.buffer.readUInt8(selected)}</td>
            </tr>
            <tr>
              <td>i8: </td>
              <td>{save.buffer.readInt8(selected)}</td>
            </tr>
            <tr>
              <td>u16: </td>
              <td>{save.buffer.readUInt16LE(selected)}</td>
            </tr>
            <tr>
              <td>i16: </td>
              <td>{save.buffer.readInt16LE(selected)}</td>
            </tr>
            <tr>
              <td>u32: </td>
              <td>{save.buffer.readUInt32LE(selected)}</td>
            </tr>
            <tr>
              <td>i32: </td>
              <td>{save.buffer.readInt32LE(selected)}</td>
            </tr>
            <tr>
              <td>item: </td>
              <td>
                {gameData.items[save.buffer.readUInt16LE(selected)] ? (
                  <>
                    <ItemIcon icon={gameData.items[save.buffer.readUInt16LE(selected)].icon} />
                    {gameData.items[save.buffer.readUInt16LE(selected)].name}
                  </>
                ) : (
                  "unknown"
                )}
              </td>
            </tr>
          </table>
        )}
      </Card>
    </div>
  )
}
