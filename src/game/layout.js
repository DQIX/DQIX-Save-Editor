import gameData from "./data"

/// total size of one save slot in bytes
export const SAVE_SIZE = 32768

export const CHECKSUM_A_OFFSET = 16
export const CHECKSUM_A_DATA_OFFSET = 20
export const CHECKSUM_A_DATA_END = 36

export const CHECKSUM_B_OFFSET = 132
export const CHECKSUM_B_DATA_OFFSET = 136
export const CHECKSUM_B_DATA_END = 28644

/// total size of a character's data in bytes
export const CHARACTER_SIZE = 572

/// offset of name relative to beginning of character data
export const CHARACTER_NAME_OFFSET = 456

/// max length of name in bytes
export const NAME_LENGTH = 10

/// offset of name equipments relative to beginning of character data
export const CHARACTER_EQUIPMENT_OFFSET = 488

/// offset of character gender/colors byte relative to beginning of character data
// u8 laid out like: `eeeesssg`
// where e is eye color, s is skin color, and g is gender
export const CHARACTER_GENDER_COLORS_OFFSET = 508

export const CHARACTER_FACE_OFFSET = 492
export const CHARACTER_HAIRSTYLE_OFFSET = 494

/// offset of character hairstyle byte relative to beginning of character data
// u8 laid out like: `xxxxcccc`
// where x is unknown data, and c is the color index
export const CHARACTER_HAIR_COLOR_OFFSET = 509

export const CHARACTER_BODY_TYPE_W = 512
export const CHARACTER_BODY_TYPE_H = 514

/// offset of current vocation index relative to beginning of character data
export const CURRENT_VOCATION_OFFSET = 216

/// offset of character's held items, relative to the beginning of the save
export const HELD_ITEM_OFFSET = 7578

/// offset of character's skill allocation array, relative to beginning of character data
export const CHARACTER_SKILL_ALLOCATIONS_OFFSET = 383

/// offset of character's proficiency bitflags, relative to beginning of character data
export const CHARACTER_PROFICIENCY_OFFSET = 418

export const CHARACTER_PROFICIENCY_LENGTH = 36

/// offset of character's unallocated skill points, relative to beginning of character data
export const CHARACTER_UNALLOCATED_SKILL_POINTS_OFFSET = 380

export const CHARACTER_ZOOM_OFFSET = 416
export const CHARACTER_EGG_ON_OFFSET = 453

/// order of party members
export const PARTY_ORDER_OFFSET = 7573

/// number of characters in standby
export const STANDBY_COUNT_OFFSET = 7572

/// number of characters in party
export const PARTY_COUNT_OFFSET = 7577

