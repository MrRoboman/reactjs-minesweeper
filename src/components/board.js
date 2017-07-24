import React from 'react';

import Tile from './tile';

function Board(props) {
    const TILE_SIZE = 16; // must be in sync with css
    const width = props.columns * TILE_SIZE;
    const height = props.rows * TILE_SIZE;

    const tiles = props.tiles.map((tileProps, index) => {
        return <Tile
                    key={index}
                    index={index}
                    {...tileProps}
                    onLeftClick={props.onLeftClick}
                    onRightClick={props.onRightClick} />;
    });

    return (
        <div
            className="board"
            style={{
                width,
                height
            }}
            onMouseDown={props.onMouseDown}
            >

            {tiles}

        </div>
    );
}

export default Board;
