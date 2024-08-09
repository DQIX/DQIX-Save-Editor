/// this file contains control functions relating to getting and setting particular pieces of data in saves
/// this is done in a sorta bad way, mostly because js doesn't have types of this granularity
///
/// please someone write this in like C with bitfields lol

import { Buffer } from "buffer"
import crc32 from "crc-32"

import gameData from "./game/data"

import * as layout from "./game/layout"
import HistoryBuffer from "./historyBuffer"

export default class SaveManager {
  /*************************************************************************************************
   *                                        control methods                                        *
   *************************************************************************************************/
  constructor(buffer) {
    this.buffer = buffer && new HistoryBuffer(buffer)

    this.saveIdx = 0
    this.saveSlots = []

    if (this.buffer) {
      this.saveSlots = [
        this.buffer.subarray(0, layout.SAVE_SIZE),
        this.buffer.subarray(layout.SAVE_SIZE, layout.SAVE_SIZE + layout.SAVE_SIZE),
      ]

      if (this.isSlotQuickSave(1)) {
        this.saveIdx = 1
      }

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

    if (!MAGIC_NUMBER.compare(this.buffer.subarray(0, 0 + MAGIC_NUMBER.length).buffer) == 0) {
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
      const srcA = this.saveSlots[i].readI32LE(layout.CHECKSUM_A_OFFSET)
      const srcB = this.saveSlots[i].readI32LE(layout.CHECKSUM_B_OFFSET)

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
      this.saveSlots[i].writeI32LE(newChecksums[0], layout.CHECKSUM_A_OFFSET)
      this.saveSlots[i].writeI32LE(newChecksums[1], layout.CHECKSUM_B_OFFSET)
    }

    const el = document.createElement("a")
    const blob = new Blob([this.buffer.buffer], { type: "octet/stream" })
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
        this.saveSlots[slot].buffer.subarray(
          layout.CHECKSUM_A_DATA_OFFSET,
          layout.CHECKSUM_A_DATA_END
        ),
        0
      ),
      crc32.buf(
        this.saveSlots[slot].buffer.subarray(
          layout.CHECKSUM_B_DATA_OFFSET,
          layout.CHECKSUM_B_DATA_END
        ),
        0
      ),
    ]
  }

  /// returns the current checksums in the save buffer
  getChecksums(slot) {
    return [
      this.saveSlots[slot].readI32LE(layout.CHECKSUM_A_OFFSET),
      this.saveSlots[slot].readI32LE(layout.CHECKSUM_B_OFFSET),
    ]
  }

  /// returns a subarray of the currently active save log
  getSaveLogBuffer() {
    return this.saveSlots[this.saveIdx]
  }

  /*************************************************************************************************
   *                                          save methods                                         *
   *************************************************************************************************/

  isSlotQuickSave(n) {
    return !!this.saveSlots[n].readByte(layout.IS_QUICK_SAVE_OFFSET)
  }

  isQuickSave() {
    return this.isSlotQuickSave(this.saveIdx)
  }

  getQuickSaveCoordinate(n) {
    if (!(0 <= n < 3)) throw "bad coordinate index"
    return this.getSaveLogBuffer().readI32LE(layout.QUICK_SAVE_COORDINATES + 4 * n)
  }

  setQuickSaveCoordinate(n, coord) {
    if (!(0 <= n < 3)) throw "bad coordinate index"

    return this.getSaveLogBuffer().writeI32LE(coord, layout.QUICK_SAVE_COORDINATES + 4 * n)
  }

  getSaveLocation() {
    return this.getSaveLogBuffer().readU16LE(
      this.isQuickSave() ? layout.QUICK_SAVE_AREA : layout.SAVE_AREA
    )
  }

  setSaveLocation(value) {
    this.getSaveLogBuffer().writeU16LE(
      value,
      this.isQuickSave() ? layout.QUICK_SAVE_AREA : layout.SAVE_AREA
    )
  }

  /*************************************************************************************************
   *                                         party methods                                         *
   *************************************************************************************************/

  /// returns the party's order
  getPartyOrder() {
    const order = []
    const partyCount = this.getPartyCount()
    for (let i = 0; i < partyCount; i++) {
      order.push(this.getSaveLogBuffer().readByte(layout.PARTY_ORDER_OFFSET + i))
    }

    return order
  }

  /// returns the number of characters waiting in the wings
  getStandbyCount() {
    return this.getSaveLogBuffer().readByte(layout.STANDBY_COUNT_OFFSET)
  }

  /// returns the number of characters in the party
  getPartyCount() {
    return this.getSaveLogBuffer().readByte(layout.PARTY_COUNT_OFFSET)
  }

  /// returns the total number of characters
  getCharacterCount() {
    return this.getStandbyCount() + this.getPartyCount()
  }

  /*************************************************************************************************
   *                                       character methods                                       *
   *************************************************************************************************/

  getCharacterBuffer(n) {
    const offset = layout.CHARACTER_SIZE * n

    return this.getSaveLogBuffer().subarray(offset, offset + layout.CHARACTER_SIZE)
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
    return this.getCharacterBuffer(n).readDqixString(
      layout.CHARACTER_NAME_OFFSET,
      layout.NAME_LENGTH
    )
  }

  /// sets the character name from a utf8 encoded string, any unknown characters will be serialized
  /// as ?, if the name is longer than the maximum name length it will be trimmed
  writeCharacterName(n, name) {
    name = name.substr(0, layout.NAME_LENGTH).padEnd(layout.NAME_LENGTH, "\0")

    this.getCharacterBuffer(n).writeDqixString(name, layout.CHARACTER_NAME_OFFSET)
  }

  getCharacterGender(n) {
    return this.getCharacterBuffer(n).readByte(layout.CHARACTER_GENDER_COLORS_OFFSET) & 1
  }

  getCharacterFace(n) {
    return this.getCharacterBuffer(n).readByte(layout.CHARACTER_FACE_OFFSET)
  }

  setCharacterFace(n, value) {
    this.getCharacterBuffer(n).writeByte(value, layout.CHARACTER_FACE_OFFSET)
  }

  getCharacterHairstyle(n) {
    return this.getCharacterBuffer(n).readByte(layout.CHARACTER_HAIRSTYLE_OFFSET)
  }

  setCharacterHairstyle(n, value) {
    this.getCharacterBuffer(n).writeByte(value, layout.CHARACTER_HAIRSTYLE_OFFSET)
  }

  getCharacterEyeColor(n) {
    return (this.getCharacterBuffer(n).readByte(layout.CHARACTER_GENDER_COLORS_OFFSET) & 0xf0) >> 4
  }

  setCharacterEyeColor(n, color) {
    const prev = this.getCharacterBuffer(n).readByte(layout.CHARACTER_GENDER_COLORS_OFFSET)

    this.getCharacterBuffer(n).writeByte(
      (prev & 0x0f) | (color << 4),
      layout.CHARACTER_GENDER_COLORS_OFFSET
    )
  }

  getCharacterSkinColor(n) {
    return (this.getCharacterBuffer(n).readByte(layout.CHARACTER_GENDER_COLORS_OFFSET) & 0xe) >> 1
  }

  setCharacterSkinColor(n, color) {
    const prev = this.getCharacterBuffer(n).readByte(layout.CHARACTER_GENDER_COLORS_OFFSET)

    this.getCharacterBuffer(n).writeByte((prev & 0xf1) | (color << 1)),
      layout.CHARACTER_GENDER_COLORS_OFFSET
  }

  getCharacterHairColor(n) {
    return this.getCharacterBuffer(n).readByte(layout.CHARACTER_HAIR_COLOR_OFFSET) & 0xf
  }

  setCharacterHairColor(n, value) {
    const prev = this.getCharacterBuffer(n).readByte(layout.CHARACTER_HAIR_COLOR_OFFSET)
    this.getCharacterBuffer(n).writeByte(
      (prev & 0xf0) | (value & 0x0f),
      layout.CHARACTER_HAIR_COLOR_OFFSET
    )
  }

  getCharacterBodyTypeW(n) {
    return this.getCharacterBuffer(n).readU16LE(layout.CHARACTER_BODY_TYPE_W)
  }

  getCharacterBodyTypeH(n) {
    return this.getCharacterBuffer(n).readU16LE(layout.CHARACTER_BODY_TYPE_H)
  }

  setCharacterBodyTypeW(n, value) {
    return this.getCharacterBuffer(n).writeU16LE(value, layout.CHARACTER_BODY_TYPE_W)
  }

  setCharacterBodyTypeH(n, value) {
    return this.getCharacterBuffer(n).writeU16LE(value, layout.CHARACTER_BODY_TYPE_H)
  }

  getCharacterSkillAllocation(n, skill) {
    return this.getCharacterBuffer(n).readByte(layout.CHARACTER_SKILL_ALLOCATIONS_OFFSET + skill)
  }

  setCharacterSkillAllocationRaw(n, skill, value) {
    this.getCharacterBuffer(n).writeByte(value, layout.CHARACTER_SKILL_ALLOCATIONS_OFFSET + skill)
  }

  setCharacterSkillAllocation(n, skill, value) {
    value = Math.max(0, Math.min(100, value))
    this.setCharacterSkillAllocationRaw(n, skill, value)

    for (const p of gameData.skills[skill].proficiencies) {
      this.setCharacterProficiency(n, p.id, p.points <= value)
    }
  }

  getCharacterProficiency(n, id) {
    return !!(
      this.getCharacterBuffer(n).readByte(
        layout.CHARACTER_PROFICIENCY_OFFSET + Math.floor(id / 8)
      ) &
      (1 << id % 8)
    )
  }

  setCharacterProficiency(n, id, value) {
    const mask = 1 << id % 8
    const prev = this.getCharacterBuffer(n).readByte(
      layout.CHARACTER_PROFICIENCY_OFFSET + Math.floor(id / 8)
    )

    this.getCharacterBuffer(n).writeByte(
      (prev & ~mask) | (value ? mask : 0),
      layout.CHARACTER_PROFICIENCY_OFFSET + Math.floor(id / 8)
    )
  }

  knowsZoom(n) {
    return !!(this.getCharacterBuffer(n).readByte(layout.CHARACTER_ZOOM_OFFSET) & 0x10)
  }

  knowsEggOn(n) {
    return !!(this.getCharacterBuffer(n).readByte(layout.CHARACTER_EGG_ON_OFFSET) & 0x40)
  }

  setKnowsZoom(n, knows) {
    knows = knows ? 0x10 : 0
    const prev = this.getCharacterBuffer(n).readByte(layout.CHARACTER_ZOOM_OFFSET) & 0x10
    this.getCharacterBuffer(n).writeByte((prev & 0xef) | knows, layout.CHARACTER_ZOOM_OFFSET)
  }

  setKnowsEggOn(n, knows) {
    knows = knows ? 0x40 : 0
    const prev = this.getCharacterBuffer(n).readByte(layout.CHARACTER_EGG_ON_OFFSET) & 0x40
    this.getCharacterBuffer(n).writeByte((prev & 0xbf) | knows, layout.CHARACTER_EGG_ON_OFFSET)
  }

  getUnallocatedSkillPoints(n) {
    return this.getCharacterBuffer(n).readU16LE(layout.CHARACTER_UNALLOCATED_SKILL_POINTS_OFFSET)
  }

  setUnallocatedSkillPoints(n, pts) {
    pts = Math.max(0, Math.min(9999, pts))

    this.getCharacterBuffer(n).writeU16LE(pts, layout.CHARACTER_UNALLOCATED_SKILL_POINTS_OFFSET)
  }

  /// returns the item id for the equipped item in the given slot, n is the character index
  /// type is the item type, `ITEM_TYPE_COMMON` and `ITEM_TYPE_IMPORTANT` are not valid
  getCharacterEquipment(n, type) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      throw `bad type: "${type}"`
    }

    return this.getCharacterBuffer(n).readU16LE(layout.CHARACTER_EQUIPMENT_OFFSET + (type - 1) * 2)
  }

  /// Sets the equipped item in the given slot for the given character
  setCharacterEquipment(n, type, id) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      throw `bad type: "${type}"`
    }

    return this.getCharacterBuffer(n).writeU16LE(
      id,
      layout.CHARACTER_EQUIPMENT_OFFSET + (type - 1) * 2
    )
  }

  /// returns the vocation index of the given character
  getCharacterVocation(n) {
    return this.getCharacterBuffer(n).readByte(layout.CURRENT_VOCATION_OFFSET)
  }

  setCharacterVocation(n, v) {
    this.getCharacterBuffer(n).writeByte(v, layout.CURRENT_VOCATION_OFFSET)
  }

  getCharacterLevel(n, v) {
    return this.getCharacterBuffer(n).readByte(layout.CHARACTER_VOCATION_LEVEL_OFFSET + v)
  }

  setCharacterLevel(n, v, l) {
    return this.getCharacterBuffer(n).writeByte(l, layout.CHARACTER_VOCATION_LEVEL_OFFSET + v)
  }

  getCharacterExp(n, v) {
    return this.getCharacterBuffer(n).readU32LE(layout.CHARACTER_VOCATION_EXP_OFFSET + v * 4)
  }

  setCharacterExp(n, v, e) {
    return this.getCharacterBuffer(n).writeU32LE(e, layout.CHARACTER_VOCATION_EXP_OFFSET + v * 4)
  }

  getCharacterRevocations(n, v) {
    return this.getCharacterBuffer(n).readByte(layout.CHARACTER_VOCATION_REVOCATION_OFFSET + v)
  }

  setCharacterRevocations(n, v, r) {
    return this.getCharacterBuffer(n).writeByte(r, layout.CHARACTER_VOCATION_REVOCATION_OFFSET + v)
  }

  getCharacterSeed(n, v, s) {
    return (
      (this.getCharacterBuffer(n).readU32LE(
        layout.CHARACTER_VOCATION_SEEDS_OFFSET + Math.floor(s / 3) * 4 + 12 * v
      ) >>
        (10 * (s % 3))) &
      0x3ff
    )
  }

  setCharacterSeed(n, v, s, value) {
    const offset = layout.CHARACTER_VOCATION_SEEDS_OFFSET + Math.floor(s / 3) * 4 + 12 * v

    const prev = this.getCharacterBuffer(n).readU32LE(offset)

    this.getCharacterBuffer(n).writeU32LE(
      (prev & (0xffffffff ^ (0x3ff << (10 * (s % 3))))) | (value << (10 * (s % 3))),
      offset
    )
  }

  /// returns the ith item held by the nth character, assumes the character is in the party
  getHeldItem(n, i) {
    n -= this.getStandbyCount()
    if (!(0 <= n && n < 4) || !(0 <= i && i < 8)) {
      return []
    }

    return this.getSaveLogBuffer().readU16LE(layout.HELD_ITEM_OFFSET + 18 * n + 2 * i)
  }

  /// sets the ith item held by the nth character, assumes the character is in the party
  setHeldItem(n, i, id) {
    n -= this.getStandbyCount()
    if (!(0 <= n && n < 4) || !(0 <= i && i < 8)) {
      return
    }

    return this.getSaveLogBuffer().writeU16LE(id, layout.HELD_ITEM_OFFSET + 18 * n + 2 * i)
  }

  /*************************************************************************************************
   *                                          bag methods                                          *
   *************************************************************************************************/

  /// returns the number of an item in the bag
  /// NOTE: this can be expensive
  getItemCount(id) {
    const itemType = gameData.items[id].item_type
    const offset = layout.itemOffsets[itemType]

    let idx = 0xffff
    //NOTE: linear search isn't ideal here, maybe make this a hashmap created in the constructor?
    for (let i = 0; i < gameData.itemTables[itemType].length; i++) {
      if (this.getSaveLogBuffer().readU16LE(offset.idOffset + 2 * i) == id) {
        idx = i
        break
      }
    }

    return idx != 0xffff ? this.getSaveLogBuffer().readByte(offset.countOffset + idx) : 0
  }

  /// sets the number of an item in the bag
  /// NOTE: this can be expensive
  setItemCount(id, count) {
    const itemType = gameData.items[id].item_type

    const offset = layout.itemOffsets[gameData.items[id].item_type]
    let idx = 0xffff

    let available = null
    for (let i = 0; i < gameData.itemTables[itemType].length; i++) {
      if (this.getSaveLogBuffer().readU16LE(offset.idOffset + 2 * i) == id) {
        idx = i
        break
      }
      if (
        available === null &&
        this.getSaveLogBuffer().readU16LE(offset.idOffset + 2 * i) == 0xffff
      ) {
        available = i
      }
    }

    if (idx == 0xffff) idx = available

    this.getSaveLogBuffer().writeByte(count, offset.countOffset + idx)
    if (count == 0) {
      this.getSaveLogBuffer().writeU16LE(0xffff, offset.idOffset + 2 * idx)
    } else {
      this.getSaveLogBuffer().writeU16LE(id, offset.idOffset + 2 * idx)
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
      if (this.getSaveLogBuffer().readU16LE(offset.idOffset + 2 * i) == 0xffff) {
        for (let j = i + 1; j < gameData.itemTables[type].length; j++) {
          if (this.getSaveLogBuffer().readU16LE(offset.idOffset + 2 * j) != 0xffff) {
            this.getSaveLogBuffer().writeU16LE(
              this.getSaveLogBuffer().readU16LE(offset.idOffset + 2 * j),
              offset.idOffset + 2 * i
            )
            this.getSaveLogBuffer().writeByte(
              this.getSaveLogBuffer().readByte(offset.countOffset + j),
              offset.countOffset + i
            )

            this.getSaveLogBuffer().writeByte(0, offset.countOffset + j)
            this.getSaveLogBuffer().writeU16LE(0xffff, offset.idOffset + 2 * j)

            continue outer
          }
        }

        break
      }
    }
  }

  /*************************************************************************************************
   *                                          misc methods                                         *
   *************************************************************************************************/

  getGoldOnHand() {
    return this.getSaveLogBuffer().readU32LE(layout.GOLD_ON_HAND_OFFSET)
  }

  getGoldInBank() {
    return this.getSaveLogBuffer().readU32LE(layout.GOLD_IN_BANK_OFFSET)
  }

  setGoldOnHand(gold) {
    gold = Math.max(0, Math.min(gold, 9999999))
    return this.getSaveLogBuffer().writeU32LE(gold, layout.GOLD_ON_HAND_OFFSET)
  }

  setGoldInBank(gold) {
    gold = Math.max(0, Math.min(gold, 1000000000))
    return this.getSaveLogBuffer().writeU32LE(gold, layout.GOLD_IN_BANK_OFFSET)
  }

  getMiniMedals() {
    return this.getSaveLogBuffer().readU32LE(layout.MINI_MEDAL_OFFSET)
  }

  setMiniMedals(medals) {
    this.getSaveLogBuffer().writeU32LE(medals, layout.MINI_MEDAL_OFFSET)
  }

  getPartyTrickLearned(i) {
    if (!(0 <= i && i <= 14)) {
      return null
    }

    return this.getSaveLogBuffer().readI32LE(layout.PARTY_TRICK_LEARNED_OFFSET) & (1 << (i + 2))
  }

  setPartyTrickLearned(i, learned) {
    if (!(0 <= i && i <= 14)) {
      return
    }
    learned = learned ? 1 : 0
    i += 2

    let prev = this.getSaveLogBuffer().readI32LE(layout.PARTY_TRICK_LEARNED_OFFSET)

    this.getSaveLogBuffer().writeI32LE(
      (prev & ~(1 << i)) | (learned << i),
      layout.PARTY_TRICK_LEARNED_OFFSET
    )
  }

  getPlaytime() {
    return [
      this.getSaveLogBuffer().readU16LE(layout.PLAYTIME_HOURS),
      this.getSaveLogBuffer().readByte(layout.PLAYTIME_MINUTES),
      this.getSaveLogBuffer().readByte(layout.PLAYTIME_SECONDS),
    ]
  }

  getMultiplayerTime() {
    return [
      this.getSaveLogBuffer().readU16LE(layout.MULTIPLAYER_HOURS),
      this.getSaveLogBuffer().readByte(layout.MULTIPLAYER_MINUTES),
      this.getSaveLogBuffer().readByte(layout.MULTIPLAYER_SECONDS),
    ]
  }

  setPlaytime(value) {
    value[0] = Math.max(0, Math.min(0xffff, value[0]))
    value[1] = Math.max(0, Math.min(59, value[1]))
    value[2] = Math.max(0, Math.min(59, value[2]))
    this.getSaveLogBuffer().writeU16LE(value[0], layout.PLAYTIME_HOURS)
    this.getSaveLogBuffer().writeByte(value[1], layout.PLAYTIME_MINUTES)
    this.getSaveLogBuffer().writeByte(value[2], layout.PLAYTIME_SECONDS)
  }

  setMultiplayerTime(value) {
    value[0] = Math.max(0, Math.min(0xffff, value[0]))
    value[1] = Math.max(0, Math.min(59, value[1]))
    value[2] = Math.max(0, Math.min(59, value[2]))
    this.getSaveLogBuffer().writeU16LE(value[0], layout.MULTIPLAYER_HOURS)
    this.getSaveLogBuffer().writeByte(value[1], layout.MULTIPLAYER_MINUTES)
    this.getSaveLogBuffer().writeByte(value[2], layout.MULTIPLAYER_SECONDS)
  }

  /// Returns true if the vocation is unlocked, id is the index into `gameData.vocationTable`
  isVocationUnlocked(id) {
    return !!(
      this.getSaveLogBuffer().readU16LE(layout.UNLOCKABLE_VOCATION_OFFSET) &
      (1 << (id - 1))
    )
  }

  setVocationUnlocked(id, unlocked) {
    id -= 1
    unlocked = unlocked ? 1 : 0

    const prev = this.getSaveLogBuffer().readU16LE(layout.UNLOCKABLE_VOCATION_OFFSET)
    this.getSaveLogBuffer().writeU16LE(
      (prev & ~(1 << id)) | (unlocked << id),
      layout.UNLOCKABLE_VOCATION_OFFSET
    )
  }

  visitedLocation(i) {
    return this.getSaveLogBuffer().readI32LE(layout.VISITED_LOCATIONS_OFFSET) & (1 << i)
  }

  setVisitedLocation(i, visited) {
    visited = visited ? 1 : 0

    const prev = this.getSaveLogBuffer().readI32LE(layout.VISITED_LOCATIONS_OFFSET)
    this.getSaveLogBuffer().writeI32LE(
      (prev & ~(1 << i)) | (visited << i),
      layout.VISITED_LOCATIONS_OFFSET
    )
  }

  /*************************************************************************************************
   *                                    canvased guest methods                                     *
   *************************************************************************************************/

  getCanvasedGuest(n) {
    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return this.getSaveLogBuffer().subarray(offset, offset + layout.CANVASED_GUEST_SIZE)
  }

  getCanvasedGuestCount() {
    return this.getSaveLogBuffer().readByte(layout.CURRENT_GUESTS_CANVASED_OFFSET)
  }

  getCanvasedGuestIndex(n) {
    return (this.getCanvasedGuest(n).readByte(layout.GUEST_INDEX_OFFSET) & 0xfffffffc) >> 2
  }

  getCanvasedGuestName(n) {
    return this.getCanvasedGuest(n).readDqixString(layout.GUEST_NAME_OFFSET, layout.NAME_LENGTH)
  }

  setCanvasedGuestName(n, name) {
    name = name.substr(0, layout.NAME_LENGTH).padEnd(layout.NAME_LENGTH, "\0")

    this.getCanvasedGuest(n).writeDqixString(name, layout.GUEST_NAME_OFFSET)
  }

  getGuestBattleVictories(n) {
    return (this.getCanvasedGuest(n).readU32LE(layout.GUEST_VICTORY_COUNT_OFFSET) & 0x7fffc0) >> 6
  }

  setGuestBattleVictories(n, v) {
    const prev = this.getCanvasedGuest(n).readU32LE(layout.GUEST_VICTORY_COUNT_OFFSET)

    this.getCanvasedGuest(n).writeU32LE(
      (prev & 0xff80003f) | ((v << 6) & 0x7fffc0),
      layout.GUEST_VICTORY_COUNT_OFFSET
    )
  }

  getGuestAlchemyCount(n) {
    return (this.getCanvasedGuest(n).readU16LE(layout.GUEST_ALCHEMY_COUNT) & 0x3fffc0) >> 6
  }

  setGuestAlchemyCount(n, v) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_ALCHEMY_COUNT)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xffc0003f) | ((v << 6) & 0x3fffc0),
      layout.GUEST_ALCHEMY_COUNT
    )
  }

  getGuestAccoladeCount(n) {
    return this.getCanvasedGuest(n).readU16LE(layout.GUEST_ACCOLADE_COUNT_OFFSET) & 0x3ff
  }

  setGuestAccoladeCount(n, v) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_ACCOLADE_COUNT_OFFSET)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xfc00) | (v & 0x3ff),
      layout.GUEST_ACCOLADE_COUNT_OFFSET
    )
  }

  getGuestQuestsCompleted(n) {
    return this.getCanvasedGuest(n).readU32LE(layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET) & 0x1ff
  }

  setGuestQuestsCompleted(n, v) {
    const prev = this.getCanvasedGuest(n).readU32LE(layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET)

    this.getCanvasedGuest(n).writeU32LE(
      (prev & 0xfffffe00) | (v & 0x1ff),
      layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET
    )
  }

  getGuestGrottosCompleted(n) {
    return (this.getCanvasedGuest(n).readU16LE(layout.GUEST_GROTTO_COUNT_OFFSET) & 0xfffc) >> 2
  }

  setGuestGrottosCompleted(n, v) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_GROTTO_COUNT_OFFSET)

    this.getSaveLogBuffer().writeU16LE((prev & 0x3) | (v << 2), layout.GUEST_GROTTO_COUNT_OFFSET)
  }

  getGuestGuestsCanvased(n) {
    return (
      (this.getCanvasedGuest(n).readU32LE(layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET) & 0x7ffe00) >> 9
    )
  }

  setGuestGuestsCanvased(n, v) {
    const prev = this.getCanvasedGuest(n).readU32LE(layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET)

    this.getCanvasedGuest(n).writeU32LE(
      (prev & 0xff8001ff) | ((v << 9) & 0x7ffe00),
      layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET
    )
  }

  getGuestMonsterCompletion(n) {
    return (this.getCanvasedGuest(n).readU16LE(layout.GUEST_MONSTER_COUNT_OFFSET) & 0x1fc0) >> 6
  }

  setGuestMonsterCompletion(n, v) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_MONSTER_COUNT_OFFSET)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xe03f) | ((v << 6) & 0x1fc0),
      layout.GUEST_MONSTER_COUNT_OFFSET
    )
  }

  getGuestWardrobeCompletion(n) {
    return this.getCanvasedGuest(n).readByte(layout.GUEST_WARDROBE_COUNT_OFFSET) & 0x7f
  }

  setGuestWardrobeCompletion(n, v) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_WARDROBE_COUNT_OFFSET)

    this.getCanvasedGuest(n).writeByte(
      (prev & 0x80) | (v & 0x7f),
      layout.GUEST_WARDROBE_COUNT_OFFSET
    )
  }

  getGuestItemCompletion(n) {
    return (this.getCanvasedGuest(n).readU16LE(layout.GUEST_ITEM_COUNT_OFFSET) & 0xfe0) >> 5
  }

  setGuestItemCompletion(n, v) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_ITEM_COUNT_OFFSET)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xf01f) | ((v << 5) & 0xfe0),
      layout.GUEST_ITEM_COUNT_OFFSET
    )
  }

  getGuestAlchenomiconCompletion(n) {
    return (
      (this.getCanvasedGuest(n).readU32LE(layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET) & 0x3f800000) >>
      23
    )
  }

  setGuestAlchenomiconCompletion(n, v) {
    const prev = this.getCanvasedGuest(n).readU32LE(layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET)

    this.getCanvasedGuest(n).writeU32LE(
      (prev & 0xc07fffff) | ((v << 23) & 0x3f800000),
      layout.GUEST_QUEST_GUEST_ALCHEMY_OFFSET
    )
  }

  getCanvasedGuestTitle(n) {
    let title =
      ((this.getCanvasedGuest(n).readU32LE(layout.GUEST_TITLE_ORIGIN_OFFSET) >> 8) & 0x3ff8) >> 3

    //NOTE: not totally sure if this should be done this way but i can't figure out any reason for it being different
    if (700 < title && title < 800) title = 700
    if (900 <= title && title < 1000) title -= 100

    return title
  }

  setCanvasedGuestTitle(n, title) {
    const prev = this.getCanvasedGuest(n).readU32LE(layout.GUEST_TITLE_ORIGIN_OFFSET)

    this.getCanvasedGuest(n).writeU32LE(
      (prev & 0xffc007ff) | (((title << 3) & 0x3ff8) << 8),
      layout.GUEST_TITLE_ORIGIN_OFFSET
    )
  }

  getCanvasedGuestOrigin(n) {
    return (this.getCanvasedGuest(n).readU16LE(layout.GUEST_TITLE_ORIGIN_OFFSET) & 0x7fe) >> 1
  }

  setCanvasedGuestOrigin(n, origin) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_TITLE_ORIGIN_OFFSET)
    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xf801) | ((origin << 1) & 0x7fe),
      layout.GUEST_TITLE_ORIGIN_OFFSET
    )
  }

  getGuestBirthday(n) {
    return this.getCanvasedGuest(n).readI32LE(layout.GUEST_BIRTHDAY_OFFSET)
  }

  setGuestBirthday(n, date) {
    this.getCanvasedGuest(n).writeI32LE(date, layout.GUEST_BIRTHDAY_OFFSET)
  }

  getCanvasedGuestSpeechStyle(n) {
    return (this.getCanvasedGuest(n).readU16LE(layout.GUEST_SPEECH_STYLE_OFFSET) & 0x1e0) >> 5
  }

  setCanvasedGuestSpeechStyle(n, style) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_SPEECH_STYLE_OFFSET)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xfe1f) | ((style << 5) & 0x1e0),
      layout.GUEST_SPEECH_STYLE_OFFSET
    )
  }

  isGuestAgeSecret(n) {
    return (this.getCanvasedGuest(n).readByte(layout.GUEST_SECRET_AGE_OFFSET) & 0x80) == 0
  }

  setGuestAgeSecret(n, secret) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_SECRET_AGE_OFFSET)

    this.getCanvasedGuest(n).writeByte(
      (prev & 0x7f) | (secret ? 0 : 0x80),
      layout.GUEST_SECRET_AGE_OFFSET
    )
  }

  getGuestMessage(n) {
    return this.getCanvasedGuest(n).readDqixString(
      layout.GUEST_MESSAGE_OFFSET,
      layout.GUEST_MESSAGE_LENGTH
    )
  }

  setGuestMessage(n, message) {
    message = message
      .substr(0, layout.GUEST_MESSAGE_LENGTH)
      .padEnd(layout.GUEST_MESSAGE_LENGTH, "\0")

    this.getCanvasedGuest(n).writeDqixString(message, layout.GUEST_MESSAGE_OFFSET)
  }

  getGuestVocation(n) {
    return this.getCanvasedGuest(n).readByte(layout.GUEST_VOCATION_AND_LOCATION_OFFSET) & 0xf
  }

  getGuestEquipment(n, type) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    return this.getCanvasedGuest(n).readU16LE(layout.GUEST_EQUIPMENT_OFFSET + (type - 1) * 2)
  }

  /// Sets the equipped item in the given slot for the given guest
  setGuestEquipment(n, type, id) {
    if (type <= 0 || type > gameData.ITEM_TYPE_ACCESSORY) {
      return null
    }

    return this.getCanvasedGuest(n).writeU16LE(id, layout.GUEST_EQUIPMENT_OFFSET + (type - 1) * 2)
  }

  getGuestGender(n) {
    //TODO: there are like 3 different gender values? which one..?

    return this.getCanvasedGuest(n).readByte(layout.GUEST_GENDER_COLORS_OFFSET) & 0x1
  }

  getGuestEyeColor(n) {
    return (this.getCanvasedGuest(n).readByte(layout.GUEST_GENDER_COLORS_OFFSET) & 0xf0) >> 4
  }

  setGuestEyeColor(n, color) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_GENDER_COLORS_OFFSET)
    return this.getCanvasedGuest(n).writeByte(
      (prev & 0x0f) | (color << 4),
      layout.GUEST_GENDER_COLORS_OFFSET
    )
  }

  getGuestSkinColor(n) {
    return (this.getCanvasedGuest(n).readByte(layout.GUEST_GENDER_COLORS_OFFSET) & 0xe) >> 1
  }

  setGuestSkinColor(n, color) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_GENDER_COLORS_OFFSET)
    this.getCanvasedGuest(n).writeByte(
      (prev & 0xf1) | (color << 1),
      layout.GUEST_GENDER_COLORS_OFFSET
    )
  }

  getGuestFace(n) {
    return this.getCanvasedGuest(n).readByte(layout.GUEST_FACE_OFFSET)
  }

  setGuestFace(n, value) {
    this.getCanvasedGuest(n).writeByte(value, layout.GUEST_FACE_OFFSET)
  }

  getGuestHairstyle(n) {
    return this.getCanvasedGuest(n).readByte(layout.GUEST_HAIRSTYLE_OFFSET)
  }

  setGuestHairstyle(n, value) {
    this.getCanvasedGuest(n).writeByte(value, layout.GUEST_HAIRSTYLE_OFFSET)
  }

  getGuestHairColor(n) {
    return this.getCanvasedGuest(n).readByte(layout.GUEST_HAIR_COLOR_OFFSET) & 0xf
  }

  setGuestHairColor(n, value) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_HAIR_COLOR_OFFSET)
    this.getCanvasedGuest(n).writeByte(
      (prev & 0xf0) | (value & 0x0f),
      layout.GUEST_HAIR_COLOR_OFFSET
    )
  }

  getGuestBodyTypeW(n) {
    return this.getCanvasedGuest(n).readU16LE(layout.GUEST_BODY_TYPE_W)
  }

  getGuestBodyTypeH(n) {
    return this.getCanvasedGuest(n).readU16LE(layout.GUEST_BODY_TYPE_H)
  }

  setGuestBodyTypeW(n, value) {
    return this.getCanvasedGuest(n).writeU16LE(value, layout.GUEST_BODY_TYPE_W)
  }

  setGuestBodyTypeH(n, value) {
    return this.getCanvasedGuest(n).writeU16LE(value, layout.GUEST_BODY_TYPE_H)
  }

  /*************************************************************************************************
   *                                          inn methods                                          *
   *************************************************************************************************/

  getInnLevel() {
    return Math.min(6, this.getSaveLogBuffer().readByte(layout.INN_LEVEL_OFFSET) & 0x7)
  }

  setInnLevel(level) {
    level = Math.max(0, Math.min(level, 6))

    const prev = this.getSaveLogBuffer().readByte(layout.INN_LEVEL_OFFSET)

    this.getSaveLogBuffer().writeByte((prev & 0xf8) | level, layout.INN_LEVEL_OFFSET)
  }

  /*************************************************************************************************
   *                                          dlc methods                                          *
   *************************************************************************************************/

  isSpecialGuestVisiting(i) {
    return !!(this.getSaveLogBuffer().readI32LE(layout.SPECIAL_GUEST_OFFSET) & (1 << (i + 1)))
  }

  setSpecialGuestVisiting(i, visiting) {
    const prev = this.getSaveLogBuffer().readI32LE(layout.SPECIAL_GUEST_OFFSET)
    const mask = 1 << (i + 1)
    this.getSaveLogBuffer().writeI32LE(
      (prev & ~mask) | (visiting ? mask : 0),
      layout.SPECIAL_GUEST_OFFSET
    )
  }

  getDqvcItem(n) {
    return this.getSaveLogBuffer().readU16LE(
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_ITEM_OFFSET + layout.DQVC_ITEM_SIZE * n
    )
  }

  setDqvcItem(n, item) {
    this.getSaveLogBuffer().writeU16LE(
      item,
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_ITEM_OFFSET + layout.DQVC_ITEM_SIZE * n
    )
  }

  getDqvcPrice(n) {
    return (
      (this.getSaveLogBuffer().readU32LE(
        layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
      ) &
        0xffffff80) >>
      7
    )
  }

  setDqvcPrice(n, price) {
    const prev = this.getSaveLogBuffer().readU32LE(
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
    )

    this.getSaveLogBuffer().writeU32LE(
      (prev & 0x7f) | ((price << 7) & 0xffffff80),
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
    )
  }

  getDqvcStock(n) {
    return (
      this.getSaveLogBuffer().readByte(
        layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
      ) & 0x7f
    )
  }

  setDqvcStock(n, stock) {
    const prev =
      this.getSaveLogBuffer().readByte(
        layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
      ) & 0x7f

    this.getSaveLogBuffer().writeByte(
      (prev & ~0x7f) | stock,
      layout.DQVC_ITEMS_OFFSET + layout.DQVC_ITEMS_PRICE_STOCK_OFFSET + layout.DQVC_ITEM_SIZE * n
    )
  }

  getDqvcMessage() {
    return this.getSaveLogBuffer().readAsciiString(
      layout.DQVC_MESSAGE_OFFSET,
      layout.DQVC_MESSAGE_LENGTH
    )
  }

  setDqvcMessage(str) {
    str = str.substring(0, layout.DQVC_MESSAGE_LENGTH).padEnd(layout.DQVC_MESSAGE_LENGTH, "\0")

    this.getSaveLogBuffer().writeAsciiString(str, layout.DQVC_MESSAGE_OFFSET)
  }

  getDqvcMessageExpiryTime() {
    return this.getSaveLogBuffer().readU32LE(layout.DQVC_MESSAGE_EXPIRY_TIME_OFFSET)
  }

  setDqvcMessageExpiryTime(time) {
    return this.getSaveLogBuffer().writeU32LE(time, layout.DQVC_MESSAGE_EXPIRY_TIME_OFFSET)
  }

  getDqvcItemExpiryTime() {
    return this.getSaveLogBuffer().readU32LE(layout.DQVC_ITEMS_EXPIRY_TIME_OFFSET)
  }

  setDqvcItemExpiryTime(time) {
    return this.getSaveLogBuffer().writeU32LE(time, layout.DQVC_ITEMS_EXPIRY_TIME_OFFSET)
  }

  /*************************************************************************************************
   *                                         quest methods                                         *
   *************************************************************************************************/

  getQuestCompletionCount() {
    return this.getSaveLogBuffer().readByte(layout.QUEST_CLEAR_COUNT_OFFSET)
  }

  updateQuestCompletionCount() {
    this.getSaveLogBuffer().writeByte(
      gameData.quests.reduce(
        (a, q) =>
          a +
          (!!(
            this.getSaveLogBuffer().readByte(layout.QUEST_CLEARED_OFFSET + Math.floor(q.id / 8)) &
            (1 << q.id % 8)
          )
            ? 1
            : 0),
        0
      ),
      layout.QUEST_CLEAR_COUNT_OFFSET
    )
  }

  getQuestStatus(id) {
    // const completed =
    //   this.getSaveLogBuffer().readByte(layout.QUEST_CLEARED_OFFSET + Math.floor(id / 8)) &
    //   (1 << id % 8)
    // if (completed) {
    //   return gameData.QUEST_STATUS_COMPLETE
    // }

    const byte = this.getSaveLogBuffer().readByte(layout.QUEST_STATUS_OFFSET + Math.floor(id / 2))

    return (id % 2 ? byte >> 4 : byte & 0xf) & 0x7
  }

  setQuestStatus(id, status) {
    const prevCompleted = this.getSaveLogBuffer().readByte(
      layout.QUEST_CLEARED_OFFSET + Math.floor(id / 8)
    )
    this.getSaveLogBuffer().writeByte(
      (prevCompleted & (0xff ^ (1 << id % 8))) |
        ((status == gameData.QUEST_STATUS_COMPLETE) << id % 8),
      layout.QUEST_CLEARED_OFFSET + Math.floor(id / 8)
    )

    this.updateQuestCompletionCount()

    status = status & 0x7
    const prev = this.getSaveLogBuffer().readByte(layout.QUEST_STATUS_OFFSET + Math.floor(id / 2))

    this.getSaveLogBuffer().writeByte(
      (prev & (id % 2 ? 0x8f : 0xf8)) | (id % 2 ? status << 4 : status),
      layout.QUEST_STATUS_OFFSET + Math.floor(id / 2)
    )
  }

  getDlcQuestUnlocked(id) {
    const byte = this.getSaveLogBuffer().readByte(layout.QUEST_STATUS_OFFSET + Math.floor(id / 2))
    return !!((id % 2 ? byte >> 4 : byte & 0xf) & 0x8)
  }

  setDlcQuestUnlocked(id, unlocked) {
    unlocked = unlocked ? 1 : 0
    const prev = this.getSaveLogBuffer().readByte(layout.QUEST_STATUS_OFFSET + Math.floor(id / 2))

    this.getSaveLogBuffer().writeByte(
      (prev & (id % 2 ? 0x7f : 0xf7)) | (unlocked << (id % 2 ? 7 : 3)),
      layout.QUEST_STATUS_OFFSET + Math.floor(id / 2)
    )
  }

  getQuestTime(id) {
    return this.getSaveLogBuffer().readU32LE(layout.QUEST_TIMES_OFFSET + id * 4)
  }

  setQuestTime(id, time) {
    return this.getSaveLogBuffer().writeU32LE(time, layout.QUEST_TIMES_OFFSET + id * 4)
  }
}
