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
            beginner: {
                rows: 8,
                columns: 8,
                totalBombs: 8
            }
        };

        // Testing Board
        const boardSetup = this.boardSettings[this.difficulty];
        const tiles = [];
        for(let i = 0; i < boardSetup.columns * boardSetup.rows; i++) {
            tiles.push({
                tileFrame: this.tileFrames.HIDDEN,
                adjacentBombCount: 0
            });
        }

        this.state = {
            tiles
        };
    }

    render() {
        const { rows, columns } = this.boardSettings[this.difficulty];
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
