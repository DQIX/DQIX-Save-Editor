import { useContext, useEffect, useRef, useReducer } from "react"

import "./Editor.scss"

import { EditorUiContext, tabs } from "../EditorUiContext"
import { SaveManagerContext } from "../SaveManagerContext"

export default props => {
  let { state } = useContext(EditorUiContext)
  let { save } = useContext(SaveManagerContext)
  window.save = save

  const [, update] = useReducer(x => x + 1, 0)

  //NOTE: this is a fix for strict mode, which would otherwise cause useEffect to trigger twice,
  // registering the event twice
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      document.addEventListener("keydown", e => {
        if (e.defaultPrevented) {
          return
        }

        //FIXME: this should detect os and only allow the meta key on macos and only allow the ctrl key on windows
        if (e.metaKey || e.ctrlKey) {
          switch (e.code) {
            case "KeyZ":
              if (e.shiftKey) {
                if (save.buffer?.redo()) {
                  update()
                }
              } else {
                if (save.buffer?.undo()) {
                  update()
                }
              }

              break
          }
        }
      })
    }
    mounted.current = true
  }, [])

  const Component = tabs[state.tab].component
  return <Component />
}
