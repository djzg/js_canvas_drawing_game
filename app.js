
//"https://api.datamuse.com/words?ml=pumpkin"


// grabbing html elements with the id
const resetButtonElement = document.querySelector('#resetButton');
const newGameElement = document.querySelector('#newGame')
const countdownElement = document.querySelector('#countdown');
const promptElement = document.querySelector('#prompt');
const definitionElement = document.querySelector('#definition');

const width = 300;
const height = 500;
const pixelSize = 10;

const prompts = [
  'Yorkshire Terrier',
  'pumpkin',
  'remote',
  'power cord',
  'foliage',
  'Philosophy',
  'nature',
  'mosquito',
  'chicken',
  'brain',
];

// initializing canvas element
const canvas = document.querySelector('#draw-area');
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');

// state variable
let gameOver = false;

// setting up a starting location in the middle of screen
const currentLocation = {
  x: width / 2,
  y: height / 2,
  
};

// listening for the new game button click
newGameElement.addEventListener('click', () => {
  startRound();
})

// listening for the reset button click
resetButtonElement.addEventListener('click', () =>{
  startRound();
})

// checking for keypress and listening for WASD keys, and drawing by moving current location
document.body.addEventListener('keydown', (e) => {

  // if it's game over stop user from drawing
  if (gameOver) return;

  // doing the drawing before everything else by passing black color so that the current position is visible
  drawPixel('black');
  
  switch(e.code) {
    case 'KeyW': {
      currentLocation.y -= pixelSize;
      break;
    }
    case 'KeyA': {
      currentLocation.x -= pixelSize;
      break;
    }
    case 'KeyS': {
      currentLocation.y += pixelSize;
      break;
    }
    case 'KeyD': {
      currentLocation.x += pixelSize;
      break;
    }
    default: break;
  }

  // checking the borders and setting current position to first visible pixel
  if (currentLocation.x < 0) {
    currentLocation.x = 0;
  } else if (currentLocation.x + pixelSize > width) {
    currentLocation.x = width - pixelSize;
  }
  if (currentLocation.y < 0) {
    currentLocation.y = 0;
  } else if (currentLocation.y + pixelSize> height) {
    currentLocation.y = height - pixelSize;
  };

  // drawing the current position with gray 
  drawPixel('gray');

})

// drawing pixel at current location
// passing color, or black if nothing present
function drawPixel(color){
  ctx.fillStyle = color || 'black';
  ctx.fillRect(currentLocation.x, currentLocation.y, pixelSize, pixelSize);
};

// Generating and returning random value
function getRandomValue(array) {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

// Getting random word from API
async function getRandomPrompt(prompt) {
  // fetching the results
  const response = await fetch(`https://api.datamuse.com/words?ml=${prompt}&md=d`);
  // getting json response
  const json = await response.json();
  // filter item if its tags includes letter 'n'
  const nouns = json.filter((item) => item.tags.includes('n'))

  // if the response is empty, write a log
  if (!nouns.length) {
    console.log(prompt)
  }
  // pick a random json element using random value
  const randomRelated = getRandomValue(nouns);

  // returning the word property from json response
  return {
    word: randomRelated.word,
    // find a definition that starts with n and grab the first one
    // if definition is not found, just return not found
    definiton: (randomRelated.defs || ['not found']).find((def) => def.startsWith('n')).replace('n\t', ''),
  };
}


async function startRound() {

  // when the game starts, hide the reset button
  resetButtonElement.style.display = 'none';
  gameOver = false;

  countdownElement.textContent = '60 seconds';
  currentLocation.x = width / 2;
  currentLocation.y = height / 2;

  // setting up countdown timer
  const endTime = Date.now() + (60 * 1000);

  const initialPrompt = getRandomValue(prompts);
  // awaiting the response
  const prompt = await getRandomPrompt(initialPrompt);

  console.log(prompt);

  // placing word and definition into html element
  promptElement.textContent = prompt.word;
  definitionElement.textContent = prompt.definiton;

  // making a background with size of canvas size
  ctx.fillStyle = '#F8FA90';
  ctx.fillRect(0, 0, width, height);



  drawPixel();

  // drawing the remaining time
  const countDownInterval = setInterval(() => {
    const secondsLeft = Math.floor((endTime - Date.now()) / 1000);
    countdownElement.textContent = secondsLeft + ' seconds';

    newGameElement.addEventListener('click', () => {
      clearInterval(countDownInterval);
    })
  // if seconds are 0, write game over
    if (secondsLeft <= 0) {
      countdownElement.textContent = 'GAME OVER';
      gameOver = true;
      drawPixel('black');
      clearInterval(countDownInterval);

      // when the game is over, show restart button
      resetButtonElement.style.display = '';

    }
  }, 500);

}


startRound();