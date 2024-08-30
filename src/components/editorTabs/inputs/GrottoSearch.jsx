import { useState } from "react"
import {
  getGrottoData,
  getGrottoDetails,
  getGrottoName,
  getGrottoSeedsByNameData,
} from "../../../game/grotto"
import data from "../../../game/data"
import "./GrottoSearch.scss"
import Input from "../../atoms/Input"
import Button from "../../atoms/Button"
import MapThumb from "../../atoms/MapThumb"

export default props => {
  const [seed, setSeed] = useState(props.seed)
  const [rank, setRank] = useState(props.rank)

  const details = getGrottoDetails(seed, rank)

  const [prefix, setPrefix] = useState(details.namePrefixIdx)
  const [place, setPlace] = useState(details.namePlaceIdx)
  const [suffix, setSuffix] = useState(details.nameSuffixIdx)
  const [level, setLevel] = useState(details.level)

  const results = getGrottoSeedsByNameData(prefix, place, suffix, level)

  return (
    <div className="grotto-search">
      <div className="search-input">
        <div className="name">
          <p>name:</p>
          <select
            value={prefix}
            onChange={e => {
              setPrefix(e.target.value)
            }}
          >
            {data.grottoNamePrefixes.map((prefix, i) => (
              <option key={i} value={i}>
                {prefix}
              </option>
            ))}
          </select>
          <select
            value={place}
            onChange={e => {
              setPlace(e.target.value)
            }}
          >
            {data.grottoNamePlaces.map((place, i) => (
              <option key={i} value={i}>
                {place}
              </option>
            ))}
          </select>
          <span>of</span>
          <select
            value={suffix}
            onChange={e => {
              setSuffix(e.target.value)
            }}
          >
            {data.grottoNameSuffixes.map((suffix, i) => (
              <option key={i} value={i}>
                {suffix}
              </option>
            ))}
          </select>
          <span>lv.</span>
          <Input
            type="number"
            min={1}
            max={99}
            value={level}
            onChange={e => {
              setLevel(e.target.value)
            }}
            size={3}
          />
          <br />
        </div>
        <p>results:</p>
      </div>

      <div className="search-results">
        <table>
          <tbody>
            {results.length != 0 ? (
              results.map(({ seed, rank }, i) => {
                const grottoData = getGrottoData(seed, rank)

                return (
                  <tr key={i} className="search-result">
                    <td>
                      <Button
                        onClick={e => {
                          props.onChange &&
                            props.onChange({
                              seed,
                              rank,
                              location: grottoData.validLocations[0] || 5,
                            })
                        }}
                      >
                        select
                      </Button>
                    </td>
                    <td>
                      <p>
                        <span>{getGrottoName(seed, rank)}</span>
                        <br />
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
                    </td>
                    <td>
                      <span>
                        <b>boss:</b> {data.grottoBossNames[grottoData.details.boss]}
                      </span>
                      <br />
                      <span>
                        <b>type:</b> {data.grottoTypeNames[grottoData.details.type]}
                      </span>
                      <br />
                      <span>
                        <b>floors:</b> {grottoData.details.floorCount}
                      </span>
                      <br />
                      <span>
                        <b>monster rank:</b> {grottoData.details.monsterRank}
                      </span>
                      <br />
                    </td>
                    <td>
                      {grottoData.validLocations.map(loc => (
                        <MapThumb map={loc} />
                      ))}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td>none found :(</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
