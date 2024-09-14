import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import gameData from "../../game/data"
import { annotations } from "../../game/layout"

import "./HexEditor.scss"

import Card from "../atoms/Card"
import Input from "../atoms/Input"
import { ItemIcon } from "../atoms/Icon"
import Virtualizer from "../containers/Virtualizer"
import { stringTables } from "../../game/string"

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
                const n = parseInt(e.target.value, 16)
                if (isNaN(n)) {
                  return
                }

                if (0 <= n && n <= 255) {
                  props.onChange && props.onChange(props.i + i, n)
                }
              }}
              onFocus={e => {
                props.select && props.select(props.i + i)
              }}
              size={2}
              className={props.i + i === props.selected ? "selected" : ""}
            />
          )
        })}
      </div>
      <div className="ascii">
        {Array.from({ length: props.length }, (_, i) => {
          const b = props.buffer[props.i + i]
          // return <span key={i}>{toHexChar(b) || "."}</span>
          return <span key={i}>{(b && b != 0xff && stringTables.encode[b]) || "."}</span>
        })}
      </div>
    </div>
  )
}

export default props => {
  let { save, updateSave } = useContext(SaveManagerContext)

  let [selected, setSelected] = useState(null)

  const rowLen = 16

  let activeAnnotation = null
  let annotation = []

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
        <Virtualizer overscan={200} height={(save.buffer.buffer.length / rowLen) * 30}>
          {[
            ...annotations.map((a, i) => {
              const active =
                typeof selected == "number" && a.begin <= selected && selected < a.begin + a.length

              if (active) {
                activeAnnotation = i
                annotation.push(a)
              }

              return (
                <div
                  key={i}
                  className={`annotation ${active ? "selected" : ""}`}
                  style={{
                    position: "absolute",
                    top: Math.floor(a.begin / rowLen) * 30,
                    height: Math.floor(1 + ((a.begin % rowLen) + a.length) / rowLen) * 30,
                    width: rowLen * 30,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: a.color,
                      position: "absolute",
                      top: 0,
                      left: (a.begin % rowLen) * 30 + 3,
                      height: 30,
                      width: Math.min(a.length, rowLen - (a.begin % rowLen)) * 30 - 6,
                    }}
                  ></div>
                  <div
                    style={{
                      backgroundColor: a.color,
                      position: "absolute",
                      top: 30,
                      bottom: 30,
                      width: rowLen * 30 - 6,
                      left: 3,
                    }}
                  ></div>

                  {(a.begin % rowLen) + a.length > rowLen && (
                    <div
                      style={{
                        backgroundColor: a.color,
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        height: 30,
                        width: Math.min(a.length, (a.begin + a.length) % rowLen) * 30 - 3,
                      }}
                    ></div>
                  )}
                </div>
              )
            }),
            ...Array.from({
              length: save.buffer.buffer.length / rowLen,
            }).map((_, i) => {
              return (
                <Row
                  key={i + annotations.length}
                  style={{
                    position: "absolute",
                    top: i * 30,
                    height: 30,
                  }}
                  buffer={save.buffer.buffer}
                  onChange={(offset, value) => {
                    updateSave(save => {
                      save.buffer.writeByte(value, offset)
                    })
                  }}
                  length={rowLen}
                  i={i * rowLen}
                  select={i => setSelected(i)}
                  selected={selected}
                />
              )
            }),
          ]}
        </Virtualizer>
      </Card>
      <Card label="inspector: " className="info">
        {typeof selected == "number" && (
          <>
            <table>
              <tbody>
                <tr>
                  <td>byte offset: </td>
                  <td>
                    0x{selected.toString(16).padStart(8, "0")} ({selected})
                  </td>
                </tr>
                <tr>
                  <td>binary: </td>
                  <td>{save.buffer.buffer[selected].toString(2).padStart(8, "0")}</td>
                </tr>
                <tr>
                  <td>octal: </td>
                  <td>{save.buffer.buffer[selected].toString(8).padStart(3, "0")}</td>
                </tr>
                <tr>
                  <td>hex: </td>
                  <td>{save.buffer.buffer[selected].toString(16).padStart(2, "0")}</td>
                </tr>
                <tr>
                  <td>u8: </td>
                  <td>{save.buffer.buffer.readUInt8(selected)}</td>
                </tr>
                <tr>
                  <td>i8: </td>
                  <td>{save.buffer.buffer.readInt8(selected)}</td>
                </tr>
                <tr>
                  <td>u16: </td>
                  <td>{save.buffer.buffer.readUInt16LE(selected)}</td>
                </tr>
                <tr>
                  <td>i16: </td>
                  <td>{save.buffer.buffer.readInt16LE(selected)}</td>
                </tr>
                <tr>
                  <td>u32: </td>
                  <td>{save.buffer.buffer.readUInt32LE(selected)}</td>
                </tr>
                <tr>
                  <td>i32: </td>
                  <td>{save.buffer.buffer.readInt32LE(selected)}</td>
                </tr>
                <tr>
                  <td>dqix character: </td>
                  <td>{stringTables.encode[save.buffer.buffer[selected]] || "?"}</td>
                </tr>
                <tr>
                  <td>item: </td>
                  <td>
                    {gameData.items[save.buffer.buffer.readUInt16LE(selected)] ? (
                      <>
                        <ItemIcon
                          icon={gameData.items[save.buffer.buffer.readUInt16LE(selected)].icon}
                        />
                        {gameData.items[save.buffer.buffer.readUInt16LE(selected)].name}
                      </>
                    ) : (
                      "unknown"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {typeof activeAnnotation == "number" && (
              <div>
                <p>annotation:</p>
                {annotation.map((a, i) => (
                  <span key={i}>
                    <span
                      style={{
                        borderBottom: `2px solid ${a.color}`,
                        margin: "0 0.4em",
                      }}
                    >
                      {a.name}
                    </span>
                    {i != annotation.length - 1 && ">"}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
