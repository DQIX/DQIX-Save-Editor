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
          defaultValue={props.value[0]}
          size={2}
          min={0}
          max={0xffff}
          onChange={
            props.onChange &&
            (e => {
              if (e.target.value === "") return
              time[0] = e.target.value
              props.onChange(time)
            })
          }
          onBlur={e => {
            e.target.value = props.value[0]
          }}
        />
        h
      </label>
      <label>
        <Input
          type="number"
          defaultValue={props.value[1]}
          size={3}
          min={0}
          max={59}
          onChange={
            props.onChange &&
            (e => {
              if (e.target.value === "") return
              time[1] = e.target.value
              props.onChange(time)
            })
          }
          onBlur={e => {
            e.target.value = props.value[1]
          }}
        />
        m
      </label>
      <label>
        <Input
          type="number"
          defaultValue={props.value[2]}
          size={3}
          min={0}
          max={59}
          onChange={
            props.onChange &&
            (e => {
              if (e.target.value === "") return
              time[2] = e.target.value
              props.onChange(time)
            })
          }
          onBlur={e => {
            e.target.value = props.value[2]
          }}
        />
        s
      </label>
    </>
  )
}

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  return (
    <div className="misc-root">
      <Card label="play time:" className="play-time">
        <div>
          <span>total time:</span>{" "}
          <TimeInput
            value={save.getPlaytime()}
            onChange={value => {
              save.setPlaytime(value)
              setSave(new SaveManager(save.buffer))
            }}
          />
          <span>multiplayer:</span>{" "}
          <TimeInput
            value={save.getMultiplayerTime()}
            onChange={value => {
              save.setMultiplayerTime(value)
              setSave(new SaveManager(save.buffer))
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
            defaultValue={save.getGoldOnHand()}
            onBlur={e => {
              save.setGoldOnHand(e.target.value)
              setSave(new SaveManager(save.buffer))
            }}
          />
          <label htmlFor="hand-gold">g</label>
          <label htmlFor="bank-gold">in bank:</label>
          <Input
            id="bank-gold"
            type="number"
            defaultValue={save.getGoldInBank()}
            onBlur={e => {
              save.setGoldInBank(e.target.value)
              setSave(new SaveManager(save.buffer))
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
                    defaultChecked={save.getPartyTrickLearned(i)}
                    onChange={e => {
                      save.setPartyTrickLearned(i, e.target.checked)
                      setSave(new SaveManager(save.buffer))
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
          defaultValue={save.getMiniMedals()}
          onChange={e => {
            save.setMiniMedals(e.target.value)
            setSave(new SaveManager(save.buffer))
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
                    save.setVocationUnlocked(v.id, e.target.checked)
                    setSave(new SaveManager(save.buffer))
                  }}
                />
                <VocationIcon icon={v.icon} />
              </label>
            ))}
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
                  save.setVisitedLocation(i, e.target.checked)
                  setSave(new SaveManager(save.buffer))
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
