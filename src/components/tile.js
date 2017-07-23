import React from 'react';

export default function Tile(props) {

    // let className = "tile ";
    // if (props.isHidden) {
    //     className += "hidden";
    //     if (props.isFlagged) {
    //         className += "flagged";
    //     }
    // } else if (props.isBomb) {
    //     className += "bomb";
    //     if (props.isDetonated) {
    //         className += "detonated";
    //     } else if (props.isFlagged) {
    //         className += "bomb_x";
    //     }
    // } else {
    //     className += "revealed-" + props.adjacentBombCount;
    // }

    let className = `tile ${props.tileFrame}`;
    if(props.tileFrame === "revealed") {
        if(props.isBomb) {
            className += "-bomb";
        }
        else {
            className += `-${props.adjacentBombCount}`;
        }
    }

    return <div
                className={className}
                onClick={() => props.onLeftClick(props.index)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    props.onRightClick(props.index);
                }} />;
}
