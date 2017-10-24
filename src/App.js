import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
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
    return (
      <div className="App">
        <AppBar
          showMenuIconButton={false}
          title="Bowling Scores"
        />
        { this.renderGame() }
      </div>
    );
  }

  renderGame() {
    const { status } = this.state;
    switch (status) {
      case GAME_STATES.START:
        return this.renderGameStart();
      case GAME_STATES.PLAY:
        return (
          <div>
            { this.renderInputs() }
            { this.renderFrames() }
          </div>
        );
      case GAME_STATES.END:
        return (
          <div>
            <RaisedButton onClick={this.restartGame} label="Restart" fullWidth={true} secondary={true} />
            { this.renderFrames() }
            <div>
              Game End
            </div>
          </div>
        );
      default:
        throw new Error('Unhandled game state')
    }
  }

  renderGameStart() {
    return (
      <RaisedButton onClick={this.startGame} label="Start" fullWidth={true} secondary={true} />
    );
  }

  renderFrames() {
    const { frames, currentFrame, status } = this.state;
    return frames.map(frame => this.renderFrame(frame, currentFrame === frame.id && status === GAME_STATES.PLAY));
  }

  renderFrame(frame, isCurrent) {
    const { rolls, score, id } = frame;
    const firstRoll = rolls[0] || 0;
    const secondRoll = frame.strike ? 'X' : frame.spare ? '/' : frame.rolls.length > 1 ? frame.rolls[1] : 0;

    const style = {
      height: 100,
      width: 100,
      margin: 20,
      textAlign: 'center',
      display: 'inline-block'
    };

    if (isCurrent) {
      style.backgroundColor = 'rgb(255, 248, 220)';
    }

    return (
      <Paper key={id} style={style} zDepth={2} rounded={false}>
        <div className='bowling-board--frame-rolls'>
          <div> { firstRoll } </div>
          <div> { secondRoll } </div>
        </div>
        <Divider />
        <div className='bowling-board--frame-score'> { score } </div>
      </Paper>
    );
  }

  renderInputs() {
    const { currentFrame, frames } = this.state;
    const { score, rolls } = frames[currentFrame];
    const inputs = [];

    for(let i = 0; i < 11; i ++) {
      const disabled = rolls.length === 1 && score + i > 10;
      inputs.push((
        <RaisedButton key={i} onClick={this.enterRollValue} value={i} disabled={disabled} label={i} />
      ));
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
    const value = parseInt(event.currentTarget.value, 10);
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
