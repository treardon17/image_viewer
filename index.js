const Util = require('./util')
// const Exif = require('./core/image/exif')
// const classifyImg = require('./core/ai/classify')
// const cv = require('opencv4nodejs')
const Vision = require('./core/image/vision')
const TRImage = require('./core/image')


const checkDups = async ({ src, src2 }) => {
  if (!src2) src2 = src
  return new Promise(async (resolve, reject) => {
    const images1 = await Util.FileIO.getFilesInDirectory({
      src,
      type: 'jpeg',
      fullPath: true,
      depth: -1
    })
    
    const images2 = await Util.FileIO.getFilesInDirectory({
      src: src2,
      type: 'jpeg',
      fullPath: true,
      depth: -1
    })

    const duplicates = {}
    const observed = new Set()
    console.log(`Images1: ${images1.length} images`)
    console.log(`Images2: ${images2.length} images`)

    for (let img1Index = 0; img1Index < images1.length; img1Index += 1) {
      const img1Path = images1[img1Index]
      console.log(`Checking: ${img1Path}`)
      const image1 = new TRImage({ path: img1Path })
      await image1.updateImageData()
      for (let img2Index = 0; img2Index < images2.length; img2Index += 1) {      
        const img2Path = images2[img2Index]
        // make sure we're not looking at the exact same image
        if (img1Path !== img2Path && !observed.has(img1Path) && !observed.has(img2Path)) {
          console.log(`   ${img1Index + 1}/${images1.length} -- ${img2Index + 1}/${images2.length} Compare: ${img2Path}`)
          const image2 = new TRImage({ path: img2Path })
          await image2.updateImageData()
          const duplicate = await image1.checkDuplicate({ image: image2 })
          if (duplicate.match > 0.9) {
            if (!duplicates[img1Path]) duplicates[img1Path] = []
            const duplicateItem = duplicates[img1Path]
            duplicateItem.push(img2Path)
            observed.add(img2Path)
            await Util.FileIO.writeFile({ src: '@/data/file-data/duplicates.json', data: duplicates })
          }
        }
      }
    }
  })
}

checkDups({
  src: '/Volumes/TDR1TB/Pictures/Google\ Photos/HEIC_TO_JPEG',
  src2: '/Volumes/TDR1TB/Pictures/2018'
}).then(() => {
  console.log('done')
})

