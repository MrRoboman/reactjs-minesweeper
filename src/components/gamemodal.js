import React from 'react';
import Modal from 'react-modal';

class GameModal extends React.Component {
    // constructor() {
    //     super();
    //
    //     this.state = {
    //         difficulty: "Loading",
    //         boardSettings:
    //     };
    // }

    componentDidMount() {
        this.setState({
            difficulty: this.props.difficulty,
            boardSettings: this.props.boardSettings
        });
    }

    componentWillReceiveProps(newProps) {
        console.log("update game modal");
        this.setState({
            difficulty: newProps.difficulty,
            boardSettings: newProps.boardSettings
        });
    }

    onChangeDifficulty(event) {
        this.setState({
            difficulty: event.target.value
        });
    }

    onChangeCustomValue(index, event) {
        let value = event.target.value;
        if (value.length > 0) {
            value = parseInt(value);
        }
        if (value || value === "") {
            const boardSettings = Object.assign({}, this.state.boardSettings);
            if (index === 0) {
                boardSettings.difficulties.custom.rows = value;
            } else if (index === 1) {
                boardSettings.difficulties.custom.columns = value;
            } else if (index === 2) {
                boardSettings.difficulties.custom.totalBombs = value;
            }
            this.setState({boardSettings});
        }
    }

    onFocusCustomValue(event) {
        event.target.select();
        this.setState({
            difficulty: 'custom'
        });
    }

    onBlurCustomValue(index, event) {
        const boardSettings = Object.assign({}, this.state.boardSettings);
        const { rows, columns } = boardSettings.difficulties.custom;
        const maxBombs = rows * columns - 1;
        let value = event.target.value;
        value = value || 1;
        if (index === 0) {
            value = Math.min(value, boardSettings.maxRows);
            value = Math.max(value, boardSettings.minRows);
            boardSettings.difficulties.custom.rows = value;
        } else if (index === 1) {
            value = Math.min(value, boardSettings.maxColumns);
            value = Math.max(value, boardSettings.minColumns);
            boardSettings.difficulties.custom.columns = value;
        } else if (index === 2) {
            value = Math.min(value, maxBombs);
            value = Math.max(value, boardSettings.minBombs);
            boardSettings.difficulties.custom.totalBombs = value;
        }
        this.setState({boardSettings});
    }

    renderRows() {
        if (!this.state) {
            return <tr><td>Loading...</td></tr>;
        }
        const difficulties = Object.keys(this.state.boardSettings.difficulties);
        const rows = difficulties.map((difficulty, index) => {
            const { rows, columns, totalBombs } = this.state.boardSettings.difficulties[difficulty];
            const values = [rows, columns, totalBombs].map((value, index) => {

                if (difficulty === "custom") {
                    return (
                        <td key={index}>
                            <input type="text"
                                   value={value}
                                   onChange={this.onChangeCustomValue.bind(this, index)}
                                   onFocus={this.onFocusCustomValue.bind(this)}
                                   onBlur={this.onBlurCustomValue.bind(this, index)}
                            />
                        </td>
                    );
                } else {
                    return <td key={index}>{value}</td>;
                }
            });
            const isChecked = (difficulty === this.state.difficulty);
            const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            return (
                <tr key={index}>
                    <td>
                    <label>
                        <input
                            type="radio"
                            value={difficulty}
                            checked={isChecked}
                            onChange={this.onChangeDifficulty.bind(this)} />
                            {capitalizedDifficulty}
                    </label>
                    </td>
                    {values}
                </tr>
            );
        });

        return rows;
    }
    // style={{
    //     content: {
    //         width: 520,
    //         height: 250
    //     }
    // }}
    render() {
        if (!this.state) {
            return <div>Loading...</div>;
        }
        return (
                <Modal
                className="modal"
                  isOpen={this.props.isOpen}
                  contentLabel="Modal"
                  onRequestClose={this.props.onRequestClose}
                >
                <div className="modal-content">
                  <h3>Game</h3>
                  <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Rows</th>
                            <th>Columns</th>
                            <th>Bombs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRows()}
                    </tbody>
                  </table>
                  <div className="modal-buttons">
                    <button onClick={this.props.onClickCancel}>Cancel</button>
                    <button onClick={() => this.props.onClickOk(this.state)}>New Game</button>
                  </div>
                  </div>
                </Modal>
        );
    }
}

export default GameModal;
