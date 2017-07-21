import React from 'react';
import ReactDOM from 'react-dom';

import Board from '../components/board';
import Counter from '../components/counter';
import FaceButton from '../components/facebutton';

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

        this.interval = null;
        this.gameover = false;
        this.difficulty = "test"; // grab this from localStorage
        this.boardSettings = {
            test: {
                rows: 3,
                columns: 3,
                totalBombs: 1
            },
            beginner: {
                rows: 8,
                columns: 8,
                totalBombs: 8
            }
        };

        // Testing Board
        const tiles = this.getNewShuffledTiles();
        this.iterateAdjacentBombCounts(tiles);

        this.state = {
            bombsRemaining: this.getBoardSetup().totalBombs,
            secondsElapsed: 0,
            faceFrame: this.faceFrames.SMILE,
            tiles
        };
    }

    onLeftClick(index) {
        console.log("left click" + index);
        if (this.gameover) {
            return;
        }
        this.startTimer();
        const tiles = this.revealTiles(index, this.state.tiles.slice());
        let { bombsRemaining } = this.state;
        let faceFrame = this.faceFrames.SMILE;
        if (this.checkForWin(tiles)) {
            console.log("winner");
            this.gameover = true;
            this.stopTimer();
            this.flagRemainingBombs(tiles);
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
        console.log("right click" + index);
        if (this.gameover) {
            return;
        }
        console.log(this.state)
        const tiles = this.markTile(index, this.state.tiles.slice());

        let { bombsRemaining } = this.state;
        if (tiles[index].tileFrame === this.tileFrames.FLAGGED) {
            bombsRemaining--;
        } else {
            bombsRemaining++;
        }

        this.setState({
            bombsRemaining,
            tiles
        });
    }

    updateTimer() {
        console.log('updatetimer');
        this.setState({
            secondsElapsed: this.state.secondsElapsed + 1
        });
    }

    startTimer() {
        console.log('starttimer');
        if (!this.interval) {
            this.interval = window.setInterval(this.updateTimer.bind(this), 1000);
        }
    }

    stopTimer() {
        if (this.interval) {
            window.clearInterval(this.interval);
            this.interval = null;
        }
    }

    checkForWin(tiles) {
        for(let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            if(tile.tileFrame !== this.tileFrames.REVEALED && !tile.isBomb) {
                return false;
            }
        }
        return true;
    }

    flagRemainingBombs(tiles) {
        for(let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            if(tile.isBomb) {
                tile.tileFrame = this.tileFrames.FLAGGED;
            }
        }
    }

    markTile(index, tiles) {
        const markFrames = [
            this.tileFrames.HIDDEN,
            this.tileFrames.FLAGGED
        ];

        const tile = tiles[index];
        const currentMark = markFrames.indexOf(tile.tileFrame);
        if (currentMark > -1) {
            const nextMark = markFrames[(currentMark + 1) % markFrames.length];
            tile.tileFrame = nextMark;
        }

        return tiles;
    }

    getBoardSetup() {
        return this.boardSettings[this.difficulty];
    }

    shuffle(tiles) {
        for(let i = 0; i < tiles.length; i++) {
            const randomIndex = Math.floor(Math.random() * tiles.length);
            [tiles[i], tiles[randomIndex]] = [tiles[randomIndex], tiles[i]];
        }
    }

    getNewShuffledTiles() {
        const boardSetup = this.getBoardSetup();
        const tileCount = boardSetup.rows * boardSetup.columns;
        const tiles = [];
        for(let i = 0; i < tileCount; i++) {
            tiles.push({
                tileFrame: this.tileFrames.HIDDEN,
                isBomb: (i < boardSetup.totalBombs),
                adjacentBombCount: 0
            });
        }
        this.shuffle(tiles);

        return tiles;
    }

    getTestTiles() {
        const boardSetup = this.getBoardSetup();
        const tileCount = boardSetup.rows * boardSetup.columns;
        const tiles = [];
        for(let i = 0; i < tileCount; i++) {
            tiles.push({
                tileFrame: this.tileFrames.HIDDEN,
                isBomb: i===0,
                adjacentBombCount: 0
            });
        }

        return tiles;
    }

    getAdjacentTileIndices(index) {
        const { rows, columns } = this.getBoardSetup();
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
        // const adjacentTiles = [];
        // deltaIndices.forEach(delta => {
        //     const adjacentIndex = index + delta;
        //     if (adjacentIndex >= 0 && adjacentIndex < tiles.length) {
        //         const thisColumn = index % columns;
        //         const otherColumn = adjacentIndex % columns;
        //         const columnsAreAdjacent = Math.abs(thisColumn - otherColumn) <= 1;
        //
        //         if (columnsAreAdjacent) {
        //             adjacentTiles.push(tiles[adjacentIndex]);
        //         }
        //     }
        // });
        //
        // return adjacentTiles;
    }

    iterateAdjacentBombCounts(tiles) {
        for(let i = 0; i < tiles.length; i++) {
            if (tiles[i].isBomb) {
                const adjacentIndices = this.getAdjacentTileIndices(i);
                adjacentIndices.forEach(adjacentIndex => {
                    tiles[adjacentIndex].adjacentBombCount++;
                })
            }
        }
    }

    revealTiles(index, tiles) {
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
                    this.getAdjacentTileIndices(index, tiles).forEach(adjacentTileIndex => {
                        this.revealTiles(adjacentTileIndex, tiles);
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

    reset() {
        this.gameover = false;
        this.stopTimer();

        const tiles = this.getNewShuffledTiles();
        this.iterateAdjacentBombCounts(tiles);

        this.setState({
            bombsRemaining: this.getBoardSetup().totalBombs,
            secondsElapsed: 0,
            faceFrame: this.faceFrames.SMILE,
            tiles
        });
    }

    render() {
        const { rows, columns } = this.getBoardSetup();
        return (
            <div>
                <Counter value={this.state.bombsRemaining} />
                <Counter value={this.state.secondsElapsed} />

                <FaceButton
                    tileFrame={this.state.faceFrame}
                    onClick={this.reset.bind(this)}
                     />
                <Board
                    rows={rows}
                    columns={columns}
                    tiles={this.state.tiles}
                    onLeftClick={this.onLeftClick.bind(this)}
                    onRightClick={this.onRightClick.bind(this)}
                />
            </div>
        );
    }
}

const container = document.getElementById('container');

ReactDOM.render(<App/>, container);
