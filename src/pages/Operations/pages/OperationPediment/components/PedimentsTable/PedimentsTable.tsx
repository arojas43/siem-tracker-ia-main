import { useGetOperationPedimentsFilesQuery } from '@store/api/documentApi.slice';
import type { SetStateAction, FC } from 'react';
import { useMemo, useRef, useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/esm/Table';
import { useParams } from 'react-router-dom';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { PDFPreviewModal } from '@components/index';
import { MdOutlineFileDownload } from 'react-icons/md';
import Spinner from 'react-bootstrap/esm/Spinner';

const PedimentsTable: FC = () => {
    const dispatch = useAppDispatch();
    const { operationCode } = useParams<{ operationCode: string }>();
    const { data: pediments, isLoading: isLoadingPediments } = useGetOperationPedimentsFilesQuery({
        operationCode: operationCode!,
    });

    const documentNameRef = useRef<string>('');
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    // todo make the show file a reusale component
    const handleShowFile = (documentName: string, file_name: string, gCloudStorageUrl: string) => {
        console.log('handleShowFile');
        // console.log(document);

        if (file_name.split('.').pop()?.toLowerCase() === 'pdf' && gCloudStorageUrl) {
            setPdfUrl(gCloudStorageUrl as SetStateAction<any>);
            documentNameRef.current = documentName;
            setShowModal(true);
        } else {
            dispatch(
                appIsToasting({
                    message: 'No se puede enseñar el archivo.',
                    show: false,
                    isError: true,
                }),
            );
        }

        // setShowModal(true);
    };

    const renderDocumentButtons = (documentName: string, file_name: string, gCloudStorageUrl: string) => {
        return (
            <div>
                <Button
                    size="lg"
                    variant="link"
                    className="tracker-action-icon-btn"
                    onClick={() => handleShowFile(documentName, file_name, gCloudStorageUrl)}
                    disabled={file_name.split('.').pop()?.toLowerCase() !== 'pdf'}
                >
                    <AiOutlineFileSearch size={25} />
                </Button>
                <Button
                    size="lg"
                    variant="link"
                >
                    <a
                        href={gCloudStorageUrl}
                        className="tracker-action-icon-btn"
                        download={file_name}
                    >
                        <MdOutlineFileDownload size={25} />
                    </a>
                </Button>
            </div>
        );
    };

    const handleClose = () => {
        setShowModal(false);
        setPdfUrl(null);
        documentNameRef.current = '';
    };

    const renderPediments = useMemo(() => {
        console.log('pediments', pediments);
        if (!pediments || !pediments.length) {
            return (
                <tr>
                    <td
                        colSpan={6}
                        className="text-center"
                    >
                        No hay pedimentos.
                    </td>
                </tr>
            );
        }

        return pediments.map((pediment: any, index: number) => (
            <tr key={index}>
                <td style={{ verticalAlign: 'middle' }}>{pediment.pedNumber || '-'}</td>
                <td style={{ verticalAlign: 'middle' }}>{pediment.pedRegimen || '-'}</td>
                <td style={{ verticalAlign: 'middle' }}>{pediment.modulationResult || '-'}</td>
                <td style={{ verticalAlign: 'middle' }}>{pediment.created_at || '-'}</td>
                <td style={{ verticalAlign: 'middle' }}>
                    {renderDocumentButtons(pediment.documentName, pediment.file_name, pediment.gCloudStorageUrl)}
                </td>
            </tr>
        ));
    }, [pediments]);

    return (
        <>
            {isLoadingPediments ? (
                <div className="text-center my-4">
                    <Spinner
                        animation="border"
                        role="status"
                    >
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                </div>
            ) : (
                <Table striped>
                    <thead>
                        <tr>
                            <th>Número de pedimento</th>
                            <th>Tipo de pedimento</th>
                            <th>Resultado de modulación</th>
                            <th>Creado en</th>
                            <th>Documentos</th>
                        </tr>
                    </thead>
                    <tbody>{renderPediments}</tbody>
                </Table>
            )}

            <PDFPreviewModal
                pdfUrl={pdfUrl}
                showModal={showModal}
                onClose={handleClose}
                title={documentNameRef.current}
            />
        </>
    );
};

export default PedimentsTable;
