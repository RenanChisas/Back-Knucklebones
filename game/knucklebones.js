class Knuckbones {
  constructor(players) {
    this.table = [
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
    ];
    this.points = [0, 0];
    this.players = players;
    this.turn = false;
    this.dice = null;
  }

  restartGame() {
    this.table = [
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
    ];
    this.points = [0, 0];
  }

  getTable() {
    const tablePlayer1 = [];
    const tablePlayer2 = [];

    for (let index = 0; index < 2; index++) {
      for (let index2 = 0; index2 < 3; index2++) {
        if (index === 0) {
          tablePlayer1.push(this.table[0][index][index2]);
          tablePlayer1.push(this.table[1][index][index2]);
          tablePlayer1.push(this.table[2][index][index2]);
        }
        if (index === 1) {
          tablePlayer2.push(this.table[0][index][index2]);
          tablePlayer2.push(this.table[1][index][index2]);
          tablePlayer2.push(this.table[2][index][index2]);
        }
      }
    }
    return [this.players, [tablePlayer1, tablePlayer2]];
  }

  addDice(line, dice, player) {
    const idPLayer = this.players.findIndex((p) => p[0] === player);
    console.log(this.players);
    console.log(idPLayer, "IDDD PLAYER");
    const linePlayer = this.table[line][idPLayer];
    console.log(linePlayer, "LINEEE PLAYER");
    const indexADD = linePlayer.findIndex((num) => num === 0);

    const turnaux = this.turn;
    if (indexADD !== -1) {
      this.table[line][idPLayer][indexADD] = dice;
      this.turn = !this.turn;
    }
    if (idPLayer === 0) {
      this.removeDice(line, dice, 1);
    } else {
      this.removeDice(line, dice, 0);
    }

    return this.turn === turnaux ? null : this.turn;
  }

  removeDice(line, dice, playerid) {
    const linePlayer = this.table[line][playerid];
    const filtered = linePlayer.filter((n) => n !== dice);
    const zerosCount = linePlayer.length - filtered.length;
    const zeros = new Array(zerosCount).fill(0);
    this.table[line][playerid] = [...filtered, ...zeros];
  }

  sumForLine() {
    const sumPlayer1 = [[], [], []];
    const sumPlayer2 = [[], [], []];

    const sumPlayerReturn1 = [];
    const sumPlayerReturn2 = [];

    for (let index = 0; index < 2; index++) {
      for (let index2 = 0; index2 < 3; index2++) {
        if (index === 0) {
          sumPlayer1[0].push(this.table[0][index][index2]);
          sumPlayer1[1].push(this.table[1][index][index2]);
          sumPlayer1[2].push(this.table[2][index][index2]);
        }
        if (index === 1) {
          sumPlayer2[0].push(this.table[0][index][index2]);
          sumPlayer2[1].push(this.table[1][index][index2]);
          sumPlayer2[2].push(this.table[2][index][index2]);
        }
      }
    }

    sumPlayer1.forEach((sum) => {
      const isZero = sum.includes(0);
      const sumReturn = this.sumWithRepeats(sum);
      sumPlayerReturn1.push({ sumReturn, isZero });
    });
    sumPlayer2.forEach((sum) => {
      const isZero = sum.includes(0);
      const sumReturn = this.sumWithRepeats(sum);
      sumPlayerReturn2.push({ sumReturn, isZero });
    });
    const player1Sum = sumPlayerReturn1.reduce(
      (acc, val) => acc + val.sumReturn,
      0
    );
    const player2Sum = sumPlayerReturn2.reduce(
      (acc, val) => acc + val.sumReturn,
      0
    );

    this.points = [player1Sum, player2Sum];

    return {
      sumReturn: [...sumPlayerReturn1, ...sumPlayerReturn2],
      tableReturn: [sumPlayer1, sumPlayer2],
    };
  }
  getWins() {
    const winIndex = this.points.indexOf(Math.max(...this.points));

    return this.players[winIndex][1];
  }

  endGame() {
    const isPlayer1end = [false, false, false];
    const isPlayer2end = [false, false, false];

    for (let index = 0; index < 3; index++) {
      if (this.table[index][0].includes(0)) {
        isPlayer1end[index] = false;
      } else {
        isPlayer1end[index] = true;
      }

      if (this.table[index][1].includes(0)) {
        isPlayer2end[index] = false;
      } else {
        isPlayer2end[index] = true;
      }
    }

    return (
      (isPlayer1end[0] && isPlayer1end[1] && isPlayer1end[2]) ||
      (isPlayer2end[0] && isPlayer2end[1] && isPlayer2end[2])
    );
  }

  getPoints() {
    return this.points;
  }

  sumWithRepeats(arr) {
    const counts = {};

    for (const num of arr) {
      counts[num] = (counts[num] || 0) + 1;
    }

    let total = 0;
    for (const numStr in counts) {
      const num = Number(numStr);
      const count = counts[num];
      if (count > 1) {
        total += num * count * count;
      } else {
        total += num;
      }
    }
    return total;
  }

  chooseTurn() {
    this.turn = !this.turn;
  }
  getTurn() {
    return [this.players, this.turn];
  }

  setTurn(turn) {
    this.turn = turn;
  }

  setDice(dice) {
    this.dice = dice;
  }

  getDice() {
    return this.dice;
  }

  setPoints(sumReturn) {
    let points = [0, 0];
    for (let index = 0; index < sumReturn.length; index++) {
      if (index < 3) {
        points[0] += sumReturn[index].sumReturn;
      } else {
        points[1] += sumReturn[index].sumReturn;
      }
    }
    console.log(points, "SETPOTINR");
    this.points = points;
  }

  print() {
    console.log("players:", this.players);
    console.log("Turn:", this.turn);
    console.log("Table:", this.table);
    console.log("");
    console.log("");
  }

  destroy() {
    this.table = null;

    this.points = null;
    this.players = null;

    this.turn = null;
    this.dice = null;

    Object.keys(this).forEach((key) => {
      this[key] = null;
    });

    console.log("Knucklebones instance destroyed.");
  }
}

module.exports = Knuckbones;
