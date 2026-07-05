"use strict";

let level = "easy";
let setting = {
  maxnumber: 20,
  startingscore: 20,
};
let maxnumber = setting.maxnumber;
let startingscore = setting.startingscore;
let secretnumber = Math.trunc(Math.random() * maxnumber) + 1;

let score = startingscore;
let highscore = 0;

const difficulties = {
  easy: {
    maxnumber: 20,
    startingscore: 20,
  },
  medium: {
    maxnumber: 50,
    startingscore: 15,
  },
  hard: {
    maxnumber: 100,
    startingscore: 10,
  },
};
const difficultybtn = document.querySelectorAll(".difficulty--btn");

difficultybtn.forEach(function (button) {
  button.addEventListener("click", function () {
    level = button.dataset.level;
    setDifficulty(level);
    setting = difficulties[level];
    maxnumber = setting.maxnumber;
    startingscore = setting.startingscore;
    restgame();
    console.log("Level:", level, setting);
  });
});
function setDifficulty(level) {
  setting = difficulties[level];

  maxnumber = setting.maxnumber;
  startingscore = setting.startingscore;
  document.querySelector(".rang").textContent =
    `Guess a Number between 1 and ${maxnumber}`;
  document.body.classList.remove("easy", "medium", "hard");
  document.body.classList.add(level);

  restgame(); // ONLY after updating values
}

function restgame() {
  score = startingscore;
  secretnumber = Math.trunc(Math.random() * maxnumber) + 1;
  document.querySelector(".score").textContent = score;
  document.querySelector(".message").textContent = "Starting Guess...";
  document.querySelector(".number").textContent = "?";
  guess.value = "";
  number.style.width = "15rem";
}
// if (level === "esay") {
//   maxnumber = 20;
//   startingscore = 20;
// } else if (level === "medium") {
//   maxnumber = 50;
//   startingscore = 15;
// } else {
//   maxnumber = 100;
//   startingscore = 10;
// }
// console.log(setting);

const lablerang = document.querySelector(".rang");
const message = document.querySelector(".message");
const scorelabel = document.querySelector(".score");
const number = document.querySelector(".number");
const guess = document.querySelector(".guess");
const checkbtn = document.querySelector(".check");
const againbtn = document.querySelector(".again");
const highscorelabel = document.querySelector(".highscore");
document.querySelector(".message").textContent = "Starting Guess...";

// document.querySelector('.message').textContent = 'correct'
checkbtn.addEventListener("click", function () {
  const userguess = Number(guess.value);
  console.log(userguess);
  // no input
  if (!userguess) {
    document.querySelector(".message").textContent = "⛔ No Number";
  } else if (userguess === secretnumber) {
    // correct number
    document.querySelector(".message").textContent = "🎉 Correct Number";
    document.querySelector(".number").textContent = secretnumber;
    document.body.style.backgroundColor = " #06a93a";
    number.style.width = "30rem";
    if (score > highscore) {
      highscore = score;
      document.querySelector(".highscore").textContent = highscore;
    }

    // too high
  } else if (userguess !== secretnumber) {
    if (score > 1) {
      if (userguess > secretnumber) {
        document.querySelector(".message").textContent = "📉Too High";
      }
      // too low
      else {
        document.querySelector(".message").textContent = "📈Too Low";
      }
      //decrese score
      score--;
      document.querySelector(".score").textContent = score;
    } else {
      document.querySelector(".message").textContent = "💀Game Over";
      document.querySelector(".score").textContent = 0;
    }
  }
});

againbtn.addEventListener("click", restgame);
// //reset score
// score = 20;
// document.querySelector(".score").textContent = score;
// //reset secret number
// secretnumber = Math.trunc(Math.random() * 20) + 1;
// console.log(secretnumber);
// //reset UI text
// document.querySelector(".message").textContent = "Starting Guess...";

// //reset input
// guess.value = "";

// //reset style
// document.body.style.backgroundColor = " #746f6f";
// number.style.width = "15rem";

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    checkbtn.click();
  }
});
