const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')

class Exif {
  static write(src, data = {}, options = { overwrite: true }) {
    return new Promise((resolve, reject) => {
      try {
        const ep = new exiftool.ExiftoolProcess(exiftoolBin)
        ep
          .open()
          .then((pid) => { typeof options.onStart === 'function' && options.onStart(pid) })
          .then(() => {
            const exifOptions = []
            options.overwrite && exifOptions.push('overwrite_original')
            return ep.writeMetadata(src, data, exifOptions)
          })
          .then(() => ep.close())
          .then(resolve)
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  static read(src, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const ep = new exiftool.ExiftoolProcess(exiftoolBin)
        ep
          .open()
          .then((pid) => {
            typeof options.onStart === 'function' && options.onStart(pid)
            return Promise.resolve()
          })
          .then(() => ep.readMetadata(src, ['-File:all']))
          .then((data, error) => {
            ep.close()
            if (error) reject(error)
            else resolve(data)
          })
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = Exif