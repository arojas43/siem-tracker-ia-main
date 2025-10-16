import classes from './DocumentsTable.module.scss';

import { useGetOperationDocumentsQuery } from '@store/api/documentApi.slice';

import Form from 'react-bootstrap/esm/Form';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';
import type { SetStateAction, FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputGroup from 'react-bootstrap/esm/InputGroup';

import { FaSearch } from 'react-icons/fa';
import type { OperationDocument } from '@store/api/api.types';
import { MdOutlineFileDownload } from 'react-icons/md';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';
import { PDFPreviewModal } from '@components/index';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useLazyGetOperationDocumentsZipQuery } from '@store/api/zipDocumentApi.slice';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';

interface DocumentsTable {
    operationCode: string;
}

const DocumentsTable: FC<DocumentsTable> = ({ operationCode }) => {
    const dispatch = useAppDispatch();
    const { data, isLoading } = useGetOperationDocumentsQuery({ operationCode });
    const [
        handleGetOperationDocumentsZipQuery,
        {
            data: operationDocumentsZipData,
            isError: isErrorOperationDocumentsZip,
            error: errorOperationDocumentZip,
            isLoading: isLoadingOperationDocumentsZip,
        },
    ] = useLazyGetOperationDocumentsZipQuery();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [documents, setDocuments] = useState<OperationDocument[]>([]);
    const documentNameRef = useRef<string>('');

    const [pdfUrl, setPdfUrl] = useState(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle(`Documentos operación ${operationCode}`);
    }, []);

    useEffect(() => {
        if (data) {
            setDocuments(data);
        }
    }, [data]);

    useEffect(() => {
        console.log('isErrorOperationDocumentsZip', isErrorOperationDocumentsZip);
        if (isErrorOperationDocumentsZip) {
            console.log('errorOperationDocumentZip', errorOperationDocumentZip);
            dispatch(
                appIsToasting({
                    message: 'Error al descargar el zip de documentos.',
                    show: true,
                    isError: true,
                }),
            );
        }
    }, [isErrorOperationDocumentsZip, errorOperationDocumentZip]);

    useEffect(() => {
        if (operationDocumentsZipData instanceof Blob) {
            const url = URL.createObjectURL(operationDocumentsZipData);
            const a = document.createElement('a');
            a.href = url;
            a.download = `documentos_operacion_${operationCode}.zip`; // 👈 your custom filename
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }
    }, [operationDocumentsZipData]);

    const handleShowFile = (document: OperationDocument) => {
        console.log('handleShowFile');
        console.log(document);
        // setPreviewFile(document);
        documentNameRef.current = document.documentName;

        if (document.file_name.split('.').pop()?.toLowerCase() === 'pdf' && document.gCloudStorageUrl) {
            setPdfUrl(document.gCloudStorageUrl as SetStateAction<any>);
        } else {
            dispatch(
                appIsToasting({
                    message: 'No se puede enseñar el archivo.',
                    show: false,
                    isError: true,
                }),
            );
        }

        setShowModal(true);
    };

    const renderDocumentButtons = (document: OperationDocument) => {
        return (
            <div>
                <Button
                    size="lg"
                    variant="link"
                    className="tracker-action-icon-btn"
                    onClick={() => handleShowFile(document)}
                    disabled={document.file_name.split('.').pop()?.toLowerCase() !== 'pdf'}
                >
                    <AiOutlineFileSearch size={25} />
                </Button>

                <Button
                    size="lg"
                    variant="link"
                >
                    <a
                        href={document.gCloudStorageUrl}
                        className="tracker-action-icon-btn"
                        download={document.documentName}
                    >
                        <MdOutlineFileDownload size={25} />
                    </a>
                </Button>
            </div>
        );
    };

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc: any) => doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, documents]);

    const renderDocuments = useMemo(() => {
        if (!filteredDocuments.length) {
            return (
                <tr>
                    <td colSpan={3}>No hay documentos.</td>
                </tr>
            );
        }

        return filteredDocuments.map((document: OperationDocument, index: number) => (
            <tr key={index}>
                <td style={{ verticalAlign: 'middle' }}>{document.documentName || '-'}</td>
                <td style={{ verticalAlign: 'middle' }}>
                    {new Date(document.created_at).toLocaleDateString('en-GB') || '-'}
                </td>
                <td style={{ verticalAlign: 'middle' }}>{renderDocumentButtons(document)}</td>
            </tr>
        ));
    }, [filteredDocuments]);

    const handleClose = () => {
        setShowModal(false);
        documentNameRef.current = '';
        setPdfUrl(null);
    };

    const handleDownloadOperationDocuments = () => {
        handleGetOperationDocumentsZipQuery({ operationCode });
    };

    return (
        <>
            <div className={classes['documents-table__container']}>
                <div
                    className={classes['tempo2']}
                    style={{ display: 'flex' }}
                >
                    <Button
                        disabled={!filteredDocuments.length}
                        variant="link"
                        className="download_button"
                        onClick={handleDownloadOperationDocuments}
                    >
                        {isLoadingOperationDocumentsZip ? (
                            <Spinner
                                as="span"
                                size="sm"
                                role="status"
                                animation="border"
                                aria-hidden="true"
                            />
                        ) : (
                            <MdOutlineFileDownload size={22} />
                        )}
                        Descargar documentos de operación
                    </Button>
                    <InputGroup className={`me-2 ${classes['operation-table__input--group']}`}>
                        <InputGroup.Text className={classes['operation-table__input--icon']}>
                            <FaSearch size={20} />
                        </InputGroup.Text>

                        <Form.Control
                            size="sm"
                            type="text"
                            value={searchTerm}
                            placeholder="Busca documento"
                            className={`me-2 ${classes['operation-table__input']}`}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
                {isLoading ? (
                    <div className="text-center my-4">
                        <Spinner
                            animation="border"
                            role="status"
                        >
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                ) : (
                    <Table
                        striped
                        responsive
                    >
                        <thead>
                            <tr>
                                <th>Nombre documento</th>
                                <th>Fecha de subida</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>{renderDocuments}</tbody>
                    </Table>
                )}
            </div>

            <PDFPreviewModal
                pdfUrl={pdfUrl}
                showModal={showModal}
                onClose={handleClose}
                title={documentNameRef.current}
            />
        </>
    );
};

export default DocumentsTable;
