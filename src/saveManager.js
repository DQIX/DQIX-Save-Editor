import { Buffer } from "buffer"
import crc32 from "crc-32"

import game_data from "./game/data"
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

  loaded() {
    return !!this.buffer
  }

  print() {
    this.validate()

    function read_save(data) {
      function read_character(data, idx) {
        /// total size of character data
        const CHARACTER_SIZE = 572
        /// offset of current vocation index relative to beginning of character data
        const CURRENT_VOCATION_OFFSET = 216
        /// offset of name relative to beginning of character data
        const NAME_OFFSET = 456
        /// max length of name in bytes
        const NAME_LENGTH = 10
        /// offset of level array relative to beginning of character data
        const LEVEL_OFFSET = 138
        /// offset of revocation array relative to beginning of you get it
        const REVOCATION_OFFSET = 151
        /// offset of exp array
        const EXP_OFFSET = 164

        /// offset of equipment types, each equipment item is a u16
        const EQUIPPED_TORSO_OFFSET = 488
        const EQUIPPED_LEGS_OFFSET = 490
        const EQUIPPED_ARMS_OFFSET = 496
        const EQUIPPED_FEET_OFFSET = 498
        const EQUIPPED_HEAD_OFFSET = 500
        const EQUIPPED_WEAPON_OFFSET = 502
        const EQUIPPED_SHIELD_OFFSET = 504
        const EQUIPPED_ACCESSORY_OFFSET = 506

        /// offset of available skill points
        const SKILL_POINT_OFFSET = 380
        /// offset of allocated skill point array
        const SKILL_LEVELS_OFFSET = 383

        /// offset of gender relative to beginning of character data
        // NOTE: gender is stored with male being 0 and female being 1, however the remaining 7 bits contain extra unknown data
        const GENDER_OFFSET = 508

        let data_offset = CHARACTER_SIZE * idx

        let vocation_data = []

        for (let i = 0; i < game_data.NUM_VOCATIONS; i++) {
          // NOTE: vocation data is stored in an AOS fashion
          vocation_data[i] = {
            level: data[data_offset + LEVEL_OFFSET + i],
            revocations: data[data_offset + REVOCATION_OFFSET + i],
            exp: data.readUInt32LE(data_offset + EXP_OFFSET + 4 * i),
          }
        }

        let skill_levels = []
        for (let i = 0; i < game_data.NUM_SKILLS; i++) {
          skill_levels[i] = data[data_offset + SKILL_LEVELS_OFFSET + i]
        }

        return {
          name: ReadStringFromBuffer(
            data.subarray(data_offset + NAME_OFFSET, data_offset + NAME_OFFSET + NAME_LENGTH)
          ),
          vocation: data[data_offset + CURRENT_VOCATION_OFFSET],
          gender: data[data_offset + GENDER_OFFSET],
          skill_points: data.readUInt16LE(data_offset + SKILL_POINT_OFFSET),
          vocation_data,
          equipment: {
            weapon: data.readUInt16LE(data_offset + EQUIPPED_WEAPON_OFFSET),
            shield: data.readUInt16LE(data_offset + EQUIPPED_SHIELD_OFFSET),
            head: data.readUInt16LE(data_offset + EQUIPPED_HEAD_OFFSET),
            torso: data.readUInt16LE(data_offset + EQUIPPED_TORSO_OFFSET),
            arms: data.readUInt16LE(data_offset + EQUIPPED_ARMS_OFFSET),
            legs: data.readUInt16LE(data_offset + EQUIPPED_LEGS_OFFSET),
            feet: data.readUInt16LE(data_offset + EQUIPPED_FEET_OFFSET),
            accessory: data.readUInt16LE(data_offset + EQUIPPED_ACCESSORY_OFFSET),
          },
          skill_levels,
          // extras: {}
        }
      }

      /// number of characters in standby
      const STANDBY_COUNT_OFFSET = 7572
      /// order of party members
      // const PARTY_ORDER_OFFSET = 7573
      /// number of characters in party
      const PARTY_COUNT_OFFSET = 7577

      let standby_count = data[STANDBY_COUNT_OFFSET]
      let party_count = data[PARTY_COUNT_OFFSET]

      // let party_order = []
      // for (let i = 0; i < 4; i++) {
      //     party_order.push(data[PARTY_ORDER_OFFSET + i])
      // }

      /// maximum number of playable characters
      const NUM_CHARACTERS = 13
      let characters = []

      for (let i = 0; i < NUM_CHARACTERS; i++) {
        characters[i] = read_character(data, i)
      }

      return {
        party_count,
        standby_count,
        // party_order,
        characters,
      }
    }

    const SAVE_SIZE = 32768

    let parsed = read_save(this.buffer.subarray(0, SAVE_SIZE))
    console.log(parsed)

    for (const character of parsed.characters) {
      if (!character.name) {
        continue
      }

      console.log(`${character.name}:`)
      console.log(`\tcurrent vocation: ${game_data.vocations[character.vocation].name}`)
      console.log(`\tgender: ${character.gender & 1 ? "f" : "m"} (${character.gender})`)

      //vocations
      {
        console.log(`\tvocations:`)
        for (let i = 0; i < game_data.NUM_VOCATIONS; i++) {
          const vocation = character.vocation_data[i]
          console.log(`\t\t${game_data.vocations[i].name.padEnd(14)} \
level ${vocation.level.toString().padEnd(3)} \
exp ${vocation.exp.toString().padEnd(8)} \
revocations ${vocation.revocations} \
`)
        }
      }

      // equipment
      {
        const get_equipment_name = id =>
          id === 0xffff ? "Nothing Equipped" : game_data.items[id].name

        console.log("\tequipment:")
        console.log(`\t\tweapon:    ${get_equipment_name(character.equipment.weapon)}`)
        console.log(`\t\tshield:    ${get_equipment_name(character.equipment.shield)}`)
        console.log(`\t\thead:      ${get_equipment_name(character.equipment.head)}`)
        console.log(`\t\ttorso:     ${get_equipment_name(character.equipment.torso)}`)
        console.log(`\t\tarm:       ${get_equipment_name(character.equipment.arms)}`)
        console.log(`\t\tlegs:      ${get_equipment_name(character.equipment.legs)}`)
        console.log(`\t\tfeet:      ${get_equipment_name(character.equipment.feet)}`)
        console.log(`\t\taccessory: ${get_equipment_name(character.equipment.accessory)}`)
      }

      // skills
      {
        console.log(`\tskills: (points ${character.skill_points})`)
        for (let i = 0; i < game_data.NUM_SKILLS / 2; i++) {
          console.log(
            `\t\t${(game_data.skills[i * 2].name + ":").padEnd(18)} ${character.skill_levels[i * 2]
              .toString()
              .padEnd(6)}${(game_data.skills[i * 2 + 1].name + ":").padEnd(18)} ${
              character.skill_levels[i * 2 + 1]
            }`
          )
        }
      }
      console.log("")
    }
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
}
