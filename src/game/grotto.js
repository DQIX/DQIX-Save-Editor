import gameData from "./data"
import * as layout from "./layout"

// https://stackoverflow.com/questions/6232939/is-there-a-way-to-correctly-multiply-two-32-bit-integers-in-javascript/6422061#6422061
// multiplies 2 u32s with C semantics
function u32Mul(a, b) {
  var ah = (a >> 16) & 0xffff,
    al = a & 0xffff
  var bh = (b >> 16) & 0xffff,
    bl = b & 0xffff
  var high = (ah * bl + al * bh) & 0xffff
  return (((high << 16) >>> 0) + al * bl) & 0xffffffff
}

class Rng {
  constructor(seed) {
    //NOTE: needs to be a typed array to get correct wrapping behavior :(
    this.seed = new Uint32Array(1)
    this.seed[0] = seed
  }

  next() {
    this.seed[0] = u32Mul(this.seed[0], 1103515245)
    this.seed[0] += 12345
    return (this.seed[0] >>> 16) & 0x7fff
  }

  nextRem(n) {
    const num = this.next()
    return num % n
  }
}

const tables = {
  a: [1, 30, 0, 0, 2, 40, 0, 0, 3, 10, 0, 0, 4, 10, 0, 0, 5, 10, 0, 0],
  b: [
    2, 55, 2, 4, 56, 75, 4, 6, 76, 100, 6, 10, 101, 120, 8, 12, 121, 140, 10, 14, 141, 180, 10, 16,
    181, 200, 11, 16, 201, 220, 12, 16, 221, 248, 14, 16,
  ],
  c: [
    2, 55, 1, 3, 56, 75, 2, 4, 76, 100, 3, 5, 101, 140, 4, 6, 141, 180, 5, 7, 181, 200, 6, 9, 201,
    220, 8, 9, 221, 248, 9, 9,
  ],
  d: [
    2, 60, 1, 3, 61, 80, 2, 5, 81, 100, 3, 7, 101, 120, 4, 7, 121, 140, 5, 9, 141, 160, 6, 9, 161,
    180, 7, 10, 181, 200, 8, 12, 201, 248, 1, 12,
  ],
  e: [1, 100, 2, 100, 3, 75, 4, 75, 5, 50, 6, 50, 7, 30, 8, 20, 9, 20, 10, 20, 11, 10, 12, 10],
  f: [
    1, 1, 2, 0, 2, 1, 2, 0, 3, 1, 3, 0, 4, 1, 4, 0, 5, 2, 5, 0, 6, 2, 6, 0, 7, 3, 7, 0, 8, 3, 8, 0,
    9, 4, 9, 0, 10, 5, 9, 0, 11, 1, 10, 0, 12, 4, 10, 0,
  ],
  g: [
    2, 3, 1, 2, 4, 5, 1, 3, 6, 7, 1, 4, 8, 9, 2, 5, 10, 11, 2, 6, 12, 13, 3, 7, 14, 15, 4, 8, 16,
    16, 6, 8,
  ],
  h: [1, 2, 1, 5, 3, 4, 4, 8, 5, 6, 7, 12, 7, 8, 7, 16, 9, 9, 12, 16],
  i: [1, 3, 1, 6, 4, 6, 4, 9, 7, 9, 7, 12, 10, 12, 10, 16],
  j: [0, 1, 2, 4, 3],
  k: [
    8, 0, 11, 0, 14, 0, 34, 0, 38, 0, 39, 0, 40, 0, 130, 0, 140, 0, 8, 0, 38, 0, 39, 0, 40, 0, 54,
    0, 59, 0, 99, 0, 135, 0, 189, 0, 8, 0, 38, 0, 39, 0, 40, 0, 52, 0, 131, 0, 139, 0, 153, 0, 1, 1,
    8, 0, 38, 0, 39, 0, 40, 0, 118, 0, 124, 0, 128, 0, 174, 0, 217, 0, 8, 0, 38, 0, 39, 0, 40, 0,
    82, 0, 125, 0, 182, 0, 197, 0, 221, 0, 8, 0, 38, 0, 39, 0, 40, 0, 47, 0, 137, 0, 151, 0, 169, 0,
    5, 1, 8, 0, 38, 0, 39, 0, 40, 0, 77, 0, 137, 0, 180, 0, 183, 0, 213, 0, 8, 0, 38, 0, 39, 0, 40,
    0, 55, 0, 198, 0, 245, 0, 2, 1, 9, 1, 8, 0, 38, 0, 39, 0, 40, 0, 53, 0, 175, 0, 237, 0, 9, 1,
    78, 1, 8, 0, 38, 0, 39, 0, 40, 0, 181, 0, 237, 0, 241, 0, 71, 1, 78, 1, 8, 0, 38, 0, 39, 0, 40,
    0, 53, 0, 215, 0, 226, 0, 237, 0, 71, 1, 8, 0, 38, 0, 39, 0, 40, 0, 215, 0, 226, 0, 235, 0, 241,
    0, 73, 1, 8, 0, 38, 0, 39, 0, 40, 0, 83, 0, 119, 0, 132, 0, 150, 0, 186, 0, 8, 0, 38, 0, 39, 0,
    40, 0, 42, 0, 159, 0, 164, 0, 200, 0, 220, 0, 8, 0, 38, 0, 39, 0, 39, 0, 40, 0, 64, 0, 76, 0,
    163, 0, 177, 0, 8, 0, 38, 0, 39, 0, 40, 0, 52, 0, 98, 0, 134, 0, 143, 0, 172, 0, 8, 0, 38, 0,
    39, 0, 40, 0, 98, 0, 148, 0, 178, 0, 203, 0, 221, 0, 8, 0, 38, 0, 39, 0, 40, 0, 151, 0, 166, 0,
    188, 0, 213, 0, 5, 1, 8, 0, 27, 0, 38, 0, 39, 0, 40, 0, 184, 0, 222, 0, 5, 1, 65, 1, 8, 0, 38,
    0, 39, 0, 40, 0, 53, 0, 77, 0, 168, 0, 184, 0, 65, 1, 8, 0, 38, 0, 39, 0, 40, 0, 53, 0, 184, 0,
    194, 0, 239, 0, 65, 1, 8, 0, 38, 0, 39, 0, 40, 0, 77, 0, 194, 0, 239, 0, 254, 0, 74, 1, 8, 0,
    38, 0, 39, 0, 40, 0, 185, 0, 230, 0, 239, 0, 254, 0, 74, 1, 8, 0, 38, 0, 39, 0, 40, 0, 228, 0,
    229, 0, 230, 0, 242, 0, 74, 1, 8, 0, 8, 0, 38, 0, 38, 0, 39, 0, 40, 0, 103, 0, 106, 0, 109, 0,
    8, 0, 18, 0, 38, 0, 39, 0, 40, 0, 95, 0, 101, 0, 114, 0, 202, 0, 8, 0, 38, 0, 39, 0, 40, 0, 104,
    0, 109, 0, 165, 0, 232, 0, 233, 0, 8, 0, 38, 0, 39, 0, 40, 0, 86, 0, 121, 0, 162, 0, 165, 0,
    217, 0, 8, 0, 38, 0, 39, 0, 40, 0, 49, 0, 190, 0, 204, 0, 217, 0, 3, 1, 8, 0, 38, 0, 39, 0, 40,
    0, 178, 0, 183, 0, 193, 0, 204, 0, 3, 1, 8, 0, 38, 0, 39, 0, 40, 0, 47, 0, 183, 0, 193, 0, 206,
    0, 222, 0, 8, 0, 38, 0, 39, 0, 40, 0, 93, 0, 196, 0, 224, 0, 243, 0, 67, 1, 8, 0, 38, 0, 39, 0,
    40, 0, 184, 0, 224, 0, 247, 0, 250, 0, 67, 1, 7, 0, 38, 0, 39, 0, 40, 0, 185, 0, 246, 0, 247, 0,
    250, 0, 0, 0, 7, 0, 38, 0, 39, 0, 40, 0, 236, 0, 246, 0, 250, 0, 69, 1, 0, 0, 7, 0, 38, 0, 39,
    0, 40, 0, 236, 0, 244, 0, 248, 0, 69, 1, 0, 0, 8, 0, 38, 0, 39, 0, 40, 0, 62, 0, 116, 0, 123, 0,
    127, 0, 200, 0, 8, 0, 38, 0, 39, 0, 40, 0, 134, 0, 135, 0, 141, 0, 187, 0, 208, 0, 8, 0, 21, 0,
    38, 0, 39, 0, 40, 0, 44, 0, 120, 0, 140, 0, 220, 0, 8, 0, 27, 0, 38, 0, 39, 0, 40, 0, 64, 0,
    120, 0, 167, 0, 177, 0, 8, 0, 38, 0, 39, 0, 40, 0, 128, 0, 136, 0, 146, 0, 167, 0, 201, 0, 8, 0,
    38, 0, 39, 0, 40, 0, 46, 0, 107, 0, 178, 0, 192, 0, 223, 0, 8, 0, 38, 0, 39, 0, 40, 0, 170, 0,
    192, 0, 195, 0, 198, 0, 223, 0, 8, 0, 38, 0, 39, 0, 40, 0, 195, 0, 213, 0, 214, 0, 218, 0, 252,
    0, 8, 0, 38, 0, 39, 0, 40, 0, 181, 0, 214, 0, 249, 0, 252, 0, 9, 1, 8, 0, 38, 0, 39, 0, 40, 0,
    199, 0, 249, 0, 252, 0, 9, 1, 68, 1, 8, 0, 38, 0, 39, 0, 40, 0, 171, 0, 199, 0, 249, 0, 68, 1,
    77, 1, 8, 0, 38, 0, 39, 0, 40, 0, 171, 0, 199, 0, 231, 0, 238, 0, 77, 1, 8, 0, 38, 0, 39, 0, 40,
    0, 61, 0, 94, 0, 157, 0, 207, 0, 4, 1, 8, 0, 38, 0, 39, 0, 40, 0, 81, 0, 149, 0, 158, 0, 179, 0,
    212, 0, 8, 0, 38, 0, 39, 0, 40, 0, 89, 0, 110, 0, 162, 0, 205, 0, 4, 1, 8, 0, 19, 0, 38, 0, 39,
    0, 40, 0, 90, 0, 160, 0, 255, 0, 6, 1, 8, 0, 38, 0, 39, 0, 40, 0, 87, 0, 96, 0, 112, 0, 180, 0,
    7, 1, 8, 0, 38, 0, 39, 0, 40, 0, 87, 0, 168, 0, 169, 0, 180, 0, 2, 1, 8, 0, 38, 0, 39, 0, 40, 0,
    55, 0, 168, 0, 175, 0, 218, 0, 2, 1, 8, 0, 38, 0, 39, 0, 40, 0, 181, 0, 218, 0, 243, 0, 245, 0,
    75, 1, 8, 0, 38, 0, 39, 0, 40, 0, 240, 0, 243, 0, 245, 0, 248, 0, 75, 1, 8, 0, 38, 0, 39, 0, 40,
    0, 240, 0, 248, 0, 251, 0, 12, 1, 75, 1, 8, 0, 38, 0, 39, 0, 40, 0, 176, 0, 248, 0, 251, 0, 253,
    0, 12, 1, 8, 0, 38, 0, 39, 0, 40, 0, 176, 0, 253, 0, 8, 1, 12, 1, 72, 1,
  ],
  l: [
    12, 16, 16, 12, 16, 12, 16, 20, 16, 12, 16, 12, 16, 16, 16, 16, 20, 20, 16, 12, 16, 16, 12, 16,
    16, 16, 16, 12, 12, 12, 12, 16, 12, 16, 16, 20, 16, 16, 12, 20, 8, 16, 16, 16, 8, 16, 16, 16,
    16, 16, 12, 20, 16, 16, 12, 12, 16, 20, 20, 16, 20, 12, 12, 16, 16, 20, 20, 16, 16, 16, 16, 16,
    16, 16, 12, 32, 24, 20, 16, 20, 16, 16, 12, 20, 20, 16, 8, 16, 12, 16, 16, 28, 16, 8, 12, 16,
    20, 20, 8, 16, 12, 16, 16, 12, 16, 20, 16, 16, 16, 16, 16, 16, 16, 20, 16, 12, 16, 12, 12, 12,
    12, 12, 12, 16, 16, 20, 16, 16, 12, 8, 16, 12, 16, 16, 16, 16, 16, 20, 16, 16, 16, 20, 20, 16,
    20, 16, 20, 12, 16, 16, 16, 20, 16, 16, 16, 20, 16, 16, 16, 12, 16, 20, 16, 16, 16, 16, 20, 16,
    28, 16, 20, 20, 16, 16, 12, 20, 16, 20, 16, 16, 16, 16, 16, 20, 16, 20, 16, 16, 16, 20, 16, 16,
    16, 16, 16, 16, 20, 24, 20, 24, 16, 12, 12, 8, 16, 16, 16, 16, 20, 16, 16, 20, 20, 16, 16, 16,
    16, 12, 20, 16, 16, 16, 16, 20, 16, 16, 20, 16, 16, 16, 16, 16, 20, 20, 16, 16, 16, 12, 12, 16,
    16, 16, 16, 20, 16, 12, 16, 12, 16, 12, 12, 12, 16, 16, 16, 20, 12, 16, 12, 20, 16, 16, 16, 16,
    16, 16, 16, 16, 20, 16, 16, 16, 16, 12, 12, 16, 16, 16, 16, 16, 16, 16, 12, 24, 28, 28, 24, 12,
    28, 32, 8, 32, 32, 32, 12, 28, 28, 28, 40, 40, 28, 28, 28, 20, 16, 16, 16, 20, 32, 16, 20, 20,
    16, 16, 16, 20, 12, 40, 40, 28, 12, 24, 12, 20, 32, 16, 28, 28, 28, 12, 20, 8, 12, 8, 12, 12,
    16, 8, 16, 12, 8, 20, 12, 12, 16, 20, 20, 8, 8, 8, 8, 12, 12, 12, 12, 8, 8, 8, 8, 12, 12, 12,
    12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 16, 16, 16, 16, 8, 8, 8, 8, 8, 8, 16, 16, 16, 16,
    16, 16, 20, 20, 20, 20, 20, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 32, 40, 40, 28, 28,
    28, 28, 28, 28, 32, 32, 12, 12, 32, 16, 24, 24, 28, 16, 16, 16, 16, 16, 16, 16, 12, 12, 8, 8,
    12, 28, 20,
  ],
  m: [
    0, 0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0, 9, 0, 10, 0, 11, 0, 12, 0, 13, 0,
    14, 0, 15, 0, 16, 0, 17, 0, 18, 0, 19, 0, 20, 0, 21, 0, 22, 0, 23, 0, 24, 0, 25, 0, 26, 0, 27,
    0, 28, 0, 29, 0, 30, 0, 31, 0, 32, 0, 33, 0, 34, 0, 35, 0, 36, 0, 37, 0, 38, 0, 39, 0, 40, 0,
    41, 0, 42, 0, 43, 0, 44, 0, 45, 0, 46, 0, 47, 0, 48, 0, 49, 0, 50, 0, 51, 0, 52, 0, 53, 0, 54,
    0, 55, 0, 56, 0, 57, 0, 58, 0, 59, 0, 60, 0, 61, 0, 62, 0, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 65, 0, 66, 0, 67, 0, 68, 0, 69, 0, 70, 0, 71, 0, 72, 0, 73,
    0, 74, 0, 75, 0, 76, 0, 77, 0, 78, 0, 79, 0, 80, 0, 81, 0, 82, 0, 83, 0, 84, 0, 85, 0, 86, 0,
    87, 0, 88, 0, 89, 0, 90, 0, 91, 0, 92, 0, 93, 0, 94, 0, 95, 0, 96, 0, 97, 0, 98, 0, 99, 0, 100,
    0, 101, 0, 102, 0, 103, 0, 104, 0, 105, 0, 106, 0, 107, 0, 108, 0, 109, 0, 110, 0, 111, 0, 112,
    0, 113, 0, 114, 0, 115, 0, 116, 0, 117, 0, 118, 0, 119, 0, 120, 0, 121, 0, 122, 0, 123, 0, 124,
    0, 125, 0, 126, 0, 127, 0, 128, 0, 129, 0, 130, 0, 131, 0, 132, 0, 133, 0, 134, 0, 135, 0, 136,
    0, 137, 0, 138, 0, 139, 0, 140, 0, 141, 0, 142, 0, 0, 0, 0, 0, 0, 0, 143, 0, 144, 0, 145, 0,
    146, 0, 147, 0, 148, 0, 149, 0, 150, 0, 151, 0, 152, 0, 153, 0, 154, 0, 155, 0, 156, 0, 157, 0,
    158, 0, 159, 0, 160, 0, 161, 0, 162, 0, 163, 0, 164, 0, 165, 0, 166, 0, 167, 0, 168, 0, 169, 0,
    170, 0, 171, 0, 172, 0, 173, 0, 174, 0, 175, 0, 176, 0, 177, 0, 178, 0, 179, 0, 180, 0, 181, 0,
    182, 0, 183, 0, 184, 0, 185, 0, 186, 0, 187, 0, 188, 0, 189, 0, 190, 0, 191, 0, 192, 0, 193, 0,
    194, 0, 0, 0, 0, 0, 0, 0, 195, 0, 196, 0, 197, 0, 198, 0, 199, 0, 200, 0, 201, 0, 202, 0, 203,
    0, 204, 0, 205, 0, 206, 0, 207, 0, 208, 0, 209, 0, 210, 0, 211, 0, 212, 0, 213, 0, 214, 0, 215,
    0, 216, 0, 217, 0, 218, 0, 219, 0, 220, 0, 221, 0, 222, 0, 223, 0, 224, 0, 225, 0, 226, 0, 227,
    0, 228, 0, 229, 0, 230, 0, 231, 0, 232, 0, 233, 0, 234, 0, 235, 0, 236, 0, 237, 0, 238, 0, 239,
    0, 240, 0, 241, 0, 242, 0, 243, 0, 244, 0, 245, 0, 246, 0, 247, 0, 248, 0, 249, 0, 250, 0, 251,
    0, 252, 0, 253, 0, 254, 0, 255, 0, 0, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9, 1,
    10, 1, 11, 1, 12, 1, 13, 1, 14, 1, 15, 1, 16, 1, 17, 1, 18, 1, 19, 1, 20, 1, 21, 1, 22, 1, 23,
    1, 24, 1, 25, 1, 0, 0, 26, 1, 27, 1, 28, 1, 29, 1, 30, 1, 31, 1, 32, 1, 33, 1, 34, 1, 35, 1, 36,
    1, 37, 1, 38, 1, 39, 1, 40, 1, 41, 1, 42, 1, 43, 1, 44, 1, 45, 1, 46, 1, 47, 1, 48, 1, 49, 1,
    50, 1, 51, 1, 52, 1, 53, 1, 54, 1, 55, 1, 56, 1, 57, 1, 58, 1, 59, 1, 60, 1, 61, 1, 62, 1, 63,
    1, 64, 1, 65, 1, 66, 1, 67, 1, 68, 1, 69, 1, 70, 1, 71, 1, 72, 1, 73, 1,
  ],
  n: [
    1, 1, 2, 0, 2, 1, 2, 0, 3, 1, 3, 0, 4, 1, 4, 0, 5, 2, 5, 0, 6, 2, 6, 0, 7, 3, 7, 0, 8, 3, 8, 0,
    9, 4, 9, 0, 10, 5, 9, 0, 11, 1, 10, 0, 12, 4, 10, 0,
  ],
  o: [0, 14, 28, 41, 55, 71, 88, 108, 125, 141, 162],
  p: [
    10, 10, 5, 10, 10, 8, 5, 8, 10, 10, 2, 8, 2, 2, 8, 8, 10, 2, 10, 10, 10, 10, 8, 8, 10, 2, 2, 2,
    10, 10, 10, 10, 10, 10, 10, 1, 10, 10, 5, 2, 2, 5, 15, 15, 12, 10, 15, 12, 2, 5, 5, 1, 1, 1, 1,
    5, 15, 10, 15, 1, 1, 1, 1, 1, 1, 10, 10, 1, 12, 1, 15, 10, 15, 15, 15, 10, 6, 1, 1, 10, 1, 10,
    1, 1, 1, 1, 1, 1, 10, 10, 10, 10, 10, 15, 6, 2, 2, 15, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 13, 13,
    10, 15, 15, 15, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 10, 10, 10, 15, 10, 10, 8, 1, 1, 1, 1, 1,
    1, 1, 15, 10, 10, 10, 15, 10, 8, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ],
  q: [
    12, 14, 16, 15, 7, 18, 28, 23, 27, 0, 29, 13, 30, 31, 32, 33, 34, 35, 36, 22, 19, 1, 7, 46, 37,
    38, 39, 40, 140, 41, 11, 42, 7, 2, 43, 44, 45, 49, 8, 50, 51, 139, 52, 53, 11, 8, 16, 3, 54, 47,
    48, 76, 55, 56, 57, 139, 24, 58, 16, 59, 60, 61, 62, 63, 64, 65, 66, 67, 11, 68, 20, 139, 21,
    69, 8, 70, 71, 72, 73, 74, 75, 11, 77, 78, 79, 80, 81, 82, 139, 83, 84, 85, 17, 4, 25, 86, 87,
    11, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 17, 5, 11, 9, 10, 101, 102, 103, 104,
    105, 106, 107, 108, 109, 110, 111, 112, 6, 17, 11, 9, 113, 114, 115, 116, 117, 118, 119, 120,
    121, 122, 123, 9, 124, 17, 125, 26, 10, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136,
    137, 138,
  ],

  placeIndices: [
    0, 8, 0, 0, 0, 1, 1, 11, 16, 1, 2, 2, 12, 17, 21, 3, 3, 13, 18, 22, 4, 4, 4, 4, 4, 5, 9, 14, 19,
    5, 6, 6, 6, 6, 6, 7, 10, 15, 20, 23,
  ],
}

