import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import GrottoData, { getGrottoName } from "../../game/grotto"

import Card from "../atoms/Card"

import "./GrottoEditor.scss"

export default props => {
  const { save, updateSave } = useContext(SaveManagerContext)
  const [selectedGrotto, setGrotto] = useState(0)

  const grotto = new GrottoData(
    save.getGrottoSeed(selectedGrotto),
    save.getGrottoRank(selectedGrotto)
  )

  return (
    <div className="grotto-root">
      <Card label="treasure maps:" className="sidebar">
        <ul>
          {Array.from({ length: save.getHeldGrottoCount() }).map((_, i) => (
            <li key={i} onClick={e => setGrotto(i)} className={i == selectedGrotto ? "active" : ""}>
              {getGrottoName(save.getGrottoSeed(i), save.getGrottoRank(i))}
            </li>
          ))}
        </ul>
      </Card>
      <div className="grotto-editor">
        <Card label="details:">
          {grotto.seed} - {grotto.rank}
          <br />
          <a
            target="_blank"
            href={`https://yabd.org/apps/dq9/grottodetails.php?map=${grotto.getMapIdString()}`}
          >
            yab's tools
          </a>
        </Card>
      </div>
    </div>
  )
}
