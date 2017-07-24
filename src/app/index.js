import React from 'react';
import Modal from 'react-modal';
import ReactDOM from 'react-dom';

import Board from '../components/board';
import ControlModal from '../components/controlmodal';
import Counter from '../components/counter';
import FaceButton from '../components/facebutton';
import GameModal from '../components/gamemodal';

const _ = require('lodash');

class App extends React.Component {
    constructor() {
        super();

        this.faceFrames = {
            SMILE_CLICKED: 'smile-clicked',
            SMILE: 'smile',
            OFACE: 'oface',
            FROWN: 'frown',
            SHADES: 'shades'
        };

        this.boardSettings = {
            minRows: 1,
            maxRows: 30,
            minColumns: 9,
            maxColumns: 50,
            minBombs: 1,
            difficulties: {
                beginner: {
                    rows: 9,
                    columns: 9,
                    totalBombs: 10
                },
                intermediate: {
                    rows: 16,
                    columns: 16,
                    totalBombs: 40
                },
                expert: {
                    rows: 16,
                    columns: 30,
                    totalBombs: 99
                },
                custom: {
                    rows: 10,
                    columns: 10,
                    totalBombs: 10
                }
            }
        };

        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        this.state = {
            difficulty: "beginner"
        };
    }

    componentDidMount() {
        this.reset();
    }

    reset() {
        this.gameover = false;
        this.stopTimer();

        const boardSettings = this.boardSettings.difficulties[this.state.difficulty];
        const tiles = this.getNewTiles(boardSettings);
        this.shuffle(tiles);
        this.iterateAdjacentBombCounts(tiles, boardSettings);

        this.setState({
            gameModalIsOpen: false,
            controlModalIsOpen: false,
            bombsRemaining: boardSettings.totalBombs,
            secondsElapsed: 0,
            faceFrame: this.faceFrames.SMILE,
            tiles
        });
    }

    getNewTiles(boardSettings) {
        const { rows, columns, totalBombs } = boardSettings;
        const tileCount = rows * columns;
        const tiles = [];
        for(let i = 0; i < tileCount; i++) {
            tiles.push({
                isHidden: true,
                isFlagged: false,
                isDetonated: false,
                isBomb: (i < totalBombs),
                adjacentBombCount: 0
            });
        }

        return tiles;
    }

    shuffle(tiles) {
        for(let i = 0; i < tiles.length; i++) {
            const randomIndex = Math.floor(Math.random() * tiles.length);
            [tiles[i], tiles[randomIndex]] = [tiles[randomIndex], tiles[i]];
        }
    }

    iterateAdjacentBombCounts(tiles, boardSettings) {
        for(let i = 0; i < tiles.length; i++) {
            if (tiles[i].isBomb) {
                const adjacentIndices = this.getAdjacentTileIndices(i, boardSettings);
                adjacentIndices.forEach(adjacentIndex => {
                    tiles[adjacentIndex].adjacentBombCount++;
                })
            }
        }
    }

    getAdjacentTileIndices(index, boardSettings) {
        const { rows, columns } = boardSettings;
        const totalTiles = rows * columns;
        const deltaIndices = [
            -columns - 1,
            -columns,
            -columns + 1,
            -1,
            +1,
            columns - 1,
            columns,
            columns + 1,
        ];

        let adjacentIndices = deltaIndices.map(delta => index + delta);

        adjacentIndices = adjacentIndices.filter(adjacentIndex => {
            const thisColumn = index % columns;
            const otherColumn = adjacentIndex % columns;
            const columnsAreAdjacent = (Math.abs(thisColumn - otherColumn) <= 1);
            const indexInBounds = (adjacentIndex >= 0 && adjacentIndex < totalTiles);

            return (indexInBounds && columnsAreAdjacent);
        });

        return adjacentIndices;
    }

    startTimer() {
        if (!this.interval) {
            this.interval = window.setInterval(this.updateTimer.bind(this), 1000);
        }
    }

    updateTimer() {
        this.setState({
            secondsElapsed: this.state.secondsElapsed + 1
        });
    }

    stopTimer() {
        if (this.interval) {
            window.clearInterval(this.interval);
            this.interval = null;
        }
    }

    revealTiles(index, tiles, boardSettings) {
        const tile = tiles[index];
        if (tile.isHidden && !tile.isFlagged) {
            tile.isHidden = false;
            if (tile.adjacentBombCount === 0) {
                this.getAdjacentTileIndices(index, boardSettings).forEach(adjacentTileIndex => {
                    this.revealTiles(adjacentTileIndex, tiles, boardSettings);
                });
            }
        }
        return tiles;
    }

    revealBombs(tiles) {
        tiles.forEach(tile => {
            if (tile.isBomb || tile.isFlagged) {
                tile.isHidden = false;
            }
        });

        return tiles;
    }

