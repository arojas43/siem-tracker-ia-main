import classes from './ClientOperationsWidgetCard.module.scss';

import { type FC } from 'react';
import Card from 'react-bootstrap/esm/Card';
import { LuPackageCheck } from 'react-icons/lu';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { LiaClipboardListSolid } from 'react-icons/lia';
import Placeholder from 'react-bootstrap/esm/Placeholder';
import { useGetClientOperationWidgetsDataQuery } from '@store/api/operationApi.slice';

const ClientOperationsWidgetCard: FC = () => {
    const { data: widgetData, isLoading: isLoadingWidgetData } = useGetClientOperationWidgetsDataQuery();
    // const widgetData = {
    //     total_operations: 63,
    //     active_operations: 21,
    //     growth_percentage: 87.5,
    //     growth_trend: 'up',
    //     pending_payment: 10000000,
    //     pending_payment_growth_percentage: 27.5,
    //     pending_payment_growth_trend: 'down',
    // };
    const renderGrowthArrow = (trend: string) => {
        return trend === 'up' ? <FaArrowUp size={15} /> : <FaArrowDown size={15} />;
    };

    const loadingPlaceHolder = () => {
        return (
            <>
                <Placeholder
                    as="div"
                    animation="glow"
                    style={{ fontSize: '34px', fontWeight: 'bold' }}
                >
                    <Placeholder xs={9} />
                </Placeholder>
                <Placeholder
                    as="div"
                    animation="glow"
                    style={{ fontSize: '14px', fontWeight: 'normal' }}
                >
                    <Placeholder
                        xs={10}
                        size="xs"
                    />
                </Placeholder>
            </>
        );
    };

    const totalOperationData = () => {
        return (
            <>
                <div style={{ fontSize: '34px', fontWeight: 'bold' }}>{widgetData?.total_operations}</div>
                <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
                    <span
                        className={
                            widgetData?.growth_trend === 'up'
                                ? classes['operation-widget-card__up-growth']
                                : classes['operation-widget-card__down-growth']
                        }
                    >
                        {renderGrowthArrow(widgetData?.growth_trend!)} {Math.abs(widgetData?.growth_percentage || 0)}%
                    </span>{' '}
                    este mes
                </div>
            </>
        );
    };

    // const pendingPaymentTotalData = () => {
    //     return (
    //         <>
    //             <div style={{ fontSize: '34px', fontWeight: 'bold' }}>{widgetData?.pending_payment}</div>
    //             <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
    //                 <span
    //                     className={
    //                         widgetData?.pending_payment_growth_trend === 'up'
    //                             ? classes['operation-widget-card__up-growth']
    //                             : classes['operation-widget-card__down-growth']
    //                     }
    //                 >
    //                     {renderGrowthArrow()} {Math.abs(widgetData?.pending_payment_growth_percentage || 0)}%
    //                 </span>{' '}
    //                 este mes
    //             </div>
    //         </>
    //     );
    // };

    const activeOperationData = () => {
        return (
            <>
                <div style={{ fontSize: '34px', fontWeight: 'bold' }}>{widgetData?.active_operations}</div>
                <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
                    <span style={{ color: 'transparent' }}>{'dont like this'}</span>
                </div>
            </>
        );
    };

    return (
        <Card className={classes['operation-widget-card']}>
            <Card.Body
                as="div"
                className={classes['operation-widget-card__body']}
            >
                <div className={classes['operation-widget-card__w1']}>
                    <div className={classes['operation-widget-card__w1--a']}>
                        <div className={classes['icon-wrapper']}>
                            <LiaClipboardListSolid size={70} />
                        </div>
                    </div>
                    <div className={classes['operation-widget-card__w1--b']}>
                        <div style={{ fontSize: '18px', fontWeight: 'normal' }}>Total Operaciones</div>
                        {isLoadingWidgetData ? loadingPlaceHolder() : totalOperationData()}
                    </div>
                </div>

                <div className={classes['vertical-line']} />

                <div className={classes['operation-widget-card__w1']}>
                    <div className={classes['operation-widget-card__w1--a']}>
                        <div className={classes['icon-wrapper']}>
                            <LuPackageCheck size={70} />
                        </div>
                    </div>
                    <div className={classes['operation-widget-card__w1--b']}>
                        <div style={{ fontSize: '18px', fontWeight: 'normal' }}>Operaciones Activas</div>
                        {isLoadingWidgetData ? loadingPlaceHolder() : activeOperationData()}
                    </div>
                </div>
                {/* <div className={classes['vertical-line']}></div>
                <div className={classes['operation-widget-card__w1']}>
                    <div className={classes['operation-widget-card__w1--a']}>
                        <div className={classes['icon-wrapper']}>
                            <LiaClipboardListSolid size={70} />
                        </div>
                    </div>
                    <div className={classes['operation-widget-card__w1--b']}>
                        <div style={{ fontSize: '18px', fontWeight: 'normal' }}>Pago total pendiente</div>
                        {isLoadingWidgetData ? loadingPlaceHolder() : pendingPaymentTotalData()}
                    </div>
                </div> */}
            </Card.Body>
        </Card>
    );
};

export default ClientOperationsWidgetCard;
