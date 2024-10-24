# DQIX Editor

A save editor for dragon quest ix

## Looking for maintainers

I can no longer work on this, if you're interested in taking ownership of it, please dm me.
The editor as it stands is basically complete, however I cannot resolve any future issues, and there are a few things yet to be added.

<details><summary><h2>features/todo (116/131 + 10)</h2></summary>

<details><summary><h3>party</h3></summary>

- [x] skills
- [x] appearance
  - [x] face
  - [x] hairstyle
  - [x] skin color
  - [x] hair color
  - [x] eye color
  - [x] height
  - [x] width
  - [x] color
- [x] current vocation
- [x] vocation exp stuff
  - [x] revocations
  - [x] seeds
- [x] equipment
- [x] held items
- [x] name
- [x] gender

</details>

<details><summary><h3>items:</h3></summary>

- [x] list of items
- [ ] bulk edit

</details>

<details><summary><h3>inn:</h3></summary>

- [ ] guest data:
  - [x] name
  - [x] appearance
    - [x] face
    - [x] hairstyle
    - [x] hair color
    - [x] eye color
    - [x] skin color
    - [x] height
    - [x] width
    - [x] color
  - [x] vocation
  - [x] battle records
    - [x] battle victories
    - [x] times alchemy performed
    - [x] accolades earnt
    - [x] quests completed
    - [x] grottos completed
    - [x] guests canvased
  - [x] completion
    - [x] monster list
    - [x] wardrobe
    - [x] item list
    - [x] alchenomicon
  - [x] play time
  - [x] map
  - [x] level
  - [x] revocations
  - [x] profile
    - [x] location
    - [x] birthday
    - [x] title
    - [x] speech style
    - [x] message
  - [x] check-in date
  - [x] location
  - [ ] gender (3?)
  - [x] id
- [x] inn rank
- [x] import/export
- [x] delete
- [x] export self

</details>

<details><summary><h3>quests:</h3></summary>

- [x] list of quests
  - [x] status
  - [x] date
- [ ] bulk edit
  - [x] filter

</details>

<details><summary><h3>records:</h3></summary>

- [x] items found
- [x] wardrobe completion
- [x] monster list
  - [x] defeat count
  - [x] rare drop
  - [x] common drop
  - [x] eye for trouble
- [ ] alchenomicon
- [x] accolades
- [ ] stats
  - [x] visible
    - [x] battle victories
    - [x] times alchemy performed
    - [x] accolades earnt
    - [x] quests completed
    - [x] grottos completed
    - [x] guests canvased
  - [ ] hidden
    - [ ] deaths
    - [ ] herbs used

</details>

<details><summary><h3>grottos:</h3></summary>

- [x] treasure map list
- [x] treasures
- [x] discoverer/conquerer
- [x] location
  - [x] current
  - [x] valid location list
- [x] normal
  - [x] info
  - [x] grotto search
- [x] legacy
  - [x] turns
  - [x] boss
- [x] add/remove
- [x] import/export

</details>

<details><summary><h3>dlc:</h3></summary>

- [ ] dqvc
  - [x] items
    - [x] past listing presets
  - [x] message
  - [x] message expiry date
  - [ ] stock expiry date (?)
- [x] historical characters
- [x] unlock all dlc

</details>

<details><summary><h3>misc:</h3></summary>

- [x] play time + multiplayer
- [x] learned party tricks
- [x] gold
- [x] mini medals
- [x] unlockable vocations
- [ ] first clear
- [x] zoom locations
- [x] player profile
  - [x] location
  - [x] birthday
  - [x] title
  - [x] speech style
  - [x] message
- [x] save location
- [x] id

</details>

<details><summary><h3>etc:</h3></summary>

- [x] auto detection of quick/confessed save
- [x] undo/redo history
- [ ] accept save files with headers/footers
- [ ] fix number input weirdness
- [ ] fix large table performance
- [x] show invalid player ids
- [x] guest age bug?
- [x] guest royal suites bug?

</details>

<details><summary><h3>stretch:</h3></summary>

- [ ] allow marking quests in progress?
- [ ] grotto map preview
- [ ] unsafe mode?
- [ ] pals past and present
- [ ] world things (chests, item respawns)
- [ ] party/standby move
  - [ ] import/export party characters
- [ ] grotto plundered item names?
- [ ] fountain group
- [ ] guest npc style? (character model type = 0)

</details>

</details>

## for devs

- `src/game/data.js` contains game data info including items, equipment, appearance data, etc
- `src/game/grotto.js` contains a partial implementation of the grotto generation algorithms
- `src/game/layout.js` contains known values of where various things in the save file are, if you find something else please feel free to open an issue or pr
- `src/saveManager.js` contains an implementation of reading and writing various data from the save file, except for grottos which is done in `src/game/grotto.js`

## Credits

- `src/assets/item_icons.png`: original image compiled by [Indogutsu Tenbuki](https://www.spriters-resource.com/submitter/Indogutsu+Tenbuki/)
