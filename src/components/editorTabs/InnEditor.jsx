import { useContext } from "react"
import { SaveManagerContext } from "../../SaveManagerContext"

import "./InnEditor.scss"

import Card from "../atoms/Card"
import Input from "../atoms/Input"

export default props => {
  let { save, setSave } = useContext(SaveManagerContext)

  return <div className="inn-root"></div>
}
