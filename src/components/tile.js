import React from 'react';

export default function Tile(props) {

    let className = "tile ";
    if (props.isHidden) {
        if (props.isFlagged) {
            className += "flagged";
        } else {
            className += "hidden";
        }
    } else if (props.isDetonated) {
        className += "detonated";
    } else if(props.isBomb) {
        className += "bomb";
    } else if (props.isFlagged) {
        className += "bomb_x";
    } else {
        className += "revealed-" + props.adjacentBombCount;
    }

    return <div
                className={className}
                onClick={() => props.onLeftClick(props.index)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    props.onRightClick(props.index);
                }} />;
}
