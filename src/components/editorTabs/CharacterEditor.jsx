import { useContext, useState } from "react"

import "./CharacterEditor.scss"

import SaveManager from "../../saveManager.js"
import Input from "../atoms/Input.jsx"
import { VocationIcon, AppearanceIcon } from "../atoms/Icon.jsx"
import { SaveManagerContext } from "../../SaveManagerContext.jsx"
import gameData from "../../game/data.js"
import ItemSelect from "../atoms/ItemSelect.jsx"
import Card from "../atoms/Card.jsx"
import bodyTypePortraits from "../../assets/default-bodytypes-transparent.png"

const AppearanceRadio = props => {
  return (
    <div>
      {Array.from({ length: 10 }, (_, i) => (
        <label key={i}>
          <input
            type="radio"
            name={props.name}
            value={i + gameData.defaultAppearanceKindOffsets[props.kind]}
            checked={i + gameData.defaultAppearanceKindOffsets[props.kind] == props.value}
            onChange={props.onChange}
          />
          <AppearanceIcon gender={props.gender} kind={props.kind} icon={i} scale={0.5} />
        </label>
      ))}
    </div>
  )
}

const ColorRadio = props => {
  const offset = props.offset || 0
  return (
    <div style={props.style}>
      {props.colors.map((color, i) => (
        <label key={i + offset} value>
          <input
            type="radio"
            value={i + offset}
            checked={i + offset == props.checked}
            style={{ backgroundColor: color }}
            onChange={props.onChange}
          />
        </label>
      ))}
    </div>
  )
}

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)
  let [character, setCharacter] = useState(save.getStandbyCount())
  let [selectedSkill, setSelectedSkill] = useState(0)

  return (
    <div className="character-root">
      <Card label="characters:" className="character-list">
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
        <Card className="character-header">
          <VocationIcon icon={gameData.vocationTable[save.getCharacterVocation(character)].icon} />
          <Input
            type="text"
            value={save.getCharacterName(character)}
            placeholder="name"
            onChange={e => {
              save.writeCharacterName(character, e.target.value)
              setSave(new SaveManager(save.buffer))
            }}
            style={{ display: "inline-block", marginLeft: "1em" }}
          />
        </Card>
        <div className="character-grid">
          <Card label="equipment:" className="item-list">
            <ItemSelect
              items={gameData.weaponsTable}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              id={save.getCharacterEquipment(character, gameData.ITEM_TYPE_WEAPON)}
              onChange={e => {
                save.setCharacterEquipment(character, gameData.ITEM_TYPE_WEAPON, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={gameData.shields}
              id={save.getCharacterEquipment(character, gameData.ITEM_TYPE_SHIELD)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, gameData.ITEM_TYPE_SHIELD, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={gameData.headEquipment}
              id={save.getCharacterEquipment(character, gameData.ITEM_TYPE_HEAD)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, gameData.ITEM_TYPE_HEAD, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={gameData.torsoEquipment}
              id={save.getCharacterEquipment(character, gameData.ITEM_TYPE_TORSO)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, gameData.ITEM_TYPE_TORSO, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={gameData.armEquipment}
              id={save.getCharacterEquipment(character, gameData.ITEM_TYPE_ARM)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, gameData.ITEM_TYPE_ARM, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={gameData.legEquipment}
              id={save.getCharacterEquipment(character, gameData.ITEM_TYPE_LEGS)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, gameData.ITEM_TYPE_LEGS, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={gameData.feetEquipment}
              id={save.getCharacterEquipment(character, gameData.ITEM_TYPE_FEET)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, gameData.ITEM_TYPE_FEET, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <ItemSelect
              items={gameData.accessories}
              id={save.getCharacterEquipment(character, gameData.ITEM_TYPE_ACCESSORY)}
              nothingName={"Nothing Equipped"}
              nothingValue={0xffff}
              onChange={e => {
                save.setCharacterEquipment(character, gameData.ITEM_TYPE_ACCESSORY, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
          </Card>

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
                  save.setHeldItem(character, j, e.target.value)
                  setSave(new SaveManager(save.buffer))
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
                    save.setUnallocatedSkillPoints(character, e.target.value)
                    setSave(new SaveManager(save.buffer))
                  }}
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
                    save.setKnowsZoom(character, e.target.checked)
                    setSave(new SaveManager(save.buffer))
                  }}
                />
              </label>
              <label>
                egg on:
                <Input
                  type="checkbox"
                  checked={save.knowsEggOn(character)}
                  onChange={e => {
                    save.setKnowsEggOn(character, e.target.checked)
                    setSave(new SaveManager(save.buffer))
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
                  size={3}
                  onChange={e => {
                    save.setCharacterSkillAllocation(character, selectedSkill, e.target.value)
                    setSave(new SaveManager(save.buffer))
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
                      // save.setCharacterProficiency(character, p.id, e.target.checked)

                      const points = e.target.checked
                        ? p.points
                        : i && gameData.skills[selectedSkill].proficiencies[i - 1].points

                      save.setCharacterSkillAllocation(character, selectedSkill, points)
                      setSave(new SaveManager(save.buffer))
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

          <Card label="face:" className="appearance-editor face">
            <AppearanceRadio
              gender={save.getCharacterGender(character)}
              kind={gameData.APPEARANCE_KIND_FACE}
              value={save.getCharacterFace(character)}
              onChange={e => {
                save.setCharacterFace(character, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <label>
              value:
              <Input
                type="number"
                value={save.getCharacterFace(character)}
                onChange={e => {
                  save.setCharacterFace(character, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
            <p>
              <small>values 70-73 are the dlc character faces</small>
            </p>
          </Card>

          <Card label="hairstyle:" className="appearance-editor hairstyle">
            <AppearanceRadio
              gender={save.getCharacterGender(character)}
              kind={gameData.APPEARANCE_KIND_HAIRSTYLE}
              value={save.getCharacterHairstyle(character)}
              onChange={e => {
                save.setCharacterHairstyle(character, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <label>
              value:
              <Input
                type="number"
                value={save.getCharacterHairstyle(character)}
                onChange={e => {
                  save.setCharacterHairstyle(character, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
            <p>
              <small>values 50-53 are the dlc character hairstyles</small>
            </p>
          </Card>

          <Card label="eye colour:" className="color-picker">
            <small>normal:</small>
            <ColorRadio
              colors={gameData.eyeColors.slice(0, 8)}
              checked={save.getCharacterEyeColor(character)}
              onChange={e => {
                save.setCharacterEyeColor(character, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <small>weird:</small>
            <ColorRadio
              offset={8}
              colors={gameData.eyeColors.slice(8)}
              checked={save.getCharacterEyeColor(character)}
              onChange={e => {
                save.setCharacterEyeColor(character, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
          </Card>

          <Card label="skin & hair colours:" className="color-picker ">
            <small>skin:</small>
            <ColorRadio
              colors={gameData.skinColors}
              checked={save.getCharacterSkinColor(character)}
              onChange={e => {
                save.setCharacterSkinColor(character, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
            <small>hair:</small>
            <ColorRadio
              colors={gameData.hairColors}
              checked={save.getCharacterHairColor(character)}
              style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
              onChange={e => {
                save.setCharacterHairColor(character, e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
          </Card>

          <Card label="body type:" className="body-type-editor">
            <div className="presets">
              {gameData.bodyTypes[save.getCharacterGender(character)].map((preset, i) => {
                const scale = 0.5
                const width = scale * 60
                const height = scale * 140
                return (
                  <label key={i}>
                    <input
                      type="radio"
                      name="body-type-preset"
                      onChange={e => {
                        save.setCharacterBodyTypeW(character, preset.width)
                        save.setCharacterBodyTypeH(character, preset.height)
                        setSave(new SaveManager(save.buffer))
                      }}
                      checked={
                        save.getCharacterBodyTypeW(character) == preset.width &&
                        save.getCharacterBodyTypeH(character) == preset.height
                      }
                    />
                    <div
                      style={{
                        backgroundImage: `url(${bodyTypePortraits})`,
                        width: width + "px",
                        height: height + "px",
                        backgroundPosition: `-${preset.icon * width}px 0`,
                        backgroundSize: `${600 * scale}px ${140 * scale}px`,
                        display: "inline-block",
                        borderRadius: "var(--border-radius)",
                      }}
                    ></div>
                  </label>
                )
              })}
            </div>
            <label>
              width:
              <Input
                type="number"
                value={save.getCharacterBodyTypeW(character)}
                onChange={e => {
                  save.setCharacterBodyTypeW(character, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
            <label>
              height:
              <Input
                type="number"
                value={save.getCharacterBodyTypeH(character)}
                onChange={e => {
                  save.setCharacterBodyTypeH(character, e.target.value)
                  setSave(new SaveManager(save.buffer))
                }}
              />
            </label>
          </Card>
        </div>
      </div>
    </div>
  )
}
