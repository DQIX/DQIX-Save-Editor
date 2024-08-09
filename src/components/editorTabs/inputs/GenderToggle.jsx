import { GenderIcon } from "../../atoms/Icon"
import "./GenderToggle.scss"
export default props => (
  <>
    <GenderIcon
      className="gender-toggle"
      icon={props.gender}
      onClick={e => {
        if (props.onChange) {
          props.onChange(props.gender == 1 ? 0 : 1)
          e.target.classList.add("trans")
          setTimeout(() => {
            e.target.classList.remove("trans")
          }, 300)
        }
      }}
    />
  </>
)
