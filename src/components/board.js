import React from 'react';

import Tile from './tile';

export default function Board(props) {
    const TILE_SIZE = 16; // must be in sync with css
    const width = props.columns * TILE_SIZE;
    const height = props.rows * TILE_SIZE;

    const tiles = props.tiles.map((tileProps, index) => {
        return <Tile key={index} {...tileProps} />;
    });

    return (
        <div
            className="board"
            style={{
                width,
                height
            }}>

            {tiles}

        </div>
    );
}
