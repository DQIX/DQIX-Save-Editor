import { useContext, useRef, useState } from "react"

import "./CharacterEditor.scss"

import SaveManager from "../../saveManager.js"
import Input from "../atoms/Input.jsx"
import { VocationIcon, AppearanceIcon, ItemIcon, GenderIcon } from "../atoms/Icon.jsx"
import { SaveManagerContext } from "../../SaveManagerContext.jsx"
import gameData from "../../game/data.js"
import { ItemSelect, VocationSelect } from "../atoms/IconSelect.jsx"
import Card from "../atoms/Card.jsx"
import EquipmentCard from "./inputs/EquipmentCard.jsx"
import AppearanceCards from "./inputs/AppearanceCards.jsx"
import GenderToggle from "./inputs/GenderToggle.jsx"

const CharacterListItem = props => {
  const ref = useRef(null)
  return (
    <li
      ref={ref}
      className={props.active ? "active" : ""}
      onClick={_ => props.onSelect(props.i)}
      // draggable
      onDragStart={e => {
        e.dataTransfer.setData("dqix-editor/character", props.i)
        ref.current.classList.add("dragging")
      }}
      onDragOver={e => {
        e.preventDefault()
        e.dataTransfer.effectAllowed = "copyMove"
      }}
      onDragEnd={e => {
        ref.current.classList.remove("dragging")
      }}
      onDrop={e => {
        e.preventDefault()
        ref.current.classList.remove("drag-entered")
        const data = e.dataTransfer.getData("dqix-editor/character")
        if (parseInt(data) != props.i) {
          props.onReorder(parseInt(data), props.i)
        }
      }}
      onDragEnter={e => {
        e.dataTransfer.dropEffect = "move"
        ref.current.classList.add("drag-entered")
      }}
      onDragLeave={e => {
        ref.current.classList.remove("drag-entered")
      }}
    >
      {props.name || "\u00A0"} {/*<span>{props.hero && "🪽"}</span> */}
      {/* <span>⠿</span> */}
    </li>
  )
}