/// items are stored in 2 contiguous arrays, one of the ids which are u16s and one of the counts which are u8s
// prettier-ignore
export const itemOffsets = {
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

export const GOLD_ON_HAND_OFFSET = 11448
export const GOLD_IN_BANK_OFFSET = 11452

export const MINI_MEDAL_OFFSET = 11460

export const PARTY_TRICK_LEARNED_OFFSET = 12108

export const PLAYTIME_HOURS = 16024
export const PLAYTIME_MINUTES = 16026
export const PLAYTIME_SECONDS = 16027

export const MULTIPLAYER_HOURS = 16028
export const MULTIPLAYER_MINUTES = 16030
export const MULTIPLAYER_SECONDS = 16031

export const UNLOCKABLE_VOCATION_OFFSET = 12276

export const VISITED_LOCATIONS_OFFSET = 11788

export const CURRENT_GUESTS_CANVASED_OFFSET = 23160
export const TOTAL_GUESTS_CANVASED_OFFSET = 23164

/// offset of canvased guest array
export const CANVASED_GUEST_OFFSET = 16200

/// size of canvased guest structure
export const CANVASED_GUEST_SIZE = 232

/// offset of name relative to beginning of guest data
export const GUEST_NAME_OFFSET = 0

/// offset of vocation and location in inn relative to beginning of guest data
export const GUEST_VOCATION_AND_LOCATION_OFFSET = 12

/// offset of the index of the guest (0 if invalid), pretty sure this is the order of guests canvased
export const GUEST_INDEX_OFFSET = 16

export const GUEST_EQUIPMENT_OFFSET = 26

export const GUEST_FACE_OFFSET = 30

export const GUEST_HAIRSTYLE_OFFSET = 32

export const GUEST_GENDER_COLORS_OFFSET = 46

export const GUEST_HAIR_COLOR_OFFSET = 47

export const GUEST_BODY_TYPE_W = 50
export const GUEST_BODY_TYPE_H = 52

export const GUEST_ALCHEMY_COUNT = 57
export const GUEST_VICTORY_COUNT_OFFSET = 61
export const GUEST_MONSTER_COUNT_OFFSET = 65
export const GUEST_ITEM_COUNT_OFFSET = 66
export const GUEST_ACCOLADE_COUNT_OFFSET = 68
export const GUEST_GROTTO_COUNT_OFFSET = 69
export const GUEST_WARDROBE_COUNT_OFFSET = 71
export const GUEST_QUEST_GUEST_ALCHEMY_OFFSET = 72

export const GUEST_BIRTHDAY_OFFSET = 108

export const GUEST_SPEECH_STYLE_OFFSET = 110

export const GUEST_SECRET_AGE_OFFSET = 111

export const GUEST_TITLE_ORIGIN_OFFSET = 113

export const GUEST_MESSAGE_OFFSET = 116

export const GUEST_MESSAGE_LENGTH = 57

/// offset of the inn level (only 0x7)
export const INN_LEVEL_OFFSET = 23172

/// offset of special guest bitflags
export const SPECIAL_GUEST_OFFSET = 11528

export const DQVC_ITEMS_OFFSET = 27844
export const DQVC_ITEMS_ITEM_OFFSET = 0
export const DQVC_ITEMS_PRICE_STOCK_OFFSET = 4

export const DQVC_ITEM_SIZE = 40

export const DQVC_MESSAGE_OFFSET = 23176
export const DQVC_MESSAGE_LENGTH = 510

export const DQVC_MESSAGE_EXPIRY_TIME_OFFSET = 28096

export const annotations = []

for (let i = 0; i < 2; i++) {
  let slotOffset = i * SAVE_SIZE
  annotations.push({
    name: `save slot ${i}`,
    begin: slotOffset,
    length: SAVE_SIZE,
    color: "var(--grey)",
  })

  // party
  {
    for (let i = 0; i < 13; i++) {
      const characterOffset = slotOffset + CHARACTER_SIZE * i

      annotations.push({
        name: `character ${i}`,
        begin: characterOffset,
        length: CHARACTER_SIZE,
        color: "var(--lavender)",
      })

      annotations.push({
        name: `name`,
        begin: characterOffset + CHARACTER_NAME_OFFSET,
        length: NAME_LENGTH,
        color: "var(--red)",
      })

      annotations.push({
        name: `gender/colors`,
        begin: characterOffset + CHARACTER_GENDER_COLORS_OFFSET,
        length: 1,
        color: "var(--peach)",
      })

      annotations.push({
        name: `face type`,
        begin: characterOffset + CHARACTER_FACE_OFFSET,
        length: 1,
        color: "var(--yellow)",
      })

      annotations.push({
        name: `hair colour`,
        begin: characterOffset + CHARACTER_HAIR_COLOR_OFFSET,
        length: 1,
        color: "var(--green)",
      })

      annotations.push({
        name: `hair style`,
        begin: characterOffset + CHARACTER_HAIRSTYLE_OFFSET,
        length: 1,
        color: "var(--green)",
      })

      annotations.push({
        name: `body type W`,
        begin: characterOffset + CHARACTER_BODY_TYPE_W,
        length: 2,
        color: "var(--teal)",
      })

      annotations.push({
        name: `body type H`,
        begin: characterOffset + CHARACTER_BODY_TYPE_H,
        length: 2,
        color: "var(--teal)",
      })

      annotations.push({
        name: `current vocation`,
        begin: characterOffset + CURRENT_VOCATION_OFFSET,
        length: 1,
        color: "var(--blue)",
      })

      for (const itemType of gameData.equipmentTypes) {
        const equipmentOffset = characterOffset + CHARACTER_EQUIPMENT_OFFSET + (itemType - 1) * 2

        annotations.push({
          name: `equipped ${gameData.itemTypeNames[itemType]}`,
          begin: equipmentOffset,
          length: 2,
          color: "var(--maroon)",
        })
      }

      for (const skill of gameData.skills) {
        const skillOffset = characterOffset + CHARACTER_SKILL_ALLOCATIONS_OFFSET + skill.id
        annotations.push({
          name: `${skill.name} point allocation`,
          begin: skillOffset,
          length: 1,
          color: "var(--sky)",
        })
      }

      annotations.push({
        name: `proficiencies bitmap`,
        begin: characterOffset + CHARACTER_PROFICIENCY_OFFSET,
        length: CHARACTER_PROFICIENCY_LENGTH,
        color: "var(--sapphire)",
      })
    }

    for (let i = 0; i < 4; i++) {
      const heldItemOffset = slotOffset + HELD_ITEM_OFFSET + 18 * i
      annotations.push({
        name: `character ${i} held items`,
        begin: heldItemOffset,
        length: 16,
        color: "var(--rosewater)",
      })

      for (let i = 0; i < 8; i++) {
        const itemOffset = heldItemOffset + 2 * i

        annotations.push({
          name: `item ${i}`,
          begin: itemOffset,
          length: 2,
          color: "var(--mauve)",
        })
      }
    }
  }

  // // items
  // FIXME: needs validation
  // {
  //   for (const [id, table] of Object.entries(gameData.itemTables)) {
  //     annotations.push({
  //       name: `${gameData.itemTypeNames[id]} bag ids`,
  //       begin: slotOffset + itemOffsets[id].idOffset,
  //       length: table.length * 2,
  //       color: "var(--mauve)",
  //     })

  //     annotations.push({
  //       name: `${gameData.itemTypeNames[id]} bag counts`,
  //       begin: slotOffset + itemOffsets[id].countOffset,
  //       length: table.length * 2,
  //       color: "var(--mauve)",
  //     })
  //   }
  // }

  // dlc
  {
    annotations.push({
      name: "special guests",
      begin: slotOffset + SPECIAL_GUEST_OFFSET,
      length: 4,
      color: "var(--mauve)",
    })

    annotations.push({
      name: "dqvc message",
      begin: slotOffset + DQVC_MESSAGE_OFFSET,
      length: DQVC_MESSAGE_LENGTH,
      color: "var(--mauve)",
    })

    annotations.push({
      name: "dqvc message expiry datetime",
      begin: slotOffset + DQVC_MESSAGE_EXPIRY_TIME_OFFSET,
      length: 4,
      color: "var(--blue)",
    })

    for (let i = 0; i < 6; i++) {
      const itemOffset = slotOffset + DQVC_ITEMS_OFFSET + DQVC_ITEM_SIZE * i

      annotations.push({
        name: `dqvc item ${i}`,
        begin: itemOffset + DQVC_ITEMS_ITEM_OFFSET,
        length: 2,
        color: "var(--green)",
      })

      annotations.push({
        name: `dqvc stock/price ${i}`,
        begin: itemOffset + DQVC_ITEMS_PRICE_STOCK_OFFSET,
        length: 1,
        color: "var(--sapphire)",
      })
    }
  }

  // misc
  {
    annotations.push({
      name: "gold on hand",
      begin: slotOffset + GOLD_ON_HAND_OFFSET,
      length: 4,
      color: "var(--yellow)",
    })

    annotations.push({
      name: "gold in bank",
      begin: slotOffset + GOLD_IN_BANK_OFFSET,
      length: 4,
      color: "var(--yellow)",
    })

    annotations.push({
      name: "mini medeals",
      begin: slotOffset + MINI_MEDAL_OFFSET,
      length: 4,
      color: "var(--yellow)",
    })

    annotations.push({
      name: "learned party tricks",
      begin: slotOffset + PARTY_TRICK_LEARNED_OFFSET,
      length: 4,
      color: "var(--green)",
    })

    // playtime
    {
      annotations.push({
        name: "play time",
        begin: slotOffset + PLAYTIME_HOURS,
        length: 4,
        color: "var(--blue)",
      })

      annotations.push({
        name: "hours",
        begin: slotOffset + PLAYTIME_HOURS,
        length: 2,
        color: "var(--red)",
      })

      annotations.push({
        name: "minutes",
        begin: slotOffset + PLAYTIME_MINUTES,
        length: 1,
        color: "var(--red)",
      })

      annotations.push({
        name: "seconds",
        begin: slotOffset + PLAYTIME_SECONDS,
        length: 1,
        color: "var(--red)",
      })
    }

    // multiplayer time
    {
      annotations.push({
        name: "multiplayer time",
        begin: slotOffset + MULTIPLAYER_HOURS,
        length: 4,
        color: "var(--blue)",
      })

      annotations.push({
        name: "hours",
        begin: slotOffset + MULTIPLAYER_HOURS,
        length: 2,
        color: "var(--red)",
      })

      annotations.push({
        name: "minutes",
        begin: slotOffset + MULTIPLAYER_MINUTES,
        length: 1,
        color: "var(--red)",
      })

      annotations.push({
        name: "seconds",
        begin: slotOffset + MULTIPLAYER_SECONDS,
        length: 1,
        color: "var(--red)",
      })
    }

    annotations.push({
      name: "unlockable vocations bitflags",
      begin: slotOffset + UNLOCKABLE_VOCATION_OFFSET,
      length: 2,
      color: "var(--lavender)",
    })

    annotations.push({
      name: "visited locations bitflags",
      begin: slotOffset + VISITED_LOCATIONS_OFFSET,
      length: 2,
      color: "var(--blue)",
    })
  }

  // checksums
  {
    annotations.push({
      name: "checksum A",
      begin: slotOffset + CHECKSUM_A_OFFSET,
      length: 1,
      color: "var(--flamingo)",
    })

    annotations.push({
      name: "checksum B",
      begin: slotOffset + CHECKSUM_B_OFFSET,
      length: 1,
      color: "var(--flamingo)",
    })
  }
}

annotations.push({
  name: "magic number",
  begin: 0,
  length: 15,
  color: "var(--blue)",
})
