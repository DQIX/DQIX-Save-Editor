import data from "./data"

/// list of costumes randomly selected to be the basis of a character.
/// each entry has the equipment, a list of vocations who can wear that equipment,
/// and a list of genders who can wear that equipment
///
/// TODO: contributions welcome, please keep in mind the gender and vocation distribution
/// there's still plenty left here, namely the rest of the cosplays and other stylish costumes, go nuts i will probably accept it
/// `0xffff`can be used to have there be nothing equipped
const outfits = [
  /// dragon warrior set
  {
    // prettier-ignore
    equipment: {
      [data.ITEM_TYPE_WEAPON]:    65535, //
      [data.ITEM_TYPE_SHIELD]:    65535, //
      [data.ITEM_TYPE_HEAD]:      12785, // Dragon warrior helm
      [data.ITEM_TYPE_TORSO]:     13162, // Dragon warrior armour
      [data.ITEM_TYPE_ARM]:       15286, // Dragon warrior gloves
      [data.ITEM_TYPE_LEGS]:      16256, // Dragon warrior trousers
      [data.ITEM_TYPE_FEET]:      17303, // Dragon warrior boots
      [data.ITEM_TYPE_ACCESSORY]: 65535, //
    },
    vocations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    genders: [0, 1],
  },
  /// celestial set + halo
  {
    // prettier-ignore
    equipment: {
      [data.ITEM_TYPE_WEAPON]:    65535, //
      [data.ITEM_TYPE_SHIELD]:    65535, //
      [data.ITEM_TYPE_HEAD]:      12805, // halo
      [data.ITEM_TYPE_TORSO]:     13007, // celestial suit
      [data.ITEM_TYPE_ARM]:       65535, //
      [data.ITEM_TYPE_LEGS]:      16215, // celestial stockings
      [data.ITEM_TYPE_FEET]:      17120, // celestial shoes
      [data.ITEM_TYPE_ACCESSORY]: 65535, //
    },
    vocations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    genders: [0, 1],
  },
  /// Textbook Trooper (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12400, // Warrior's helm
    [data.ITEM_TYPE_TORSO]:     13000, // Warrior's armour
    [data.ITEM_TYPE_ARM]:       15000, // Warrior's gloves
    [data.ITEM_TYPE_LEGS]:      16200, // Warrior's trousers
    [data.ITEM_TYPE_FEET]:      17100, // Warrior's boots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [1],
    genders: [0],
  },
  /// Prototypical Priest (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12429, // Holy hat
    [data.ITEM_TYPE_TORSO]:     13300, // Ascetic robe
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      65535, //
    [data.ITEM_TYPE_FEET]:      17101, // Frugal footwear
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [2],
    genders: [0],
  },
  /// Classic Caster (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12401, // Hocus hat
    [data.ITEM_TYPE_TORSO]:     13700, // Fizzle-retardant suit
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      16204, // Wizard's trousers
    [data.ITEM_TYPE_FEET]:      17105, // Wizard wellies
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [3],
    genders: [0],
  },
  /// Paradigmatic Pugilist (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      65535, //
    [data.ITEM_TYPE_TORSO]:     13001, // Tussler's top
    [data.ITEM_TYPE_ARM]:       15101, // Bruiser's bracers
    [data.ITEM_TYPE_LEGS]:      16203, // Tussler's trousers
    [data.ITEM_TYPE_FEET]:      17104, // Kung fu shoes
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [4],
    genders: [0],
  },
  /// Stock Stealer (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12700, // Thief's turban
    [data.ITEM_TYPE_TORSO]:     13301, // Rogue's robes
    [data.ITEM_TYPE_ARM]:       15048, // Lockpicker's mitts
    [data.ITEM_TYPE_LEGS]:      16202, // Nicker's knickers
    [data.ITEM_TYPE_FEET]:      17102, // Bandit boots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [5],
    genders: [0],
  },
  /// Model Minstrel (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12200, // Feather headband
    [data.ITEM_TYPE_TORSO]:     13002, // Flamenco shirt
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      16205, // Loud trousers
    [data.ITEM_TYPE_FEET]:      17106, // Acroboots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [6],
    genders: [0],
  },
  /// Fadiator (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12202, // Battler's band
    [data.ITEM_TYPE_TORSO]:     13100, // Tactical vest
    [data.ITEM_TYPE_ARM]:       15103, // Metallic mitts
    [data.ITEM_TYPE_LEGS]:      16206, // Battle britches
    [data.ITEM_TYPE_FEET]:      17300, // Payback pumps
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [7],
    genders: [0],
  },
  /// Everyday Knight (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12702, // Mail coif
    [data.ITEM_TYPE_TORSO]:     13200, // Holy mail
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      16208, // Red tights
    [data.ITEM_TYPE_FEET]:      17111, // Safety shoes
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [9],
    genders: [0],
  },
  /// Average Armamentalist (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12403, // Musketeer hat
    [data.ITEM_TYPE_TORSO]:     13303, // Fencing jacket
    [data.ITEM_TYPE_ARM]:       15001, // Gorgeous gloves
    [data.ITEM_TYPE_LEGS]:      16207, // Swordsman's slacks
    [data.ITEM_TYPE_FEET]:      17109, // Cowboy boots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [8],
    genders: [0],
  },
  /// Regular Ranger (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12407, // Hunter's hat
    [data.ITEM_TYPE_TORSO]:     13003, // Fur vest
    [data.ITEM_TYPE_ARM]:       15106, // Archer's armguard
    [data.ITEM_TYPE_LEGS]:      16210, // Steppe steppers
    [data.ITEM_TYPE_FEET]:      17114, // Agiliboots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [12],
    genders: [0],
  },
  /// Stereotypical Sage (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12405, // Minerva's mitre
    [data.ITEM_TYPE_TORSO]:     13304, // Sage's robe
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      65535, //
    [data.ITEM_TYPE_FEET]:      17112, // Clever clogs
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [10],
    genders: [0],
  },
  /// Exemplary Luminary (M)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12409, // Top hat
    [data.ITEM_TYPE_TORSO]:     13004, // Star's suit
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      16212, // White tights
    [data.ITEM_TYPE_FEET]:      17116, // Bardic boots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [11],
    genders: [0],
  },
  /// Textbook Trooper (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      65535, //
    [data.ITEM_TYPE_TORSO]:     13601, // Femiscyran mail
    [data.ITEM_TYPE_ARM]:       15102, // Femiscyran fingerwear
    [data.ITEM_TYPE_LEGS]:      16100, // Femiscyran bottoms
    [data.ITEM_TYPE_FEET]:      17108, // Femiscyran footwear
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [1],
    genders: [1],
  },
  /// Prototypical Priest (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12402, // Hermetic hat
    [data.ITEM_TYPE_TORSO]:     13501, // Priestess's pinafore
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      65535, //
    [data.ITEM_TYPE_FEET]:      17402, // Sheepskin shoes
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [2],
    genders: [1],
  },
  /// Classic Caster (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12600, // Tricky turban
    [data.ITEM_TYPE_TORSO]:     13600, // Fizzle-retardant blouse
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      16300, // Sorcerer's slacks
    [data.ITEM_TYPE_FEET]:      17400, // Siren sandals
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [3],
    genders: [1],
  },
  /// Paradigmatic Pugilist (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      65535, //
    [data.ITEM_TYPE_TORSO]:     13500, // Strongsam
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      16301, // Slick slacks
    [data.ITEM_TYPE_FEET]:      17401, // She-fu shoes
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [4],
    genders: [1],
  },
  /// Stock Stealer (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12701, // Disturbin' turban
    [data.ITEM_TYPE_TORSO]:     13302, // Roguess's robes
    [data.ITEM_TYPE_ARM]:       15100, // Fingerless gauntlets
    [data.ITEM_TYPE_LEGS]:      16202, // Nicker's knickers
    [data.ITEM_TYPE_FEET]:      17103, // Sneakers
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [5],
    genders: [1],
  },
  /// Model Minstrel (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12201, // Circlet
    [data.ITEM_TYPE_TORSO]:     13502, // Dancer's dress
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      65535, //
    [data.ITEM_TYPE_FEET]:      17403, // Starlet sandals
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [6],
    genders: [1],
  },
  /// Fadiator (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12202, // Battler's band
    [data.ITEM_TYPE_TORSO]:     13602, // Brawling byrnie
    [data.ITEM_TYPE_ARM]:       15103, // Metallic mitts
    [data.ITEM_TYPE_LEGS]:      65535, //
    [data.ITEM_TYPE_FEET]:      17300, // Payback pumps
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [7],
    genders: [1],
  },
  /// Everyday Knight (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      65535, //
    [data.ITEM_TYPE_TORSO]:     13603, // Holy femail
    [data.ITEM_TYPE_ARM]:       15105, // Light gauntlets
    [data.ITEM_TYPE_LEGS]:      16103, // Chainmail socks
    [data.ITEM_TYPE_FEET]:      17302, // Saintly sollerets
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [9],
    genders: [1],
  },
  /// Average Armamentalist (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12404, // Cavalier hat
    [data.ITEM_TYPE_TORSO]:     13201, // Fencing frock
    [data.ITEM_TYPE_ARM]:       15002, // Mental mittens
    [data.ITEM_TYPE_LEGS]:      65535, //
    [data.ITEM_TYPE_FEET]:      17110, // Hip boots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [8],
    genders: [1],
  },
  /// Regular Ranger (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12408, // Ear cosy
    [data.ITEM_TYPE_TORSO]:     13202, // Nomadic deel
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      65535, //
    [data.ITEM_TYPE_FEET]:      17115, // Hiking boots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [12],
    genders: [1],
  },
  /// Stereotypical Sage (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12406, // Canny cap
    [data.ITEM_TYPE_TORSO]:     13503, // Maiden's mantle
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      16209, // Green tights
    [data.ITEM_TYPE_FEET]:      17113, // Shaman shoes
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [10],
    genders: [1],
  },
  /// Exemplary Luminary (F)
  {
    // prettier-ignore
    equipment: {
    [data.ITEM_TYPE_WEAPON]:    65535, //
    [data.ITEM_TYPE_SHIELD]:    65535, //
    [data.ITEM_TYPE_HEAD]:      12204, // Ravishing ribbon
    [data.ITEM_TYPE_TORSO]:     13604, // Tint-tastic tutu
    [data.ITEM_TYPE_ARM]:       65535, //
    [data.ITEM_TYPE_LEGS]:      65535, //
    [data.ITEM_TYPE_FEET]:      17117, // Crimson boots
    [data.ITEM_TYPE_ACCESSORY]: 65535, //
  },
    vocations: [11],
    genders: [1],
  },
]

