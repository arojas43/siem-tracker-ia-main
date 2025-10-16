import type { FC } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Modal from 'react-bootstrap/esm/Modal';

interface ConfirmationModalProps {
    show: boolean;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    body?: any;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({ message, body, onCancel, onConfirm, show = true }) => {
    return (
        <Modal
            show={show}
            // onHide={handleClose}
        >
            {/* <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header> */}
            <Modal.Body>
                {message}
                {body}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
                <Button
                    className="siem-primary-button"
                    onClick={onConfirm}
                >
                    Aceptar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;
