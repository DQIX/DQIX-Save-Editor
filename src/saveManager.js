/// this file contains control functions relating to getting and setting particular pieces of data in saves
/// this is done in a sorta bad way, mostly because js doesn't have types of this granularity
///
/// please someone write this in like C with bitfields lol

import { Buffer } from "buffer"
import crc32 from "crc-32"

import gameData from "./game/data"

import * as layout from "./game/layout"
import HistoryBuffer from "./historyBuffer"
import Grotto, { registerGrottos } from "./game/grotto"
import {
  createValidCharacter,
  createValidGuest,
  emptyCharacter,
  emptyGuest,
  generateId,
} from "./game/character"
import { getHourFromTime, timeFromDateObject } from "./game/time"

export default class SaveManager {
  /*************************************************************************************************
   *                                        control methods                                        *
   *************************************************************************************************/
  constructor(buffer) {
    window.save = this

    this.buffer = buffer && new HistoryBuffer(buffer)
    this.saveIdx = 0
    this.saveSlots = []

    if (this.buffer) {
      registerGrottos()
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
        this.saveSlots[i].buffer.subarray(
          layout.CHECKSUM_A_DATA_OFFSET,
          layout.CHECKSUM_A_DATA_END
        ),
        0
      )
      const b = crc32.buf(
        this.saveSlots[i].buffer.subarray(
          layout.CHECKSUM_B_DATA_OFFSET,
          layout.CHECKSUM_B_DATA_END
        ),
        0
      )
      const c = crc32.buf(
        this.saveSlots[i].buffer.subarray(
          layout.CHECKSUM_C_DATA_OFFSET,
          layout.CHECKSUM_C_DATA_END
        ),
        0
      )

      // NOTE: crc-32 returns an int instead of a uint
      const srcA = this.saveSlots[i].readI32LE(layout.CHECKSUM_A_OFFSET)
      const srcB = this.saveSlots[i].readI32LE(layout.CHECKSUM_B_OFFSET)
      const srcC = this.saveSlots[i].readI32LE(layout.CHECKSUM_C_OFFSET)

      if (a != srcA || b != srcB || c != srcC) {
        return false
      }
    }

