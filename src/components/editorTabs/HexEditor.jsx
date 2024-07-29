import { forwardRef, useContext, useState } from "react"

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

// CURSED: here `props.children` is not the children values
// instead its an object containing extra props that can't be sent. this is a
// bit of an abuse of what is meant but in this case its fine . probably
const Item = forwardRef((props, ref) => {
  if (props.children.row) {
    return (
      <Row
        vRef={ref}
        style={{ ...props.style }}
        buffer={props.children.buffer}
        length={props.children.rowLen}
        i={props.children.i * props.children.rowLen}
        select={i => props.children.setSelected(i)}
        selected={props.children.selected}
      />
    )
  } else if (props.children.annotation) {
    return (
      <div
        ref={ref}
        style={{
          ...props.style,
          position: "absolute",
          top: 28 * props.children.annotation.begin + "px",
          height: 28 + "px",
          width: 28 * props.children.annotation.length + "px",
          backgroundColor: "var(--accent-color)",
        }}
      ></div>
    )
  }
})

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  let [selected, setSelected] = useState(null)

  const rowLen = 16
  console.log(save.buffer.length)
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
        <Virtualizer overscan={200}>
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

          {/* {Array.from({ length: 100000 }, (_, i) => {
            function splitmix32(a) {
              return function () {
                a |= 0
                a = (a + 0x9e3779b9) | 0
                let t = a ^ (a >>> 16)
                t = Math.imul(t, 0x21f0aaad)
                t = t ^ (t >>> 15)
                t = Math.imul(t, 0x735a2d97)
                return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
              }
            }
            const rand = splitmix32(i)
            return (
              <div
                style={{
                  position: "absolute",
                  width: rand() * 200 + 10,
                  height: rand() * 200 + 10,
                  top: rand() * 100000,
                  left: rand() * 400,
                  opacity: 0.2,
                  backgroundColor: "var(--accent-fade)",
                }}
              ></div>
            )
          })} */}
        </Virtualizer>
        {/* <Virtualizer as="div" item={Item}>
          {Array.from({
            length: 800 / rowLen,
          }).map((_, i) => ({
            i,
            rowLen,
            buffer: save.buffer,
            selected,
            setSelected,
            row: true,
          }))}

          {annotations.map((annotation, i) => ({
            i: save.buffer.length / rowLen + i,
            rowLen,
            annotation,
          }))}
        </Virtualizer> */}
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
