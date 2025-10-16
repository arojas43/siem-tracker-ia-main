import type { ReactElement, FC } from 'react';
import Modal from 'react-bootstrap/esm/Modal';
import classes from './ActionModalContainer.module.scss';
import CloseButton from 'react-bootstrap/esm/CloseButton';

interface SingleFieldActionModalProps {
    title?: string;
    showModal: boolean;
    onClose: () => void;
    children: ReactElement;
}

const ActionModalContainer: FC<SingleFieldActionModalProps> = ({ title, showModal, children, onClose }) => {
    return (
        <>
            <Modal
                show={showModal}
                contentClassName={classes['action-modal-container']}
                dialogClassName={classes['action-modal-container__dialog']}
            >
                <Modal.Body>
                    <div className={classes['action-modal-container__header']}>
                        {title && (
                            <h4 className={classes['action-modal-container__header--title']}>
                                <strong>{title}</strong>
                            </h4>
                        )}

                        <CloseButton
                            className={classes['action-modal-container__close-button']}
                            onClick={onClose}
                        />
                    </div>
                    {children}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ActionModalContainer;
