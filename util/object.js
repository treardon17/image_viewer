class ObjectUtil {
  removeKeysFromObject({ object, keys }) {
    keys.forEach(key => {
      delete object[key]
    })
  }

  serializeObj(obj, prefix) {
    const str = []
    if (typeof obj === 'object') {
      const keys = Object.keys(obj)
      keys.forEach((key) => {
        const k = prefix ? `${prefix}[${key}]` : key
        const v = obj[key]
        str.push((v !== null && typeof v === 'object') ?
          this.serializeObj(v, k) :
          `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      })
    }
    return str.join('&')
  }

  setNestedObject ({ obj, keyArray, value }) {
    let tempObj = obj
    keyArray.forEach((key, index) => {
      if (!obj[key] && index < keyArray.length) {
        tempObj[key] = {}
      }
      if (index < keyArray.length - 1) {
        tempObj = obj[key]
      } else {
        tempObj[key] = value
      }
    })
    return obj
  }

  getNestedElement({ obj, keys }) {
    let tempEl = obj
    if (Array.isArray(keys)) {
      for(let i = 0; i < keys.length; i++) {
        // If we're not done yet and the object is null, quit
        const key = keys[i]
        if (!tempEl || typeof tempEl !== 'object') {
          tempEl = null
          break
        } else {
          tempEl = tempEl[key]
        }
      }
    } else if (typeof keys === 'string') {
      tempEl = tempEl[key]
    }
    return tempEl
  }
}

module.exports = new ObjectUtil()