    onLeftClick(index) {
        if (this.gameover) {
            return;
        }

        this.startTimer();

        const boardSettings = this.boardSettings.difficulties[this.state.difficulty];
        const tiles = _.cloneDeep(this.state.tiles);
        let { bombsRemaining, faceFrame } = this.state;

        if (tiles[index].isBomb) {
            this.gameover = true;
            this.stopTimer();
            this.revealBombs(tiles);
            tiles[index].isDetonated = true;
            faceFrame = this.faceFrames.FROWN;
        } else {
            this.revealTiles(index, tiles, boardSettings);

            if (this.playerWon(tiles)) {
                this.gameover = true;
                this.stopTimer();
                this.flagAllBombs(tiles);
                bombsRemaining = 0;
                faceFrame = this.faceFrames.SHADES;
            }
        }

        this.setState({
            bombsRemaining,
            faceFrame,
            tiles
        });
    }

    onRightClick(index) {
        if (this.gameover) {
            return;
        }

        const tiles = this.flagTile(index, _.cloneDeep(this.state.tiles));

        let { bombsRemaining } = this.state;
        if (tiles[index].isFlagged) {
            bombsRemaining--;
        } else {
            bombsRemaining++;
        }

        this.setState({
            bombsRemaining,
            tiles
        });
    }

    playerWon(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            if(tile.isHidden && !tile.isBomb) {
                return false;
            }
        }
        return true;
    }

    flagAllBombs(tiles) {
        tiles.forEach(tile => {
            if (tile.isBomb) {
                tile.isFlagged = true;
            }
        });
    }

    flagTile(index, tiles) {
        tiles[index].isFlagged = !tiles[index].isFlagged;

        return tiles;
    }

    onClickOkGameModal(options) {
        this.boardSettings = options.boardSettings;
        this.setState({
            difficulty: options.difficulty,
            gameModalIsOpen: false
        }, this.reset);
    }

    closeGameModal() {
        this.setState({
            gameModalIsOpen: false
        });
    }

    closeControlModal() {
        this.setState({
            controlModalIsOpen: false
        });
    }

    onClickGameMenu() {
        this.setState({
            gameModalIsOpen: true
        });
    }

    onClickControlMenu() {
        this.setState({
            controlModalIsOpen: true
        });
    }

    onMouseDownBoard(event) {
        if (this.gameover || event.button !== 0) {
            return;
        }
        this.setState({
            faceFrame: this.faceFrames.OFACE
        });
    }

    onMouseDownFace(event) {
        if (event.button === 0) {
            this.setState({
                faceFrame: this.faceFrames.SMILE_CLICKED
            });
        }
    }

    onMouseUpFace(event) {
        if (event.button === 0 && this.state.faceFrame === this.faceFrames.SMILE_CLICKED) {
            this.reset();
        }
    }

    onMouseUp() {
        if (this.gameover) {
            return;
        }
        this.setState({
            faceFrame: this.faceFrames.SMILE
        });
    }

    render() {
        if (!this.state.tiles) {
            return <div>Loading...</div>;
        }

        const { rows, columns } = this.boardSettings.difficulties[this.state.difficulty];
        const gameWidth = columns * 16 + 12;

        return (
            <div className="minesweeper-app">
                <GameModal
                    isOpen={this.state.gameModalIsOpen}
                    boardSettings={_.cloneDeep(this.boardSettings)}
                    difficulty={this.state.difficulty}
                    onClickOk={this.onClickOkGameModal.bind(this)}
                    onClickCancel={this.closeGameModal.bind(this)}
                    onRequestClose={this.closeGameModal.bind(this)}
                    />

                <ControlModal
                    isOpen={this.state.controlModalIsOpen}
                    onRequestClose={this.closeControlModal.bind(this)}
                    />

                <ul>
                    <li><a className="menulink" onClick={this.onClickGameMenu.bind(this)}>Game</a></li>
                    <li><a className="menulink" onClick={this.onClickControlMenu.bind(this)}>Controls</a></li>
                </ul>


                <div className="minesweeper" style={{width: gameWidth}}>
                    <div className="minesweeper minesweeper-indent minesweeper-header">
                        <Counter value={this.state.bombsRemaining} />
                        <FaceButton
                            tileFrame={this.state.faceFrame}
                            onMouseDown={this.onMouseDownFace.bind(this)}
                            onMouseUp={this.onMouseUpFace.bind(this)}
                             />
                        <Counter value={this.state.secondsElapsed} />
                    </div>

                    <div className="minesweeper minesweeper-indent">
                        <Board
                            rows={rows}
                            columns={columns}
                            tiles={_.cloneDeep(this.state.tiles)}
                            onLeftClick={this.onLeftClick.bind(this)}
                            onRightClick={this.onRightClick.bind(this)}
                            onMouseDown={this.onMouseDownBoard.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const container = document.getElementById('container');

ReactDOM.render(<App/>, container);
