import { Buffer } from "buffer"
import {
  readAsciiStringFromBuffer,
  readDqixStringFromBuffer,
  writeAsciiStringToBuffer,
  writeDqixStringToBuffer,
} from "./game/string"

const WRITE_TYPE_BYTE = 1
const WRITE_TYPE_I16LE = 2
const WRITE_TYPE_I32LE = 3
const WRITE_TYPE_U16LE = 4
const WRITE_TYPE_U32LE = 5
const WRITE_TYPE_DQIX_STRING = 6
const WRITE_TYPE_ASCII_STRING = 7

export default class HistoryBuffer {
  constructor(buffer, history, parentBuffer) {
    this._buffer = buffer
    this.parentBuffer = parentBuffer || buffer

    this.history = history || {
      uncommittedActions: [],
      commands: [null],
      idx: 0,
    }
  }

  get buffer() {
    return this._buffer
  }

  pushAction(action) {
    if (action.prev == action.value) {
      return
    }

    this.history.uncommittedActions.push(action)
    this.applyAction(action)
  }

  applyAction(action, undo) {
    const value = undo ? action.prev : action.value

    switch (action.type) {
      case WRITE_TYPE_BYTE:
        this.parentBuffer[action.offset] = value
        break

      case WRITE_TYPE_I16LE:
        this.parentBuffer.writeInt16LE(value, action.offset)
        break

      case WRITE_TYPE_I32LE:
        this.parentBuffer.writeInt32LE(value, action.offset)
        break

      case WRITE_TYPE_U16LE:
        this.parentBuffer.writeUint16LE(value, action.offset)
        break

      case WRITE_TYPE_U32LE:
        this.parentBuffer.writeUint32LE(value, action.offset)
        break

      case WRITE_TYPE_DQIX_STRING:
        {
          let b = writeDqixStringToBuffer(value)

          b.copy(this.parentBuffer, action.offset)
        }
        break

      case WRITE_TYPE_ASCII_STRING:
        {
          let b = writeAsciiStringToBuffer(value)

          b.copy(this.parentBuffer, action.offset)
        }
        break

      default:
        throw `unknown write type ${action.type}`
    }
  }

  commitActions() {
    this.pushCommand({
      actions: this.history.uncommittedActions,
    })
    this.history.uncommittedActions = []
  }

  pushCommand(cmd) {
    if (this.history.idx < this.history.commands.length - 1) {
      this.history.commands = this.history.commands.slice(0, this.history.idx + 1)
    }

    this.history.commands.push(cmd)
    this.history.idx++
  }

  applyCommand(cmd, undo) {
    for (let i = 0; i < cmd.actions.length; i++) {
      let ri = undo ? cmd.actions.length - i - 1 : i
      this.applyAction(cmd.actions[ri], undo)
    }
  }

  undo() {
    if (this.history.idx > 0) {
      this.applyCommand(this.history.commands[this.history.idx--], true)

      return true
    }

    return false
  }

  redo() {
    if (this.history.idx < this.history.commands.length - 1) {
      this.applyCommand(this.history.commands[++this.history.idx], false)

      return true
    }

    return false
  }

  subarray(start, end) {
    return new HistoryBuffer(this._buffer.subarray(start, end), this.history, this.parentBuffer)
  }

  readByte(offset) {
    return this.buffer[offset]
  }

  readI16LE(offset) {
    return this.buffer.readInt16LE(offset)
  }

  readI32LE(offset) {
    return this.buffer.readInt32LE(offset)
  }

  readU16LE(offset) {
    return this.buffer.readUint16LE(offset)
  }

  readU32LE(offset) {
    return this.buffer.readUint32LE(offset)
  }

  readDqixString(offset, length, noTrim) {
    return readDqixStringFromBuffer(this.subarray(offset, offset + length).buffer, noTrim)
  }

  readAsciiString(offset, length, noTrim) {
    return readAsciiStringFromBuffer(this.subarray(offset, offset + length).buffer, noTrim)
  }

  writeByte(value, offset) {
    this.pushAction({
      type: WRITE_TYPE_BYTE,
      offset: offset + this.buffer.byteOffset,
      prev: this.buffer[offset],
      value,
    })
  }

  writeI16LE(value, offset) {
    this.pushAction({
      type: WRITE_TYPE_I16LE,
      offset: offset + this.buffer.byteOffset,
      prev: this.readI16LE(offset),
      value,
    })
  }

  writeI32LE(value, offset) {
    this.pushAction({
      type: WRITE_TYPE_I32LE,
      offset: offset + this.buffer.byteOffset,
      prev: this.readI32LE(offset),
      value,
    })
  }

  writeU16LE(value, offset) {
    this.pushAction({
      type: WRITE_TYPE_U16LE,
      offset: offset + this.buffer.byteOffset,
      prev: this.readU16LE(offset),
      value,
    })
  }

  writeU32LE(value, offset) {
    this.pushAction({
      type: WRITE_TYPE_U32LE,
      offset: offset + this.buffer.byteOffset,
      prev: this.readU32LE(offset),
      value,
    })
  }

  writeDqixString(value, offset) {
    console.log(value)
    console.log(value.length)
    console.log(Buffer.from(value))
    console.log(this.readDqixString(offset, value.length, true))
    console.log(this.readDqixString(offset, value.length, true).length)
    console.log(Buffer.from(this.readDqixString(offset, value.length, true)))
    this.pushAction({
      type: WRITE_TYPE_DQIX_STRING,
      offset: offset + this.buffer.byteOffset,
      prev: this.readDqixString(offset, value.length, true),
      value,
    })
  }

  writeAsciiString(value, offset) {
    this.pushAction({
      type: WRITE_TYPE_ASCII_STRING,
      offset: offset + this.buffer.byteOffset,
      prev: this.readAsciiString(offset, value.length, true),
      value,
    })
  }
}
