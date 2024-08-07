import { useContext } from "react"

import "./MiscEditor.scss"

import { SaveManagerContext } from "../../SaveManagerContext"
import Card from "../atoms/Card"
import Input from "../atoms/Input"
import SaveManager from "../../saveManager"
import { VocationIcon } from "../atoms/Icon"

import gameData from "../../game/data"

const TimeInput = props => {
  const time = [...props.value]
  return (
    <>
      <label>
        <Input
          type="number"
          value={props.value[0]}
          size={2}
          min={0}
          max={0xffff}
          onChange={
            props.onChange &&
            (e => {
              time[0] = e.target.value
              props.onChange(time)
            })
          }
        />
        h
      </label>
      <label>
        <Input
          type="number"
          value={props.value[1]}
          size={3}
          min={0}
          max={59}
          onChange={
            props.onChange &&
            (e => {
              time[1] = e.target.value
              props.onChange(time)
            })
          }
        />
        m
      </label>
      <label>
        <Input
          type="number"
          value={props.value[2]}
          size={3}
          min={0}
          max={59}
          onChange={
            props.onChange &&
            (e => {
              time[2] = e.target.value
              props.onChange(time)
            })
          }
        />
        s
      </label>
    </>
  )
}

export default props => {
  let { save, updateSave } = useContext(SaveManagerContext)

  return (
    <div className="misc-root">
      <Card label="play time:" className="play-time">
        <div>
          <span>total time:</span>{" "}
          <TimeInput
            value={save.getPlaytime()}
            onChange={value => {
              updateSave(save => {
                save.setPlaytime(value)
              })
            }}
          />
          <span>multiplayer:</span>{" "}
          <TimeInput
            value={save.getMultiplayerTime()}
            onChange={value => {
              updateSave(save => {
                save.setMultiplayerTime(value)
              })
            }}
          />
        </div>
      </Card>
      <Card label="gold:" className="gold">
        <div>
          <label htmlFor="hand-gold">on hand:</label>
          <Input
            id="hand-gold"
            type="number"
            value={save.getGoldOnHand()}
            onChange={e => {
              updateSave(save => {
                save.setGoldOnHand(e.target.value)
              })
            }}
          />
          <label htmlFor="hand-gold">g</label>
          <label htmlFor="bank-gold">in bank:</label>
          <Input
            id="bank-gold"
            type="number"
            value={save.getGoldInBank()}
            onChange={e => {
              updateSave(save => {
                save.setGoldInBank(e.target.value)
              })
            }}
          />
          <label htmlFor="bank-gold">g</label>
        </div>
        <p>
          <small>note that the bank can only be interacted with in units of 1000 in game.</small>
        </p>
      </Card>
      <Card label="party tricks:" className="party-tricks">
        <div>
          {(() => {
            return gameData.partyTricks
              .slice(gameData.LEARNABLE_PARTY_TRICK_START, gameData.LEARNABLE_PARTY_TRICK_END)
              .map((name, i) => (
                <label key={i}>
                  <Input
                    type="checkbox"
                    checked={save.getPartyTrickLearned(i)}
                    onChange={e => {
                      updateSave(save => {
                        save.setPartyTrickLearned(i, e.target.checked)
                      })
                    }}
                  />
                  <span>{name}</span>
                </label>
              ))
          })()}
        </div>
      </Card>
      <Card label="mini medals:" className="mini-medals">
        <Input
          type="number"
          style={{
            fontSize: "2.5em",
            width: "100%",
          }}
          value={save.getMiniMedals()}
          onChange={e => {
            updateSave(save => {
              save.setMiniMedals(e.target.value)
            })
          }}
        />
        <p>
          <small>counts all medals given to Cap'n Max Meddlin'</small>
        </p>
      </Card>
      <Card label="unlocked vocations:" className="unlocked-vocations">
        <div>
          {gameData.vocations
            .filter(v => v.unlockable)
            .map((v, i) => (
              <label key={i}>
                <Input
                  type="checkbox"
                  name={v.name}
                  checked={save.isVocationUnlocked(v.id)}
                  onChange={e => {
                    updateSave(save => {
                      save.setVocationUnlocked(v.id, e.target.checked)
                    })
                  }}
                />
                <VocationIcon icon={v.icon} />
              </label>
            ))}
        </div>
      </Card>

      <Card
        label={save.isQuickSave() ? "quick save location:" : "confessed save location:"}
        className="save-location"
      >
        <div>
          <label>
            <span>area:</span>
            <select
              name="save location"
              value={save.getSaveLocation()}
              onChange={e => {
                updateSave(save => {
                  save.setSaveLocation(e.target.value)
                })
              }}
            >
              {gameData.saveLocations.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <div className={save.isQuickSave() || "disabled"}>
            {["x", "y", "z"].map((c, i) => (
              <label key={i}>
                <span>{c}: </span>
                <Input
                  type="number"
                  disabled={!save.isQuickSave()}
                  value={save.getQuickSaveCoordinate(i)}
                  onChange={e => {
                    updateSave(save => {
                      save.setQuickSaveCoordinate(i, e.target.value)
                    })
                  }}
                />
                {i == 2 && (
                  <small
                    style={{
                      marginLeft: "0.5em",
                    }}
                  >
                    (z is up)
                  </small>
                )}
              </label>
            ))}
          </div>
        </div>
      </Card>

      <Card label="visited locations:" className="visited-locations">
        <div>
          {gameData.locationNames.map((name, i) => (
            <label key={i}>
              <Input
                type="checkbox"
                checked={save.visitedLocation(i)}
                onChange={e => {
                  updateSave(save => {
                    save.setVisitedLocation(i, e.target.checked)
                  })
                }}
                key={i}
              />
              {name}
            </label>
          ))}
        </div>
        <p>
          <small>counts for zoom and chimera wings</small>
        </p>
      </Card>
    </div>
  )
}
