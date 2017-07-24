import React from 'react';

function Digit(props) {
    if (props.digit < 0 || props.digit > 9) {
        throw new Error(`Digit component received out of range digit: ${props.digit}`);
    }
    const className = `digit digit-${props.digit}`;

    return <div className={className} />;
}

export default Digit;
