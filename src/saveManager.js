import { Buffer } from "buffer"
import crc32 from "crc-32"

import GameData from "./game/data"
import { readStringFromBuffer, writeStringToBuffer } from "./game/string"

export const STATE_NULL = 0
export const STATE_LOADING = 1
export const STATE_LOADED = 2

/// total size of one save slot in bytes
const SAVE_SIZE = 32768

const CHECKSUM_A_OFFSET = 16
const CHECKSUM_A_DATA_OFFSET = 20
const CHECKSUM_A_DATA_END = 36

const CHECKSUM_B_OFFSET = 132
const CHECKSUM_B_DATA_OFFSET = 136
const CHECKSUM_B_DATA_END = 28644

/// total size of a character's data in bytes
const CHARACTER_SIZE = 572

/// offset of name relative to beginning of character data
const NAME_OFFSET = 456
/// max length of name in bytes
const NAME_LENGTH = 10

/// offset of name equipments relative to beginning of character data
const EQUIPMENT_OFFSET = 488

/// offset of current vocation index relative to beginning of character data
const CURRENT_VOCATION_OFFSET = 216

/// offset of character's held items, relative to the beginning of the save
const HELD_ITEM_OFFSET = 7578

export default class SaveManager {
  constructor(buffer) {
    this.state = buffer == null ? STATE_NULL : STATE_LOADED
    this.buffer = buffer

    this.saveIdx = 0
    this.saveSlots = []

    if (this.buffer) {
      this.saveSlots = [
        this.buffer.subarray(0, SAVE_SIZE),
        this.buffer.subarray(SAVE_SIZE, SAVE_SIZE + SAVE_SIZE),
      ]

      this.validate()
    }
  }

  validate() {
    if (!this.buffer) {
      return false
    }

    if (this.buffer.length < 65536) {
      return false
    }

    const MAGIC_NUMBER = Buffer.from([
      // `DRAGON QUEST IX` in hex, the save file's magic "number"
      0x44, 0x52, 0x41, 0x47, 0x4f, 0x4e, 0x20, 0x51, 0x55, 0x45, 0x53, 0x54, 0x20, 0x49, 0x58,
    ])

    if (!MAGIC_NUMBER.compare(this.buffer.subarray(0, 0 + MAGIC_NUMBER.length)) == 0) {
      return false
    }

    for (let i = 0; i < 2; i++) {
      //FIXME
      this.getChecksums(i)
      const a = crc32.buf(
        this.saveSlots[i].subarray(CHECKSUM_A_DATA_OFFSET, CHECKSUM_A_DATA_END),
        0
      )
      const b = crc32.buf(
        this.saveSlots[i].subarray(CHECKSUM_B_DATA_OFFSET, CHECKSUM_B_DATA_END),
        0
      )

      // NOTE: crc-32 returns an int instead of a uint
      const srcA = this.saveSlots[i].readInt32LE(CHECKSUM_A_OFFSET)
      const srcB = this.saveSlots[i].readInt32LE(CHECKSUM_B_OFFSET)

      if (a != srcA || b != srcB) {
        return false
      }
    }

    return true
  }

  load(buffer) {
    this.buffer = buffer
  }

  async loadDemo() {
    const response = await fetch("demo.sav")
    if (!response.ok) {
      return null
    }

    return Buffer.from(await response.arrayBuffer())
  }

  download() {
    for (let i = 0; i < 2; i++) {
      let newChecksums = this.makeChecksums(i)
      this.saveSlots[i].writeInt32LE(newChecksums[0], CHECKSUM_A_OFFSET)
      this.saveSlots[i].writeInt32LE(newChecksums[1], CHECKSUM_B_OFFSET)
    }

    const el = document.createElement("a")
    const blob = new Blob([this.buffer], { type: "octet/stream" })
    const url = window.URL.createObjectURL(blob)
    el.href = url
    el.download = "edited.sav"
    el.click()
    window.URL.revokeObjectURL(url)
  }

  /// returns the new checksums for the current save buffer
  makeChecksums(slot) {
    return [
      crc32.buf(this.saveSlots[slot].subarray(CHECKSUM_A_DATA_OFFSET, CHECKSUM_A_DATA_END), 0),
      crc32.buf(this.saveSlots[slot].subarray(CHECKSUM_B_DATA_OFFSET, CHECKSUM_B_DATA_END), 0),
    ]
  }