function seek1(table, tableSize, rng) {
  const num = rng.nextRem(100)
  let num2 = 0

  for (let i = 0; i < tableSize; i++) {
    num2 += table[i * 4 + 1]
    if (num < num2) {
      return table[i * 4]
    }
  }
  return 0
}

function seek2(table, value, tableSize, rng) {
  for (let i = 0; i < tableSize; i++) {
    if (value >= table[i * 4] && value <= table[i * 4 + 1]) {
      return seek3(table[i * 4 + 2], table[i * 4 + 3], rng)
    }
  }
  return 0
}

function seek3(val1, val2, rng) {
  let num = rng.next()
  let num2 = val2 - val1 + 1
  if (num2 == 0) {
    return val1
  }
  return val1 + (num % num2)
}

function seek4(table1, table2, rank, roopCount, rng) {
  for (let i = 0; i < roopCount; i++) {
    if (rank < table1[i * 4] || rank > table1[i * 4 + 1]) {
      continue
    }
    let num = 0
    for (let j = table1[i * 4 + 2]; j <= table1[i * 4 + 3]; j++) {
      num += table2[(j - 1) * 2 + 1]
    }
    let num2 = rng.next() % num

    num = 0
    for (let k = table1[i * 4 + 2]; k <= table1[i * 4 + 3]; k++) {
      num += table2[(k - 1) * 2 + 1]
      if (num2 < num) {
        return k
      }
    }
    break
  }
  return 0
}

