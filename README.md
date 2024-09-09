# DQIX Editor

A save editor for dragon quest ix

<details><summary><h2>features/todo (88/108 + 7)</h2></summary>

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
- [x] inn rank
- [ ] import/export

</details>

<details><summary><h3>quests:</h3></summary>

- [x] list of quests
  - [x] status
  - [x] date
- [ ] bulk edit
  - [x] filter

</details>

<details><summary><h3>records:</h3></summary>

- [ ] items found
- [ ] wardrobe completion
- [ ] monster list
- [ ] alchenomicon
- [ ] accolades
- [ ] deaths
- [ ] first completion record (or under misc?)

</details>

<details><summary><h3>grottos:</h3></summary>

- [x] treasure map list
- [x] treasures
  - [ ] name preview?
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
  - [ ] stock expiry date
- [x] historical characters
- [x] unlock all dlc

</details>

<details><summary><h3>misc:</h3></summary>

- [x] play time + multiplayer
- [x] learned party tricks
- [x] gold
- [x] mini medals
- [x] unlockable vocations
- [ ] stats
- [ ] first clear
- [x] zoom locations
- [ ] player profile
- [x] save location
- [ ] fountain group

</details>

<details><summary><h3>etc:</h3></summary>

- [x] auto detection of quick/confessed save
- [x] undo/redo history
- [ ] fix number input weirdness

</details>

<details><summary><h3>stretch:</h3></summary>

- [ ] allow marking quests in progress?
- [ ] grotto map preview
- [ ] unsafe mode?
- [ ] pals past and present
- [ ] world things (chests, item respawns)
- [ ] party/standby move
- [ ] import/export party characters

</details>

</details>

## for devs

- `src/game/data.js` contains game data info including items, equipment, appearance data, etc
- `src/game/grotto.js` contains a partial implementation of the grotto generation algorithms
- `src/game/layout.js` contains known values of where various things in the save file are, if you find something else please feel free to open an issue or pr
- `src/saveManager.js` contains an implementation of reading and writing various data from the save file, except for grottos which is done in `src/game/grotto.js`

## Credits

- `src/assets/item_icons.png`: original image compiled by [Indogutsu Tenbuki](https://www.spriters-resource.com/submitter/Indogutsu+Tenbuki/)
