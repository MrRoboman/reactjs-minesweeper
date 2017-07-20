import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
    constructor() {
        super();

    }

    render() {
        return (
            <h1>Hello Minesweeper</h1>
        );
    }
}

const container = document.getElementById('container');

ReactDOM.render(<App/>, container);
