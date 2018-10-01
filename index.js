const Util = require('./util')
const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')
const classifyImg = require('./core/ai/classify')
const cv = require('opencv4nodejs')


Util.FileIO.getFilesInDirectory({
  src: '@/images',
  type: 'image',
  // group: true,
  fullPath: true,
  depth: -1
}).then((images) => {
  console.log(images)
  images.forEach((image) => {
    const img = cv.imread(image)
    const predictions = classifyImg(img)
    predictions.forEach(p => console.log(p))
    // cv.imshowWait('img', img)
  })
  // for (let i = 0; i < images.length; i += 1) {
  //   const image = images[i]
  //   console.log('image', image)
  //   // try {
  //   //   const ep = new exiftool.ExiftoolProcess(exiftoolBin)
  //   //   ep
  //   //     .open()
  //   //     // display pid
  //   //     .then((pid) => console.log('Started exiftool process %s', pid))
  //   //     .then(() => ep.writeMetadata(image, {
  //   //       'Keywords+': ['keywordA', 'keywordB'],
  //   //       'UserComment': 'This is really cool'
  //   //     }, ['overwrite_original']))
  //   //     .then(() => ep.readMetadata(image, ['-File:all']))
  //   //     .then(console.log, console.error)
  //   //     .then(() => ep.close())
  //   //     .then(() => console.log('Closed exiftool'))
  //   //     .catch(console.error)
  //   // } catch (error) {
  //   //   console.log('error is:', error)
  //   // }
  // }
})

