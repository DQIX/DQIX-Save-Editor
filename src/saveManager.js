import { Buffer } from "buffer"

import game_data from "./data"

export default class SaveManager {
  constructor(buffer) {
    this.buffer = buffer
  }

  validate() {
    if (!this.buffer) {
      return false
    }

    if (this.buffer.length < 65536) {
      return false
    }

    const MAGIC_NUMBER = Buffer.from([
      // `DRAGON QUEST IX` in hex, save file magic "number"
      0x44, 0x52, 0x41, 0x47, 0x4f, 0x4e, 0x20, 0x51, 0x55, 0x45, 0x53, 0x54, 0x20, 0x49, 0x58,
    ])

    if (MAGIC_NUMBER.compare(this.buffer.subarray(0, 0 + MAGIC_NUMBER.length)) == 0) {
      return true
    }

    return false
  }

  load(buffer) {
    this.buffer = buffer
  }

  async loadDemo() {
    const response = await fetch("demo.sav")
    if (!response.ok) {
      this.buffer = "couldn't get demo save file"
    }

    this.buffer = Buffer.from(await response.arrayBuffer())

    console.log(this.buffer)

    this.print()
  }

  loaded() {
    return !!this.buffer
  }

  print() {
    this.validate()

    const string_tables = {}

    function prepare_string_tables() {
      string_tables.encode = {}
      string_tables.decode = {}

      for (let i = 0; i < 26; i++) {
        // uppercase a-z
        string_tables.decode[String.fromCharCode(65 + i)] = i + 18
        // lowercase a-z
        string_tables.decode[String.fromCharCode(97 + i)] = i + 44
      }

      for (let i = 0; i < 10; i++) {
        // 0-9
        string_tables.decode[String.fromCharCode(48 + i)] = i + 8
      }

      const bytes = [
        4, 70, 71, 72, 74, 75, 76, 77, 83, 84, 85, 88, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
        102, 103, 105, 106, 107, 109, 111, 113, 114, 116, 118, 120, 121, 122, 123, 124, 125, 126,
        127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 141, 142, 143, 144, 145,
        146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163,
        164, 165, 166, 167, 168, 169, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 240,
        255,
      ]

      const chars =
        "'{|}€,„Œœ¡£«»¿!\"#$%&’()+-./;=?[]_ÀÁÂÄÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜßàáâäæçèéêëìíîïñòóôõöùúûü~☻*@¢ªº←↑→↓– "

      for (let i = 0; i < bytes.length; i++) {
        string_tables.decode[chars[i]] = bytes[i]
      }

      const entries = Object.entries(string_tables.decode)
      for (let i = 0; i < entries.length; i++) {
        string_tables.encode[entries[i][1]] = entries[i][0]
      }
    }

    prepare_string_tables()

    function read_str(buffer) {
      return Array.from(buffer)
        .map(b => b != 0 && (string_tables.encode[b] || "?"))
        .filter(x => x)
        .join("")
    }

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
          name: read_str(
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

      //   if (character.name != "Ayla") {
      //     continue
      //   }

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
}
