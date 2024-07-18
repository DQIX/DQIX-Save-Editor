import { useContext } from "react"

import SaveManager from "../../saveManager"
import { SaveManagerContext } from "../../SaveManagerContext"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  return <h1>items</h1>
}
