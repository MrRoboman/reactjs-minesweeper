import React from 'react';
import ReactDOM from 'react-dom';

import Board from '../components/board';
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
            faceFrame: this.faceFrames.SMILE,
            tiles
        };
    }

    onLeftClick(index) {
        console.log("left click" + index);
        if (this.gameover) {
            return;
        }
        const tiles = this.revealTiles(index, this.state.tiles.slice());
        if (this.checkForWin(tiles)) {
            console.log("winner");
            this.gameover = true;
            this.flagRemainingBombs(tiles);
        }
        this.setState({tiles});
    }

    onRightClick(index) {
        console.log("right click" + index);
        if (this.gameover) {
            return;
        }
        console.log(this.state)
        const tiles = this.markTile(index, this.state.tiles.slice());
        this.setState({tiles});
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
            this.tileFrames.FLAGGED,
            this.tileFrames.QUESTION_MARK
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

        const tiles = this.getNewShuffledTiles();
        this.iterateAdjacentBombCounts(tiles);

        this.setState({tiles});
    }

    render() {
        const { rows, columns } = this.getBoardSetup();
        return (
            <div>
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
