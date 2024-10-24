import { useContext, useState } from "react"
import { SaveManagerContext } from "../../SaveManagerContext"

import gameData from "../../game/data"
import * as layout from "../../game/layout"

import "./InnEditor.scss"

import Button from "../atoms/Button"
import Card from "../atoms/Card"
import Input from "../atoms/Input"
import Modal from "../atoms/Modal"
import Textarea from "../atoms/Textarea"
import AppearanceCards from "./inputs/AppearanceCards"
import EquipmentCard from "./inputs/EquipmentCard"
import GenderToggle from "./inputs/GenderToggle"
import GrottoCard from "./inputs/GrottoCard"
import ProfileCard from "./inputs/ProfileCard"
import { VocationSelect } from "../atoms/IconSelect"
import { GrottoStateIcon } from "../atoms/Icon"

export default props => {
  let { save, updateSave } = useContext(SaveManagerContext)
  let [guest, setGuest] = useState(0)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [selfExportModalOpen, setSelfExportModalOpen] = useState(false)
  const [exportHoldingGrotto, setExportHoldingGrotto] = useState(-1)

  const [showImportModal, setShowImportModal] = useState(false)
  const [importStr, setImportStr] = useState("")

  const isStrValid =
    importStr.length === layout.CANVASED_GUEST_SIZE * 2 && /^[0-9A-Fa-f]+$/.test(importStr)

  const heldGrotto = save.getGuestHeldGrotto(guest)

  const guestIdxs = Array.from({ length: 30 }, (_, i) => ({
    idx: save.getCanvasedGuestIndex(i),
    guest: i,
  })).filter(guest => guest.idx != 0)

  return (
    <div className="inn-root">
      <Modal
        open={showImportModal}
        label="paste guest string here:"
        onClose={e => {
          setShowImportModal(false)
        }}
        style={{
          maxWidth: "80%",
          width: 720,
        }}
      >
        <Textarea
          placeholder="paste..."
          value={importStr}
          onChange={e => setImportStr(e.target.value)}
        ></Textarea>
        <p>{!!importStr.length && <small>{isStrValid ? "ok ✓" : "invalid guest"}</small>}</p>
        <Button
          disabled={!isStrValid}
          onClick={e => {
            updateSave(save => {
              const idx = save.importGuest(importStr)
              if (typeof idx == "number") setGuest(idx)
            })
            setImportStr("")
            setShowImportModal(false)
          }}
        >
          import
        </Button>
      </Modal>

      <Modal
        open={selfExportModalOpen}
        label="copy guest string:"
        onClose={e => {
          setSelfExportModalOpen(false)
        }}
        style={{
          maxWidth: "80%",
          width: 960,
        }}
        className="export-self"
      >
        <div>
          <ul className="grotto-list">
            <li
              onClick={e => setExportHoldingGrotto(-1)}
              className={-1 == exportHoldingGrotto ? "active" : ""}
            >
              Don't bring a grotto
            </li>
            {Array.from({ length: save.getHeldGrottoCount() }).map((_, i) => (
              <li
                key={i}
                onClick={e => setExportHoldingGrotto(i)}
                className={i == exportHoldingGrotto ? "active" : ""}
              >
                <GrottoStateIcon
                  icon={gameData.grottoStateTable[save.getGrotto(i).getState()].icon}
                />
                {save.getGrotto(i).getName()}
              </li>
            ))}
          </ul>
          <div>
            <p>another person can import this string to have you as a guest.</p>
            <Textarea
              style={{
                minHeight: 200,
              }}
              readOnly={true}
              value={save.exportSelfAsGuest(exportHoldingGrotto)}
            ></Textarea>
            <Button
              onClick={e => {
                setExportModalOpen(false)
              }}
            >
              Ok
            </Button>
          </div>
        </div>
      </Modal>

      <div className="sidebar">
        <Card label="inn info:" className="instance">
          <label>
            level:{" "}
            <Input
              type="number"
              min={0}
              max={6}
              size={4}
              value={save.getInnLevel()}
              onChange={e => {
                updateSave(save => {
                  save.setInnLevel(e.target.value)
                })
              }}
            />
          </label>
          <Button onClick={e => setSelfExportModalOpen(true)}>export self as guest</Button>
          {/* {gameData.guestLocations
            .filter(loc => loc.valid)
            .map(loc => (
              <small>
                {loc.name}:{" "}
                {guestIdxs.reduce((a, c) => a + (save.getGuestLocation(c.guest) == loc.id), 0)}/
                {loc.size}
              </small>
            ))} */}
        </Card>
        <Card
          label={`canvased guests: (${guestIdxs.length}/30)`}
          className="guest-list canvased-guests"
        >
          <ul>
            {guestIdxs.map((x, i) => (
              <li
                key={i}
                className={x.guest == guest ? "active" : ""}
                onClick={_ => setGuest(x.guest)}
              >
                {save.getCanvasedGuestName(x.guest) || "(unnamed)"}
                <a
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    updateSave(save => {
                      save.removeGuest(x.guest)
                      if (x.guest == guest) {
                        if (i != 0) {
                          setGuest(guestIdxs[i - 1].guest)
                        } else if (guestIdxs.length != 1) {
                          setGuest(guestIdxs[i + 1].guest)
                        }
                      }
                    })
                  }}
                >
                  ✕
                </a>
              </li>
            ))}
          </ul>
          <div className="edit-list">
            <button
              disabled={guestIdxs.length >= 30}
              onClick={e => {
                updateSave(save => {
                  const idx = save.addNewCanvasedGuest()
                  if (typeof idx == "number") setGuest(idx)
                })
              }}
            >
              add
            </button>
            <button
              disabled={guestIdxs.length >= 30}
              onClick={e => {
                updateSave(save => {
                  setShowImportModal(true)
                })
              }}
            >
              import
            </button>
          </div>
        </Card>
      </div>
      <div className="guest-editor">
        {guestIdxs.length == 0 ? (
          <div className="none-found">
            no guests :( <br /> try adding or importing one
          </div>
        ) : (
          <div className="guest-grid">
            <Card className="guest-header">
              <div>
                <GenderToggle
                  gender={save.getGuestGender(guest)}
                  onChange={gender => {
                    updateSave(save => {
                      save.setGuestGender(guest, gender)
                    })
                  }}
                />
                <Input
                  type="text"
                  value={save.getCanvasedGuestName(guest)}
                  placeholder="name"
                  onChange={e => {
                    updateSave(save => {
                      save.setCanvasedGuestName(guest, e.target.value)
                    })
                  }}
                  style={{ display: "inline-block", marginLeft: "1em" }}
                />

                <Button
                  className="export-btn"
                  onClick={e => {
                    setExportModalOpen(true)
                  }}
                >
                  export
                </Button>
                <Modal
                  open={exportModalOpen}
                  label="copy guest string:"
                  onClose={e => {
                    setExportModalOpen(false)
                  }}
                  style={{
                    maxWidth: "80%",
                    width: 720,
                  }}
                >
                  <Textarea
                    style={{
                      minHeight: 200,
                    }}
                    readOnly={true}
                    value={save
                      .getCanvasedGuest(guest)
                      .toArray()
                      .map(n => n.toString(16).padStart(2, "0"))
                      .join("")}
                  ></Textarea>
                  <Button
                    onClick={e => {
                      setExportModalOpen(false)
                    }}
                  >
                    Ok
                  </Button>
                </Modal>
              </div>
              <div>
                <label>
                  id:{" "}
                  <Input
                    type="text"
                    value={save.getCanvasedGuestId(guest).toString(16).toUpperCase()}
                    onChange={e => {
                      const input = e.target.value
                      if (/^[0-9A-Fa-f]+$/.test(input)) {
                        updateSave(save => {
                          save.setCanvasedGuestId(guest, BigInt(`0x${input}`))
                        })
                      }
                    }}
                  />
                  {save.getCanvasedGuestId(guest) == save.getPlayerId() ||
                  guestIdxs.reduce(
                    (a, c) =>
                      a ||
                      (c.guest != guest &&
                        save.getCanvasedGuestId(guest) == save.getCanvasedGuestId(c.guest)),
                    false
                  )
                    ? "⚠"
                    : ""}
                </label>
                {/* TODO: make this editable, it would be cool */}

                {/* <label>
                  render as model:
                  <Input
                    type="checkbox"
                    checked={!!(save.getGuestRenderStyle(guest) & gameData.GUEST_RENDER_STYLE_3D)}
                    onChange={e => {
                      updateSave(save => {
                        save.setGuestRenderStyle(
                          guest,
                          (e.target.checked ? gameData.GUEST_RENDER_STYLE_3D : 0) |
                            gameData.GUEST_RENDER_STYLE_UNKNOWN_A
                        )
                      })
                    }}
                  />
                </label> */}
              </div>
            </Card>
            <ProfileCard
              getOrigin={() => save.getCanvasedGuestOrigin(guest)}
              setOrigin={value => {
                updateSave(save => {
                  save.setCanvasedGuestOrigin(guest, value)
                })
              }}
              getBirthday={() => save.getGuestBirthday(guest)}
              setBirthday={time => {
                updateSave(save => {
                  save.setGuestBirthday(guest, time)
                })
              }}
              isAgeSecret={() => save.isGuestAgeSecret(guest)}
              setAgeSecret={secret => {
                updateSave(save => {
                  save.setGuestAgeSecret(guest, secret)
                })
              }}
              getTitle={() => save.getCanvasedGuestTitle(guest)}
              setTitle={title => {
                updateSave(save => {
                  save.setCanvasedGuestTitle(guest, title)
                })
              }}
              getGender={() => save.getGuestGender(guest)}
              getSpeechStyle={() => save.getCanvasedGuestSpeechStyle(guest)}
              setSpeechStyle={style => {
                updateSave(save => {
                  save.setCanvasedGuestSpeechStyle(guest, style)
                })
              }}
              getMessage={() => save.getGuestMessage(guest)}
              setMessage={message =>
                updateSave(save => {
                  save.setGuestMessage(guest, message)
                })
              }
            />

            <EquipmentCard
              i={guest}
              getter={(i, type) => {
                return save.getGuestEquipment(i, type)
              }}
              setter={(i, type, value) => {
                updateSave(save => {
                  save.setGuestEquipment(i, type, value)
                })
              }}
            />

            <Card label="records:" className="records">
              <label>
                <span>battle victories:</span>
                <Input
                  type="number"
                  value={save.getGuestBattleVictories(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestBattleVictories(guest, e.target.value)
                    })
                  }}
                />
              </label>
              <label>
                <span>times alchemy performed:</span>
                <Input
                  type="number"
                  value={save.getGuestAlchemyCount(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestAlchemyCount(guest, e.target.value)
                    })
                  }}
                />
              </label>
              <label>
                <span>accolades earnt:</span>
                <Input
                  type="number"
                  value={save.getGuestAccoladeCount(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestAccoladeCount(guest, e.target.value)
                    })
                  }}
                />
              </label>
              <label>
                <span>quests completed:</span>
                <Input
                  type="number"
                  value={save.getGuestQuestsCompleted(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestQuestsCompleted(guest, e.target.value)
                    })
                  }}
                />
              </label>
              <label>
                <span>grottos completed:</span>
                <Input
                  type="number"
                  value={save.getGuestGrottosCompleted(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestGrottosCompleted(guest, e.target.value)
                    })
                  }}
                />
              </label>
              <label>
                <span>guests canvased:</span>
                <Input
                  type="number"
                  value={save.getGuestGuestsCanvased(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestGuestsCanvased(guest, e.target.value)
                    })
                  }}
                />
              </label>

              <label>
                <span>defeated monster list completion:</span>
                <Input
                  type="number"
                  value={save.getGuestMonsterCompletion(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestMonsterCompletion(guest, e.target.value)
                    })
                  }}
                  min={0}
                  max={100}
                  size={4}
                />
                %
              </label>
              <label>
                <span>wardrobe completion:</span>
                <Input
                  type="number"
                  value={save.getGuestWardrobeCompletion(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestWardrobeCompletion(guest, e.target.value)
                    })
                  }}
                  min={0}
                  max={100}
                  size={4}
                />
                %
              </label>
              <label>
                <span>item list completion:</span>
                <Input
                  type="number"
                  value={save.getGuestItemCompletion(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestItemCompletion(guest, e.target.value)
                    })
                  }}
                  min={0}
                  max={100}
                  size={4}
                />
                %
              </label>
              <label>
                <span>alchenomicon completion:</span>
                <Input
                  type="number"
                  value={save.getGuestAlchenomiconCompletion(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestAlchenomiconCompletion(guest, e.target.value)
                    })
                  }}
                  min={0}
                  max={100}
                  size={4}
                />
                %
              </label>

              <label>
                <span>time spent playing:</span>
                <Input
                  type="number"
                  value={save.getGuestPlaytimeHours(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestPlaytimeHours(guest, e.target.value)
                    })
                  }}
                  min="0"
                  max="16384"
                  size="6"
                />
                h
                <Input
                  type="number"
                  value={save.getGuestPlaytimeMinutes(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestPlaytimeMinutes(guest, e.target.value)
                    })
                  }}
                  min="0"
                  max="59"
                  size="3"
                />
                m
              </label>
              <label>
                <span>time spent in multiplayer:</span>
                <Input
                  type="number"
                  value={save.getGuestMultiPlayerTimeHours(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestMultiPlayerTimeHours(guest, e.target.value)
                    })
                  }}
                  min="0"
                  max="16384"
                  size="6"
                />
                h
                <Input
                  type="number"
                  value={save.getGuestMultiPlayerTimeMinutes(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestMultiPlayerTimeMinutes(guest, e.target.value)
                    })
                  }}
                  min="0"
                  max="59"
                  size="3"
                />
                m
              </label>
            </Card>

            <Card label="lodgings:" className="lodgings">
              <small>location: </small>
              <label>
                <select
                  value={save.getGuestLocation(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestLocation(guest, e.target.value)
                    })
                  }}
                >
                  {gameData.guestLocations
                    .filter(loc => loc.valid || save.getGuestLocation(guest) == loc.id)
                    .map((loc, i) => {
                      const count = guestIdxs.reduce(
                        (a, c) => a + (save.getGuestLocation(c.guest) == loc.id),
                        0
                      )
                      return (
                        <option
                          key={i}
                          value={loc.id}
                          disabled={count == loc.size && loc.id != save.getGuestLocation(guest)}
                        >
                          {count}/{loc.size} {loc.name}
                        </option>
                      )
                    })}
                </select>
              </label>
              <br />
              <small>check-in date: </small>
              <label>
                d:
                <Input
                  type="number"
                  value={save.getGuestCheckInDay(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestCheckInDay(guest, e.target.value)
                    })
                  }}
                  min="1"
                  max="31"
                  size="1"
                />
              </label>
              <label>
                m:
                <Input
                  type="number"
                  value={save.getGuestCheckInMonth(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestCheckInMonth(guest, e.target.value)
                    })
                  }}
                  min="1"
                  max="12"
                  size="1"
                />
              </label>
              <label>
                y:
                <Input
                  type="number"
                  value={save.getGuestCheckInYear(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestCheckInYear(guest, e.target.value)
                    })
                  }}
                  min="2000"
                  max="2128"
                  size="4"
                />
              </label>
            </Card>

            <Card label="vocation:" className="level">
              {/* NOTE: having an invalid vocation here will crash the guestbook */}
              {/* <label>
                <Input
                  type="number"
                  value={save.getGuestVocation(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestVocation(guest, e.target.value)
                    })
                  }}
                />
              </label> */}
              <VocationSelect
                id={save.getGuestVocation(guest)}
                onChange={e => {
                  updateSave(save => {
                    save.setGuestVocation(guest, e.target.value)
                  })
                }}
              />
              <label>
                <span>level:</span>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  size="4"
                  value={save.getGuestLevel(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestLevel(guest, e.target.value)
                    })
                  }}
                />
              </label>
              <br />
              <label>
                <span>revocations:</span>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  size="4"
                  value={save.getGuestRevocations(guest)}
                  onChange={e => {
                    updateSave(save => {
                      save.setGuestRevocations(guest, e.target.value)
                    })
                  }}
                />
              </label>
            </Card>

            <GrottoCard
              labelFn={() => (
                <p className="card-label">
                  held grotto:
                  <Button
                    onClick={e => {
                      updateSave(save => {
                        save.setGuestHoldingGrotto(guest, !save.isGuestHoldingGrotto(guest))
                        if (
                          save.isGuestHoldingGrotto(guest) &&
                          !gameData.grottoKinds[heldGrotto.getKind()].valid
                        ) {
                          heldGrotto.setKind(gameData.GROTTO_KIND_NORMAL)
                        }
                      })
                    }}
                  >
                    {save.isGuestHoldingGrotto(guest) ? "remove" : "add"}
                  </Button>
                </p>
              )}
              disabled={!save.isGuestHoldingGrotto(guest)}
              grotto={heldGrotto}
              onChange={({ seed, rank, location }) => {
                heldGrotto.setSeed(seed)
                heldGrotto.setRank(rank)
                heldGrotto.setLocation(location)
              }}
              updateGrotto={fn => {
                updateSave(save => {
                  fn(save)
                })
              }}
            />

            <AppearanceCards
              gender={save.getGuestGender(guest)}
              getCharacterFace={() => {
                return save.getGuestFace(guest)
              }}
              setCharacterFace={v => {
                updateSave(save => {
                  save.setGuestFace(guest, v)
                })
              }}
              getCharacterHairstyle={() => {
                return save.getGuestHairstyle(guest)
              }}
              setCharacterHairstyle={v => {
                updateSave(save => {
                  save.setGuestHairstyle(guest, v)
                })
              }}
              getCharacterEyeColor={() => {
                return save.getGuestEyeColor(guest)
              }}
              setCharacterEyeColor={v => {
                updateSave(save => {
                  save.setGuestEyeColor(guest, v)
                })
              }}
              getCharacterSkinColor={() => {
                return save.getGuestSkinColor(guest)
              }}
              setCharacterSkinColor={v => {
                updateSave(save => {
                  save.setGuestSkinColor(guest, v)
                })
              }}
              getCharacterHairColor={() => {
                return save.getGuestHairColor(guest)
              }}
              setCharacterHairColor={v => {
                updateSave(save => {
                  save.setGuestHairColor(guest, v)
                })
              }}
              getCharacterColor={() => {
                return save.getGuestColor(guest)
              }}
              setCharacterColor={v => {
                updateSave(save => {
                  save.setGuestColor(guest, v)
                })
              }}
              getCharacterBodyTypeW={() => {
                return save.getGuestBodyTypeW(guest)
              }}
              getCharacterBodyTypeH={() => {
                return save.getGuestBodyTypeH(guest)
              }}
              setCharacterBodyTypeW={w => {
                updateSave(save => {
                  save.setGuestBodyTypeW(guest, w)
                })
              }}
              setCharacterBodyTypeH={h => {
                updateSave(save => {
                  save.setGuestBodyTypeH(guest, h)
                })
              }}
              setCharacterBodyType={(w, h) => {
                updateSave(save => {
                  save.setGuestBodyTypeW(guest, w)
                  save.setGuestBodyTypeH(guest, h)
                })
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
