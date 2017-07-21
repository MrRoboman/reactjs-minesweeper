import React from 'react';

export default function Digit(props) {
    if(props.digit < 0 || props.digit > 9) {
        //throw exception
    }
    const className = `digit digit-${props.digit}`;

    return <div className={className} />;
}
