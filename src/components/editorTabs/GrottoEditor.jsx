import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import GrottoData, {
  getGrottoName,
  getGrottoSeedsByDetails,
  getGrottoSeedsByNameData,
  grottoLookup,
} from "../../game/grotto"
import gameData from "../../game/data"

import Card from "../atoms/Card"

import "./GrottoEditor.scss"
import Input from "../atoms/Input"
import MapThumb from "../atoms/MapThumb"

export default props => {
  const { save, updateSave } = useContext(SaveManagerContext)
  const [selectedGrotto, setGrotto] = useState(0)

  const grotto = new GrottoData(
    save.getGrottoSeed(selectedGrotto),
    save.getGrottoRank(selectedGrotto)
  )

  const details = grotto.getDetails()

  const updateByName = (e, id) => {
    let nameIdxs = [
      details.namePrefixIdx,
      details.namePlaceIdx,
      details.nameSuffixIdx,
      details.level,
    ]
    nameIdxs[id] = parseInt(e.target.value)
    let seeds = getGrottoSeedsByNameData(nameIdxs[0], nameIdxs[1], nameIdxs[2], nameIdxs[3])

    if (seeds.length == 0) {
      return
    }

    updateSave(save => {
      save.setGrottoSeed(selectedGrotto, seeds[0].seed)
      save.setGrottoRank(selectedGrotto, seeds[0].rank)
    })
  }

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
        <Card className="name">
          <select
            name="grotto name prefix"
            value={details.namePrefixIdx}
            onChange={e => updateByName(e, 0)}
          >
            {gameData.grottoNamePrefixes.map((prefix, i) => (
              <option key={i} value={i}>
                {prefix}
              </option>
            ))}
          </select>
          <select
            name="grotto name place"
            value={details.namePlaceIdx}
            onChange={e => updateByName(e, 1)}
          >
            {gameData.grottoNamePlaces.map((place, i) => (
              <option key={i} value={i}>
                {place}
              </option>
            ))}
          </select>
          <span>of</span>
          <select
            name="grotto name suffix"
            value={details.nameSuffixIdx}
            onChange={e => updateByName(e, 2)}
          >
            {gameData.grottoNameSuffixes.map((suffix, i) => (
              <option key={i} value={i}>
                {suffix}
              </option>
            ))}
          </select>
          <span>lv.</span>
          <Input
            type="number"
            min="1"
            max="99"
            size="3"
            value={details.level}
            onChange={e => updateByName(e, 3)}
          />
        </Card>
        <Card label="identifier:" className="save-details">
          <div>
            <div>
              <label>
                seed:
                <Input
                  type="number"
                  value={grotto.seed}
                  onChange={e => {
                    updateSave(save => {
                      save.setGrottoSeed(selectedGrotto, e.target.value)
                    })
                  }}
                />
              </label>
              <br />
              <label>
                rank:
                <Input
                  type="number"
                  value={grotto.rank}
                  onChange={e => {
                    updateSave(save => {
                      save.setGrottoRank(selectedGrotto, e.target.value)
                    })
                  }}
                />
              </label>
              <br />
              <small>
                {grotto.seed.toString(16)} - {grotto.rank.toString(16)}
              </small>
              <br />
              <a
                target="_blank"
                href={`https://yabd.org/apps/dq9/grottodetails.php?map=${grotto.getMapIdString()}`}
              >
                yab's tools
              </a>
            </div>
          </div>
        </Card>
        <Card label="location:">
          <label>
            <Input
              type="number"
              value={save.getGrottoLocation(selectedGrotto)}
              min={1}
              max={150}
              size={4}
              onChange={e => {
                updateSave(save => {
                  save.setGrottoLocation(selectedGrotto, e.target.value)
                })
              }}
            />
          </label>
          <br />
          <MapThumb map={save.getGrottoLocation(selectedGrotto)} />
        </Card>
        <Card label="explorers:">
          <label>
            discovered by:
            <Input
              type="text"
              value={save.getGrottoDiscoveredBy(selectedGrotto)}
              onChange={e => {
                updateSave(save => {
                  save.setGrottoDiscoveredBy(selectedGrotto, e.target.value)
                })
              }}
            />
          </label>
          <br />
          <label>
            conquered by:
            <Input
              type="text"
              value={save.getGrottoConqueredBy(selectedGrotto)}
              onChange={e => {
                updateSave(save => {
                  save.setGrottoConqueredBy(selectedGrotto, e.target.value)
                })
              }}
            />
          </label>
        </Card>
        <Card label="info:">
          <span>boss: {gameData.grottoBossNames[details.boss]}</span> <br />
          <span>type: {gameData.grottoTypeNames[details.type]}</span> <br />
          <span>floors: {details.floorCount}</span> <br />
          <span>monster rank: {details.monsterRank}</span> <br />
        </Card>
        <Card label="treasures plundered:">
          <label>
            common:{" "}
            <Input
              type="checkbox"
              checked={save.getGrottoTreasurePlundered(selectedGrotto, 0)}
              onChange={e => {
                updateSave(save => {
                  save.setGrottoTreasurePlundered(selectedGrotto, 0, e.target.checked)
                })
              }}
            />
          </label>
          <br />
          <label>
            uncommon:{" "}
            <Input
              type="checkbox"
              checked={save.getGrottoTreasurePlundered(selectedGrotto, 1)}
              onChange={e => {
                updateSave(save => {
                  save.setGrottoTreasurePlundered(selectedGrotto, 1, e.target.checked)
                })
              }}
            />
          </label>
          <br />
          <label>
            rare:
            <Input
              type="checkbox"
              checked={save.getGrottoTreasurePlundered(selectedGrotto, 2)}
              onChange={e => {
                updateSave(save => {
                  save.setGrottoTreasurePlundered(selectedGrotto, 2, e.target.checked)
                })
              }}
            />
          </label>
          <br />
        </Card>
        <Card label="same name:">
          {getGrottoSeedsByDetails(details).map(({ seed, rank }, i) => (
            <p key={i}>
              {seed.toString(16)} - {rank.toString(16)}{" "}
              <a
                target="_blank"
                href={`https://yabd.org/apps/dq9/grottodetails.php?map=${
                  rank.toString(16).padStart(2, "0") + seed.toString(16).padStart(4, "0")
                }`}
              >
                yab's tools
              </a>
            </p>
          ))}
        </Card>
      </div>
    </div>
  )
}