export function getGrottoDetails(seed, rank) {
  const rng = new Rng(seed)

  for (let i = 0; i < 12; i++) {
    rng.next()
  }

  const details = []
  details.type = seek1(tables.a, 5, rng) - 1
  details.floorCount = seek2(tables.b, rank, 9, rng)
  details.monsterRank = seek2(tables.c, rank, 8, rng)
  details.boss = seek4(tables.d, tables.e, rank, 9, rng) - 1

  for (let i = 0; i < 12; i++) {
    rng.next()
    // details[i + 8] = seek3(tables.f[i * 4 + 1], tables.f[i * 4 + 2], rng)
  }

  details.namePrefixIdx = seek2(tables.h, details.monsterRank, 5, rng) - 1
  details.nameSuffixIdx = seek2(tables.i, details.boss + 1, 4, rng) - 1
  const env = seek2(tables.g, details.floorCount, 8, rng)
  details.namePlaceIdx = tables.placeIndices[(env - 1) * 5 + details.type]

  details.level = (details.boss + details.floorCount + details.monsterRank - 3) * 3
  details.level += rng.nextRem(11) - 5
  details.level = Math.max(1, Math.min(details.level, 99))

  details.lastRng = rng.seed[0]

  return details
}

export function getGrottoName(seed, rank) {
  const details = getGrottoDetails(seed, rank)

  return (
    (gameData.grottoNamePrefixes[details.namePrefixIdx] || "unknown") +
    " " +
    (gameData.grottoNamePlaces[details.namePlaceIdx] || "unknown") +
    " of " +
    (gameData.grottoNameSuffixes[details.nameSuffixIdx] || "unknown") +
    " lv. " +
    (details.level || 1)
  )
}

