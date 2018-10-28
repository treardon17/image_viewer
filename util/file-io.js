const path = require('path')
var os = require("os")
const mkdirp = require('mkdirp')
const isJSON = require('is-json')
const fs = require('fs-extra')
const glob = require('glob')

class FileIO {
  getAliasedFilePath({ src = '' }) {
    let newFilePath = src
    Object.keys(this.alias).forEach((key) => {
      if (newFilePath.includes(key)) {
        newFilePath = newFilePath.split(key).join(this.alias[key])
      }
    })
    return newFilePath
  }

  async getFilesInDirectory({
    src,
    type,
    group = false,
    // tree = false,
    fullPath = false,
    depth = 0
  } = {}) {
    return new Promise((resolve, reject) => {
      const filePath = this.getAliasedFilePath({ src })
      let depthString = '*'
      if (depth === -1 || depth === Number.POSITIVE_INFINITY) {
        depthString = '**/*'
      } else {
        for (let i = 0; i < depth; i += 1) {
          depthString += '/*'
        }
      }
      const globPath = path.resolve(filePath, depthString)
      glob(globPath, (err, files) => {
        // If there were no errors
        if (!err) {
          // copy the array
          let fileList = [...files]
          // file type checking
          const regex = this.fileExtRegex[type] || type
          if (type != null && regex instanceof RegExp) {
            fileList = fileList.filter((file) => regex.test(file))
          }
          // change file path if needed
          if (!fullPath) {
            fileList = fileList.map((file) => file.replace(filePath, ''))
          }
          return resolve(fileList)
        } else reject(err)
      })
    })
  }

  isDirectory({ src }) {
    try {
      return fs.statSync(src).isDirectory() 
    } catch (error) {
      return false
    }
  }

  fileExists({ src }) {
    const filePath = this.getAliasedFilePath({ src })
    try {
      return fs.existsSync(filePath)
    } catch (error) {
      return false
    }
  }

  async readFile({ src }) {
    return new Promise((resolve, reject) => {
      const filePath = this.getAliasedFilePath({ src })
      const exists = fs.existsSync(filePath)
      if (exists) {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
          err ? reject(err) : resolve(data)
        });
      } else {
        reject('File does not exist')
      }
    })
  }

  async createFilePath({ src }) {
    return new Promise((resolve, reject) => {
      const filePath = this.getAliasedFilePath({ src })
      mkdirp(path.dirname(filePath), (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  async writeFile({ src, data }) {
    return new Promise((resolve, reject) => {
      let writeData = data
      const filePath = this.getAliasedFilePath({ src })
      this.createFilePath({ filePath })
        .then(() => {
          if (typeof writeData === 'object') {
            writeData = JSON.stringify(data, null, 2)
          }
          fs.writeFile(filePath, writeData, (err) => {
            err ? reject(err) : resolve()
          })
        })
        .catch(reject)
    })
  }

  async saveToDataFile({ src, key, data }) {
    return new Promise((resolve, reject) => {
      const filePath = this.getAliasedFilePath({ src })
      this.readFile({ filePath })
        .then((fileData) => {
          const newData = isJSON(fileData) ? JSON.parse(fileData) : {}
          key ? newData[key] = data : newData = data
          this.writeFile({ filePath, data: newData })
            .then(resolve)
            .catch((error) => {
              reject(error)
            })
        }).catch(() => {
          const newData = key ? { [key]: data } : data
          this.writeFile({ filePath, data: newData })
            .then(resolve)
            .catch((error) => {
              reject(error)
            })
        })
    })
  }

  async readDataFile({ src, createIfNeeded = false }) {
    return new Promise((resolve, reject) => {
      const filePath = this.getAliasedFilePath({ src })
      this.readFile({ filePath })
        .then((data) => {
          if (isJSON(data) || data.trim() === '{}') {
            const dataObj = JSON.parse(data)
            resolve(dataObj)
          } else {
            reject('Invalid JSON in file', filePath)
          }
        })
        .catch((error) => {
          if (createIfNeeded) {
            const data = {}
            this.saveToDataFile({ filePath, data })
              .then(() => {
                reject(data)
              })
              .catch(reject)
          } else {
            reject(error)
          }
        })
    })
  }

  async appendToFile({ src, output }) {
    return new Promise((resolve, reject) => {
      const filePath = this.getAliasedFilePath({ src })
      this.createFilePath({ filePath })
        .then(() => {
          const fileExists = fs.existsSync(filePath)
          if (!fileExists) {
            fs.openSync(filePath, 'w');
          }
          fs.appendFile(filePath, `${output}${os.EOL}`, (err) => {
            if (err) { reject() }
            else { resolve() }
          })
        })
    })
  }
}

FileIO.prototype.alias = {
  '@': path.dirname(require.main.filename)
}

FileIO.prototype.fileExtRegex = {
  'image': (/\.(gif|jpe?g|tiff|png)$/i)
}

module.exports = new FileIO()