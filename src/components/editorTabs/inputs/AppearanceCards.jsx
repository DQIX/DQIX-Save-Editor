import Input from "../../atoms/Input.jsx"
import { AppearanceIcon } from "../../atoms/Icon.jsx"
import gameData from "../../../game/data.js"
import Card from "../../atoms/Card.jsx"

import bodyTypePortraits from "../../../assets/default-bodytypes-transparent.png"

import "./AppearanceCards.scss"

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
        <label key={i + offset}>
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
  return (
    <>
      <Card label="face:" className="appearance-editor face">
        <AppearanceRadio
          gender={props.gender}
          kind={gameData.APPEARANCE_KIND_FACE}
          value={props.getCharacterFace()}
          onChange={e => {
            props.setCharacterFace(e.target.value)
          }}
        />
        <label>
          value:
          <Input
            type="number"
            value={props.getCharacterFace()}
            onChange={e => {
              props.setCharacterFace(e.target.value)
            }}
            min={0}
            max={255}
            size={4}
          />
        </label>
        <p>
          <small>values 70-73 are the dlc character faces</small>
        </p>
      </Card>

      <Card label="hairstyle:" className="appearance-editor hairstyle">
        <AppearanceRadio
          gender={props.gender}
          kind={gameData.APPEARANCE_KIND_HAIRSTYLE}
          value={props.getCharacterHairstyle()}
          onChange={e => {
            props.setCharacterHairstyle(e.target.value)
          }}
        />
        <label>
          value:
          <Input
            type="number"
            value={props.getCharacterHairstyle()}
            onChange={e => {
              props.setCharacterHairstyle(e.target.value)
            }}
            min={0}
            max={255}
            size={4}
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
          checked={props.getCharacterEyeColor()}
          onChange={e => {
            props.setCharacterEyeColor(e.target.value)
          }}
        />
        <small>weird:</small>
        <ColorRadio
          offset={8}
          colors={gameData.eyeColors.slice(8)}
          checked={props.getCharacterEyeColor()}
          onChange={e => {
            props.setCharacterEyeColor(e.target.value)
          }}
        />
      </Card>

      <Card label="skin & hair colours:" className="color-picker ">
        <small>skin:</small>
        <ColorRadio
          colors={gameData.skinColors}
          checked={props.getCharacterSkinColor()}
          onChange={e => {
            props.setCharacterSkinColor(e.target.value)
          }}
        />
        <small>hair:</small>
        <ColorRadio
          colors={gameData.hairColors}
          checked={props.getCharacterHairColor()}
          style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
          onChange={e => {
            props.setCharacterHairColor(e.target.value)
          }}
        />
      </Card>

      <Card label="character colour:" className="color-picker">
        <ColorRadio
          colors={gameData.colors}
          checked={props.getCharacterColor()}
          onChange={e => {
            props.setCharacterColor(e.target.value)
          }}
        />
      </Card>

      <Card label="body type:" className="body-type-editor">
        <div className="presets">
          {gameData.bodyTypes[props.gender].map((preset, i) => {
            const scale = 0.5
            const width = scale * 60
            const height = scale * 140
            return (
              <label key={i}>
                <input
                  type="radio"
                  name="body-type-preset"
                  onChange={e => {
                    props.setCharacterBodyType(preset.width, preset.height)
                  }}
                  checked={
                    props.getCharacterBodyTypeW() == preset.width &&
                    props.getCharacterBodyTypeH() == preset.height
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
            value={props.getCharacterBodyTypeW()}
            onChange={e => {
              props.setCharacterBodyTypeW(e.target.value)
            }}
            min={0}
            max={65535}
            size={8}
          />
        </label>
        <br />
        <label>
          height:
          <Input
            type="number"
            value={props.getCharacterBodyTypeH()}
            onChange={e => {
              props.setCharacterBodyTypeH(e.target.value)
            }}
            min={0}
            max={65535}
            size={8}
          />
        </label>
      </Card>
    </>
  )
}
