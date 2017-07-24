import React from 'react';
import Modal from 'react-modal';

const _ = require('lodash');

// Note: This component may be broken down into smaller components.

class GameModal extends React.Component {
    componentDidMount() {
        this.setState({
            difficulty: this.props.difficulty,
            boardSettings: this.props.boardSettings
        });
    }

    componentDidUpdate(prevProps, prevState) {
      if (!prevProps.isOpen && this.props.isOpen) {
          this.setState({
              difficulty: this.props.difficulty,
              boardSettings: this.props.boardSettings
          });
      }
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
            const boardSettings = _.cloneDeep(this.state.boardSettings);
            const name = event.target.name;
            boardSettings.difficulties.custom[name] = value;
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
        const boardSettings = _.cloneDeep(this.state.boardSettings);
        const { rows, columns } = boardSettings.difficulties.custom;
        const maxBombs = rows * columns - 1;
        const name = event.target.name;
        let value = event.target.value;
        value = value ? value : 1;
        if (name === "rows") {
            value = _.clamp(value, boardSettings.minRows, boardSettings.maxRows);
            boardSettings.difficulties.custom.rows = value;
        } else if (name === "columns") {
            value = _.clamp(value, boardSettings.minColumns, boardSettings.maxColumns);
            boardSettings.difficulties.custom.columns = value;
        } else if (name === "totalBombs") {
            value = _.clamp(value, boardSettings.minBombs, maxBombs);
            boardSettings.difficulties.custom.totalBombs = value;
        }
        this.setState({boardSettings});
    }

    renderColumns(boardSettingDifficulty, difficulty) {
        const { rows, columns, totalBombs } = boardSettingDifficulty[difficulty];
        const boardSettingValues = [rows, columns, totalBombs].map((value, index) => {
            let name;
            if (index === 0) {
                name = "rows";
            } else if (index === 1) {
                name = "columns";
            } else {
                name = "totalBombs";
            }
            if (difficulty === "custom") {
                return (
                    <td key={index}>
                        <input type="text"
                               name={name}
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

        return boardSettingValues;
    }

    renderRows() {
        const difficulties = _.keys(this.state.boardSettings.difficulties);
        const rows = difficulties.map((difficulty, index) => {
            const columns = this.renderColumns(this.state.boardSettings.difficulties, difficulty);
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
                    {columns}
                </tr>
            );
        });

        return rows;
    }

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
