import React from 'react';

export default function FaceButton(props) {
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