/// single identifier that encapsulates a grotto without location
export function getMapIdString(seed, rank) {
  return rank.toString(16).padStart(2, "0") + seed.toString(16).padStart(4, "0")
}

const rankDivisions = [0x02, 0x38, 0x3d, 0x4c, 0x51, 0x65, 0x79, 0x8d, 0xa1, 0xb5, 0xc9, 0xdd]
export const grottoLookup = {}
export const grottoSeedSamples = {}
window.grottoSeedSamples = grottoSeedSamples

export function registerGrottos() {
  if (Object.keys(grottoLookup).length) return

  for (let seed = 0; seed < 0xffff; seed++) {
    const sample = new Uint32Array(1)
    sample[0] = u32Mul(seed, 1103515245) + 12345
    sample[0] = u32Mul(sample[0], 1103515245)
    sample[0] = ((sample[0] + 12345) >> 16) & 0x7fff

    if (!grottoSeedSamples[sample]) grottoSeedSamples[sample] = []
    grottoSeedSamples[sample].push(seed)

    for (const rank of rankDivisions) {
      const details = getGrottoDetails(seed, rank)

      // name lookup
      if (!grottoLookup[details.namePrefixIdx]) grottoLookup[details.namePrefixIdx] = {}
      if (!grottoLookup[details.namePrefixIdx][details.namePlaceIdx])
        grottoLookup[details.namePrefixIdx][details.namePlaceIdx] = {}
      if (!grottoLookup[details.namePrefixIdx][details.namePlaceIdx][details.nameSuffixIdx])
        grottoLookup[details.namePrefixIdx][details.namePlaceIdx][details.nameSuffixIdx] = {}
      if (
        !grottoLookup[details.namePrefixIdx][details.namePlaceIdx][details.nameSuffixIdx][
          details.level
        ]
      )
        grottoLookup[details.namePrefixIdx][details.namePlaceIdx][details.nameSuffixIdx][
          details.level
        ] = []
      grottoLookup[details.namePrefixIdx][details.namePlaceIdx][details.nameSuffixIdx][
        details.level
      ].push({
        seed,
        rank,
      })
    }
  }
}

