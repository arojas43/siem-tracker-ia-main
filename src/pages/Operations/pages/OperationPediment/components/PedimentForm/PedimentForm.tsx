import classes from './PedimentForm.module.scss';
import { useState, type FC } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import Spinner from 'react-bootstrap/esm/Spinner';

interface PedimentFormProps {
    onClose: () => void;
}

const PedimentForm: FC<PedimentFormProps> = ({ onClose }) => {
    const [isInvalid, setIsInvalid] = useState<boolean>(false);

    const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsInvalid(false);

        const formData = new FormData(event.currentTarget);
        const formDataValues = Object.fromEntries(formData.entries());
        console.log('formDataValues', formDataValues);

        // todo handle error on form
        // if (!formDataValues.singleInput) {
        //     setIsInvalid(true);
        //     return;
        // }

        // todo hanlde send info to endpoint
        onClose();
    };

    const handleInputChanged = (input: string) => {
        if (!input) {
            setIsInvalid(true);
            return;
        }
        setIsInvalid(false);
    };

    return (
        <>
            <h5 style={{ paddingLeft: 20, paddingBottom: 10 }}>Crear nuevo pedimento</h5>
            <Form
                onSubmit={handleSubmitForm}
                className={classes['three-field-action-modal__form']}
            >
                <Form.Group as={Row}>
                    <Form.Label
                        column
                        as="p"
                        style={{ fontSize: 17 }}
                    >
                        Número de pedimento
                    </Form.Label>
                    <Col>
                        <Form.Control
                            name="pedimentNumber"
                            onChange={(event) => handleInputChanged(event.currentTarget.value)}
                            isInvalid={isInvalid}
                        />
                        <Form.Text
                            muted
                            hidden={!isInvalid}
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label
                        column
                        as="p"
                        style={{ fontSize: 17 }}
                    >
                        Tipo de pedimento
                    </Form.Label>
                    <Col>
                        <Form.Select
                            name="pedimentType"
                            // onChange={handleDropdownChange}
                            // onChange={(event) => handleInputChanged(event.currentTarget.value)}
                            // isInvalid={isInvalid}
                            // value={formData.operation_type}
                        >
                            <option value="">Selecione una opción</option>
                            <option value="Desaduanamiento libre">Desaduanamiento libre</option>
                            <option value="Reconocimiento aduanero">Reconocimiento aduanero</option>
                        </Form.Select>
                        <Form.Text
                            muted
                            hidden={!isInvalid}
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label
                        column
                        as="p"
                        style={{ fontSize: 17 }}
                    >
                        Resultado de modulación
                    </Form.Label>
                    <Col>
                        <Form.Select
                            name="pedimentResult"
                            // onChange={handleDropdownChange}
                            // onChange={(event) => handleInputChanged(event.currentTarget.value)}
                            // isInvalid={isInvalid}
                            // value={formData.operation_type}
                        >
                            <option value="">Selecione una opción</option>
                            <option value="M3">M3</option>
                            <option value="G9 Impo">G9 Impo</option>
                            <option value="G9 Expo">G9 Expo</option>
                            <option value="R1">R1</option>
                        </Form.Select>
                        <Form.Text
                            muted
                            hidden={!isInvalid}
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>
                <div className={classes['three-field-action-modal__footer']}>
                    <Button
                        type="submit"
                        className={`siem-primary-button ${classes['three-field-action-modal__button']}`}
                    >
                        {true && (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                style={{ marginRight: 20 }}
                            />
                        )}
                        Finalizar
                    </Button>
                </div>
            </Form>
        </>
    );
};

export default PedimentForm;