const randomIn = arr => arr[Math.floor(Math.random() * arr.length)]
//NOTE: not inclusive [min, max)
const randomIntBetween = (min, max) => Math.floor(Math.random() * (max - min) + min)
const randomBirthday = () => {
  const first = new Date("1960-01-01") // both are somewhat arbitrary idk
  const last = new Date("2016-12-31")

  return new Date(+first + Math.random() * (last - first))
}

/// generates a random character
export function createValidCharacter() {
  const outfit = randomIn(outfits)
  const gender = randomIn(outfit.genders)
  const vocation = randomIn(outfit.vocations)

  return {
    name: randomIn(data.defaultNames[gender]),
    equipment: outfit.equipment,
    gender,
    vocation,
    face: randomIntBetween(60, 70),
    hairstyle: randomIntBetween(40, 50),
    eyeColor: randomIntBetween(0, 8),
    hairColor: randomIntBetween(0, 10),
    skinColor: randomIntBetween(0, 8),
    bodyType: randomIn(data.bodyTypes[gender]),
    color: randomIntBetween(0, 16),
  }
}

export function createValidGuest() {
  const character = createValidCharacter()

  let title = 0
  do {
    title = randomIn(Object.keys(data.titles))
  } while (!data.titles[title][character.gender])

  const multiplayerTime = {
    hours: randomIntBetween(0, 1200),
    minutes: randomIntBetween(0, 60),
  }

  if (Math.random() > 0.3) {
    multiplayerTime.hours = 0
    multiplayerTime.minutes = 0
  }

  return {
    ...character,

    level: randomIntBetween(1, 100),
    revocations: randomIntBetween(0, 11),

    birthday: randomBirthday(),
    agePrivate: Math.random() > 0.5,
    //NOTE: no countries since they're kinda ugly, just continents and in game locations
    origin: randomIn(Object.keys(data.guestOrigins).slice(0, 26)),
    speech: randomIntBetween(0, data.speechStyles.length),
    title,

    //FIXME: these are not likely to be strictly valid, but its a good enough approach for now
    victories: randomIntBetween(10, 5000),
    alchemy: randomIntBetween(0, 2000),
    accolades: randomIntBetween(0, character.gender ? 413 : 412),
    quests: randomIntBetween(0, 184),
    grottos: randomIntBetween(0, 2000),
    guests: randomIntBetween(1, 2000),
    monster: randomIntBetween(0, 101),
    wardrobe: randomIntBetween(0, 101),
    items: randomIntBetween(0, 101),
    alchenomicon: randomIntBetween(0, 101),

    multiplayerTime,
    playTime: {
      hours: multiplayerTime.hours + randomIntBetween(1, 2000),
      minutes: randomIntBetween(0, 60),
    },
  }
}