export default props => {
  const { save, updateSave } = useContext(SaveManagerContext)

  let [character, setCharacter] = useState(save.getStandbyCount())
  let [selectedSkill, setSelectedSkill] = useState(0)
  let [selectedVocation, setSelectedVocation] = useState(2)

  return (
    <div className="character-root">
      <Card label="characters:" className="character-list sidebar">
        <p>
          <small>in party:</small>
        </p>
        <ul>
          {Array.from({ length: save.getPartyCount() }, (_, i) => {
            const hero = i == 0
            i += save.getStandbyCount()
            return (
              <CharacterListItem
                key={i}
                active={character == i}
                name={save.getCharacterName(i)}
                hero={hero}
                i={i}
                onSelect={i => {
                  setCharacter(i)
                }}
                onReorder={(from, to) => {
                  updateSave(save => {
                    save.moveCharacter(from, to)
                    if (character == from) setCharacter(to)
                    if (character == to) setCharacter(to - 1)
                  })
                }}
              />
            )
          })}
        </ul>
        <p>
          <small>waiting in the wings:</small>
        </p>
        <ul>
          {Array.from({ length: save.getStandbyCount() }, (_, i) => (
            <CharacterListItem
              key={i}
              i={i}
              active={character == i}
              name={save.getCharacterName(i)}
              onSelect={i => {
                setCharacter(i)
              }}
              onReorder={(from, to) => {
                updateSave(save => {
                  save.moveCharacter(from, to)
                  if (character == from) setCharacter(to)
                  if (character == to) setCharacter(to - 1)
                })
              }}
            />
          ))}
        </ul>
        {/* <div className="edit-list">
          <button
            onClick={e => {
              updateSave(save => {
                save.tryAddNewCharacter()
              })
            }}
          >
            add
          </button>
        </div> */}
      </Card>

      <div className="character-editor">
        <div className="character-grid">
          <Card className="character-header">
            <GenderToggle
              gender={save.getCharacterGender(character)}
              onChange={gender => {
                updateSave(save => {
                  save.setCharacterGender(character, gender)
                })
              }}
            />
            <VocationSelect
              id={save.getCharacterVocation(character)}
              onChange={e => {
                updateSave(save => {
                  save.setCharacterVocation(character, e.target.value)
                })
              }}
            />
            <Input
              type="text"
              value={save.getCharacterName(character)}
              placeholder="name"
              onChange={e => {
                updateSave(save => {
                  save.writeCharacterName(character, e.target.value)
                })
              }}
              style={{ display: "inline-block", marginLeft: "1em" }}
            />
          </Card>
          <EquipmentCard
            i={character}
            getter={(i, type) => {
              return save.getCharacterEquipment(i, type)
            }}
            setter={(i, type, value) => {
              updateSave(save => {
                save.setCharacterEquipment(i, type, value)
              })
            }}
          />
          <Card
            label="held items:"
            className={`item-list ${save.inParty(character) ? "" : "disabled"}`}
          >
            {Array.from({ length: 8 }, (_, j) => (
              <ItemSelect
                key={j}
                items={gameData.everydayItems}
                id={save.getHeldItem(character, j)}
                nothingName={"---"}
                nothingValue={0xffff}
                disabled={!save.inParty(character)}
                onChange={e => {
                  updateSave(save => {
                    save.setHeldItem(character, j, e.target.value)
                  })
                }}
              />
            ))}
          </Card>
          <Card label="skills:" className="skills-editor">
            <div>
              <label>
                unallocated skill points:
                <Input
                  type="number"
                  value={save.getUnallocatedSkillPoints(character)}
                  onChange={e => {
                    updateSave(save => {
                      save.setUnallocatedSkillPoints(character, e.target.value)
                    })
                  }}
                  min={0}
                  max={9999}
                  size={6}
                />
              </label>
            </div>
            <div className="specialty-skills">
              <label>
                zoom:
                <Input
                  type="checkbox"
                  checked={save.knowsZoom(character)}
                  onChange={e => {
                    updateSave(save => {
                      save.setKnowsZoom(character, e.target.checked)
                    })
                  }}
                />
              </label>
              <label>
                egg on:
                <Input
                  type="checkbox"
                  checked={save.knowsEggOn(character)}
                  onChange={e => {
                    updateSave(save => {
                      save.setKnowsEggOn(character, e.target.checked)
                    })
                  }}
                />
              </label>
            </div>
            <div>
              <select
                name="selected-skill"
                value={selectedSkill}
                onChange={e => setSelectedSkill(parseInt(e.target.value))}
              >
                {gameData.skills.map((skill, i) => (
                  <option value={i} key={i}>
                    {skill.name}
                  </option>
                ))}
              </select>
              <label>
                allocated points:
                <Input
                  type="number"
                  value={save.getCharacterSkillAllocation(character, selectedSkill)}
                  min={0}
                  max={100}
                  size={4}
                  onChange={e => {
                    updateSave(save => {
                      save.setCharacterSkillAllocation(character, selectedSkill, e.target.value)
                    })
                  }}
                />
              </label>
            </div>
            <div className="proficiencies">
              {gameData.skills[selectedSkill].proficiencies.map((p, i) => (
                <label key={i}>
                  <Input
                    type="checkbox"
                    checked={save.getCharacterProficiency(character, p.id)}
                    onChange={e => {
                      updateSave(save => {
                        // save.setCharacterProficiency(character, p.id, e.target.checked)

                        const points = e.target.checked
                          ? p.points
                          : i && gameData.skills[selectedSkill].proficiencies[i - 1].points

                        save.setCharacterSkillAllocation(character, selectedSkill, points)
                      })
                    }}
                  />
                  <span>{p.points}</span>
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
            {save.isHero(character) && (
              <p>
                <small>editing here does not give hero skill accolades</small>
              </p>
            )}
          </Card>
          <Card label="vocations:" className="vocation-editor">
            <VocationSelect
              id={selectedVocation}
              onChange={e => {
                setSelectedVocation(parseInt(e.target.value))
              }}
            />
            <small>expertise:</small>
            <div>
              <label>
                level:{" "}
                <Input
                  type="number"
                  value={save.getCharacterLevel(character, selectedVocation)}
                  min={1}
                  max={99}
                  size={3}
                  onChange={e => {
                    updateSave(save => {
                      save.setCharacterLevel(character, selectedVocation, e.target.value)
                    })
                  }}
                />
              </label>

              <label>
                exp:{" "}
                <Input
                  type="number"
                  value={save.getCharacterExp(character, selectedVocation)}
                  onChange={e => {
                    updateSave(save => {
                      save.setCharacterExp(character, selectedVocation, e.target.value)
                    })
                  }}
                />
              </label>

              <label>
                revocations:{" "}
                <Input
                  type="number"
                  value={save.getCharacterRevocations(character, selectedVocation)}
                  min={0}
                  max={10}
                  size={4}
                  onChange={e => {
                    updateSave(save => {
                      save.setCharacterRevocations(character, selectedVocation, e.target.value)
                    })
                  }}
                />
              </label>
            </div>
            <small>stat bonuses (in points):</small>
            <div>
              {gameData.seeds.map((seed, i) => (
                <label key={i}>
                  <ItemIcon icon={seed.icon} /> {seed.name}
                  <Input
                    type="number"
                    min={0}
                    max={999}
                    size={4}
                    value={save.getCharacterSeed(character, selectedVocation, seed.id)}
                    onChange={e =>
                      updateSave(save => {
                        save.setCharacterSeed(character, selectedVocation, seed.id, e.target.value)
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </Card>
          <AppearanceCards
            gender={save.getCharacterGender(character)}
            getCharacterFace={() => {
              return save.getCharacterFace(character)
            }}
            setCharacterFace={v => {
              updateSave(save => {
                save.setCharacterFace(character, v)
              })
            }}
            getCharacterHairstyle={() => {
              return save.getCharacterHairstyle(character)
            }}
            setCharacterHairstyle={v => {
              updateSave(save => {
                save.setCharacterHairstyle(character, v)
              })
            }}
            getCharacterEyeColor={() => {
              return save.getCharacterEyeColor(character)
            }}
            setCharacterEyeColor={v => {
              updateSave(save => {
                save.setCharacterEyeColor(character, v)
              })
            }}
            getCharacterSkinColor={() => {
              return save.getCharacterSkinColor(character)
            }}
            setCharacterSkinColor={v => {
              updateSave(save => {
                save.setCharacterSkinColor(character, v)
              })
            }}
            getCharacterHairColor={() => {
              return save.getCharacterHairColor(character)
            }}
            setCharacterHairColor={v => {
              updateSave(save => {
                save.setCharacterHairColor(character, v)
              })
            }}
            getCharacterColor={() => {
              return save.getCharacterColor(character)
            }}
            setCharacterColor={v => {
              updateSave(save => {
                save.setCharacterColor(character, v)
              })
            }}
            getCharacterBodyTypeW={() => {
              return save.getCharacterBodyTypeW(character)
            }}
            getCharacterBodyTypeH={() => {
              return save.getCharacterBodyTypeH(character)
            }}
            setCharacterBodyType={(w, h) => {
              updateSave(save => {
                save.setCharacterBodyTypeW(character, w)
                save.setCharacterBodyTypeH(character, h)
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
