import React from 'react';

export default function Tile(props) {
    let className = `tile ${props.tileFrame}`;
    if(props.tileFrame === "revealed") {
        className += `-${props.adjacentBombCount}`;
    }

    return <div className={className} />;
}
