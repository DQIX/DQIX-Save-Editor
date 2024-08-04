import { useContext, useState } from "react"
import { SaveManagerContext } from "../../SaveManagerContext"
import SaveManager from "../../saveManager"

import gameData from "../../game/data"

import "./InnEditor.scss"

import Card from "../atoms/Card"
import Input from "../atoms/Input"
import { VocationIcon } from "../atoms/Icon"
import EquipmentCard from "./inputs/EquipmentCard"
import AppearanceCards from "./inputs/AppearanceCards"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)
  let [guest, setGuest] = useState(2)

  return (
    <div className="inn-root">
      <div className="sidebar">
        <Card label="inn level:" className="instance">
          <label>
            <Input
              type="number"
              min={0}
              max={6}
              size={4}
              value={save.getInnLevel()}
              onChange={e => {
                save.setInnLevel(e.target.value)
                setSave(new SaveManager(save.buffer))
              }}
            />
          </label>
        </Card>
        <Card label="canvased guests:" className="guest-list canvased-guests">
          <ul>
            {Array.from({ length: 30 }, (_, i) => (
              <li key={i} className={i == guest ? "active" : ""} onClick={_ => setGuest(i)}>
                {save.getCanvasedGuestName(i) || "\u00A0"}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="guest-editor">
        <Card className="guest-header">
          <VocationIcon icon={gameData.vocationTable[save.getGuestVocation(guest)].icon} />
          <Input
            type="text"
            value={save.getCanvasedGuestName(guest)}
            placeholder="name"
            onChange={e => {
              save.setCanvasedGuestName(guest, e.target.value)
              setSave(new SaveManager(save.buffer))
            }}
            style={{ display: "inline-block", marginLeft: "1em" }}
          />
        </Card>
        <div className="guest-grid">
          <EquipmentCard
            i={guest}
            getter={(i, type) => {
              return save.getGuestEquipment(i, type)
            }}
            setter={(i, type, value) => {
              save.setGuestEquipment(i, type, value)
              setSave(new SaveManager(save.buffer))
            }}
          />

          <AppearanceCards
            gender={save.getGuestGender(guest)}
            getCharacterFace={() => {
              return save.getGuestFace(guest)
            }}
            setCharacterFace={v => {
              save.setGuestFace(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterHairstyle={() => {
              return save.getGuestHairstyle(guest)
            }}
            setCharacterHairstyle={v => {
              save.setGuestHairstyle(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterEyeColor={() => {
              return save.getGuestEyeColor(guest)
            }}
            setCharacterEyeColor={v => {
              save.setGuestEyeColor(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterSkinColor={() => {
              return save.getGuestSkinColor(guest)
            }}
            setCharacterSkinColor={v => {
              save.setGuestSkinColor(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterHairColor={() => {
              return save.getGuestHairColor(guest)
            }}
            setCharacterHairColor={v => {
              save.setGuestHairColor(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            getCharacterBodyTypeW={() => {
              return save.getGuestBodyTypeW(guest)
            }}
            getCharacterBodyTypeH={() => {
              return save.getGuestBodyTypeH(guest)
            }}
            setCharacterBodyTypeW={v => {
              save.setGuestBodyTypeW(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
            setCharacterBodyTypeH={v => {
              save.setGuestBodyTypeH(guest, v)
              setSave(new SaveManager(save.buffer))
            }}
          />
        </div>
      </div>
    </div>
  )
}