export function getGrottoSeedsByNameData(prefix, place, suffix, lvl) {
  return grottoLookup?.[prefix]?.[place]?.[suffix]?.[lvl] || []
}

export function getValidLocations(seed, rank) {
  const validLocations = new Set()
  const lowRankValidLocations = new Set()
  const midRankValidLocations = new Set()
  const highRankValidLocations = new Set()

  const samples = grottoSeedSamples[seed]
  if (!samples) {
    return {
      validLocations: [],
      lowRankValidLocations: [],
      midRankValidLocations: [],
      highRankValidLocations: [],
    }
  }
  const validRanks = new Set()
  for (const sample of samples) {
    const srng = new Rng(sample)

    let n = srng.next()
    for (let i = 2; i <= 248; i++) {
      const validRank = Math.min(
        248,
        sample + (n % (Math.floor(sample / 10) * 2 + 1)) - Math.floor(sample / 10)
      )

      validRanks.add(validRank)
    }

    srng.next()
    n = srng.next()

    validLocations.add(rank <= 50 ? (n % 47) + 1 : rank > 80 ? (n % 150) + 1 : (n % 131) + 1)
    lowRankValidLocations.add((n % 47) + 1)
    midRankValidLocations.add((n % 131) + 1)
    highRankValidLocations.add((n % 150) + 1)

    if (rank == 2 && seed == 50) {
      validLocations.add(5)
      lowRankValidLocations.add(5)
    }
  }

  return {
    validLocations: [...validLocations].sort(),
    lowRankValidLocations: [...lowRankValidLocations].sort(),
    midRankValidLocations: [...midRankValidLocations].sort(),
    highRankValidLocations: [...highRankValidLocations].sort(),
  }
}