  /// returns the current checksums in the save buffer
  getChecksums(slot) {
    return [
      this.saveSlots[slot].readInt32LE(CHECKSUM_A_OFFSET),
      this.saveSlots[slot].readInt32LE(CHECKSUM_B_OFFSET),
    ]
  }

  /// returns the party's order
  getPartyOrder() {
    /// order of party members
    const PARTY_ORDER_OFFSET = 7573

    const order = []
    const partyCount = this.getPartyCount()
    for (let i = 0; i < partyCount; i++) {
      order.push(this.saveSlots[this.saveIdx][PARTY_ORDER_OFFSET + i])
    }

    return order
  }

  /// returns the number of characters waiting in the wings
  getStandbyCount() {
    /// number of characters in standby
    const STANDBY_COUNT_OFFSET = 7572

    return this.saveSlots[this.saveIdx][STANDBY_COUNT_OFFSET]
  }

  /// returns the number of characters in the party
  getPartyCount() {
    /// number of characters in party
    const PARTY_COUNT_OFFSET = 7577

    return this.saveSlots[this.saveIdx][PARTY_COUNT_OFFSET]
  }

  /// returns the total number of characters
  getCharacterCount() {
    return this.getStandbyCount() + this.getPartyCount()
  }

  /// returns true if the character index is in the party
  inParty(n) {
    return n >= this.getStandbyCount()
  }

  /// returns the utf8 encoded name, any unknown characters will be returned as ?
  getCharacterName(n) {
    const character_offset = CHARACTER_SIZE * n

    return readStringFromBuffer(
      this.saveSlots[this.saveIdx].subarray(
        character_offset + NAME_OFFSET,
        character_offset + NAME_OFFSET + NAME_LENGTH
      )
    )
  }

  /// sets the character name from a utf8 encoded string, any unknown characters will be serialized
  /// as ?, if the name is longer than the maximum name length it will be trimmed
  writeCharacterName(n, name) {
    const character_offset = CHARACTER_SIZE * n

    name = name.substr(0, NAME_LENGTH).padEnd(NAME_LENGTH, "\0")
    console.log(name)

    let b = writeStringToBuffer(name)

    b.copy(this.saveSlots[this.saveIdx], character_offset + NAME_OFFSET)
  }

  /// returns the item id for the equipped item in the given slot, n is the character index
  /// type is the item type, `ITEM_TYPE_COMMON` and `ITEM_TYPE_IMPORTANT` are not valid
  getCharacterEquipment(n, type) {
    if (type <= 0 || type > GameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    const character_offset = CHARACTER_SIZE * n

    return this.saveSlots[this.saveIdx].readUInt16LE(
      character_offset + EQUIPMENT_OFFSET + (type - 1) * 2
    )
  }

  /// Sets the equipped item in the given slot for the given character
  setCharacterEquipment(n, type, id) {
    if (type <= 0 || type > GameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    const character_offset = CHARACTER_SIZE * n

    return this.saveSlots[this.saveIdx].writeUInt16LE(
      id,
      character_offset + EQUIPMENT_OFFSET + (type - 1) * 2
    )
  }

  /// returns the vocation index of the given character
  getCharacterVocation(n) {
    const character_offset = CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx][character_offset + CURRENT_VOCATION_OFFSET]
  }

  /// returns the ith item held by the nth character, assumes the character is in the party
  getHeldItem(n, i) {
    n -= this.getStandbyCount()
    if (!(0 <= n && n < 4) || !(0 <= i && i < 8)) {
      return []
    }

    return this.saveSlots[this.saveIdx].readUInt16LE(HELD_ITEM_OFFSET + 18 * n + 2 * i)
  }

  /// sets the ith item held by the nth character, assumes the character is in the party
  setHeldItem(n, i, id) {
    n -= this.getStandbyCount()
    if (!(0 <= n && n < 4) || !(0 <= i && i < 8)) {
      return
    }

    return this.saveSlots[this.saveIdx].writeUInt16LE(id, HELD_ITEM_OFFSET + 18 * n + 2 * i)
  }
}
