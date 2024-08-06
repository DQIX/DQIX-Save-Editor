import { Buffer } from "buffer"
import {
  readAsciiStringFromBuffer,
  readDqixStringFromBuffer,
  writeAsciiStringToBuffer,
  writeDqixStringToBuffer,
} from "./game/string"

export default class HistoryBuffer {
  constructor(buffer, commands, position) {
    this._buffer = buffer

    this.commands = commands || [null]
    this.position = position || { idx: 0 }
  }

  get buffer() {
    return this._buffer
  }

  subarray(start, end) {
    return new HistoryBuffer(this._buffer.subarray(start, end), this.commands, this.position)
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

  readDqixString(offset, length) {
    return readDqixStringFromBuffer(this.subarray(offset, offset + length).buffer)
  }

  readAsciiString(offset, length) {
    return readAsciiStringFromBuffer(this.subarray(offset, offset + length).buffer)
  }

  writeByte(value, offset) {
    this.buffer[offset] = value
  }

  writeI16LE(value, offset) {
    this.buffer.writeInt16LE(value, offset)
  }

  writeI32LE(value, offset) {
    this.buffer.writeInt32LE(value, offset)
  }

  writeU16LE(value, offset) {
    this.buffer.writeUint16LE(value, offset)
  }

  writeU32LE(value, offset) {
    this.buffer.writeUint32LE(value, offset)
  }

  writeDqixString(value, offset) {
    let b = writeDqixStringToBuffer(value)

    b.copy(this.buffer, offset)
  }

  writeAsciiString(value, offset) {
    let b = writeAsciiStringToBuffer(value)

    b.copy(this.buffer, offset)
  }
}
