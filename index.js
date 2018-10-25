const Util = require('./util')
const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')
const Vision = require('./core/image/vision')
// const classifyImg = require('./core/ai/classify')
// const cv = require('opencv4nodejs')


Util.FileIO.getFilesInDirectory({
  src: '@/images',
  type: 'image',
  // group: true,
  fullPath: true,
  depth: -1
}).then((images) => {
  // console.log(images)
  // images.forEach((image) => {
  //   const img = cv.imread(image)
  //   const predictions = classifyImg(img)
  //   predictions.forEach(p => console.log(p))
    // cv.imshowWait('img', img)
    Vision.checkDuplicate({ img1: images[0], img2: images[0] })
      .then((equal) => {
        console.log('images are equal', equal)
      })
      .catch((error) => {
        console.log('error:', error)
      })
  })

