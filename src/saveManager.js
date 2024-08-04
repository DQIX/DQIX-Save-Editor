import { Buffer } from "buffer"
import crc32 from "crc-32"

import gameData from "./game/data"
import {
  readAsciiStringFromBuffer,
  writeAsciiStringToBuffer,
  readDqixStringFromBuffer,
  writeDqixStringToBuffer,
} from "./game/string"

import * as layout from "./game/layout"

export const STATE_NULL = 0
export const STATE_LOADING = 1
export const STATE_LOADED = 2

export default class SaveManager {
  constructor(buffer) {
    this.state = buffer == null ? STATE_NULL : STATE_LOADED
    this.buffer = buffer

    this.saveIdx = 0
    this.saveSlots = []

    if (this.buffer) {
      this.saveSlots = [
        this.buffer.subarray(0, layout.SAVE_SIZE),
        this.buffer.subarray(layout.SAVE_SIZE, layout.SAVE_SIZE + layout.SAVE_SIZE),
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
        this.saveSlots[i].subarray(layout.CHECKSUM_A_DATA_OFFSET, layout.CHECKSUM_A_DATA_END),
        0
      )
      const b = crc32.buf(
        this.saveSlots[i].subarray(layout.CHECKSUM_B_DATA_OFFSET, layout.CHECKSUM_B_DATA_END),
        0
      )

      // NOTE: crc-32 returns an int instead of a uint
      const srcA = this.saveSlots[i].readInt32LE(layout.CHECKSUM_A_OFFSET)
      const srcB = this.saveSlots[i].readInt32LE(layout.CHECKSUM_B_OFFSET)

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
      this.saveSlots[i].writeInt32LE(newChecksums[0], layout.CHECKSUM_A_OFFSET)
      this.saveSlots[i].writeInt32LE(newChecksums[1], layout.CHECKSUM_B_OFFSET)
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
      crc32.buf(
        this.saveSlots[slot].subarray(layout.CHECKSUM_A_DATA_OFFSET, layout.CHECKSUM_A_DATA_END),
        0
      ),
      crc32.buf(
        this.saveSlots[slot].subarray(layout.CHECKSUM_B_DATA_OFFSET, layout.CHECKSUM_B_DATA_END),
        0
      ),
    ]
  }

  /// returns the current checksums in the save buffer
  getChecksums(slot) {
    return [
      this.saveSlots[slot].readInt32LE(layout.CHECKSUM_A_OFFSET),
      this.saveSlots[slot].readInt32LE(layout.CHECKSUM_B_OFFSET),
    ]
  }

  /// returns the party's order
  getPartyOrder() {
    const order = []
    const partyCount = this.getPartyCount()
    for (let i = 0; i < partyCount; i++) {
      order.push(this.saveSlots[this.saveIdx][layout.PARTY_ORDER_OFFSET + i])
    }

    return order
  }

  /// returns the number of characters waiting in the wings
  getStandbyCount() {
    return this.saveSlots[this.saveIdx][layout.STANDBY_COUNT_OFFSET]
  }

  /// returns the number of characters in the party
  getPartyCount() {
    return this.saveSlots[this.saveIdx][layout.PARTY_COUNT_OFFSET]
  }

  /// returns the total number of characters
  getCharacterCount() {
    return this.getStandbyCount() + this.getPartyCount()
  }

  /// returns true if the character index is in the party
  inParty(n) {
    return n >= this.getStandbyCount()
  }

  isHero(n) {
    return n == this.getStandbyCount()
  }

  /// returns the utf8 encoded name, any unknown characters will be returned as ?
  getCharacterName(n) {
    const character_offset = layout.CHARACTER_SIZE * n

    return readDqixStringFromBuffer(
      this.saveSlots[this.saveIdx].subarray(
        character_offset + layout.CHARACTER_NAME_OFFSET,
        character_offset + layout.CHARACTER_NAME_OFFSET + layout.NAME_LENGTH
      )
    )
  }

