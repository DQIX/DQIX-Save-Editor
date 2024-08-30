import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import gameData from "../../game/data"

import Card from "../atoms/Card"

import "./GrottoEditor.scss"
import GrottoCard from "./inputs/GrottoCard"

export default props => {
  const { save, updateSave } = useContext(SaveManagerContext)
  const [selectedGrotto, setGrotto] = useState(0)

  const grotto = save.getGrotto(selectedGrotto)

  return (
    <div className="grotto-root">
      <Card label="treasure maps:" className="sidebar">
        <ul>
          {Array.from({ length: save.getHeldGrottoCount() }).map((_, i) => (
            <li key={i} onClick={e => setGrotto(i)} className={i == selectedGrotto ? "active" : ""}>
              {save.getGrotto(i).getName()}
            </li>
          ))}
        </ul>
      </Card>
      <div className="grotto-editor">
        <GrottoCard
          grotto={grotto}
          onChange={({ seed, rank, location }) => {
            updateSave(save => {
              grotto.setSeed(selectedGrotto, seed)
              grotto.setRank(selectedGrotto, rank)
              grotto.setLocation(selectedGrotto, location)
            })
          }}
          updateGrotto={fn => {
            updateSave(save => {
              fn(save)
            })
          }}
        />

        <Card label="info:" className="info">
          {grotto.getKind() == gameData.GROTTO_KIND_NORMAL ? (
            <>
              <span>boss: {gameData.grottoBossNames[grotto.getDetails().boss]}</span> <br />
              <span>type: {gameData.grottoTypeNames[grotto.getDetails().type]}</span> <br />
              <span>floors: {grotto.getDetails().floorCount}</span> <br />
              <span>monster rank: {grotto.getDetails().monsterRank}</span> <br />
            </>
          ) : (
            "no known info :)"
          )}
        </Card>
      </div>
    </div>
  )
}
