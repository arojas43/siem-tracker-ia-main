import classes from './PDFPreviewModal.module.scss';

import Modal from 'react-bootstrap/esm/Modal';

import { useState, type FC } from 'react';
import { Document, Page } from 'react-pdf';

interface PDFPreviewModalProps {
    title: string;
    showModal: boolean;
    pdfUrl: string | null;
    onClose: () => void;
}

const PDFPreviewModal: FC<PDFPreviewModalProps> = ({ title, pdfUrl, showModal, onClose }) => {
    // const [pdfUrl, setPdfUrl] = useState(null);
    const [numPages, setNumPages] = useState<number>(0);

    const onLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    return (
        <Modal
            size="xl"
            show={showModal}
            onHide={onClose}
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {pdfUrl && (
                    <div className={classes['modal-pdf__body']}>
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onLoadSuccess}
                            onLoadError={(error) => console.error('Error loading PDF:', error)}
                        >
                            {Array.from({ length: numPages }, (_, index) => (
                                <div
                                    key={index}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <Page
                                        className={classes['modal-pdf__pages']}
                                        pageNumber={index + 1}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default PDFPreviewModal;
