/// this component is designed to take a large number of absolutely positioned child elements
/// and cull those that are not in the scroll view, this *only* works for absolutely positioned children
/// whose style props (top, height) are numbers

// this whole thing is cursed tbh and should probably be rewritten

import { useEffect, useRef, useState } from "react"

function throttle(fn, t) {
  let now = Date.now()

  return (...args) => {
    let nnow = Date.now()

    if (now + t - nnow <= 0) {
      fn(...args)
      now = nnow
    }
  }
}

export default props => {
  const height =
    props.height ||
    props.children.reduce((a, c) => Math.max(a, c.props.style.top + c.props.style.height), 0)

  const [scrollPos, setScrollPos] = useState(-(props.overscan || 0))
  const [viewPort, setViewPort] = useState(0)

  const scroller = useRef(null)

  useEffect(() => {
    setViewPort(scroller.current.offsetHeight + (props.overscan || 0) * 2)
    // scroller.current.scrollTo(0, 35100)
  })

  return (
    <div
      ref={scroller}
      style={{
        overflowY: "scroll",
      }}
      onScroll={throttle(e => {
        setScrollPos(e.target.scrollTop - (props.overscan || 0))
        setViewPort(e.target.offsetHeight + (props.overscan || 0) * 2)
      }, 0)}
    >
      <div
        style={{
          position: "relative",
          height,
        }}
      >
        {props.children.filter(child => {
          return (
            child.props.style.top <= scrollPos + viewPort &&
            scrollPos <= child.props.style.top + child.props.style.height
          )
        })}
      </div>
    </div>
  )
}
