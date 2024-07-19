import { Buffer } from "buffer"
import crc32 from "crc-32"

import gameData from "./game/data"
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

/// items are stored in 2 contiguous arrays, one of the ids which are u16s and one of the counts which are u8s
// prettier-ignore
const itemOffsets = {
  [gameData.ITEM_TYPE_COMMON]:    { idOffset: 7664,  countOffset: 7968,  needsPacking: true },
  [gameData.ITEM_TYPE_IMPORTANT]: { idOffset: 11164, countOffset: 11352, needsPacking: true },
  [gameData.ITEM_TYPE_WEAPON]:    { idOffset: 8120,  countOffset: 10136 },
  [gameData.ITEM_TYPE_SHIELD]:    { idOffset: 8664,  countOffset: 10408 },
  [gameData.ITEM_TYPE_TORSO]:     { idOffset: 8760,  countOffset: 10456 },
  [gameData.ITEM_TYPE_HEAD]:      { idOffset: 9336,  countOffset: 10744 },
  [gameData.ITEM_TYPE_ARM]:       { idOffset: 9624,  countOffset: 10888 },
  [gameData.ITEM_TYPE_FEET]:      { idOffset: 9784,  countOffset: 10968 },
  [gameData.ITEM_TYPE_LEGS]:      { idOffset: 9144,  countOffset: 10648 },
  [gameData.ITEM_TYPE_ACCESSORY]: { idOffset: 10008, countOffset: 11080 },
}

const GOLD_ON_HAND_OFFSET = 11448
const GOLD_IN_BANK_OFFSET = 11452

const MINI_MEDAL_OFFSET = 11460
const PARTY_TRICK_LEARNED_OFFSET = 12108

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
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    const character_offset = CHARACTER_SIZE * n

    return this.saveSlots[this.saveIdx].readUInt16LE(
      character_offset + EQUIPMENT_OFFSET + (type - 1) * 2
    )
  }

  /// Sets the equipped item in the given slot for the given character
  setCharacterEquipment(n, type, id) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
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

  /// returns the number of an item in the bag
  /// NOTE: this can be expensive
  getItemCount(id) {
    const itemType = gameData.items[id].item_type
    const offset = itemOffsets[itemType]

    let idx = 0xffff
    //NOTE: linear search isn't ideal here, maybe make this a hashmap created in the constructor?
    for (let i = 0; i < gameData.itemTables[itemType].length; i++) {
      if (this.saveSlots[this.saveIdx].readUInt16LE(offset.idOffset + 2 * i) == id) {
        idx = i
        break
      }
    }

    return idx != 0xffff ? this.saveSlots[this.saveIdx][offset.countOffset + idx] : 0
  }

  /// sets the number of an item in the bag
  /// NOTE: this can be expensive
  setItemCount(id, count) {
    const itemType = gameData.items[id].item_type

    const offset = itemOffsets[gameData.items[id].item_type]
    let idx = 0xffff

    let available = null
    for (let i = 0; i < gameData.itemTables[itemType].length; i++) {
      if (this.saveSlots[this.saveIdx].readUInt16LE(offset.idOffset + 2 * i) == id) {
        idx = i
        break
      }
      if (
        available === null &&
        this.saveSlots[this.saveIdx].readUInt16LE(offset.idOffset + 2 * i) == 0xffff
      ) {
        available = i
      }
    }

    if (idx == 0xffff) idx = available

    this.saveSlots[this.saveIdx][offset.countOffset + idx] = count
    if (count == 0) {
      this.saveSlots[this.saveIdx].writeUInt16LE(0xffff, offset.idOffset + 2 * idx)
    } else {
      this.saveSlots[this.saveIdx].writeUInt16LE(id, offset.idOffset + 2 * idx)
    }

    if (offset.needsPacking) {
      this.packItems(itemType)
    }
  }

  /// everyday and important items need to be packed densely for the game's ui to work well,
  /// this is not the case with equipment
  packItems(type) {
    const offset = itemOffsets[type]
    outer: for (let i = 0; i < gameData.itemTables[type].length; i++) {
      if (this.saveSlots[this.saveIdx].readUInt16LE(offset.idOffset + 2 * i) == 0xffff) {
        for (let j = i + 1; j < gameData.itemTables[type].length; j++) {
          if (this.saveSlots[this.saveIdx].readUInt16LE(offset.idOffset + 2 * j) != 0xffff) {
            this.saveSlots[this.saveIdx].writeUInt16LE(
              this.saveSlots[this.saveIdx].readUInt16LE(offset.idOffset + 2 * j),
              offset.idOffset + 2 * i
            )
            this.saveSlots[this.saveIdx][offset.countOffset + i] =
              this.saveSlots[this.saveIdx][offset.countOffset + j]

            this.saveSlots[this.saveIdx][offset.countOffset + j] = 0
            this.saveSlots[this.saveIdx].writeUInt16LE(0xffff, offset.idOffset + 2 * j)

            continue outer
          }
        }

        break
      }
    }
  }

  getGoldOnHand() {
    return this.saveSlots[this.saveIdx].readUInt32LE(GOLD_ON_HAND_OFFSET)
  }

  getGoldInBank() {
    return this.saveSlots[this.saveIdx].readUInt32LE(GOLD_IN_BANK_OFFSET)
  }

  setGoldOnHand(gold) {
    gold = Math.max(0, Math.min(gold, 9999999))
    return this.saveSlots[this.saveIdx].writeUInt32LE(gold, GOLD_ON_HAND_OFFSET)
  }

  setGoldInBank(gold) {
    gold = Math.max(0, Math.min(gold, 1000000000))
    return this.saveSlots[this.saveIdx].writeUInt32LE(gold, GOLD_IN_BANK_OFFSET)
  }

  getMiniMedals() {
    return this.saveSlots[this.saveIdx].readUint32LE(MINI_MEDAL_OFFSET)
  }

  setMiniMedals(medals) {
    this.saveSlots[this.saveIdx].writeUint32LE(medals, MINI_MEDAL_OFFSET)
  }

  getPartyTrickLearned(i) {
    if (!(0 <= i && i <= 14)) {
      return null
    }

    return this.saveSlots[this.saveIdx].readInt32LE(PARTY_TRICK_LEARNED_OFFSET) & (1 << (i + 2))
  }

  setPartyTrickLearned(i, learned) {
    if (!(0 <= i && i <= 14)) {
      return
    }
    learned = learned ? 1 : 0
    i += 2

    let prev = this.saveSlots[this.saveIdx].readInt32LE(PARTY_TRICK_LEARNED_OFFSET)

    this.saveSlots[this.saveIdx].writeInt32LE(
      (prev & ~(1 << i)) | (learned << i),
      PARTY_TRICK_LEARNED_OFFSET
    )
  }
}
