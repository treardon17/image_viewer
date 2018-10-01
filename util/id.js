class IDUtil {
  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  randHex(len) {
    //  random hex string generator
    const maxlen = 8
    const min = Math.pow(16, Math.min(len, maxlen) - 1)
    const max = Math.pow(16, Math.min(len, maxlen)) - 1
    const n = Math.floor(Math.random() * (max - min + 1)) + min
    let r = n.toString(16)
    while (r.length < len) {
      r = r + this.randHex(len - maxlen)
    }
    return r.toUpperCase()
  }

  guidMac() {
    const hexLength = 12
    const hex = this.randHex(hexLength).split('')
    const arrays = []
    for (let index = 0; index < (hexLength / 2); index++) {
      let subArray = null
      if (hex.length > 1) {
        subArray = hex.splice(0, 2)
      } else if (hex.length === 1) {
        subArray = [hex[0]]
      }
      arrays.push(subArray.join(''))
    }
    const mac = arrays.join(':')
    return mac
  }

  hash(str) {
    var hash = 0
    for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i)
      hash = char + (hash << 6) + (hash << 16) - hash
    }
    return `${Math.abs(hash)}`
  }
}

module.exports = new IDUtil()