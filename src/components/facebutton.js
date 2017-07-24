import React from 'react';

function FaceButton(props) {
    const className = `face-button ${props.tileFrame}`;

    return (
        <div
            className={className}
            onClick={props.onClick}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
        />
    ) ;
}

export default FaceButton;
