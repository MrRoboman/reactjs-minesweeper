import React from 'react';
import ReactDOM from 'react-dom';

import Tile from '../components/tile';

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

        // Testing all tile frames
        const testTiles = [];
        const tileFrames = Object.keys(this.tileFrames);
        for(let key in this.tileFrames) {
            const tileFrame = this.tileFrames[key];
            testTiles.push({tileFrame, adjacentBombCount: 0});
        }
        for(let i = 1; i < 8; i++) {
            testTiles.push({tileFrame: "revealed", adjacentBombCount: i});
        }

        this.state = {
            testTiles
        };
    }

    render() {
        const tiles = this.state.testTiles.map((props, index) => {
            return <Tile key={index} {...props} />
        });
        return (
            <div>
                {tiles}
            </div>
        );
    }
}

const container = document.getElementById('container');

ReactDOM.render(<App/>, container);
