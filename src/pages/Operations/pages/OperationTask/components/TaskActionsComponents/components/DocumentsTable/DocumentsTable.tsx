import Table from 'react-bootstrap/esm/Table';
import classes from './DocumentsTable.module.scss';
import type { SetStateAction, FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import ScrollableDropdownMenu from '../ScrollableDropdownMenu';
import CloseButton from 'react-bootstrap/esm/CloseButton';
import Button from 'react-bootstrap/esm/Button';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { MdOutlineFileDownload } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import type { TaskDocument, TrackerFile } from '../../TaskActionsComponents.types';
import ConfirmationModal from '@components/ConfirmationModal';
import { useDeleteFileByIdMutation } from '@store/api/documentApi.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';
import PDFPreviewModal from '@components/PDFPreviewModal';

interface DocumentsTableProps {
    documents: any[];
    dropDownItems: TaskDocument[];
    requiredFiles: Map<string, { isSet: boolean }>;
    // dropdownItems: any[];
    onDocumentChange: (newDocuments: any[]) => void;
    onValidateRequiredFilesAreMapped: (areAllMapped: boolean) => void;
}
const DocumentsTable: FC<DocumentsTableProps> = ({
    documents,
    dropDownItems,
    requiredFiles,
    onDocumentChange,
    onValidateRequiredFilesAreMapped,
}) => {
    const dispatch = useAppDispatch();

    const documentIdRef = useRef<number>(-1);
    const requiredFilesRef = useRef(requiredFiles);
    // const [documents, setDocuments] = useState<any[]>([]);
    const [dropdownItems, setDropdownItems] = useState<TaskDocument[]>(dropDownItems);
    const confirmationModalMessageRef = useRef<string>('');
    const [previewFile, setPreviewFile] = useState<TrackerFile | null>(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
    const [handleDeleteFileById, { isSuccess: isSuccessDeleteFileById }] = useDeleteFileByIdMutation();

    useEffect(() => {
        checkIfAllRequiredFilesAreMapped();
    }, [requiredFilesRef]);

    useEffect(() => {
        if (dropDownItems.length) {
            setDropdownItems(dropDownItems);
        }
    }, [dropDownItems]);

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    useEffect(() => {
        // todo handle error
        if (isSuccessDeleteFileById) {
            dispatch(
                appIsToasting({
                    message: 'Archivos borrado con exito',
                    show: true,
                    isError: false,
                }),
            );
        }
    }, [isSuccessDeleteFileById]);

    const handleUpdateRequiredFilesSelected = (dropDownSelectedName: string, value: { isSet: boolean }) => {
        if (requiredFilesRef.current.has(dropDownSelectedName)) {
            requiredFilesRef.current.set(dropDownSelectedName, value);
        }

        checkIfAllRequiredFilesAreMapped();
    };

    const checkIfAllRequiredFilesAreMapped = () => {
        let allAreMapped = true;

        for (const [_, value] of requiredFiles) {
            if (!value.isSet) {
                allAreMapped = false;
                break;
            }
        }

        onValidateRequiredFilesAreMapped(allAreMapped);
    };

    const handleDropdownItemSelected = (dropDownSelectedName: string, documentIndex: number, dropdownIndex: number) => {
        const { dropdownIndex: prevDropdownIndex } = documents[documentIndex];

        if (prevDropdownIndex > -1) {
            const { documentName } = dropDownItems[prevDropdownIndex];
            handleUpdateRequiredFilesSelected(documentName, { isSet: false });
            setDropdownItems((prev) =>
                prev.map((item, i) => (i === prevDropdownIndex ? { ...item, selected: false } : item)),
            );
        }

        onDocumentChange(
            documents.map((doc, i) =>
                i === documentIndex ? Object.assign(doc, { dropDownSelectedName, dropdownIndex }) : doc,
            ),
        );

        setDropdownItems((prev) => prev.map((item, i) => (i === dropdownIndex ? { ...item, selected: true } : item)));

        handleUpdateRequiredFilesSelected(dropDownSelectedName, { isSet: true });
    };

    const renderDropdownItems = (fileIndex: number) => {
        return dropdownItems.map((dropdownItem, dropdownIndex) => (
            <Dropdown.Item
                key={dropdownIndex}
                disabled={dropdownItem.selected}
                eventKey={dropdownItem.documentName}
                defaultValue={dropdownItem.documentName}
                onClick={() => handleDropdownItemSelected(dropdownItem.documentName, fileIndex, dropdownIndex)}
            >
                {dropdownItem.documentName}
            </Dropdown.Item>
        ));
    };

    const handleClearDropdown = (documentIndex: number) => {
        const { dropdownIndex, dropDownSelectedName } = documents[documentIndex];

        setDropdownItems((prev) => prev.map((item, i) => (i === dropdownIndex ? { ...item, selected: false } : item)));

        onDocumentChange(
            documents.map((doc, i) =>
                i === documentIndex ? Object.assign(doc, { dropDownSelectedName: '', dropdownIndex: -1 }) : doc,
            ),
        );

        handleUpdateRequiredFilesSelected(dropDownSelectedName, { isSet: false });
    };

    const handleDate = (fileDate: string): string => {
        const date = fileDate ? new Date(fileDate) : new Date();
        return date.toLocaleDateString('en-GB');
    };

    const handleConfirmDeleteCloudFile = (documentIndex: number) => {
        const { documentName } = documents[documentIndex];

        documentIdRef.current = documentIndex;
        confirmationModalMessageRef.current = `¿Estás seguro de querer borrar al documento ${documentName}?`;
        setShowConfirmationModal(true);
    };

    const handleShowFile = (file: any) => {
        console.log(file);
        setPreviewFile(file);

        if (file.type === 'application/pdf') {
            try {
                const fileUrl = URL.createObjectURL(file);

                setPdfUrl(fileUrl as SetStateAction<any>);
            } catch (error) {
                console.error('Failed to create PDF URL:', error);
                setPdfUrl(null);
            }
        }

        if (file.gCloudStorageUrl) {
            setPdfUrl(file.gCloudStorageUrl as SetStateAction<any>);
        }
        setShowModal(true);
    };

    const handleDeleteFile = (documentIndex: number, hasCloudUrl: boolean) => {
        if (hasCloudUrl) {
            handleConfirmDeleteCloudFile(documentIndex);
            return;
        }

        handleDeleteLocalFile(documentIndex);
    };

    const handleDeleteLocalFile = (documentIndex: number) => {
        handleClearDropdown(documentIndex);
        // todo aqui
        const updatedFiles = [...documents];
        updatedFiles.splice(documentIndex, 1);
        onDocumentChange(updatedFiles);
    };

    const handleDeleteCloudFile = () => {
        const document = documents[documentIdRef.current];
        handleDeleteFileById(document.file_id);
        handleDeleteLocalFile(documentIdRef.current);
    };

    const onConfirmModal = () => {
        const document = documents[documentIdRef.current];
        setShowConfirmationModal(false);

        if (document.gCloudStorageUrl) {
            handleDeleteCloudFile();
            return;
        }
        handleDeleteLocalFile(documentIdRef.current);
    };

    const handleClose = () => {
        setShowModal(false);

        setPreviewFile(null);
        setPdfUrl(null);
    };

    const documentsRowsMemo = useMemo(() => {
        return documents.map((file, documentIndex) => (
            <tr key={documentIndex}>
                <td style={{ verticalAlign: 'middle' }}>{file.originalDocumentName}</td>
                {/* <td style={{ verticalAlign: 'middle' }}>{file.name}</td> */}
                <td style={{ verticalAlign: 'middle' }}>
                    <div className={classes['upload-file-card__dropdown-block']}>
                        <Dropdown>
                            <Dropdown.Toggle
                                disabled={!!file.gCloudStorageUrl}
                                variant="success"
                                id="dropdown-basic"
                                style={{
                                    width: 200,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {file.dropDownSelectedName ? file.dropDownSelectedName : 'Tipo de archivo'}
                            </Dropdown.Toggle>

                            <ScrollableDropdownMenu maxHeight={150}>
                                {renderDropdownItems(documentIndex)}
                            </ScrollableDropdownMenu>
                        </Dropdown>
                        <div style={{ width: 20 }}>
                            <CloseButton
                                style={{ fontSize: 10, marginLeft: 10 }}
                                hidden={!file.dropDownSelectedName || !!file.gCloudStorageUrl}
                                onClick={() => handleClearDropdown(documentIndex)}
                            />
                        </div>
                    </div>
                </td>
                <td style={{ verticalAlign: 'middle' }}>{handleDate(file.created_at)}</td>

                <td style={{ verticalAlign: 'middle' }}>
                    <Button
                        size="lg"
                        variant="link"
                        className="tracker-action-icon-btn"
                        onClick={() => handleShowFile(file)}
                        disabled={file.originalDocumentName.split('.').pop()?.toLowerCase() !== 'pdf'}
                    >
                        <AiOutlineFileSearch size={25} />
                    </Button>
                    <Button
                        size="lg"
                        variant="link"
                    >
                        <a
                            href={file.gCloudStorageUrl ? file.gCloudStorageUrl : URL.createObjectURL(file)}
                            className="tracker-action-icon-btn"
                            download={file.name}
                        >
                            <MdOutlineFileDownload size={25} />
                        </a>
                    </Button>
                    <Button
                        size="lg"
                        variant="link"
                        className="siem-delete-icon-button"
                        onClick={() => handleDeleteFile(documentIndex, !!file.gCloudStorageUrl)}
                    >
                        <RiDeleteBin6Line size={25} />
                    </Button>
                </td>
            </tr>
        ));
    }, [documents, dropdownItems, handleShowFile, handleDeleteFile, renderDropdownItems, handleClearDropdown]);

    return (
        <>
            <div className={classes['upload-file-card__table']}>
                <h5>Archivos Subidos</h5>

                <Table
                    striped
                    style={{ marginTop: 20, marginBottom: 30 }}
                >
                    <thead>
                        <tr>
                            <th>Nombre del archivo</th>
                            <th>Tipo de documento</th>
                            <th>Fecha de subida</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {documents.length ? (
                            documentsRowsMemo
                        ) : (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="text-center"
                                >
                                    No hay documentos
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            <PDFPreviewModal
                title={previewFile?.originalDocumentName || ''}
                showModal={showModal}
                pdfUrl={pdfUrl}
                onClose={handleClose}
            />

            <ConfirmationModal
                onConfirm={onConfirmModal}
                show={showConfirmationModal}
                message={confirmationModalMessageRef.current}
                onCancel={() => setShowConfirmationModal(false)}
            />
        </>
    );
};

export default DocumentsTable;
