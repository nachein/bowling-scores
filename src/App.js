import React, { Component } from 'react';
import './App.css';

const GAME_STATES = {
  START: Symbol('START'),
  PLAY: Symbol('PLAY'),
  END: Symbol('END')
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = this.initGame();

    this.startGame = this.startGame.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.enterRollValue = this.enterRollValue.bind(this);
    this.renderInputs = this.renderInputs.bind(this);
  }

  render() {
    const { frames, status } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Bowling Scores</h1>
        </header>

        { this.renderGame() }

      </div>
    );
  }

  renderGame() {
    const { frames, status } = this.state;
    switch (status) {
      case GAME_STATES.START:
        return this.renderGameStart();
      case GAME_STATES.PLAY:
        return (
          <div>
            { this.renderFrames() }
            { this.renderInputs() }
          </div>
        );
      case GAME_STATES.END:
        return (
          <div>
            { this.renderFrames() }
            Game end
            <button onClick={this.restartGame}>Restart</button>
          </div>
        );
    }
  }

  renderGameStart() {
    return (
      <div><button onClick={this.startGame}>START</button></div>
    );
  }

  renderFrames() {
    const { frames } = this.state;
    return frames.map(frame => this.renderFrame(frame));
  }

  renderFrame(frame) {
    const { rolls, score, id } = frame;
    const firstRoll = rolls[0] || 0;
    const secondRoll = frame.strike ? 'X' : frame.spare ? '/' : frame.rolls.length > 1 ? frame.rolls[1] : 0;
    return (
      <div key={id} className='bowling-board--frame'>
          <div> { firstRoll } | { secondRoll } </div>
          <div> { score } </div>
      </div>
    );
  }

  renderInputs() {
    const { currentFrame, frames } = this.state;
    const { score, rolls } = frames[currentFrame];
    const inputs = [];

    for(let i = 0; i < 11; i ++) {
      const disabled = rolls.length === 1 && score + i > 10;
      inputs.push(<button key={i} onClick={this.enterRollValue} value={i} disabled={disabled}>{i}</button>);
    }
    return (<div className='bowling-board--inputs'>
      { inputs }
    </div>);
  }

  initGame() {
    return {
      frames: this.createBoard(),
      currentFrame: 0,
      pendingScores: [],
      status: GAME_STATES.START
    };
  }

  startGame() {
    this.setState({ status: GAME_STATES.PLAY });
  }

  restartGame() {
    const newGame = this.initGame();
    newGame.status = GAME_STATES.PLAY;
    this.setState(newGame);
  }

  createBoard() {
    const frames = [];
    for (let i = 0; i < 10; i++) {
      frames.push(this.createFrame(i));
    }
    return frames;
  }

  createFrame(id) {
    return {
      id,
      rolls: [],
      strike: false,
      spare: false,
      score: 0
    }
  }

  enterRollValue(event) {
    const { frames, currentFrame, status } = this.state;
    const frame = frames[currentFrame];
    const value = parseInt(event.target.value);
    if (status === GAME_STATES.PLAY) {
      this.addRoll(frame, value);
    }
  }

  addRoll(frame, value) {
    const { rolls, score } = frame;

    if (value < 0 || value > 10 || score + value > 10) return; // TODO: handle error messages

    this.completePendingScore(value);

    if (rolls.length === 0 && value === 10) {
      frame.strike = true;
      this.addPendingScore(frame, 2);
      this.nextFrame();
    }
    else if (rolls.length === 1) {

      if (score + value === 10) {
        frame.spare = true;
        this.addPendingScore(frame);
      }

      this.nextFrame();
    }

    frame.score += value;
    frame.rolls.push(value);
  }

  completePendingScore(value) {
    const { pendingScores, frames } = this.state;

    const updatedPendingScores = pendingScores.map((score) => {
      const frame = frames.find(frm => frm.id === score.frame.id);
      if (frame) {
        frame.score += value;
        score.count--;
      }
      return score;
    });

    this.setState({
      pendingScores: updatedPendingScores.filter(pending => pending.count > 0)
    });
  }

  nextFrame() {
    const { currentFrame } = this.state;

    if (currentFrame === 9) {
      // end game
      this.setState({ status: GAME_STATES.END });
      return;
    }

    this.setState({ currentFrame: currentFrame + 1 });
  }

  addPendingScore(frame, times = 1) {
    const { pendingScores } = this.state;

    pendingScores.push({
      frame,
      count: times
    });

    this.setState({ pendingScores: pendingScores.filter(pending => pending.count > 0)})
  }

}

export default App;