export function getGrottoData(seed, rank) {
  const details = getGrottoDetails(seed, rank)

  return { details, ...getValidLocations(seed, rank) }
}

export default class Grotto {
  constructor(buffer) {
    this._buffer = buffer

    this._details = null
    this._validLocations = null
  }

  getDetails() {
    if (!this._details) {
      this._details = getGrottoDetails(this.getSeed(), this.getRank())
    }

    return this._details
  }

  getName() {
    switch (this.getKind()) {
      case gameData.GROTTO_KIND_NORMAL: {
        const details = this.getDetails()
        return (
          (gameData.grottoNamePrefixes[details.namePrefixIdx] || "unknown") +
          " " +
          (gameData.grottoNamePlaces[details.namePlaceIdx] || "unknown") +
          " of " +
          (gameData.grottoNameSuffixes[details.nameSuffixIdx] || "unknown") +
          " lv. " +
          (details.level || 1)
        )
      }
      case gameData.GROTTO_KIND_LEGACY: {
        return (
          gameData.legacyBosses[this.getLegacyBoss() - 1].name +
          "'s Map lv. " +
          this.getLegacyBossLevel()
        )
      }
      default: {
        return "unknown map"
      }
    }
  }

  createValidLocations() {
    this._validLocations = getValidLocations(this.getSeed(), this.getRank()).validLocations

    return this._validLocations
  }

