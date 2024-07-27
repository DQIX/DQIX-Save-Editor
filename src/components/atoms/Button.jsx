import "./Button.scss"

export default props => {
  return <button {...props}>{props.children}</button>
}
