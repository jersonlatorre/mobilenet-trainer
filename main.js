let featureExtractor
let regressor
let video
let canvas
let value = 0
let smoothValue = 0

let numSamples1 = 0
let numSamples2 = 0

let isVideoReady = false
let isModelReady = false
let isFlip = true

let VIDEO_SIZE = 320

let isTrained = false

function setup() {
  canvas = createCanvas(VIDEO_SIZE, VIDEO_SIZE / 1.33333)
  canvas.parent('videoContainer')

  initModel()
  setupButtons()
}

function initModel() {
  if (video) video.remove()
  video = createCapture(VIDEO)
  video.hide()
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady)
  regressor = featureExtractor.regression(video, regressorReady)

  select('#modelStatusMessage').html('cargando modelo...')
  select('#videoStatusMessage').html('cargando webcam')
}

function draw() {
  background('black')

  push()
  if (isFlip) {
    translate(width, 0)
    scale(-1, 1)
  }
  image(video, 0, 0, video.width, video.height)
  pop()

  if (isTrained) {
    smoothValue = lerp(smoothValue, value, 0.1)
    let x = map(smoothValue, 0, 1, 0, width)
    fill('red')
    circle(x, height / 2, 20)
  }
}

function modelReady() {
  select('#modelStatusMessage').html('modelo cargado')
  select('#modelStatusIndicator').elt.src = '/assets/check.svg'

  isModelReady = true
  if (isVideoReady) {
    enableButtons()
  }
}

function regressorReady() {
  let aspectRatio = video.width / video.height
  resizeCanvas(VIDEO_SIZE, VIDEO_SIZE / aspectRatio)
  video.size(VIDEO_SIZE, VIDEO_SIZE / aspectRatio)
  select('#videoStatusMessage').html('webcam cargada')
  select('#videoStatusIndicator').elt.src = '/assets/check.svg'

  isVideoReady = true
  if (isModelReady) {
    enableButtons()
  }
}

function enableButtons() {
  select('#state1').removeClass('disabled')
  select('#state2').removeClass('disabled')
  select('#train').removeClass('disabled')
}

function predict() {
  regressor.predict(gotResults)
}

function setupButtons() {
  select('#state1').mousePressed(() => {
    regressor.addImage(0.01)
    numSamples1++
    select('#stateCounter1').html(numSamples1 + ' muestras')
  })

  select('#state2').mousePressed(() => {
    regressor.addImage(1)
    numSamples2++
    select('#stateCounter2').html(numSamples2 + ' muestras')
  })

  select('#train').mousePressed(() => {
    if (isTrained) {
      featureExtractor.save()
    } else {
      regressor.train(function(lossValue) {
        if (lossValue) {
          select('#train').html(`Loss: ${lossValue}`)
        } else {
          isTrained = true
          predict()
          select('#train').html(`Modelo Entrenado! <br> Descargar`)
        }
      })
    }
  })

  select('#reset').mousePressed(() => {
    isTrained = false
    numSamples1 = 0
    numSamples2 = 0
    select('#stateCounter1').html('0 muestras')
    select('#stateCounter2').html('0 muestras')
    select('#train').html('Entrenar Modelo')
    select('#modelStatusIndicator').elt.src = '/assets/error.svg'
    select('#videoStatusIndicator').elt.src = '/assets/error.svg'
    initModel()
  })

  select('#flipButton').mousePressed(() => {
    isFlip = !isFlip
  })
}

function gotResults(err, result) {
  if (err) {
    console.error(err)
  }
  if (result && result.value && isTrained) {
    value = result.value
    predict()
  }
}