  getValidLocations() {
    switch (this.getKind()) {
      case gameData.GROTTO_KIND_NORMAL:
        return this._validLocations || this.createValidLocations()
      case gameData.GROTTO_KIND_LEGACY:
        return Array.from({ length: 150 }, (_, i) => i + 1)
      default:
        return []
    }
  }

  /// single identifier that encapsulates a grotto without location (for yab's tools link)
  getMapIdString() {
    return (
      this.getRank().toString(16).padStart(2, "0") + this.getSeed().toString(16).padStart(4, "0")
    )
  }

  getState() {
    const b = this._buffer.readByte(layout.GROTTO_KIND_STATE_OFFSET) & 0x7
    if (b & gameData.GROTTO_STATE_UNDISCOVERED) {
      return gameData.GROTTO_STATE_UNDISCOVERED
    } else if (b & gameData.GROTTO_STATE_DISCOVERED) {
      return gameData.GROTTO_STATE_DISCOVERED
    } else if (b & gameData.GROTTO_STATE_CLEARED) {
      return gameData.GROTTO_STATE_CLEARED
    } else {
      return gameData.GROTTO_STATE_UNKNOWN
    }
  }

  setState(state) {
    const prev = this._buffer.readByte(layout.GROTTO_KIND_STATE_OFFSET)

    this._buffer.writeByte((prev & 0xf8) | (state & 0x7), layout.GROTTO_KIND_STATE_OFFSET)
  }

