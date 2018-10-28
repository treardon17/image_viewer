const Sharp = require('sharp')
const btoa = require('btoa')
const Exif = require('./exif')
const Vision = require('./vision')

class TRImage {
  constructor({ path, onLoad, onError }) {
    this.path = path
    this.onLoad = onLoad
    this.onError = onError

    this._imageDataDirty = true
    this._setupPromise = null
    this._thumbnail = null
    this.imageData = null
    this.image = Sharp(this.path)
    this.setupImage()
  }
  // //////////////////////
  // GETTERS
  // //////////////////////
  get dimensions() {
    const dimensions = { width: 0, height: 0 }
    if (this.imageData) {
      dimensions.width = this.imageData.width
      dimensions.heihgt = this.imageData.height
    }
    return dimensions
  }

  get widthToHeightRatio() {
    if (this.imageData && height !== 0) {
      const { width, height } = this.imageData
      return width / height
    }
    return 0
  }

  get heightToWidthRatio() {
    if (this.imageData && width !== 0) {
      const { width, height } = this.imageData
      return height / width
    }
    return 0
  }

  get format() {
    if (this.imageData) {
      return this.imageData.format
    }
    return null
  }

  async thumbnail() {
    return new Promise(async (resolve, reject) => {
      if (!this._thumbnail || this._imageDataDirty) {
        this._thumbnail = await this.getResizedBuffer({ width: 50 })
      }
      resolve(this._thumbnail)
    })
  }

  // //////////////////////
  // SETUP
  // //////////////////////
  async setupImage() {
    this._setupPromise = this.updateImageData()
      .then((data) => {
        typeof this.onLoad === 'function' && this.onLoad(this)
      })
      .catch((error) => {
        typeof this.onError === 'function' && this.onError(error)
      })
      .finally(() => {
        this._setupPromise = null
      })
  }

  async updateImageData() {
    if (this._setupPromise === null) {
      return new Promise(async (resolve, reject) => {
        if (this._imageDataDirty) {
          this.image
            .metadata()
            .then(async (data) => {
              this.imageData = data
              this._imageDataDirty = false
              resolve(data)
            })
            .catch((error) => {
              reject(error)
            })
        } else {
          resolve(this.imageData)
        }
      })
    } else {
      return this._setupPromise
    }
  }

  // //////////////////////
  // ACTIONS
  // //////////////////////
  async getResizedBuffer({ width, height, options, base64 = true }) {
    return new Promise((resolve, reject) => {
      const bufferPromise = this.image.resize({
        width,
        height,
        options
      })
      .toFormat(this.format)
      .toBuffer()

      if (base64) {
        bufferPromise
          .then((data) => {
            const { buffer } = data
            let base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
            base64 = `data:image/${this.format};base64,${base64}`
            resolve(base64)
          })
          .catch(reject)
      } else {
        bufferPromise
          .then(resolve)
          .catch(reject)
      }
    })
  }

  async checkDuplicate({ image }) {
    return new Promise(async (resolve, reject) => {
      if (image instanceof TRImage) {
        const img1 = await this.thumbnail()
        const img2 = await image.thumbnail()
        Vision.checkDuplicate({ img1, img2 })
          .then((compareData) => {
            compareData.match = 1 - (compareData.rawMisMatchPercentage / 100)
            resolve(compareData)
          })
          .catch((error) => {
            reject(error)
          })
      } else {
        reject(new Error('Invalid type of image. Must be of type TRImage.'))
      }
    })
  }
}

module.exports = TRImage