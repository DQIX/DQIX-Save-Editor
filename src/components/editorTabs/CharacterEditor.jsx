import { useContext, useState } from "react"

import "./CharacterEditor.scss"

import SaveManager from "../../saveManager.js"
import Input from "../atoms/Input.jsx"
import { VocationIcon, AppearanceIcon } from "../atoms/Icon.jsx"
import { SaveManagerContext } from "../../SaveManagerContext.jsx"
import gameData from "../../game/data.js"
import ItemSelect from "../atoms/ItemSelect.jsx"
import Card from "../atoms/Card.jsx"
import EquipmentCard from "./inputs/EquipmentCard.jsx"
import AppearanceCards from "./inputs/AppearanceCards.jsx"

export default props => {
  const { save, updateSave } = useContext(SaveManagerContext)
  console.log(save)
  let [character, setCharacter] = useState(save.getStandbyCount())
  let [selectedSkill, setSelectedSkill] = useState(0)

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
              <li key={i} className={i == character ? "active" : ""} onClick={_ => setCharacter(i)}>
                {save.getCharacterName(i) || "\u00A0"} <span>{hero && "🪽"}</span>
              </li>
            )
          })}
        </ul>
        <p>
          <small>waiting in the wings:</small>
        </p>
        <ul>
          {Array.from({ length: save.getStandbyCount() }, (_, i) => (
            <li key={i} className={i == character ? "active" : ""} onClick={_ => setCharacter(i)}>
              {save.getCharacterName(i)}
            </li>
          ))}
        </ul>
      </Card>

      <div className="character-editor">
        <div className="character-grid">
          <Card className="character-header">
            <VocationIcon
              icon={gameData.vocationTable[save.getCharacterVocation(character)].icon}
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
