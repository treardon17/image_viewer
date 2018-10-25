const cv = require('opencv4nodejs')
const resemble = require('resemblejs')

class Vision {
  static checkDuplicate({ img1, img2 }) {
    return new Promise((resolve, reject) => {
      resemble(img1).compareTo(img2).ignoreColors().onComplete((data) => {
        resolve(data)
      })
    })
  }

  static matchFeatures ({ img1, img2, detector, matchFunc }) {

    // detect keypoints
    const keyPoints1 = detector.detect(img1)
    const keyPoints2 = detector.detect(img2)

    // compute feature descriptors
    const descriptors1 = detector.compute(img1, keyPoints1)
    const descriptors2 = detector.compute(img2, keyPoints2)

    // match the feature descriptors
    const matches = matchFunc(descriptors1, descriptors2)

    // only keep good matches
    const bestN = 40
    const bestMatches = matches.sort(
      (match1, match2) => match1.distance - match2.distance
    ).slice(0, bestN)

    return {
      img1,
      img2,
      keyPoints1,
      keyPoints2,
      bestMatches
    }
  }

  static compare ({ img1, img2, options = { draw: false } } = {}) {
    return new Promise((resolve, reject) => {
      const cvImg1 = cv.imread(img1)
      const cvImg2 = cv.imread(img2)
      try {
        let matches = null
        // check if opencv compiled with extra modules and nonfree
        if (cv.xmodules.xfeatures2d) {
          matches = Vision.matchFeatures({
            img1: cvImg1,
            img2: cvImg2,
            detector: new cv.SIFTDetector({ nFeatures: 2000 }),
            matchFunc: cv.matchFlannBased
          })
        } else {
          console.log('skipping SIFT matches')
          // Match using the BFMatcher with crossCheck true
          const bf = new cv.BFMatcher(cv.NORM_L2, true)
          const matches = Vision.matchFeatures({
            img1: cvImg1,
            img2: cvImg2,
            detector: new cv.ORBDetector(),
            matchFunc: (desc1, desc2) => bf.match(desc1, desc2)
          })
        }

        if (options.draw) {
          const { img1, img2, keyPoints1, keyPoints2, bestMatches } = matches
          const draw = cv.drawMatches(img1, img2, keyPoints1, keyPoints2, bestMatches)
          cv.imshow('ORB with BFMatcher - crossCheck true', draw)
        }
        resolve(matches)
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = Vision