  /// sets the character name from a utf8 encoded string, any unknown characters will be serialized
  /// as ?, if the name is longer than the maximum name length it will be trimmed
  writeCharacterName(n, name) {
    const character_offset = layout.CHARACTER_SIZE * n

    name = name.substr(0, layout.NAME_LENGTH).padEnd(layout.NAME_LENGTH, "\0")

    let b = writeDqixStringToBuffer(name)

    b.copy(this.saveSlots[this.saveIdx], character_offset + layout.CHARACTER_NAME_OFFSET)
  }

  getCharacterGender(n) {
    const character_offset = layout.CHARACTER_SIZE * n
    return (
      this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_GENDER_COLORS_OFFSET] & 1
    )
  }

  getCharacterFace(n) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_FACE_OFFSET]
  }

  setCharacterFace(n, value) {
    const character_offset = layout.CHARACTER_SIZE * n
    this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_FACE_OFFSET] = value
  }

  getCharacterHairstyle(n) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_HAIRSTYLE_OFFSET]
  }

  setCharacterHairstyle(n, value) {
    const character_offset = layout.CHARACTER_SIZE * n
    this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_HAIRSTYLE_OFFSET] = value
  }

  getCharacterEyeColor(n) {
    const character_offset = layout.CHARACTER_SIZE * n

    return (
      (this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_GENDER_COLORS_OFFSET] &
        0xf0) >>
      4
    )
  }

  setCharacterEyeColor(n, color) {
    const character_offset = layout.CHARACTER_SIZE * n
    const prev =
      this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_GENDER_COLORS_OFFSET]
    return (this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_GENDER_COLORS_OFFSET] =
      (prev & 0x0f) | (color << 4))
  }

  getCharacterSkinColor(n) {
    const character_offset = layout.CHARACTER_SIZE * n

    return (
      (this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_GENDER_COLORS_OFFSET] &
        0xe) >>
      1
    )
  }

  setCharacterSkinColor(n, color) {
    const character_offset = layout.CHARACTER_SIZE * n
    const prev =
      this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_GENDER_COLORS_OFFSET]
    return (this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_GENDER_COLORS_OFFSET] =
      (prev & 0xf1) | (color << 1))
  }

  getCharacterHairColor(n) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_HAIR_COLOR_OFFSET] & 0xf
  }

  setCharacterHairColor(n, value) {
    const character_offset = layout.CHARACTER_SIZE * n
    const prev = this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_HAIR_COLOR_OFFSET]
    this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_HAIR_COLOR_OFFSET] =
      (prev & 0xf0) | (value & 0x0f)
  }

  getCharacterBodyTypeW(n) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx].readUInt16LE(
      character_offset + layout.CHARACTER_BODY_TYPE_W
    )
  }

  getCharacterBodyTypeH(n) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx].readUInt16LE(
      character_offset + layout.CHARACTER_BODY_TYPE_H
    )
  }

  setCharacterBodyTypeW(n, value) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx].writeUInt16LE(
      value,
      character_offset + layout.CHARACTER_BODY_TYPE_W
    )
  }

  setCharacterBodyTypeH(n, value) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx].writeUInt16LE(
      value,
      character_offset + layout.CHARACTER_BODY_TYPE_H
    )
  }

  getCharacterSkillAllocation(n, skill) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx][
      character_offset + layout.CHARACTER_SKILL_ALLOCATIONS_OFFSET + skill
    ]
  }

  setCharacterSkillAllocationRaw(n, skill, value) {
    const character_offset = layout.CHARACTER_SIZE * n
    this.saveSlots[this.saveIdx][
      character_offset + layout.CHARACTER_SKILL_ALLOCATIONS_OFFSET + skill
    ] = value
  }

  setCharacterSkillAllocation(n, skill, value) {
    value = Math.max(0, Math.min(100, value))
    this.setCharacterSkillAllocationRaw(n, skill, value)

    for (const p of gameData.skills[skill].proficiencies) {
      this.setCharacterProficiency(n, p.id, p.points <= value)
    }
  }

  getCharacterProficiency(n, id) {
    const character_offset = layout.CHARACTER_SIZE * n
    return !!(
      this.saveSlots[this.saveIdx][
        character_offset + layout.CHARACTER_PROFICIENCY_OFFSET + Math.floor(id / 8)
      ] &
      (1 << id % 8)
    )
  }

  setCharacterProficiency(n, id, value) {
    const character_offset = layout.CHARACTER_SIZE * n
    const mask = 1 << id % 8

    this.saveSlots[this.saveIdx][
      character_offset + layout.CHARACTER_PROFICIENCY_OFFSET + Math.floor(id / 8)
    ] =
      (this.saveSlots[this.saveIdx][
        character_offset + layout.CHARACTER_PROFICIENCY_OFFSET + Math.floor(id / 8)
      ] &
        ~mask) |
      (value ? mask : 0)
  }

  knowsZoom(n) {
    const character_offset = layout.CHARACTER_SIZE * n

    return !!(this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_ZOOM_OFFSET] & 0x10)
  }

  knowsEggOn(n) {
    const character_offset = layout.CHARACTER_SIZE * n

    return !!(
      this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_EGG_ON_OFFSET] & 0x40
    )
  }

  setKnowsZoom(n, knows) {
    const character_offset = layout.CHARACTER_SIZE * n

    knows = knows ? 0x10 : 0
    const prev =
      this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_ZOOM_OFFSET] & 0x10
    this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_ZOOM_OFFSET] =
      (prev & 0xef) | knows
  }

  setKnowsEggOn(n, knows) {
    const character_offset = layout.CHARACTER_SIZE * n

    knows = knows ? 0x40 : 0
    const prev =
      this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_EGG_ON_OFFSET] & 0x40
    this.saveSlots[this.saveIdx][character_offset + layout.CHARACTER_EGG_ON_OFFSET] =
      (prev & 0xbf) | knows
  }

  getUnallocatedSkillPoints(n) {
    const character_offset = layout.CHARACTER_SIZE * n

    return this.saveSlots[this.saveIdx].readUInt16LE(
      character_offset + layout.CHARACTER_UNALLOCATED_SKILL_POINTS_OFFSET
    )
  }

  setUnallocatedSkillPoints(n, pts) {
    const character_offset = layout.CHARACTER_SIZE * n

    pts = Math.max(0, Math.min(9999, pts))

    this.saveSlots[this.saveIdx].writeUInt16LE(
      pts,
      character_offset + layout.CHARACTER_UNALLOCATED_SKILL_POINTS_OFFSET
    )
  }

  /// returns the item id for the equipped item in the given slot, n is the character index
  /// type is the item type, `ITEM_TYPE_COMMON` and `ITEM_TYPE_IMPORTANT` are not valid
  getCharacterEquipment(n, type) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    const character_offset = layout.CHARACTER_SIZE * n

    return this.saveSlots[this.saveIdx].readUInt16LE(
      character_offset + layout.CHARACTER_EQUIPMENT_OFFSET + (type - 1) * 2
    )
  }

  /// Sets the equipped item in the given slot for the given character
  setCharacterEquipment(n, type, id) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    const character_offset = layout.CHARACTER_SIZE * n

    return this.saveSlots[this.saveIdx].writeUInt16LE(
      id,
      character_offset + layout.CHARACTER_EQUIPMENT_OFFSET + (type - 1) * 2
    )
  }

  /// returns the vocation index of the given character
  getCharacterVocation(n) {
    const character_offset = layout.CHARACTER_SIZE * n
    return this.saveSlots[this.saveIdx][character_offset + layout.CURRENT_VOCATION_OFFSET]
  }

  /// returns the ith item held by the nth character, assumes the character is in the party
  getHeldItem(n, i) {
    n -= this.getStandbyCount()
    if (!(0 <= n && n < 4) || !(0 <= i && i < 8)) {
      return []
    }

    return this.saveSlots[this.saveIdx].readUInt16LE(layout.HELD_ITEM_OFFSET + 18 * n + 2 * i)
  }

  /// sets the ith item held by the nth character, assumes the character is in the party
  setHeldItem(n, i, id) {
    n -= this.getStandbyCount()
    if (!(0 <= n && n < 4) || !(0 <= i && i < 8)) {
      return
    }

    return this.saveSlots[this.saveIdx].writeUInt16LE(id, layout.HELD_ITEM_OFFSET + 18 * n + 2 * i)
  }

  /// returns the number of an item in the bag
  /// NOTE: this can be expensive
  getItemCount(id) {
    const itemType = gameData.items[id].item_type
    const offset = layout.itemOffsets[itemType]

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

    const offset = layout.itemOffsets[gameData.items[id].item_type]
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
    const offset = layout.itemOffsets[type]
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
    return this.saveSlots[this.saveIdx].readUInt32LE(layout.GOLD_ON_HAND_OFFSET)
  }

  getGoldInBank() {
    return this.saveSlots[this.saveIdx].readUInt32LE(layout.GOLD_IN_BANK_OFFSET)
  }

  setGoldOnHand(gold) {
    gold = Math.max(0, Math.min(gold, 9999999))
    return this.saveSlots[this.saveIdx].writeUInt32LE(gold, layout.GOLD_ON_HAND_OFFSET)
  }

  setGoldInBank(gold) {
    gold = Math.max(0, Math.min(gold, 1000000000))
    return this.saveSlots[this.saveIdx].writeUInt32LE(gold, layout.GOLD_IN_BANK_OFFSET)
  }

  getMiniMedals() {
    return this.saveSlots[this.saveIdx].readUint32LE(layout.MINI_MEDAL_OFFSET)
  }

  setMiniMedals(medals) {
    this.saveSlots[this.saveIdx].writeUint32LE(medals, layout.MINI_MEDAL_OFFSET)
  }

  getPartyTrickLearned(i) {
    if (!(0 <= i && i <= 14)) {
      return null
    }

    return (
      this.saveSlots[this.saveIdx].readInt32LE(layout.PARTY_TRICK_LEARNED_OFFSET) & (1 << (i + 2))
    )
  }

  setPartyTrickLearned(i, learned) {
    if (!(0 <= i && i <= 14)) {
      return
    }
    learned = learned ? 1 : 0
    i += 2

    let prev = this.saveSlots[this.saveIdx].readInt32LE(layout.PARTY_TRICK_LEARNED_OFFSET)

    this.saveSlots[this.saveIdx].writeInt32LE(
      (prev & ~(1 << i)) | (learned << i),
      layout.PARTY_TRICK_LEARNED_OFFSET
    )
  }

  getPlaytime() {
    return [
      this.saveSlots[this.saveIdx].readUint16LE(layout.PLAYTIME_HOURS),
      this.saveSlots[this.saveIdx][layout.PLAYTIME_MINUTES],
      this.saveSlots[this.saveIdx][layout.PLAYTIME_SECONDS],
    ]
  }

  getMultiplayerTime() {
    return [
      this.saveSlots[this.saveIdx].readUint16LE(layout.MULTIPLAYER_HOURS),
      this.saveSlots[this.saveIdx][layout.MULTIPLAYER_MINUTES],
      this.saveSlots[this.saveIdx][layout.MULTIPLAYER_SECONDS],
    ]
  }

  setPlaytime(value) {
    value[0] = Math.max(0, Math.min(0xffff, value[0]))
    value[1] = Math.max(0, Math.min(59, value[1]))
    value[2] = Math.max(0, Math.min(59, value[2]))
    this.saveSlots[this.saveIdx].writeUint16LE(value[0], layout.PLAYTIME_HOURS)
    this.saveSlots[this.saveIdx][layout.PLAYTIME_MINUTES] = value[1]
    this.saveSlots[this.saveIdx][layout.PLAYTIME_SECONDS] = value[2]
  }

  setMultiplayerTime(value) {
    value[0] = Math.max(0, Math.min(0xffff, value[0]))
    value[1] = Math.max(0, Math.min(59, value[1]))
    value[2] = Math.max(0, Math.min(59, value[2]))
    this.saveSlots[this.saveIdx].writeUint16LE(value[0], layout.MULTIPLAYER_HOURS)
    this.saveSlots[this.saveIdx][layout.MULTIPLAYER_MINUTES] = value[1]
    this.saveSlots[this.saveIdx][layout.MULTIPLAYER_SECONDS] = value[2]
  }

  /// Returns true if the vocation is unlocked, id is the index into `gameData.vocationTable`
  isVocationUnlocked(id) {
    return !!(
      this.saveSlots[this.saveIdx].readUint16LE(layout.UNLOCKABLE_VOCATION_OFFSET) &
      (1 << (id - 1))
    )
  }

  setVocationUnlocked(id, unlocked) {
    id -= 1
    unlocked = unlocked ? 1 : 0

    const prev = this.saveSlots[this.saveIdx].readUint16LE(layout.UNLOCKABLE_VOCATION_OFFSET)
    this.saveSlots[this.saveIdx].writeUint16LE(
      (prev & ~(1 << id)) | (unlocked << id),
      layout.UNLOCKABLE_VOCATION_OFFSET
    )
  }

  visitedLocation(i) {
    return this.saveSlots[this.saveIdx].readInt32LE(layout.VISITED_LOCATIONS_OFFSET) & (1 << i)
  }

  setVisitedLocation(i, visited) {
    visited = visited ? 1 : 0

    const prev = this.saveSlots[this.saveIdx].readInt32LE(layout.VISITED_LOCATIONS_OFFSET)
    this.saveSlots[this.saveIdx].writeInt32LE(
      (prev & ~(1 << i)) | (visited << i),
      layout.VISITED_LOCATIONS_OFFSET
    )
  }

  getCanvasedGuestCount() {
    return this.saveSlots[this.saveIdx][layout.CURRENT_GUESTS_CANVASED_OFFSET]
  }

  getCanvasedGuestIndex(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return (this.saveSlots[this.saveIdx][offset + layout.GUEST_INDEX_OFFSET] & 0xfffffffc) >> 2
  }

  getCanvasedGuestName(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return readDqixStringFromBuffer(
      this.saveSlots[this.saveIdx].subarray(
        offset + layout.GUEST_NAME_OFFSET,
        offset + layout.GUEST_NAME_OFFSET + layout.NAME_LENGTH
      )
    )
  }

  getCanvasedGuestTitle(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    let title =
      ((this.saveSlots[this.saveIdx].readUInt32LE(offset + layout.GUEST_TITLE_ORIGIN_OFFSET) >> 8) &
        0x3ff8) >>
      3

    //NOTE: not totally sure if this should be done this way but i can't figure out any reason for it being different
    if (700 < title && title < 800) title = 700
    if (900 <= title && title < 1000) title -= 100

    return title
  }

  setCanvasedGuestTitle(n, title) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    const prev = this.saveSlots[this.saveIdx].readUInt32LE(
      offset + layout.GUEST_TITLE_ORIGIN_OFFSET
    )

    this.saveSlots[this.saveIdx].writeUInt32LE(
      (prev & 0xffc007ff) | (((title << 3) & 0x3ff8) << 8),
      offset + layout.GUEST_TITLE_ORIGIN_OFFSET
    )
  }

  getCanvasedGuestOrigin(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    return (
      (this.saveSlots[this.saveIdx].readUInt16LE(offset + layout.GUEST_TITLE_ORIGIN_OFFSET) &
        0x7fe) >>
      1
    )
  }

  setCanvasedGuestOrigin(n, origin) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    const prev = this.saveSlots[this.saveIdx].readUInt16LE(
      offset + layout.GUEST_TITLE_ORIGIN_OFFSET
    )
    this.saveSlots[this.saveIdx].writeUint16LE(
      (prev & 0xf801) | ((origin << 1) & 0x7fe),
      offset + layout.GUEST_TITLE_ORIGIN_OFFSET
    )
  }

  getGuestBirthday(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return this.saveSlots[this.saveIdx].readInt32LE(offset + layout.GUEST_BIRTHDAY_OFFSET)
  }

  setGuestBirthday(n, date) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    this.saveSlots[this.saveIdx].writeInt32LE(date, offset + layout.GUEST_BIRTHDAY_OFFSET)
  }

  getCanvasedGuestSpeechStyle(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return (
      (this.saveSlots[this.saveIdx].readUInt16LE(offset + layout.GUEST_SPEECH_STYLE_OFFSET) &
        0x1e0) >>
      5
    )
  }

  setCanvasedGuestSpeechStyle(n, style) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    const prev = this.saveSlots[this.saveIdx].readUInt16LE(
      offset + layout.GUEST_SPEECH_STYLE_OFFSET
    )

    this.saveSlots[this.saveIdx].writeUInt16LE(
      (prev & 0xfe1f) | ((style << 5) & 0x1e0),
      offset + layout.GUEST_SPEECH_STYLE_OFFSET
    )
  }

  isGuestAgeSecret(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return (this.saveSlots[this.saveIdx][offset + layout.GUEST_SECRET_AGE_OFFSET] & 0x80) == 0
  }

  setGuestAgeSecret(n, secret) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    const prev = this.saveSlots[this.saveIdx][offset + layout.GUEST_SECRET_AGE_OFFSET]

    this.saveSlots[this.saveIdx][offset + layout.GUEST_SECRET_AGE_OFFSET] =
      (prev & 0x7f) | (secret ? 0 : 0x80)
  }

  setCanvasedGuestName(n, name) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    name = name.substr(0, layout.NAME_LENGTH).padEnd(layout.NAME_LENGTH, "\0")

    let b = writeDqixStringToBuffer(name)

    b.copy(this.saveSlots[this.saveIdx], offset + layout.GUEST_NAME_OFFSET)
  }

  getGuestVocation(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return this.saveSlots[this.saveIdx][offset + layout.GUEST_VOCATION_AND_LOCATION_OFFSET] & 0xf
  }

  getGuestEquipment(n, type) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return this.saveSlots[this.saveIdx].readUInt16LE(
      offset + layout.GUEST_EQUIPMENT_OFFSET + (type - 1) * 2
    )
  }

  /// Sets the equipped item in the given slot for the given guest
  setGuestEquipment(n, type, id) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return this.saveSlots[this.saveIdx].writeUInt16LE(
      id,
      offset + layout.GUEST_EQUIPMENT_OFFSET + (type - 1) * 2
    )
  }

  getGuestGender(n) {
    //TODO: there are like 3 different gender values? which one..?

    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return this.saveSlots[this.saveIdx][offset + layout.GUEST_GENDER_COLORS_OFFSET] & 0x1
  }

  getGuestEyeColor(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return (this.saveSlots[this.saveIdx][offset + layout.GUEST_GENDER_COLORS_OFFSET] & 0xf0) >> 4
  }

  setGuestEyeColor(n, color) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    const prev = this.saveSlots[this.saveIdx][offset + layout.GUEST_GENDER_COLORS_OFFSET]
    return (this.saveSlots[this.saveIdx][offset + layout.GUEST_GENDER_COLORS_OFFSET] =
      (prev & 0x0f) | (color << 4))
  }

  getGuestSkinColor(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return (this.saveSlots[this.saveIdx][offset + layout.GUEST_GENDER_COLORS_OFFSET] & 0xe) >> 1
  }

  setGuestSkinColor(n, color) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    const prev = this.saveSlots[this.saveIdx][offset + layout.GUEST_GENDER_COLORS_OFFSET]
    return (this.saveSlots[this.saveIdx][offset + layout.GUEST_GENDER_COLORS_OFFSET] =
      (prev & 0xf1) | (color << 1))
  }

  getGuestFace(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    return this.saveSlots[this.saveIdx][offset + layout.GUEST_FACE_OFFSET]
  }

  setGuestFace(n, value) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    this.saveSlots[this.saveIdx][offset + layout.GUEST_FACE_OFFSET] = value
  }

  getGuestHairstyle(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    return this.saveSlots[this.saveIdx][offset + layout.GUEST_HAIRSTYLE_OFFSET]
  }

  setGuestHairstyle(n, value) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    this.saveSlots[this.saveIdx][offset + layout.GUEST_HAIRSTYLE_OFFSET] = value
  }

  getGuestHairColor(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    return this.saveSlots[this.saveIdx][offset + layout.GUEST_HAIR_COLOR_OFFSET] & 0xf
  }

  setGuestHairColor(n, value) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    const prev = this.saveSlots[this.saveIdx][offset + layout.GUEST_HAIR_COLOR_OFFSET]
    this.saveSlots[this.saveIdx][offset + layout.GUEST_HAIR_COLOR_OFFSET] =
      (prev & 0xf0) | (value & 0x0f)
  }

  getGuestBodyTypeW(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    return this.saveSlots[this.saveIdx].readUInt16LE(offset + layout.GUEST_BODY_TYPE_W)
  }

  getGuestBodyTypeH(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    return this.saveSlots[this.saveIdx].readUInt16LE(offset + layout.GUEST_BODY_TYPE_H)
  }

  setGuestBodyTypeW(n, value) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    return this.saveSlots[this.saveIdx].writeUInt16LE(value, offset + layout.GUEST_BODY_TYPE_W)
  }

  setGuestBodyTypeH(n, value) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE
    return this.saveSlots[this.saveIdx].writeUInt16LE(value, offset + layout.GUEST_BODY_TYPE_H)
  }

  getInnLevel() {
    return Math.min(6, this.saveSlots[this.saveIdx][layout.INN_LEVEL_OFFSET] & 0x7)
  }

  setInnLevel(level) {
    level = Math.max(0, Math.min(level, 6))

    const prev = this.saveSlots[this.saveIdx][layout.INN_LEVEL_OFFSET]

    this.saveSlots[this.saveIdx][layout.INN_LEVEL_OFFSET] = (prev & 0xf8) | level
  }

  isSpecialGuestVisiting(i) {
    return !!(
      this.saveSlots[this.saveIdx].readInt32LE(layout.SPECIAL_GUEST_OFFSET) &
      (1 << (i + 1))
    )
  }

  setSpecialGuestVisiting(i, visiting) {
    const prev = this.saveSlots[this.saveIdx].readInt32LE(layout.SPECIAL_GUEST_OFFSET)
    const mask = 1 << (i + 1)
    this.saveSlots[this.saveIdx].writeInt32LE(
      (prev & ~mask) | (visiting ? mask : 0),
      layout.SPECIAL_GUEST_OFFSET
    )
  }

  getDqvcItem(n) {
    return this.saveSlots[this.saveIdx].readUInt16LE(
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_ITEM_OFFSET + layout.DQVC_ITEM_SIZE * n
    )
  }

  setDqvcItem(n, item) {
    this.saveSlots[this.saveIdx].writeUInt16LE(
      item,
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_ITEM_OFFSET + layout.DQVC_ITEM_SIZE * n
    )
  }

  getDqvcPrice(n) {
    return (
      (this.saveSlots[this.saveIdx].readUInt32LE(
        layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
      ) &
        0xffffff80) >>
      7
    )
  }

  setDqvcPrice(n, price) {
    const prev = this.saveSlots[this.saveIdx].readUInt32LE(
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
    )

    this.saveSlots[this.saveIdx].writeUInt32LE(
      (prev & 0x7f) | ((price << 7) & 0xffffff80),
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
    )
  }

  getDqvcStock(n) {
    return (
      this.saveSlots[this.saveIdx][
        layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
      ] & 0x7f
    )
  }

  setDqvcStock(n, stock) {
    const prev =
      this.saveSlots[this.saveIdx][
        layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
      ] & 0x7f

    this.saveSlots[this.saveIdx][
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
    ] = (prev & ~0x7f) | stock
  }

  getDqvcMessage() {
    return readAsciiStringFromBuffer(
      this.saveSlots[this.saveIdx].subarray(
        layout.DQVC_MESSAGE_OFFSET,
        layout.DQVC_MESSAGE_OFFSET + layout.DQVC_MESSAGE_LENGTH
      )
    )
  }

  setDqvcMessage(str) {
    str = str.substring(0, layout.DQVC_MESSAGE_LENGTH).padEnd(layout.DQVC_MESSAGE_LENGTH, "\0")

    writeAsciiStringToBuffer(str).copy(this.saveSlots[this.saveIdx], layout.DQVC_MESSAGE_OFFSET)
  }

  getDqvcMessageExpiryTime() {
    return this.saveSlots[this.saveIdx].readUInt32LE(layout.DQVC_MESSAGE_EXPIRY_TIME_OFFSET)
  }

  setDqvcMessageExpiryTime(time) {
    return this.saveSlots[this.saveIdx].writeUInt32LE(time, layout.DQVC_MESSAGE_EXPIRY_TIME_OFFSET)
  }
}
