import React, { useState } from 'react';
import styles from './DocumentListGrid.module.scss';

interface DocumentListGridProps {
    documentList: Array<{ documentName: string; required?: boolean }>;
}

const MAX_VISIBLE = 12;

const DocumentListGrid: React.FC<DocumentListGridProps> = ({ documentList }) => {
    const [showAll, setShowAll] = useState(false);
    const visibleDocs = showAll ? documentList : documentList.slice(0, MAX_VISIBLE);
    const hasMore = documentList.length > MAX_VISIBLE;

    return (
        <div>
            <strong style={{ margin: 0, padding: 0, fontSize: 16 }}>Documentos de la tarea:</strong>
            <div className={styles.gridContainer}>
                {visibleDocs.map((document, index) => (
                    <p
                        key={index}
                        className={styles.documentItem}
                    >
                        {document.documentName} {document.required && '(Requerido)'}
                    </p>
                ))}
            </div>
            {hasMore && (
                <div className={styles.showMoreContainer}>
                    <hr className={styles.showMoreLine} />
                    <span
                        className={styles.showMoreText}
                        onClick={() => setShowAll((prev) => !prev)}
                    >
                        {showAll ? 'Ver menos' : 'Ver más'}
                    </span>
                    <hr className={styles.showMoreLine} />
                </div>
            )}
        </div>
    );
};

export default DocumentListGrid;
