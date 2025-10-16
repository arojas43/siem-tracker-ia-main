import classes from './OperationPediment.module.scss';
import { useState, type FC } from 'react';
import { PedimentForm, PedimentsTable } from './components';
import { ActionModalContainer } from '@components/index';

const OperationPedimentPage: FC = () => {
    const [showModal, setShowModal] = useState<boolean>(false);

    return (
        <>
            <div className="operation-page__container">
                {/* <div className={classes['operation-pediment-page__top']}>
                    <Button
                        className={classes['new-pediment-button']}
                        onClick={() => setShowModal(true)}
                    >
                        <FaPlus className="me-2" />
                        Nuevo Pedimento
                    </Button>
                </div> */}
                <div className={classes['operation-page__bottom']}>
                    <PedimentsTable />
                </div>
            </div>
            <ActionModalContainer
                showModal={showModal}
                onClose={() => setShowModal(false)}
            >
                <PedimentForm onClose={() => setShowModal(false)} />
            </ActionModalContainer>
        </>
    );
};

export default OperationPedimentPage;
