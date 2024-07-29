import { Buffer } from "buffer"

export const stringTables = {}

function prepareStringTables() {
  stringTables.encode = {}
  stringTables.decode = {}

  for (let i = 0; i < 26; i++) {
    // uppercase a-z
    stringTables.decode[String.fromCharCode(65 + i)] = i + 18
    // lowercase a-z
    stringTables.decode[String.fromCharCode(97 + i)] = i + 44
  }

  for (let i = 0; i < 10; i++) {
    // 0-9
    stringTables.decode[String.fromCharCode(48 + i)] = i + 8
  }

  const bytes = [
    4, 70, 71, 72, 74, 75, 76, 77, 83, 84, 85, 88, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102,
    103, 105, 106, 107, 109, 111, 113, 114, 116, 118, 120, 121, 122, 123, 124, 125, 126, 127, 128,
    129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 141, 142, 143, 144, 145, 146, 147, 148,
    149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167,
    168, 169, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 240, 255,
  ]

  const chars =
    "'{|}€,„Œœ¡£«»¿!\"#$%&’()+-./;=?[]_ÀÁÂÄÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜßàáâäæçèéêëìíîïñòóôõöùúûü~☻*@¢ªº←↑→↓– "

  for (let i = 0; i < bytes.length; i++) {
    stringTables.decode[chars[i]] = bytes[i]
  }

  const entries = Object.entries(stringTables.decode)
  for (let i = 0; i < entries.length; i++) {
    stringTables.encode[entries[i][1]] = entries[i][0]
  }
}

prepareStringTables()

export function readDqixStringFromBuffer(buffer) {
  return Array.from(buffer)
    .map(b => b != 0 && (stringTables.encode[b] || "?"))
    .filter(x => x)
    .join("")
}

export function writeDqixStringToBuffer(str) {
  return Buffer.from([...str].map(c => stringTables.decode[c]))
}

export function readAsciiStringFromBuffer(buffer) {
  return Array.from(buffer)
    .map(b => b != 0 && String.fromCharCode(b))
    .filter(x => x)
    .join("")
}

export function writeAsciiStringToBuffer(str) {
  return Buffer.from(str)
}