//FIXME: idk if the game uses some bad rng to do ids that may prevent certain ids from being generated
// it probably doesn't matter
export function generateId() {
  const a = BigInt(Math.floor(Math.random() * 0xffff))
  const b = BigInt(Math.floor(Math.random() * 0xffff))
  const c = BigInt(Math.floor(Math.random() * 0xffff))

  return (a << 32n) | (b << 16n) | c
}

// TODO: finalize all the stuff in here
// - hp/mp?

/// NOTE: this is mostly just a sanitized default new character with no known bad data in it, but also
/// idk what parts of this mean so :(
// prettier-ignore
export const emptyCharacter = [
  0x00, 0x07, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
  0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x12, 0x10, 0x20, 0x01, // NOTE: bytes 466-487 are unknown, i think there's current stat data in them but idk
  0x05, 0x10, 0x00, 0x00, 0x00, 0x68, 0x40, 0x00, 0x1a, 0x10, 0x90, 0x01,
  0x1a, 0x64, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x3c, 0x23, 0x28, 0x23,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0x00, 0x00, 0x15, 0x37, 0x0a, 0x0f, 0xae, 0x0f, 0xff, 0xff, 0xff, 0xff, // NOTE: ending 0xff's are previously set per vocation equipment
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
]

export const emptyGuest = [
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xcf, 0x32, 0x57, 0x3f, 0x3c, 0x23,
  0x28, 0x23, 0xff, 0xff, 0xe0, 0x42, 0xff, 0xff, 0x24, 0x4e, 0xff, 0xff, 0xff, 0xff, 0x04, 0x00,
  0xb7, 0x36, 0x00, 0x10, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xd0, 0x17, 0x01, 0x40,
  0xff, 0x59, 0x12, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]
