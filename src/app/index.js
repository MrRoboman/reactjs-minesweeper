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

        this.tileFrames = {
            BOMB_X: 'bomb_x',
            DETONATED: 'detonated',
            FLAGGED: 'flagged',
            HIDDEN: 'hidden',
            QUESTION_MARK: 'question_mark',
            REVEALED: 'revealed'
        };

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
                test: {
                    rows: 1,
                    columns: 16,
                    totalBombs: 1
                },
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
        this.state = {
            difficulty: "test"
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
                tileFrame: this.tileFrames.HIDDEN,
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

    onLeftClick(index) {
        if (this.gameover) {
            return;
        }

        this.startTimer();

        const boardSettings = this.boardSettings.difficulties[this.state.difficulty];
        const tiles = this.state.tiles.slice();
        this.revealTiles(index, tiles, boardSettings);
        let { bombsRemaining } = this.state;
        let faceFrame = this.faceFrames.SMILE;

        if (this.checkForWin(tiles)) {
            this.gameover = true;
            this.stopTimer();
            this.flagAllBombs(tiles);
            bombsRemaining = 0;
            faceFrame = this.faceFrames.SHADES;
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

        const tiles = this.markTile(index, this.state.tiles.slice());

        let { bombsRemaining } = this.state;

        if (tiles[index].tileFrame === this.tileFrames.HIDDEN) {
            bombsRemaining++;
        } else {
            bombsRemaining--;
        }

        this.setState({
            bombsRemaining,
            tiles
        });
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

    checkForWin(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            if(tile.tileFrame !== this.tileFrames.REVEALED && !tile.isBomb) {
                return false;
            }
        }
        return true;
    }

    flagAllBombs(tiles) {
        tiles.forEach(tile => {
            if (tile.isBomb) {
                tile.tileFrame = this.tileFrames.FLAGGED;
            }
        });
    }

    markTile(index, tiles) {
        const markFrames = [
            this.tileFrames.HIDDEN,
            this.tileFrames.FLAGGED,
        ];

        const tile = tiles[index];
        const currentMark = markFrames.indexOf(tile.tileFrame);
        if (currentMark > -1) {
            const nextMark = markFrames[(currentMark + 1) % markFrames.length];
            tile.tileFrame = nextMark;
        }

        return tiles;
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
            const columnsAreAdjacent = Math.abs(thisColumn - otherColumn) <= 1;
            const indexInBounds = adjacentIndex >= 0 && adjacentIndex < totalTiles;

            return indexInBounds && columnsAreAdjacent;
        });

        return adjacentIndices;
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

    revealTiles(index, tiles, boardSettings) {
        const tile = tiles[index];
        if (tile.tileFrame === this.tileFrames.HIDDEN) {
            if (tile.isBomb) {
                this.gameover = true;
                this.stopTimer();
                this.revealBombs(tiles);
                tile.tileFrame = this.tileFrames.DETONATED;
            } else {
                tile.tileFrame = this.tileFrames.REVEALED;
                if (tile.adjacentBombCount === 0) {
                    this.getAdjacentTileIndices(index, boardSettings).forEach(adjacentTileIndex => {
                        this.revealTiles(adjacentTileIndex, tiles, boardSettings);
                    });
                }
            }
        }
        return tiles;
    }

    revealBombs(tiles) {
        tiles.forEach(tile => {
            if (tile.isBomb) {
                if (tile.tileFrame !== this.tileFrames.FLAGGED) {
                    tile.tileFrame = this.tileFrames.REVEALED;
                }
            } else if (tile.tileFrame === this.tileFrames.FLAGGED) {
                tile.tileFrame = this.tileFrames.BOMB_X;
            }
        });

        return tiles;
    }

    onModalChange(event) {
        this.setState({
            selectedDifficultyOption: event.target.value
        });
    }

    onClickGameModal() {
        this.setState({
            gameModalIsOpen: false
        }, this.reset);
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

    onRequestCloseGameModal() {
        this.setState({
            gameModalIsOpen: false
        });
    }

    onRequestCloseControlModal() {
        this.setState({
            controlModalIsOpen: false
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
                onClick={this.onClickGameModal.bind(this)}
                onClickOk={this.onClickOkGameModal.bind(this)}
                onClickCancel={this.closeGameModal.bind(this)}
                onChange={this.onModalChange.bind(this)}
                onRequestClose={this.closeGameModal.bind(this)}
                />

            <ControlModal
                isOpen={this.state.controlModalIsOpen}
                onRequestClose={this.onRequestCloseControlModal.bind(this)}
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
                        onClick={this.reset.bind(this)}
                         />
                    <Counter value={this.state.secondsElapsed} />
                </div>

                <div className="minesweeper minesweeper-indent">
                    <Board
                        rows={rows}
                        columns={columns}
                        tiles={this.state.tiles}
                        onLeftClick={this.onLeftClick.bind(this)}
                        onRightClick={this.onRightClick.bind(this)}
                    />
                </div>
            </div>
            </div>
        );
    }
}

const container = document.getElementById('container');

ReactDOM.render(<App/>, container);
