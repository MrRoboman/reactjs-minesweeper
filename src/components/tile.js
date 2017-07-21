import React from 'react';

export default function Tile(props) {
    let className = `tile ${props.tileFrame}`;
    if(props.tileFrame === "revealed") {
        if(props.isBomb) {
            className += "-bomb";
        }
        else {
            className += `-${props.adjacentBombCount}`;
        }
    }

    return <div className={className} />;
}
