export default props => {
  return (
    <img
      {...props}
      className={`map-thumb ${props.className}`}
      src={`grottoMaps/map_${props.map.toString(16).padStart(2, "0")}.png`}
    />
  )
}