  getKind() {
    return (this._buffer.readByte(layout.GROTTO_KIND_STATE_OFFSET) >> 3) & 0x3
  }

  setKind(kind) {
    this._details = null

    const prev = this._buffer.readByte(layout.GROTTO_KIND_STATE_OFFSET)

    this._buffer.writeByte((prev & 0xe7) | ((kind << 3) & 0x18), layout.GROTTO_KIND_STATE_OFFSET)

    this.setState(gameData.GROTTO_STATE_UNDISCOVERED)
    this.setConqueredBy("")
    this.setDiscoveredBy("")
    this.setTreasurePlundered(0, false)
    this.setTreasurePlundered(1, false)
    this.setTreasurePlundered(2, false)
    switch (kind) {
      case gameData.GROTTO_KIND_NORMAL:
        {
          this.setSeed(50)
          this.setRank(2)
          this.setLocation(5)
        }
        break
      case gameData.GROTTO_KIND_LEGACY:
        {
          this.setLegacyBoss(3)
          this.setLegacyBossLevel(1)
          this.setLegacyBossTurns(1000)
        }
        break
    }
  }

  getLegacyBoss() {
    return this._buffer.readByte(layout.GROTTO_RANK_LEGACY_BOSS_OFFSET)
  }

  setLegacyBoss(b) {
    this._buffer.writeByte(b, layout.GROTTO_RANK_LEGACY_BOSS_OFFSET)
  }

  getLegacyBossLevel() {
    return this._buffer.readByte(layout.GROTTO_LEGACY_BOSS_LEVEL_OFFSET)
  }

  setLegacyBossLevel(lvl) {
    lvl = Math.max(0, Math.min(999, lvl))
    this._buffer.writeByte(lvl, layout.GROTTO_LEGACY_BOSS_LEVEL_OFFSET)
  }

  getLegacyBossTurns() {
    console.log(this)
    return this._buffer.readU16LE(layout.GROTTO_SEED_TURNS_OFFSET)
  }

  setLegacyBossTurns(turns) {
    // turns = Math.max(0, Math.min(999, turns))
    this._buffer.writeU16LE(turns, layout.GROTTO_SEED_TURNS_OFFSET)
  }

  getSeed() {
    return this._buffer.readU16LE(layout.GROTTO_SEED_TURNS_OFFSET)
  }

  setSeed(seed) {
    this._details = null
    this._validLocations = null
    this._buffer.writeU16LE(seed, layout.GROTTO_SEED_TURNS_OFFSET)
  }

  getRank() {
    return this._buffer.readByte(layout.GROTTO_RANK_LEGACY_BOSS_OFFSET)
  }

  setRank(rank) {
    this._details = null
    this._validLocations = null
    this._buffer.writeByte(rank, layout.GROTTO_RANK_LEGACY_BOSS_OFFSET)
  }

  getLocation() {
    return this._buffer.readByte(layout.GROTTO_LOCATION_OFFSET)
  }

  setLocation(location) {
    this._buffer.writeByte(location, layout.GROTTO_LOCATION_OFFSET)
  }

  getDiscoveredBy() {
    return this._buffer.readDqixString(layout.GROTTO_DISCOVERED_BY_OFFSET, layout.NAME_LENGTH)
  }

  setDiscoveredBy(name) {
    name = name.substr(0, layout.NAME_LENGTH).padEnd(layout.NAME_LENGTH, "\0")

    this._buffer.writeDqixString(name, layout.GROTTO_DISCOVERED_BY_OFFSET)
  }

  getConqueredBy() {
    return this._buffer.readDqixString(layout.GROTTO_CONQUERED_BY_OFFSET, layout.NAME_LENGTH)
  }

  setConqueredBy(name) {
    name = name.substr(0, layout.NAME_LENGTH).padEnd(layout.NAME_LENGTH, "\0")

    this._buffer.writeDqixString(name, layout.GROTTO_CONQUERED_BY_OFFSET)
  }

  getTreasurePlundered(i) {
    if (0 <= i && i < 3)
      return !!(this._buffer.readByte(layout.GROTTO_TREASURE_PLUNDERED_OFFSET) & (1 << i))

    return false
  }

  setTreasurePlundered(i, value) {
    if (!(0 <= i && i < 3)) return

    const mask = 1 << i

    const prev = this._buffer.readByte(layout.GROTTO_TREASURE_PLUNDERED_OFFSET)
    this._buffer.writeByte(
      (prev & (0xff ^ mask)) | (value ? mask : 0),
      layout.GROTTO_TREASURE_PLUNDERED_OFFSET
    )
  }
}
