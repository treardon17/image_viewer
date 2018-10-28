class ArrayUtil {
  removeDuplicates({ array, prop }) {
    const isArray = (Array.isArray(prop) && prop.length > 0)
    const property = isArray ? prop.shift() : prop
    if (property) {
      if (isArray) {
        return this.removeDuplicates({ array, prop: property })
      }
      return array.filter((obj, pos, arr) => arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos)
    } else {
      return [...new Set(array)]
    }
  }
  intersection({ array1, array2 }){
    return array1.filter(n => array2.indexOf(n) !== -1)
  }
  union({ array1, array2 }){
    return [...new Set([...array1, ...array2])]
  }  
  difference({ array1, array2 }) {
    return array1.filter(x => !array2.includes(x))
  }
  symmetricDifference({ array1, array2 }) {
    return array1
      .filter(x => !array2.includes(x))
      .concat(array2.filter(x => !array1.includes(x)))
  }
  chunk({ array, size = 10 }) {
    return array.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / size)
      if (!resultArray[chunkIndex]) resultArray[chunkIndex] = [] // start a new chunk
      resultArray[chunkIndex].push(item)
      return resultArray
    }, [])
  }
}

module.exports = new ArrayUtil()