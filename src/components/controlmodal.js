import React from 'react';
import Modal from 'react-modal';

class ControlModal extends React.Component {

    render() {
        return (
            <Modal
            className="modal modal-control"
              isOpen={this.props.isOpen}
              contentLabel="Modal"
              onRequestClose={this.props.onRequestClose}
            >
            <div className="modal-content">
              <h3>Controls</h3>
              <ul>
                <li>Reveal all non-bomb tiles.</li>
                <li>Tiles indicate the number of bombs touching them.</li>
                <li>Left-click a tile to reveal it.</li>
                <li>Right-click (or Ctrl+click) a tile to flag it.</li>
              </ul>
              </div>
            </Modal>
        );
    }
}

export default ControlModal;
