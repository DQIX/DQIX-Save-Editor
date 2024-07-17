import item_icons from "../../assets/item_icons.png"
import vocation_icons from "../../assets/vocation_icons.png"

export const ItemIcon = props => (
  <div
    style={{
      width: "24px",
      height: "24px",
      display: "inline-block",
      verticalAlign: "bottom",
      backgroundImage: `url(${item_icons})`,
      backgroundPosition: `-${1 + 25 * (props.icon % 11)}px -${
        1 + 25 * Math.floor(props.icon / 11)
      }px`,
      ...props.style,
    }}
  ></div>
)

export const VocationIcon = props => (
  <div
    style={{
      width: "24px",
      height: "24px",
      display: "inline-block",
      verticalAlign: "bottom",
      backgroundImage: `url(${vocation_icons})`,
      backgroundPosition: `0px -${props.icon * 24}px`,
      ...props.style,
    }}
  ></div>
)
