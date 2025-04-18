type="module"
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const fallSound = new Audio('https://actions.google.com/sounds/v1/cartoon/slap_with_glove.ogg')
fallSound.volume = 0.1

const score = document.querySelector('#score')
const highScoreDisplay = document.querySelector('#highScoreDisplay') // Acá mostramos el puntaje más alto

const MODES = {
  FALL: 'fall',
  BOUNCE: 'bounce',
  GAMEOVER: 'gameover'
}

const INITIAL_BOX_WIDTH = 200
const INITIAL_BOX_Y = 600
const BOX_HEIGHT = 50
const INITIAL_Y_SPEED = 5
const INITIAL_X_SPEED = 2

let boxes = []
let debris = { x: 0, y: 0, width: 0 }
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0; // Leemos el puntaje más alto del localStorage

// Mostramos el puntaje más alto en pantalla
highScoreDisplay.textContent = `Puntuación más alta: ${highScore}`;

function initializeGameState() {
  // Inicializamos el juego con el primer bloque en el centro
  boxes = [{
    x: (canvas.width / 2) - (INITIAL_BOX_WIDTH / 2),
    y: 200,
    width: INITIAL_BOX_WIDTH,
    color: 'white'
  }]
  debris = { x: 0, y: 0, width: 0 }
  current = 1
  mode = MODES.BOUNCE
  xSpeed = INITIAL_X_SPEED
  ySpeed = INITIAL_Y_SPEED
  scrollCounter = 0
  cameraY = 0
  createNewBox() // Creamos el siguiente bloque
}

function restart() {
  // Reiniciamos todo y volvemos a dibujar
  initializeGameState()
  draw()
}

function draw() {
  if (mode === MODES.GAMEOVER) return // Si se terminó el juego, no seguimos dibujando

  context.fillStyle = 'rgba(0, 0, 0, 0.5)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  boxes.forEach(({ x, y, width, color }) => {
    const newY = INITIAL_BOX_Y - y + cameraY
    context.fillStyle = color
    context.fillRect(x, newY, width, BOX_HEIGHT)
  })

  context.fillStyle = 'red'
  const { x, y, width } = debris
  context.fillRect(x, INITIAL_BOX_Y - y + cameraY, width, BOX_HEIGHT)

  if (mode === MODES.BOUNCE) {
    moveAndDetectCollision()
  } else if (mode === MODES.FALL) {
    updateFallMode()
  }

  debris.y -= ySpeed
  updateCamera()

  window.requestAnimationFrame(draw)
}

function updateCamera() {
  if (scrollCounter > 0) {
    cameraY++
    scrollCounter--
  }
}

function createNewBox() {
  const previousBox = boxes[current - 1]
  boxes[current] = {
    x: 0,
    y: (current + 10) * BOX_HEIGHT,
    width: previousBox.width,
    color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
  }
}

function createNewDebris(difference) {
  const currentBox = boxes[current]
  const previousBox = boxes[current - 1]
  const debrisX = currentBox.x > previousBox.x
    ? currentBox.x + currentBox.width
    : currentBox.x
  debris = { x: debrisX, y: currentBox.y, width: difference }
}

function updateFallMode() {
  const currentBox = boxes[current]
  currentBox.y -= ySpeed

  const positionPreviousBox = boxes[current - 1].y + BOX_HEIGHT
  if (currentBox.y === positionPreviousBox) {
    handleBoxLanding()
  }
}

function adjustCurrentBox(difference) {
  const currentBox = boxes[current]
  const previousBox = boxes[current - 1]

  if (currentBox.x > previousBox.x) {
    currentBox.width -= difference
  } else {
    currentBox.width += difference
    currentBox.x = previousBox.x
  }
}

function gameOver() {
  mode = MODES.GAMEOVER
  context.fillStyle = 'rgba(255, 0, 0, 0.5)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.font = 'bold 20px Arial'
  context.fillStyle = 'white'
  context.textAlign = 'center'
  context.fillText('Game Over', canvas.width / 2, canvas.height / 2)
  context.fillText('Haz clic para jugar de nuevo', canvas.width / 2, canvas.height / 2 + 30)

  // Comparamos el puntaje actual con el más alto y actualizamos si es necesario
  const currentScore = current - 1;
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem('highScore', highScore) // Guardamos el nuevo puntaje más alto
    highScoreDisplay.textContent = `Puntuación más alta: ${highScore}`; // Actualizamos la pantalla con el nuevo puntaje
  }
}

function handleBoxLanding() {
  const currentBox = boxes[current]
  const previousBox = boxes[current - 1]
  const difference = currentBox.x - previousBox.x

  if (Math.abs(difference) >= currentBox.width) {
    gameOver()
    return
  }

  adjustCurrentBox(difference)
  createNewDebris(difference)

  xSpeed += xSpeed > 0 ? 1 : -1
  current++
  scrollCounter = BOX_HEIGHT
  mode = MODES.BOUNCE

  score.textContent = current - 1

  createNewBox()

  fallSound.currentTime = 0
  fallSound.play()
}

function moveAndDetectCollision() {
  const currentBox = boxes[current]
  currentBox.x += xSpeed

  const hasHitRightSide = currentBox.x + currentBox.width > canvas.width
  const hasHitLeftSide = currentBox.x < 0

  if ((xSpeed > 0 && hasHitRightSide) || (xSpeed < 0 && hasHitLeftSide)) {
    xSpeed = -xSpeed
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' && mode === MODES.BOUNCE) {
    mode = MODES.FALL
  }
})

canvas.onpointerdown = () => {
  if (mode === MODES.GAMEOVER) {
    restart()
  } else if (mode === MODES.BOUNCE) {
    mode = MODES.FALL
  }
}

restart()

}

restart()
