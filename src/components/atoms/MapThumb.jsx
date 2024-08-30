export default props => {
  if (!(0 < props.map && props.map <= 150)) {
    return (
      <div
        className="map-thumb, invalid-map"
        style={{
          width: "102px",
          height: "76px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--surface-bg)",
          pointerEvents: "none",
        }}
      >
        ?
      </div>
    )
  }
  return (
    <img
      style={{ width: "102px", height: "76px" }}
      {...props}
      className={`map-thumb ${props.className || ""}`}
      src={`grottoMaps/map_${props.map.toString(16).padStart(2, "0")}.png`}
    />
  )
}
