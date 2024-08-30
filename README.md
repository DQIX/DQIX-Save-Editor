# DQIX Editor

A save editor for dragon quest ix

<details><summary><h2>features/todo (77/105)</h2></summary>

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
- [ ] party/standby move
- [ ] import/export

</details>

<details><summary><h3>items:</h3></summary>

- [x] list of items
- [ ] bulk edit

</details>

<details><summary><h3>inn:</h3></summary>

- [ ] lodged characters profiles
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
  - [ ] map
  - [ ] level/revocations
  - [x] profile
    - [x] location
    - [x] birthday
    - [x] title
    - [x] speech style
    - [x] message
  - [ ] gender
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
- [ ] location
  - [x] current
  - [ ] valid location list
- [ ] add/remove
- [ ] normal
  - [x] info
  - [ ] map preview
  - [ ] grotto search
- [x] legacy
  - [x] turns
  - [x] boss

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

</details>

<details><summary><h3>etc:</h3></summary>

- [x] auto detection of quick/confessed save
- [x] undo/redo history

</details>

<details><summary><h3>stretch:</h3></summary>

- [ ] allow marking quests in progress?
- [ ] unsafe mode?
- [ ] fountain group
- [ ] pals past and present
- [ ] world things (chests, item respawns)

</details>

</details>

## for devs

- `src/game/data.js` contains game data info including items, equipment, appearance data, etc
- `src/game/grotto.js` contains a partial implementation of the grotto generation algorithms
- `src/game/layout.js` contains known values of where various things in the save file are, if you find something else please feel free to open an issue or pr
- `src/saveManager.js` contains an implementation of reading and writing various data from the save file, except for grottos which is done in `src/game/grotto.js`

## Credits

- `src/assets/item_icons.png`: original image compiled by [Indogutsu Tenbuki](https://www.spriters-resource.com/submitter/Indogutsu+Tenbuki/)
