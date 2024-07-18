import "./Loading.scss"
export default props => {
  let random = Math.random()
  return (
    <div className="loader">
      <div className={`slime ${random <= 0.05 ? "metal" : random <= 0.1 ? "she" : ""}`}></div>
      <div className="slime"></div>
      <div className="slime"></div>
    </div>
  )
}
