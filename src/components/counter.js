import React from 'react';

import Digit from './digit';

export default function Counter(props) {
    let { value } = props;
    if (value < 0) {
        value = 0;
    } else if (value > 999) {
        value = 999;
    }
    const hundreds = Math.floor(value / 100) % 10;
    const tens = Math.floor(value / 10) % 10;
    const ones = value % 10;

    return (
            <div className="counter">
                <Digit digit={hundreds} />
                <Digit digit={tens} />
                <Digit digit={ones} />
            </div>
    )
}
