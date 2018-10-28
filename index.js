const Util = require('./util')
// const Exif = require('./core/image/exif')
// const classifyImg = require('./core/ai/classify')
// const cv = require('opencv4nodejs')
const Vision = require('./core/image/vision')
const TRImage = require('./core/image')


Util.FileIO.getFilesInDirectory({
  src: '@/images',
  type: 'image',
  // group: true,
  fullPath: true,
  depth: -1
}).then(async (images) => {
  for (let img1Index = 0; img1Index < images.length; img1Index += 1) {
    const img1Path = images[img1Index]
    const image1 = new TRImage({ path: img1Path })
    await image1.updateImageData()
    for (let img2Index = 0; img2Index < images.length; img2Index += 1) {      
      const img2Path = images[img2Index]
      // make sure we're not looking at the exact same image
      if (img1Path !== img2Path) {
        const image2 = new TRImage({ path: img2Path })
        await image2.updateImageData()
        const duplicate = await image1.checkDuplicate({ image: image2 })
        console.log(duplicate)
      } else {
        break
      }
    }
  }
})

