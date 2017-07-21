import React from 'react';
import ReactDOM from 'react-dom';

import Board from '../components/board';

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
        }

        this.difficulty = "beginner";
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
            tiles
        };
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

    getAdjacentTiles(index, tiles) {
        const { columns } = this.getBoardSetup();
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

        const adjacentTiles = [];
        deltaIndices.forEach(delta => {
            const adjacentIndex = index + delta;
            if(adjacentIndex >= 0 && adjacentIndex < tiles.length) {
                const thisColumn = index % columns;
                const otherColumn = adjacentIndex % columns;
                const columnsAreAdjacent = Math.abs(thisColumn - otherColumn) <= 1;

                if(columnsAreAdjacent) {
                    adjacentTiles.push(tiles[adjacentIndex]);
                }
            }
        });

        return adjacentTiles;
    }

    iterateAdjacentBombCounts(tiles) {
        for(let i = 0; i < tiles.length; i++) {
            if(tiles[i].isBomb) {
                const adjacentTiles = this.getAdjacentTiles(i, tiles);
                adjacentTiles.forEach(adjacentTile => {
                    adjacentTile.adjacentBombCount++;
                })
            }
        }
    }

    render() {
        const { rows, columns } = this.getBoardSetup();
        return (
            <Board
                rows={rows}
                columns={columns}
                tiles={this.state.tiles}
            />
        );
    }
}

const container = document.getElementById('container');

ReactDOM.render(<App/>, container);
