import TimeInput from "../../atoms/TimeInput"
import Card from "../../atoms/Card"
import Input from "../../atoms/Input"
import gameData from "../../../game/data"

import "./ProfileCard.scss"

export default props => (
  <Card label="profile:" className="profile-card">
    <div>
      <label>
        <span>location:</span>
        <select
          value={props.getOrigin()}
          onChange={e => {
            props.setOrigin(e.target.value)
          }}
        >
          {Object.entries(gameData.guestOrigins).map(([id, origin]) => (
            <option value={id} key={id}>
              {origin}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>birthday:</span>
        <TimeInput
          value={props.getBirthday()}
          onChange={time => {
            props.setBirthday(time)
          }}
          noHours
        />
        <label>
          <span>secret:</span>
          <Input
            type="checkbox"
            checked={props.isAgeSecret()}
            onChange={e => {
              props.setAgeSecret(e.target.checked)
            }}
          />
        </label>
      </label>
      <label>
        <span>title:</span>
        <select
          value={props.getTitle()}
          onChange={e => {
            props.setTitle(e.target.value)
          }}
        >
          {Object.entries(gameData.titles)
            .filter(([_, title]) => title[props.getGender()])
            .map(([id, title]) => (
              <option value={id} key={id}>
                {title[props.getGender()]}
              </option>
            ))}
        </select>
      </label>
      <label>
        <span>speech style:</span>
        <select
          value={props.getSpeechStyle()}
          onChange={e => {
            props.setSpeechStyle(e.target.value)
          }}
        >
          {gameData.speechStyles.map((style, i) => (
            <option key={i} value={i}>
              {style}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>message:</span>
        <Input
          type="text"
          value={props.getMessage()}
          onChange={e => {
            props.setMessage(e.target.value)
          }}
        />
      </label>
    </div>
  </Card>
)
