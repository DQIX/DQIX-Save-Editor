import { useContext, useState } from "react"

import { SaveManagerContext } from "../../SaveManagerContext"

import Card from "../atoms/Card"

import "./GrottoEditor.scss"
import GrottoCard from "./inputs/GrottoCard"
import Textarea from "../atoms/Textarea"
import Modal from "../atoms/Modal"
import Button from "../atoms/Button"
import { GrottoStateIcon } from "../atoms/Icon"
import data from "../../game/data"
import * as layout from "../../game/layout"

export default props => {
  const { save, updateSave } = useContext(SaveManagerContext)
  const [selectedGrotto, setGrotto] = useState(0)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importStr, setImportStr] = useState("")

  //TODO: more complex validation...
  const isStrValid =
    importStr.length === layout.GROTTO_DATA_SIZE * 2 && /^[0-9A-Fa-f]+$/.test(importStr)

  const grotto = save.getGrotto(selectedGrotto)

  return (
    <div className="grotto-root">
      <Modal
        open={showImportModal}
        label="paste grotto string here:"
        onClose={e => {
          setShowImportModal(false)
        }}
      >
        <Textarea
          placeholder="paste..."
          value={importStr}
          onChange={e => setImportStr(e.target.value)}
        ></Textarea>
        <p>{!!importStr.length && <small>{isStrValid ? "ok ✓" : "invalid grotto"}</small>}</p>
        <Button
          disabled={!isStrValid}
          onClick={e => {
            updateSave(save => {
              save.importGrotto(importStr)
            })
            setGrotto(save.getHeldGrottoCount() - 1)
            setImportStr("")
            setShowImportModal(false)
          }}
        >
          import
        </Button>
      </Modal>

      <Card label="treasure maps:" className="sidebar">
        <ul>
          {Array.from({ length: save.getHeldGrottoCount() }).map((_, i) => (
            <li key={i} onClick={e => setGrotto(i)} className={i == selectedGrotto ? "active" : ""}>
              <GrottoStateIcon icon={data.grottoStateTable[save.getGrotto(i).getState()].icon} />
              {save.getGrotto(i).getName()}
              <a
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  updateSave(save => {
                    save.removeGrotto(i)
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
            disabled={save.getHeldGrottoCount() >= layout.HELD_GROTTO_COUNT_MAX}
            onClick={e => {
              updateSave(save => {
                save.tryAddNewGrotto()
              })
            }}
          >
            add
          </button>
          <button
            disabled={save.getHeldGrottoCount() >= layout.HELD_GROTTO_COUNT_MAX}
            onClick={e => {
              setShowImportModal(true)
            }}
          >
            import
          </button>
        </div>
      </Card>
      <div className="grotto-editor">
        <GrottoCard
          grotto={grotto}
          onChange={({ seed, rank, location }) => {
            updateSave(save => {
              grotto.setSeed(seed)
              grotto.setRank(rank)
              grotto.setLocation(location)
            })
          }}
          updateGrotto={fn => {
            updateSave(save => {
              fn(save)
            })
          }}
        />

        <Card label="info:" className="info">
          {grotto.getKind() == data.GROTTO_KIND_NORMAL ? (
            <>
              <span>boss: {data.grottoBossNames[grotto.getDetails().boss]}</span> <br />
              <span>type: {data.grottoTypeNames[grotto.getDetails().type]}</span> <br />
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
