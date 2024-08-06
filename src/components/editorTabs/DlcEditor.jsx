import { useContext, useState } from "react"

import "./DlcEditor.scss"

import gameData from "../../game/data"
import Card from "../atoms/Card"
import ItemSelect from "../atoms/ItemSelect"
import Input from "../atoms/Input"
import TimeInput from "../atoms/TimeInput"
import SaveManager from "../../saveManager"
import { SaveManagerContext } from "../../SaveManagerContext"
import Textarea from "../atoms/Textarea"
import { DQVC_MESSAGE_LENGTH } from "../../game/layout"

export default props => {
  const { save, updateSave } = useContext(SaveManagerContext)
  const [listing, setListing] = useState(gameData.dqvcListings.length)

  return (
    <div className="dlc-root">
      <Card label="special guests:" className="special-guests">
        <div>
          {gameData.specialGuests.map((name, i) => (
            <label key={i}>
              <Input
                type="checkbox"
                checked={save.isSpecialGuestVisiting(i)}
                onChange={e => {
                  updateSave(save => {
                    save.setSpecialGuestVisiting(i, e.target.checked)
                  })
                }}
              />
              {name}
            </label>
          ))}
        </div>
      </Card>
      <Card label="dqvc store:" className="dqvc">
        <table>
          <thead>
            <tr>
              <th style={{ width: "60%" }}>
                <small>item</small>
              </th>
              <th style={{ width: "20%" }}>
                <small>price</small>
              </th>
              <th style={{ width: "100%" }}>
                <small>stock</small>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, i) => {
              return (
                <tr key={i}>
                  <td>
                    <ItemSelect
                      items={gameData.itemTables}
                      nothingName={"---"}
                      nothingValue={0xffff}
                      id={save.getDqvcItem(i)}
                      onChange={e => {
                        updateSave(save => {
                          save.setDqvcItem(i, e.target.value)
                        })
                      }}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      min={0}
                      max={33554431}
                      size={10}
                      value={save.getDqvcPrice(i)}
                      onChange={e => {
                        updateSave(save => {
                          save.setDqvcPrice(i, e.target.value)
                        })
                      }}
                    />
                    g
                  </td>
                  <td>
                    <Input
                      type="number"
                      min={0}
                      max={127}
                      size={4}
                      value={save.getDqvcStock(i)}
                      onChange={e => {
                        updateSave(save => {
                          save.setDqvcStock(i, e.target.value)
                        })
                      }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p>
          <small>past listings:</small>
        </p>
        <select
          value={listing}
          onChange={e => {
            setListing(e.target.value)
          }}
        >
          <option value={gameData.dqvcListings.length}>---</option>
          {gameData.dqvcListings.map((listing, i) => (
            <option key={i} value={i}>
              {listing.name}
            </option>
          ))}
        </select>
        {gameData.dqvcListings[listing] && (
          <>
            <button
              className="randomize"
              onClick={e => {
                const l = gameData.dqvcListings[listing]
                let idxs = new Set()
                while (idxs.size != 6) {
                  idxs.add(Math.floor(Math.random() * l.items.length))
                }

                idxs = [...idxs]

                for (let i = 0; i < 6; i++) {
                  const idx = idxs[i]
                  save.setDqvcItem(i, l.items[idx].itemId)
                  save.setDqvcPrice(i, l.items[idx].price)
                  save.setDqvcStock(i, 1)
                }
                updateSave(save => {})
              }}
            >
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <a href={gameData.dqvcListings[listing].link} target="_blank">
              yab's list
            </a>
          </>
        )}
      </Card>
      <Card label="dqvc message:" className="dqvc-msg">
        <Textarea
          type="text"
          value={save.getDqvcMessage()}
          maxLength={DQVC_MESSAGE_LENGTH}
          onChange={e => {
            updateSave(save => {
              save.setDqvcMessage(e.target.value)
            })
          }}
        />
        <TimeInput
          label="expires:"
          value={save.getDqvcMessageExpiryTime()}
          onChange={time => {
            updateSave(save => {
              save.setDqvcMessageExpiryTime(time)
            })
          }}
        />
      </Card>

      {/* TODO: */}
      {/* <Card label="unlock:" className="unlock">
        // - unlock dlc all quests
        // - set all special guests to be visiting
        <button>unlock all</button>
        // - give all dlc exclusive items?
        <button>unlock all with items</button>
      </Card> */}
    </div>
  )
}
