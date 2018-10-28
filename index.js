const Util = require('./util')
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

    const cache = {}
    const duplicates = {}
    const observed = new Set()
    console.log(`Images1: ${images1.length} images`)
    console.log(`Images2: ${images2.length} images`)

    const getCachedImage = async (imgPath) => {
      return new Promise(async (resolve, reject) => {
        let image
        if (cache[imgPath]) image = cache[imgPath]
        else {
          image = new TRImage({ path: imgPath })
          await image.updateImageData()
          cache[imgPath] = image
        }
        resolve(image)
      })
    }

    for (let img1Index = 0; img1Index < images1.length; img1Index += 1) {
      const img1Path = images1[img1Index]
      console.log(`Checking: ${img1Path}`)
      const image1 = await getCachedImage(img1Path)

      for (let img2Index = 0; img2Index < images2.length; img2Index += 1) {
        const img2Path = images2[img2Index]
        // make sure we're not looking at the exact same image
        if (img1Path !== img2Path && !observed.has(img1Path) && !observed.has(img2Path)) {
          console.log(`   ${img1Index + 1}/${images1.length} -- ${img2Index + 1}/${images2.length} Compare: ${img2Path}`)
          const image2 = await getCachedImage(img2Path)
          const duplicate = await image1.checkDuplicate({ image: image2 })
          if (duplicate.match > 0.9) {
            if (!duplicates[img1Path]) duplicates[img1Path] = []
            const duplicateItem = duplicates[img1Path]
            duplicateItem.push(img2Path)
            observed.add(img2Path)
            delete cache[img2Path]
            await Util.FileIO.writeFile({ src: '@/data/file-data/duplicates.json', data: duplicates })
          }
        }
      }
      delete cache[img1Path]
      observed.add(img1Path)
    }
  })
}

checkDups({
  src: '/Volumes/TDR1TB/Pictures/Google\ Photos/HEIC_TO_JPEG',
  src2: '/Volumes/TDR1TB/Pictures/2018'
}).then(() => {
  console.log('done')
})

// checkDups({
//   src: '@/images/',
// }).then(() => {
//   console.log('done')
// })

