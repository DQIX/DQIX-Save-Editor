import itemIcons from "../../assets/itemIcons.png"
import vocationIcons from "../../assets/vocationIcons.png"
import appearanceIcons from "../../assets/appearanceIcons-transparent.png"

export const ItemIcon = props => (
  <div
    style={{
      width: "24px",
      height: "24px",
      display: "inline-block",
      verticalAlign: "top",
      backgroundImage: `url(${itemIcons})`,
      backgroundPosition: `-${1 + 25 * (props.icon % 11)}px -${
        1 + 25 * Math.floor(props.icon / 11)
      }px`,
      ...props.style,
    }}
    className="item-icon"
  ></div>
)

export const VocationIcon = props => (
  <div
    style={{
      width: "24px",
      height: "24px",
      display: "inline-block",
      verticalAlign: "top",
      backgroundImage: `url(${vocationIcons})`,
      backgroundPosition: `0px -${props.icon * 24}px`,
      ...props.style,
    }}
  ></div>
)

export const AppearanceIcon = props => {
  const scale = props.scale || 1
  const size = 64 * scale
  const kind = props.kind + props.gender
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-block",
        verticalAlign: "top",
        backgroundImage: `url(${appearanceIcons})`,
        backgroundPosition: `-${kind * size}px -${props.icon * size}px`,
        backgroundSize: `${256 * scale}px ${640 * scale}px`,
        ...props.style,
      }}
    ></div>
  )
}