    return true
  }

  load(buffer) {
    this.buffer = buffer
  }

  async loadDemo() {
    const response = await fetch("demoSaves/demo.sav")
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
      this.saveSlots[i].writeI32LE(newChecksums[2], layout.CHECKSUM_C_OFFSET)
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
      crc32.buf(
        this.saveSlots[slot].buffer.subarray(
          layout.CHECKSUM_C_DATA_OFFSET,
          layout.CHECKSUM_C_DATA_END
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

  moveCharacter(from, to) {
    //FIXME: lol send help
    // if (from > this.getStandbyCount() && to < this.getStandbyCount() && this.getPartyCount() > 1) {
    //   this.getSaveLogBuffer().writeByte(
    //     this.getSaveLogBuffer().readByte(layout.STANDBY_COUNT_OFFSET) + 1,
    //     layout.STANDBY_COUNT_OFFSET
    //   )
    //   this.getSaveLogBuffer().writeByte(
    //     this.getSaveLogBuffer().readByte(layout.PARTY_COUNT_OFFSET) - 1,
    //     layout.PARTY_COUNT_OFFSET
    //   )
    // }
    // const src = this.getCharacterBuffer(from).cloneInner()
    // if (from < to) {
    //   const offset = layout.CHARACTER_OFFSET + layout.CHARACTER_SIZE * (from + 1)
    //   const scooted = this.getSaveLogBuffer()
    //     .subarray(offset, offset + layout.CHARACTER_SIZE * (to - from))
    //     .cloneInner()
    //   this.getSaveLogBuffer()
    //     .subarray(offset - layout.CHARACTER_SIZE, offset + layout.CHARACTER_SIZE * (to - from))
    //     .writeBuffer(scooted, 0)
    // } else {
    //   const offset = layout.CHARACTER_OFFSET + layout.CHARACTER_SIZE * to
    //   const scooted = this.getSaveLogBuffer()
    //     .subarray(offset, offset + layout.CHARACTER_SIZE * (from - to))
    //     .cloneInner()
    //   this.getSaveLogBuffer()
    //     .subarray(offset + layout.CHARACTER_SIZE, offset + layout.CHARACTER_SIZE * (from - to))
    //     .writeBuffer(scooted, 0)
    // }
    // this.getCharacterBuffer(to).writeBuffer(src, 0)
  }

  tryAddNewCharacter() {
    if (this.getCharacterCount() >= layout.MAX_CHARACTERS_IN_INN + 1) {
      return
    }

    const characterIdx = this.getStandbyCount()
    this.getSaveLogBuffer().writeByte(characterIdx + 1, layout.STANDBY_COUNT_OFFSET)

    const offset = layout.CHARACTER_OFFSET + layout.CHARACTER_SIZE * characterIdx
    const scooted = this.getSaveLogBuffer()
      .subarray(offset, offset + layout.CHARACTER_SIZE * this.getPartyCount())
      .cloneInner()
    this.getSaveLogBuffer()
      .subarray(
        offset + layout.CHARACTER_SIZE,
        offset + layout.CHARACTER_SIZE * this.getPartyCount()
      )
      .writeBuffer(scooted, 0)

    this.getSaveLogBuffer()
      .subarray(
        offset + layout.CHARACTER_SIZE,
        offset + layout.CHARACTER_SIZE * this.getPartyCount()
      )
      .writeBuffer(scooted, 0)

    // create character

    const characterBuffer = Buffer.from(emptyCharacter)

    const character = createValidCharacter()

    this.getCharacterBuffer(characterIdx).writeBuffer(characterBuffer, 0)

    this.writeCharacterName(characterIdx, character.name)
    this.setCharacterGender(characterIdx, character.gender)
    this.setCharacterVocation(characterIdx, character.vocation)
    this.setCharacterFace(characterIdx, character.face)
    this.setCharacterHairstyle(characterIdx, character.hairstyle)
    this.setCharacterEyeColor(characterIdx, character.eyeColor)
    this.setCharacterHairColor(characterIdx, character.hairColor)
    this.setCharacterSkinColor(characterIdx, character.skinColor)
    this.setCharacterBodyTypeW(characterIdx, character.bodyType.width)
    this.setCharacterBodyTypeH(characterIdx, character.bodyType.height)
    this.setCharacterColor(characterIdx, character.color)
  }

  /*************************************************************************************************
   *                                       character methods                                       *
   *************************************************************************************************/

  getCharacterBuffer(n) {
    const offset = layout.CHARACTER_OFFSET + layout.CHARACTER_SIZE * n

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

  setCharacterGender(n, gender) {
    const prev = this.getCharacterBuffer(n).readByte(layout.CHARACTER_GENDER_COLORS_OFFSET)
    this.getCharacterBuffer(n).writeByte(
      (prev & 0xfe) | (gender & 1),
      layout.CHARACTER_GENDER_COLORS_OFFSET
    )
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
    this.getCharacterBuffer(n).writeByte(
      (prev & 0xf1) | (color << 1),
      layout.CHARACTER_GENDER_COLORS_OFFSET
    )
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

  /// returns undershirt color
  getCharacterColor(n) {
    return this.getCharacterBuffer(n).readByte(layout.CHARACTER_COLOR_OFFSET) & 0x0f
  }

  setCharacterColor(n, c) {
    const prev = this.getCharacterBuffer(n).readByte(layout.CHARACTER_COLOR_OFFSET)
    this.getCharacterBuffer(n).writeByte((prev & 0xf0) | (c & 0x0f), layout.CHARACTER_COLOR_OFFSET)
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
    //FIXME: linear search isn't ideal here, maybe make this a hashmap created in the constructor?
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
    if (count > 0) {
      if (offset.isWardrobe) {
        this.setWardrobeItemFound(gameData.items[id].wardrobeIdx, true)
      } else {
        this.setItemFound(gameData.items[id].itemIdx, true)
      }
    }

    if (!offset.isWardrobe) {
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
   *                                         profile methods                                       *
   *************************************************************************************************/

  isPlayerIdValid(id) {
    for (let i = 0; i < 30; i++) {
      if (this.getCanvasedGuestIndex(i) != 0 && this.getCanvasedGuestId(i) == id) return false
    }

    return true
  }

  getPlayerId() {
    return this.getSaveLogBuffer().readBigU64LE(layout.PLAYER_ID_OFFSET) & 0xffffffffffffn
  }

  setPlayerId(id) {
    const prev = this.getSaveLogBuffer().readBigU64LE(layout.PLAYER_ID_OFFSET)

    this.getSaveLogBuffer().writeBigU64LE(
      (prev & 0xffff000000000000n) | (id & 0xffffffffffffn),
      layout.PLAYER_ID_OFFSET
    )
  }

  getProfileOrigin() {
    return (this.getSaveLogBuffer().readU16LE(layout.PROFILE_TITLE_ORIGIN_OFFSET) & 0x7fe) >> 1
  }

  setProfileOrigin(origin) {
    const prev = this.getSaveLogBuffer().readU16LE(layout.PROFILE_TITLE_ORIGIN_OFFSET)

    this.getSaveLogBuffer().writeU16LE(
      (prev & 0xf801) | ((origin << 1) & 0x7fe),
      layout.PROFILE_TITLE_ORIGIN_OFFSET
    )
  }

  getProfileBirthday() {
    return this.getSaveLogBuffer().readI32LE(layout.PROFILE_BIRTHDAY_OFFSET)
  }

  setProfileBirthday(birthday) {
    this.getSaveLogBuffer().writeI32LE(birthday, layout.PROFILE_BIRTHDAY_OFFSET)
  }

  isProfileAgeSecret() {
    return !(this.getSaveLogBuffer().readByte(layout.PROFILE_SECRET_AGE_OFFSET) & 0x80)
  }

  setProfileAgeSecret(secret) {
    const prev = this.getSaveLogBuffer().readByte(layout.PROFILE_SECRET_AGE_OFFSET)

    this.getSaveLogBuffer().writeByte(
      (prev & 0x7f) | (secret ? 0 : 0x80),
      layout.PROFILE_SECRET_AGE_OFFSET
    )
  }

  getProfileTitle() {
    let title =
      ((this.getSaveLogBuffer().readU32LE(layout.PROFILE_TITLE_ORIGIN_OFFSET) >> 8) & 0x3ff8) >> 3

    //NOTE: not totally sure if this should be done this way but i can't figure out any reason for it being different
    if (700 < title && title < 800) title = 700
    if (900 <= title && title < 1000) title -= 100

    return title
  }

  setProfileTitle(title) {
    const prev = this.getSaveLogBuffer().readU32LE(layout.PROFILE_TITLE_ORIGIN_OFFSET)

    this.getSaveLogBuffer().writeU32LE(
      (prev & 0xffc007ff) | (((title << 3) & 0x3ff8) << 8),
      layout.PROFILE_TITLE_ORIGIN_OFFSET
    )
  }

  //FIXME: idk, gender is hard, there's like 3 here i think
  // speech style changes this too because why not
  getProfileGender() {
    return this.getCharacterGender(this.getStandbyCount())
  }

  getProfileSpeechStyle() {
    return (this.getSaveLogBuffer().readU16LE(layout.PROFILE_SPEECH_STYLE_OFFSET) & 0x1e0) >> 5
  }

  setProfileSpeechStyle(style) {
    const prev = this.getSaveLogBuffer().readU16LE(layout.PROFILE_SPEECH_STYLE_OFFSET)

    this.getSaveLogBuffer().writeU16LE(
      (prev & 0xfe1f) | ((style << 5) & 0x1e0),
      layout.PROFILE_SPEECH_STYLE_OFFSET
    )
  }

  getProfileMessage() {
    return this.getSaveLogBuffer().readDqixString(
      layout.PROFILE_MESSAGE_OFFSET,
      layout.PROFILE_MESSAGE_LENGTH
    )
  }

  setProfileMessage(message) {
    message = message
      .substr(0, layout.PROFILE_MESSAGE_LENGTH)
      .padEnd(layout.PROFILE_MESSAGE_LENGTH, "\0")

    this.getSaveLogBuffer().writeDqixString(message, layout.PROFILE_MESSAGE_OFFSET)
  }

  /*************************************************************************************************
   *                                    canvased guest methods                                     *
   *************************************************************************************************/

  getCanvasedGuest(n) {
    //HACK: i'm just as disgusted with this as you are, see `exportSelfAsGuest`
    if (n == -1 && this.selfGuestBuffer) {
      return this.selfGuestBuffer
    }

    const offset = layout.CANVASED_GUEST_OFFSET + n * layout.CANVASED_GUEST_SIZE

    return this.getSaveLogBuffer().subarray(offset, offset + layout.CANVASED_GUEST_SIZE)
  }

  getCanvasedGuestCount() {
    return this.getSaveLogBuffer().readByte(layout.CURRENT_GUESTS_CANVASED_OFFSET)
  }

  setCanvasedGuestCount(n) {
    this.getSaveLogBuffer().writeByte(n, layout.CURRENT_GUESTS_CANVASED_OFFSET)
  }

  isGuestIdValid(id) {
    if (id == this.getPlayerId()) return false

    return this.isPlayerIdValid()
  }

  exportSelfAsGuest(grottoIdx) {
    //NOTE: see `getCanvasedGuest`
    this.selfGuestBuffer = new HistoryBuffer(Buffer.from(emptyGuest))

    this.setCanvasedGuestId(-1, this.getPlayerId())

    const playerIdx = this.getStandbyCount()
    this.setCanvasedGuestName(-1, this.getCharacterName(playerIdx))
    this.setGuestGender(-1, this.getCharacterGender(playerIdx))
    const vocation = this.getCharacterVocation(playerIdx)
    this.setGuestVocation(-1, vocation)

    this.setGuestFace(-1, this.getCharacterFace(playerIdx))
    this.setGuestHairstyle(-1, this.getCharacterHairstyle(playerIdx))
    this.setGuestEyeColor(-1, this.getCharacterEyeColor(playerIdx))
    this.setGuestHairColor(-1, this.getCharacterHairColor(playerIdx))
    this.setGuestSkinColor(-1, this.getCharacterSkinColor(playerIdx))
    this.setGuestBodyTypeW(-1, this.getCharacterBodyTypeW(playerIdx))
    this.setGuestBodyTypeH(-1, this.getCharacterBodyTypeH(playerIdx))
    this.setGuestColor(-1, this.getCharacterColor(playerIdx))
    for (const type of gameData.equipmentTypes) {
      this.setGuestEquipment(-1, type, this.getCharacterEquipment(playerIdx, type))
    }

    this.setGuestLevel(-1, this.getCharacterLevel(playerIdx, vocation))
    this.setGuestRevocations(-1, this.getCharacterRevocations(playerIdx, vocation))

    this.setGuestBirthday(-1, this.getProfileBirthday())
    this.setGuestAgeSecret(-1, this.isProfileAgeSecret())
    this.setCanvasedGuestTitle(-1, this.getProfileTitle())
    this.setCanvasedGuestSpeechStyle(-1, this.getProfileSpeechStyle())
    this.setCanvasedGuestOrigin(-1, this.getProfileOrigin())
    this.setGuestMessage(-1, this.getProfileMessage())

    this.setGuestBattleVictories(-1, this.getBattleVictories())
    this.setGuestAlchemyCount(-1, this.getAlchemyCount())
    this.setGuestAccoladeCount(-1, this.getAccoladeCount())
    this.setGuestQuestsCompleted(-1, this.getQuestCompletionCount())
    this.setGuestGrottosCompleted(-1, this.getGrottosCompleted())
    this.setGuestGuestsCanvased(-1, this.getCanvasedGuestCount() + 1)
    this.setGuestMonsterCompletion(-1, this.getMonsterCompletion())
    this.setGuestWardrobeCompletion(-1, this.getWardrobeCompletion())
    this.setGuestItemCompletion(-1, this.getItemCompletion())
    this.setGuestAlchenomiconCompletion(-1, this.getAlchenomiconCompletion())

    const playtime = this.getPlaytime()
    this.setGuestPlaytimeHours(-1, playtime[0])
    this.setGuestPlaytimeMinutes(-1, playtime[1])
    const mPlaytime = this.getMultiplayerTime()
    this.setGuestMultiPlayerTimeHours(-1, mPlaytime[0])
    this.setGuestMultiPlayerTimeMinutes(-1, mPlaytime[1])

    if (grottoIdx != -1) {
      const grotto = this.getGrotto(grottoIdx)._buffer
      this.getGuestHeldGrotto(-1)._buffer.writeBuffer(grotto._buffer, 0)
      this.setGuestHoldingGrotto(-1, true)
    }

    this.fixGuest(-1)

    const str = [...this.selfGuestBuffer._buffer].map(n => n.toString(16).padStart(2, "0")).join("")

    this.selfGuestBuffer = null

    return str
  }

  addNewCanvasedGuest() {
    if (this.getCanvasedGuestCount() >= 30) {
      return
    }

    let idx = 0
    while (this.getCanvasedGuestIndex(idx) != 0 && ++idx <= 30);
    if (idx > 30) return

    this.setCanvasedGuestIndex(idx, this.getCanvasedGuestCount() + 1)

    const guest = createValidGuest()

    let id = generateId()
    while (!this.isGuestIdValid(id)) id = generateId()
    this.setCanvasedGuestId(idx, id)

    this.setCanvasedGuestName(idx, guest.name)
    this.setGuestGender(idx, guest.gender)
    this.setGuestVocation(idx, guest.vocation)
    this.setGuestFace(idx, guest.face)
    this.setGuestHairstyle(idx, guest.hairstyle)
    this.setGuestEyeColor(idx, guest.eyeColor)
    this.setGuestHairColor(idx, guest.hairColor)
    this.setGuestSkinColor(idx, guest.skinColor)
    this.setGuestBodyTypeW(idx, guest.bodyType.width)
    this.setGuestBodyTypeH(idx, guest.bodyType.height)
    this.setGuestColor(idx, guest.color)
    for (const [type, item] of Object.entries(guest.equipment)) {
      this.setGuestEquipment(idx, type, item)
    }

    this.setGuestLevel(idx, guest.level)
    this.setGuestRevocations(idx, guest.revocations)

    this.setGuestBirthday(idx, timeFromDateObject(guest.birthday))
    this.setGuestAgeSecret(idx, guest.agePrivate)
    this.setCanvasedGuestTitle(idx, guest.title)
    this.setCanvasedGuestSpeechStyle(idx, guest.speech)
    this.setCanvasedGuestOrigin(idx, guest.origin)

    this.setGuestBattleVictories(idx, guest.victories)
    this.setGuestAlchemyCount(idx, guest.alchemy)
    this.setGuestAccoladeCount(idx, guest.accolades)
    this.setGuestQuestsCompleted(idx, guest.quests)
    this.setGuestGrottosCompleted(idx, guest.grottos)
    this.setGuestGuestsCanvased(idx, guest.guests)
    this.setGuestMonsterCompletion(idx, guest.monster)
    this.setGuestWardrobeCompletion(idx, guest.wardrobe)
    this.setGuestItemCompletion(idx, guest.items)
    this.setGuestAlchenomiconCompletion(idx, guest.alchenomicon)

    this.setGuestPlaytimeHours(idx, guest.playTime.hours)
    this.setGuestPlaytimeMinutes(idx, guest.playTime.minutes)
    this.setGuestMultiPlayerTimeHours(idx, guest.multiplayerTime.hours)
    this.setGuestMultiPlayerTimeMinutes(idx, guest.multiplayerTime.minutes)

    const now = new Date()
    this.setGuestCheckInDay(idx, now.getDate())
    this.setGuestCheckInMonth(idx, now.getMonth() + 1)
    this.setGuestCheckInYear(idx, now.getFullYear())

    this.fixGuest(idx)

    this.bumpGuests()
    this.setGuestLocation(idx, 2)

    this.setCanvasedGuestCount(this.getCanvasedGuestCount() + 1)
    this.setGuestsCanvased(this.getGuestsCanvased() + 1)

    return idx
  }

  fixGuest(n) {
    // make render style Normal
    this.setGuestRenderStyle(
      n,
      gameData.GUEST_RENDER_STYLE_3D | gameData.GUEST_RENDER_STYLE_UNKNOWN_A
    )

    {
      // no clue why it needs this but without it the age calc bugs out
      const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_TITLE_ORIGIN_OFFSET)
      this.getCanvasedGuest(n).writeByte(prev & 0xfe, layout.GUEST_TITLE_ORIGIN_OFFSET)
    }

    {
      // without this transferring out of the royal suites deletes the character
      const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_SECRET_AGE_OFFSET)
      this.getCanvasedGuest(n).writeByte((prev & 0xc3) | 0x1e, layout.GUEST_SECRET_AGE_OFFSET)
    }
  }

  importGuest(str) {
    if (this.getCanvasedGuestCount() >= 30) {
      return
    }

    let idx = 0
    while (this.getCanvasedGuestIndex(idx) != 0 && ++idx <= 30);
    if (idx > 30) return

    const bytes = new Uint8Array(str.length / 2)
    for (let i = 0; i < bytes.byteLength; i++) {
      bytes[i] = parseInt(str.substr(i * 2, 2), 16)
    }

    this.getCanvasedGuest(idx).writeBuffer(Buffer.from(bytes), 0)

    this.setCanvasedGuestIndex(idx, this.getCanvasedGuestCount() + 1)

    const now = new Date()
    this.setGuestCheckInDay(idx, now.getDate())
    this.setGuestCheckInMonth(idx, now.getMonth() + 1)
    this.setGuestCheckInYear(idx, now.getFullYear())

    this.bumpGuests()
    this.setGuestLocation(idx, 2)

    this.setCanvasedGuestCount(this.getCanvasedGuestCount() + 1)
    this.setGuestsCanvased(this.getGuestsCanvased() + 1)

    return idx
  }

  removeGuest(idx) {
    // "empty" guest, actually contains some real data but its taken from the save file directly
    //prettier-ignore
    this.getCanvasedGuest(idx).writeBuffer(Buffer.from(emptyGuest), 0)

    this.setCanvasedGuestCount(this.getCanvasedGuestCount() - 1)
  }

  bumpGuests() {
    const guestIdxs = Array.from({ length: 30 }, (_, i) => ({
      idx: this.getCanvasedGuestIndex(i),
      guest: i,
    }))
      .filter(guest => guest.idx != 0)
      .sort((a, b) => b.idx - a.idx) //intentional reverse
      .map(g => g.guest)

    const locs = {}

    for (const g of guestIdxs) {
      if (gameData.guestLocations[this.getGuestLocation(g)].royal) continue

      if (!locs[this.getGuestLocation(g)]) {
        locs[this.getGuestLocation(g)] = 0
      }

      if (
        locs[this.getGuestLocation(g)] + 1 >=
        gameData.guestLocations[this.getGuestLocation(g)].size
      ) {
        this.setGuestLocation(g, this.getGuestLocation(g) + 1)
      }

      locs[this.getGuestLocation(g)]++
    }
  }

  getCanvasedGuestIndex(n) {
    return (this.getCanvasedGuest(n).readU32LE(layout.GUEST_INDEX_OFFSET) & 0xfffffffc) >> 2
  }

  setCanvasedGuestIndex(n, idx) {
    const prev = this.getCanvasedGuest(n).readU32LE(layout.GUEST_INDEX_OFFSET)

    this.getCanvasedGuest(n).writeU32LE(
      (prev & 0x3) | ((idx << 2) & 0xfffffffc),
      layout.GUEST_INDEX_OFFSET
    )
  }

  getGuestRenderStyle(n) {
    return this.getCanvasedGuest(n).readU16LE(layout.GUEST_RENDER_STYLE_OFFSET) & 0x3ff
  }

  setGuestRenderStyle(n, flags) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_RENDER_STYLE_OFFSET)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xfc00) | (flags & 0x3ff),
      layout.GUEST_RENDER_STYLE_OFFSET
    )
  }

  getGuestLocation(n) {
    return (
      (this.getCanvasedGuest(n).readByte(layout.GUEST_VOCATION_AND_LOCATION_OFFSET) & 0xf0) >> 4
    )
  }

  setGuestLocation(n, loc) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_VOCATION_AND_LOCATION_OFFSET)

    this.getCanvasedGuest(n).writeByte(
      (prev & 0x0f) | ((loc << 4) & 0xf0),
      layout.GUEST_VOCATION_AND_LOCATION_OFFSET
    )
  }

  getGuestCheckInDay(n) {
    return (
      (this.getCanvasedGuest(n).readU16LE(layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET) & 0xf800) >>
      11
    )
  }

  setGuestCheckInDay(n, day) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0x7ff) | ((day << 11) & 0xf800),
      layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET
    )
  }

  getGuestCheckInMonth(n) {
    return (
      (this.getCanvasedGuest(n).readU16LE(layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET) & 0x780) >>
      7
    )
  }

  setGuestCheckInMonth(n, month) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xf87f) | ((month << 7) & 0x780),
      layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET
    )
  }

  getGuestCheckInYear(n) {
    return (
      2000 +
      (this.getCanvasedGuest(n).readByte(layout.GUEST_HOLDING_GROTTO_CHECK_IN_YEAR_OFFSET) & 0x7f)
    )
  }

  setGuestCheckInYear(n, year) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_HOLDING_GROTTO_CHECK_IN_YEAR_OFFSET)
    this.getCanvasedGuest(n).writeByte(
      (prev & 0x80) | ((year - 2000) & 0x7f),
      layout.GUEST_HOLDING_GROTTO_CHECK_IN_YEAR_OFFSET
    )
  }

  getCanvasedGuestId(n) {
    return this.getCanvasedGuest(n).readBigU64LE(layout.GUEST_ID_OFFSET) & 0xffffffffffffn
  }

  setCanvasedGuestId(n, id) {
    const prev = this.getCanvasedGuest(n).readBigU64LE(layout.GUEST_ID_OFFSET)

    this.getCanvasedGuest(n).writeBigU64LE(
      (prev & 0xffff000000000000n) | (id & 0xffffffffffffn),
      layout.GUEST_ID_OFFSET
    )
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
    return (this.getCanvasedGuest(n).readU32LE(layout.GUEST_ALCHEMY_COUNT) & 0x3fffc0) >> 6
  }

  setGuestAlchemyCount(n, v) {
    const prev = this.getCanvasedGuest(n).readU32LE(layout.GUEST_ALCHEMY_COUNT)

    this.getCanvasedGuest(n).writeU32LE(
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

    this.getCanvasedGuest(n).writeU16LE((prev & 0x3) | (v << 2), layout.GUEST_GROTTO_COUNT_OFFSET)
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

  getGuestPlaytimeHours(n) {
    return this.getCanvasedGuest(n).readU16LE(layout.GUEST_PLAYTIME_HOURS) & 0x3fff
  }

  setGuestPlaytimeHours(n, value) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_PLAYTIME_HOURS)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xc000) | (value & 0x3fff),
      layout.GUEST_PLAYTIME_HOURS
    )
  }

  getGuestPlaytimeMinutes(n) {
    return this.getCanvasedGuest(n).readU16LE(layout.GUEST_PLAYTIME_MINUTES) & 0x7f
  }

  setGuestPlaytimeMinutes(n, value) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_PLAYTIME_MINUTES)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xff80) | (value & 0x7f),
      layout.GUEST_PLAYTIME_MINUTES
    )
  }

  getGuestMultiPlayerTimeHours(n) {
    return this.getCanvasedGuest(n).readU16LE(layout.GUEST_MULTIPLAYER_HOURS) & 0x3fff
  }

  setGuestMultiPlayerTimeHours(n, value) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_MULTIPLAYER_HOURS)
    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xc000) | (value & 0x3fff),
      layout.GUEST_MULTIPLAYER_HOURS
    )
  }

  getGuestMultiPlayerTimeMinutes(n) {
    return (this.getCanvasedGuest(n).readU16LE(layout.GUEST_PLAYTIME_MINUTES) & 0x3f80) >> 7
  }

  setGuestMultiPlayerTimeMinutes(n, value) {
    const prev = this.getCanvasedGuest(n).readU16LE(layout.GUEST_PLAYTIME_MINUTES)

    this.getCanvasedGuest(n).writeU16LE(
      (prev & 0xc07f) | ((value << 7) & 0x3f80),
      layout.GUEST_PLAYTIME_MINUTES
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

    const prev1 = this.getCanvasedGuest(n).readU16LE(layout.GUEST_TITLE_TOP_OFFSET)
    this.getCanvasedGuest(n).writeU16LE(
      (prev1 & 0xf800) | (title & 0x7ff),
      layout.GUEST_TITLE_TOP_OFFSET
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

  setGuestVocation(n, v) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_VOCATION_AND_LOCATION_OFFSET)

    this.getCanvasedGuest(n).writeByte(
      (prev & 0xf0) | (v & 0xf),
      layout.GUEST_VOCATION_AND_LOCATION_OFFSET
    )
  }

  getGuestLevel(n) {
    return this.getCanvasedGuest(n).readByte(layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET) & 0x7f
  }

  setGuestLevel(n, lvl) {
    lvl = Math.max(1, Math.min(99, lvl))
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET)
    this.getCanvasedGuest(n).writeByte(
      (prev & 0x80) | (lvl & 0x7f),
      layout.GUEST_LEVEL_CHECK_IN_DAY_MONTH_OFFSET
    )
  }

  getGuestRevocations(n) {
    return (this.getCanvasedGuest(n).readByte(layout.GUEST_REVOCATION_OFFSET) & 0x1e) >> 1
  }

  setGuestRevocations(n, revocations) {
    revocations = Math.max(0, Math.min(10, revocations))

    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_REVOCATION_OFFSET)
    this.getCanvasedGuest(n).writeByte(
      (prev & 0xe1) | ((revocations << 1) & 0x1e),
      layout.GUEST_REVOCATION_OFFSET
    )
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

  setGuestGender(n, gender) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_GENDER_COLORS_OFFSET)

    this.getCanvasedGuest(n).writeByte(
      (prev & 0xfe) | (gender & 1),
      layout.GUEST_GENDER_COLORS_OFFSET
    )
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

  getGuestColor(n) {
    return this.getCanvasedGuest(n).readByte(layout.GUEST_COLOR_OFFSET) & 0x0f
  }

  setGuestColor(n, c) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_COLOR_OFFSET)
    this.getCanvasedGuest(n).writeByte((prev & 0xf0) | (c & 0x0f), layout.GUEST_COLOR_OFFSET)
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

  isGuestHoldingGrotto(n) {
    return !!(
      this.getCanvasedGuest(n).readByte(layout.GUEST_HOLDING_GROTTO_CHECK_IN_YEAR_OFFSET) & 0x80
    )
  }

  setGuestHoldingGrotto(n, held) {
    const prev = this.getCanvasedGuest(n).readByte(layout.GUEST_HOLDING_GROTTO_CHECK_IN_YEAR_OFFSET)

    this.getCanvasedGuest(n).writeByte(
      (prev & 0x7f) | (held << 7),
      layout.GUEST_HOLDING_GROTTO_CHECK_IN_YEAR_OFFSET
    )
  }

  getGuestHeldGrotto(n) {
    //NOTE: see ./grotto.js for read/write for the grotto buffers
    return new Grotto(
      this.getCanvasedGuest(n).subarray(
        layout.GUEST_HELD_GROTTO_OFFSET,
        layout.GUEST_HELD_GROTTO_OFFSET + layout.GROTTO_DATA_SIZE
      )
    )
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
   *                                         record methods                                        *
   *************************************************************************************************/

  getBattleVictories() {
    return this.getSaveLogBuffer().readU32LE(layout.BATTLE_VICTORIES_OFFSET) & 0xffffff
  }
  setBattleVictories(n) {}

  getAlchemyCount() {
    return this.getSaveLogBuffer().readI32LE(layout.ALCHEMY_PERFORMED_OFFSET)
  }
  setAlchemyCount(n) {
    return this.getSaveLogBuffer().writeI32LE(n, layout.ALCHEMY_PERFORMED_OFFSET)
  }

  getAccoladeCount() {
    return this.getSaveLogBuffer().readU16LE(layout.ACCOLADE_COUNT_OFFSET) & 0x1ff
  }

  setAccoladeCount(n) {
    console.log(n)
    const prev = this.getSaveLogBuffer().readU16LE(layout.ACCOLADE_COUNT_OFFSET)

    this.getSaveLogBuffer().writeU16LE((prev & 0xfe00) | (n & 0x1ff), layout.ACCOLADE_COUNT_OFFSET)
  }

  getQuestsCompleted() {
    return this.getSaveLogBuffer().readByte(layout.QUEST_CLEAR_COUNT_OFFSET)
  }

  setQuestsCompleted(n) {
    return this.getSaveLogBuffer().writeByte(n, layout.QUEST_CLEAR_COUNT_OFFSET)
  }

  getGrottosCompleted() {
    return (this.getSaveLogBuffer().readU32LE(layout.GROTTOS_CLEARED_OFFSET) & 0xfffc0) >> 6
  }

  setGrottosCompleted(n) {
    const prev = this.getSaveLogBuffer().readU32LE(layout.GROTTOS_CLEARED_OFFSET)

    this.getSaveLogBuffer().writeU32LE(
      (prev & 0xfff0003f) | ((n << 6) & 0xfffc0),
      layout.GROTTOS_CLEARED_OFFSET
    )
  }

  getGuestsCanvased() {
    return this.getSaveLogBuffer().readU32LE(layout.TOTAL_GUESTS_CANVASED_OFFSET) & 0x7fffffff
  }

  setGuestsCanvased(n) {
    this.getSaveLogBuffer().writeU32LE(n & 0x7fffffff, layout.TOTAL_GUESTS_CANVASED_OFFSET)

    const prev = this.getSaveLogBuffer().readU16LE(layout.GUESTS_CANVASED_OFFSET)
    this.getSaveLogBuffer().writeU16LE((prev & 0x8001) | (n << 1), layout.GUESTS_CANVASED_OFFSET)
  }

  getMonsterCompletion() {
    return Math.floor(
      ((this.getSaveLogBuffer().readU16LE(layout.DEFEATED_MONSTER_COUNT_OFFSET) & 0x1ff) /
        gameData.monsters.length) *
        100
    )
  }

  getWardrobeCompletion() {
    return Math.floor(
      (((this.getSaveLogBuffer().readU16LE(layout.WARDROBE_COLLECTED_COUNT_OFFSET) & 0x1ffc) >> 2) /
        gameData.wardrobeItems.length) *
        100
    )
  }

  getItemCompletion() {
    return Math.floor(
      (((this.getSaveLogBuffer().readU16LE(layout.ITEMS_COLLECTED_COUNT_OFFSET) & 0x3fe) >> 1) /
        gameData.standardItems.length) *
        100
    )
  }

  getAlchenomiconCompletion() {
    return Math.floor(
      (((this.getSaveLogBuffer().readU16LE(layout.ALCHENOMICON_COUNT_OFFSET) & 0xff80) >> 7) /
        gameData.alchenomiconItems.length) *
        100
    )
  }

  /*************************************************************************************************
   *                                        monster methods                                        *
   *************************************************************************************************/

  getMonsterData(m) {
    return this.getSaveLogBuffer().subarray(
      layout.DEFEATED_MONSTER_DATA_OFFSET + m * 4,
      layout.DEFEATED_MONSTER_DATA_OFFSET + m * 4 + 4
    )
  }

  getMonsterDefeatCount(m) {
    return this.getMonsterData(m).readU16LE(0) & 0x3ff
  }

  setMonsterDefeatCount(m, n) {
    const prev = this.getMonsterData(m).readU16LE(0)
    n = Math.max(0, Math.min(999, n))
    this.getMonsterData(m).writeU16LE((prev & 0xfc00) | (n & 0x3ff), 0)

    const prev1 = this.getSaveLogBuffer().readU16LE(layout.DEFEATED_MONSTER_COUNT_OFFSET)
    if (n == 0 && prev & (0x3ff != 0)) {
      this.getSaveLogBuffer().writeU16LE(
        (prev1 & 0xfe00) | ((prev1 & 0x1ff) - 1),
        layout.DEFEATED_MONSTER_COUNT_OFFSET
      )
    } else if (n != 0 && prev & (0x3ff == 0)) {
      this.getSaveLogBuffer().writeU16LE(
        (prev1 & 0xfe00) | ((prev1 & 0x1ff) + 1),
        layout.DEFEATED_MONSTER_COUNT_OFFSET
      )
    }
  }

  getMonsterCommonDropCount(m) {
    return (this.getMonsterData(m).readU32LE(0) & 0x3f800) >> 11
  }

  setMonsterCommonDropCount(m, n) {
    const prev = this.getMonsterData(m).readU32LE(0)
    n = Math.max(0, Math.min(99, n))
    this.getMonsterData(m).writeU32LE((prev & 0xfffc07ff) | ((n << 11) & 0x3f800), 0)
  }

  getMonsterRareDropCount(m) {
    return (this.getMonsterData(m).readU32LE(0) & 0x1fc0000) >> 18
  }

  setMonsterRareDropCount(m, n) {
    const prev = this.getMonsterData(m).readU32LE(0)
    n = Math.max(0, Math.min(99, n))
    this.getMonsterData(m).writeU32LE((prev & 0xfe03ffff) | ((n << 18) & 0x1fc0000), 0)
  }

  getMonsterUsedEyeForTrouble(m) {
    return !!(this.getMonsterData(m).readByte(1) & 0x4)
  }

  setMonsterUsedEyeForTrouble(m, b) {
    const prev = this.getMonsterData(m).readByte(1)
    b = b ? 1 : 0
    this.getMonsterData(m).writeByte((prev & 0xf3) | (b << 2), 1)
  }

  /*************************************************************************************************
   *                                        wardrobe methods                                       *
   *************************************************************************************************/

  isWardrobeItemFound(id) {
    return !!(
      this.getSaveLogBuffer().readByte(layout.WARDROBE_FOUND_OFFSET + Math.floor(id / 8)) &
      (1 << id % 8)
    )
  }

  setWardrobeItemFound(id, found) {
    const prev = this.getSaveLogBuffer().readByte(layout.WARDROBE_FOUND_OFFSET + Math.floor(id / 8))

    this.getSaveLogBuffer().writeByte(
      (prev & ~(1 << id % 8)) | ((found ? 1 : 0) << id % 8),
      layout.WARDROBE_FOUND_OFFSET + Math.floor(id / 8)
    )

    const prev1 = this.getSaveLogBuffer().readU16LE(layout.WARDROBE_COLLECTED_COUNT_OFFSET)
    const sum = gameData.wardrobeItems.reduce((a, c) => {
      return a + this.isWardrobeItemFound(c.wardrobeIdx)
    }, 0)

    this.getSaveLogBuffer().writeU16LE(
      (prev1 & 0xe003) | ((sum << 2) & 0x1ffc),
      layout.WARDROBE_COLLECTED_COUNT_OFFSET
    )
  }

  /*************************************************************************************************
   *                                          item methods                                         *
   *************************************************************************************************/

  isItemFound(id) {
    return !!(
      this.getSaveLogBuffer().readByte(layout.ITEM_FOUND_OFFSET + Math.floor(id / 8)) &
      (1 << id % 8)
    )
  }

  setItemFound(id, found) {
    const prev = this.getSaveLogBuffer().readByte(layout.ITEM_FOUND_OFFSET + Math.floor(id / 8))

    this.getSaveLogBuffer().writeByte(
      (prev & ~(1 << id % 8)) | ((found ? 1 : 0) << id % 8),
      layout.ITEM_FOUND_OFFSET + Math.floor(id / 8)
    )

    const prev1 = this.getSaveLogBuffer().readU16LE(layout.ITEMS_COLLECTED_COUNT_OFFSET)
    const sum = gameData.standardItems.reduce((a, c) => {
      return a + this.isItemFound(c.itemIdx)
    }, 0)

    this.getSaveLogBuffer().writeU16LE(
      (prev1 & 0xfc01) | ((sum << 1) & 0x3fe),
      layout.ITEMS_COLLECTED_COUNT_OFFSET
    )
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
    const completed =
      this.getSaveLogBuffer().readByte(layout.QUEST_CLEARED_OFFSET + Math.floor(id / 8)) &
      (1 << id % 8)
    if (completed) {
      return gameData.QUEST_STATUS_COMPLETE
    }

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

  /*************************************************************************************************
   *                                        accolade methods                                       *
   *************************************************************************************************/

  isAccoladeUnlocked(id) {
    return (
      this.getSaveLogBuffer().readByte(layout.ACCOLADE_UNLOCK_DATA_OFFSET + Math.floor(id / 8)) &
      (1 << id % 8)
    )
  }

  setAccoladeUnlocked(id, unlocked) {
    const prev = this.getSaveLogBuffer().readByte(
      layout.ACCOLADE_UNLOCK_DATA_OFFSET + Math.floor(id / 8)
    )

    this.getSaveLogBuffer().writeByte(
      (prev & ~(1 << id % 8)) | (unlocked << id % 8),
      layout.ACCOLADE_UNLOCK_DATA_OFFSET + Math.floor(id / 8)
    )

    this.setAccoladeCount(
      gameData.accolades.reduce(
        (a, c) => a + (!!c.name[this.getProfileGender()] && this.isAccoladeUnlocked(c.id) ? 1 : 0),
        0
      )
    )
  }

  /*************************************************************************************************
   *                                         grotto methods                                         *
   *************************************************************************************************/

  getHeldGrottoCount() {
    return this.getSaveLogBuffer().readByte(layout.HELD_GROTTO_COUNT_OFFSET)
  }

  setHeldGrottoCount(count) {
    const prev = this.getSaveLogBuffer().readByte(layout.HELD_GROTTO_COUNT_OFFSET)
    if (prev < layout.HELD_GROTTO_COUNT_MAX) {
      this.getSaveLogBuffer().writeByte(count, layout.HELD_GROTTO_COUNT_OFFSET)
    }
  }

  getGrotto(n) {
    //NOTE: see ./grotto.js for read/write for the grotto buffers
    return new Grotto(
      this.getSaveLogBuffer().subarray(
        layout.GROTTO_DATA_OFFSET + layout.GROTTO_DATA_SIZE * n,
        layout.GROTTO_DATA_OFFSET + layout.GROTTO_DATA_SIZE * n + layout.GROTTO_DATA_SIZE
      )
    )
  }

  removeGrotto(n) {
    const scooted = this.getSaveLogBuffer()
      .subarray(
        layout.GROTTO_DATA_OFFSET + layout.GROTTO_DATA_SIZE * (n + 1),
        layout.GROTTO_DATA_OFFSET + layout.GROTTO_DATA_SIZE * this.getHeldGrottoCount()
      )
      .cloneInner()

    this.getSaveLogBuffer()
      .subarray(
        layout.GROTTO_DATA_OFFSET + layout.GROTTO_DATA_SIZE * n,
        layout.GROTTO_DATA_OFFSET + layout.GROTTO_DATA_SIZE * this.getHeldGrottoCount()
      )
      .writeBuffer(scooted, 0)

    this.setHeldGrottoCount(this.getHeldGrottoCount() - 1)
  }

  tryAddNewGrotto() {
    const heldCount = this.getHeldGrottoCount()
    if (heldCount >= layout.HELD_GROTTO_COUNT_MAX) {
      return
    }

    this.setHeldGrottoCount(heldCount + 1)
    this.getGrotto(heldCount).setKind(gameData.GROTTO_KIND_NORMAL)
  }

  importGrotto(str) {
    const heldCount = this.getHeldGrottoCount()
    if (heldCount >= layout.HELD_GROTTO_COUNT_MAX) {
      return
    }

    this.setHeldGrottoCount(heldCount + 1)
    const bytes = new Uint8Array(str.length / 2)
    for (let i = 0; i < bytes.byteLength; i++) {
      bytes[i] = parseInt(str.substr(i * 2, 2), 16)
    }

    this.getGrotto(heldCount)._buffer.writeBuffer(Buffer.from(bytes), 0)
  }
}
