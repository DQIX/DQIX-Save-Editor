import { useEffect, useRef } from "react"
import "./Modal.scss"

export default props => {
  //NOTE: this is a fix for strict mode, which would otherwise cause useEffect to trigger twice,
  // registering the event twice
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      document.addEventListener("keydown", e => {
        if (!e.defaultPrevented && e.code == "Escape") {
          props.onClose && props.onClose(e)
        }
      })
    }
    mounted.current = true
  }, [])

  return (
    <>
      <div
        className={`modal-fade-bg ${props.open ? "open" : "closed"}`}
        onClick={e => {
          props.onClose && props.onClose(e)
        }}
      ></div>
      <div
        {...props}
        className={`modal card ${props.className || ""} ${props.open ? "open" : "closed"}`}
      >
        {props.label && (
          <p className="card-label">
            {props.label}{" "}
            <a
              onClick={e => {
                props.onClose && props.onClose(e)
              }}
            >
              ✕
            </a>
          </p>
        )}

        {props.children}
      </div>
    </>
  )
}
