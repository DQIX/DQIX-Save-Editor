import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"
import GrottoData, { getGrottoName } from "../../game/grotto"
import gameData from "../../game/data"

import Card from "../atoms/Card"

import "./GrottoEditor.scss"
import Input from "../atoms/Input"
import MapThumb from "../atoms/MapThumb"
import Button from "../atoms/Button"
import Modal from "../atoms/Modal"
import GrottoSearch from "./inputs/GrottoSearch"

export default props => {
  const { save, updateSave } = useContext(SaveManagerContext)
  const [selectedGrotto, setGrotto] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const grotto = new GrottoData(
    save.getGrottoSeed(selectedGrotto),
    save.getGrottoRank(selectedGrotto)
  )

  const details = grotto.getDetails()

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
          <span>
            {getGrottoName(save.getGrottoSeed(selectedGrotto), save.getGrottoRank(selectedGrotto))}
          </span>
          <Button
            onClick={e => {
              setModalOpen(true)
            }}
          >
            search
          </Button>
          <Modal
            open={modalOpen}
            label="search grottos:"
            onClose={e => {
              setModalOpen(false)
            }}
          >
            <GrottoSearch
              seed={save.getGrottoSeed(selectedGrotto)}
              rank={save.getGrottoRank(selectedGrotto)}
              onChange={({ seed, rank, location }) => {
                updateSave(save => {
                  save.setGrottoSeed(selectedGrotto, seed)
                  save.setGrottoRank(selectedGrotto, rank)
                  save.setGrottoLocation(selectedGrotto, location)
                  setModalOpen(false)
                })
              }}
            />
          </Modal>
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
      </div>
    </div>
  )
}
