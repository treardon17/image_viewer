const Util = require('./util')
// const Exif = require('./core/image/exif')
// const classifyImg = require('./core/ai/classify')
// const cv = require('opencv4nodejs')
const Vision = require('./core/image/vision')
const TRImage = require('./core/image')


Util.FileIO.getFilesInDirectory({
  src: '@/images',
  type: 'image',
  fullPath: true,
  depth: -1
}).then(async (images) => {
  const duplicates = {}
  const observed = new Set()
  for (let img1Index = 0; img1Index < images.length; img1Index += 1) {
    const img1Path = images[img1Index]
    const image1 = new TRImage({ path: img1Path })
    await image1.updateImageData()
    for (let img2Index = 0; img2Index < images.length; img2Index += 1) {      
      const img2Path = images[img2Index]
      // make sure we're not looking at the exact same image
      if (img1Path !== img2Path && !observed.has(img1Path) && !observed.has(img2Path)) {
        const image2 = new TRImage({ path: img2Path })
        await image2.updateImageData()
        const duplicate = await image1.checkDuplicate({ image: image2 })
        if (duplicate.match > 0.9) {
          if (!duplicates[img1Path]) duplicates[img1Path] = []
          const duplicateItem = duplicates[img1Path]
          // duplicateItem.duplicates.push({
          //   ...duplicate,
          //   path: img2Path
          // })
          duplicateItem.push(img2Path)
          observed.add(img2Path)
        }
      }
    }
  }

  console.log(JSON.stringify(duplicates, null, 2))
})

