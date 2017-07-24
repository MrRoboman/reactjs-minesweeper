import React from 'react';

import Digit from './digit';

function Counter(props) {
    let { value } = props;
    if (value > 999) {
        value = 999;
    } else if (value < -99) {
        value = -99;
    }

    let hundreds, tens, ones;
    hundreds = Math.floor(Math.abs(value) / 100) % 10;
    tens = Math.floor(Math.abs(value) / 10) % 10;
    ones = Math.abs(value) % 10;

    if (value < 0) {
        hundreds = "minus";
    }

    return (
            <div className="counter">
                <Digit digit={hundreds} />
                <Digit digit={tens} />
                <Digit digit={ones} />
            </div>
    )
}

export default Counter;
