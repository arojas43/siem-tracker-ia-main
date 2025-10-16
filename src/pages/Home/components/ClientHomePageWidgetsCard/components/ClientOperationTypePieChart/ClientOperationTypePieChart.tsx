import classes from './ClientOperationTypePieChart.module.scss';
import type { OperationByType } from '@store/api/api.types';
import { useEffect, useState, type FC } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Placeholder from 'react-bootstrap/esm/Placeholder';
import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions, Plugin } from 'chart.js';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

const defaultChartData: ChartData = {
    labels: [],
    datasets: [
        {
            label: '# de operaciones',
            data: [],
            backgroundColor: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2'],
            borderColor: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2'],
            borderWidth: 1,
        },
    ],
};

interface ClientOperationTypePieChartProps {
    isLoading: boolean;
    cardTitle: string;
    operationTypes: OperationByType | undefined;
}
const ClientOperationTypePieChart: FC<ClientOperationTypePieChartProps> = ({
    cardTitle,
    isLoading,
    operationTypes,
}) => {
    const [chartData, setChartData] = useState(defaultChartData);

    const centerTextPlugin: Plugin<'doughnut'> = {
        id: 'centerText',
        beforeDraw(chart) {
            const { width, height, ctx } = chart;
            const dataset = chart.data.datasets[0];
            const total = dataset.data.reduce((acc, val) => acc + val, 0);

            ctx.save();
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const text = `Total: ${total}`;

            const offsetY = 15;

            ctx.fillText(text, width / 2, height / 2 - offsetY);
            ctx.restore();
        },
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    useEffect(() => {
        if (operationTypes) {
            const labels: string[] = [];
            const data: number[] = [];
            Object.entries(operationTypes).forEach(([label, value]) => {
                labels.push(label);
                data.push(value as number);
            });
            defaultChartData.labels = labels;
            defaultChartData.datasets[0].data = data;
            setChartData(defaultChartData);
        }
    }, [operationTypes]);

    useEffect(() => {
        console.log('chartData', chartData);
    }, [chartData]);

    const renderOperationTypesPieChart = () => {
        if (!operationTypes) {
            return (
                <Card.Body
                    as="div"
                    className={classes['pie-chart-card__body']}
                    style={{ textAlign: 'center' }}
                >
                    <Card.Title>No hay datos disponibles</Card.Title>
                </Card.Body>
            );
        }

        return (
            <>
                <Card.Title>{cardTitle}</Card.Title>
                <Card.Body
                    as="div"
                    className={classes['pie-chart-card__body']}
                >
                    <div className={classes['data-block']}>
                        <Doughnut
                            width={174}
                            height={174}
                            plugins={[centerTextPlugin]}
                            options={options}
                            data={chartData}
                        />
                    </div>
                </Card.Body>
            </>
        );
    };

    const renderLoadingWebPlaceholder = () => {
        return (
            <Card.Body
                as="div"
                className={classes['pie-chart-card__body']}
            >
                <div className={classes['data-block']}>
                    {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index}>
                            <Placeholder
                                as="p"
                                animation="wave"
                            >
                                <Placeholder xs={12} />
                            </Placeholder>
                        </div>
                    ))}
                </div>

                <div className={classes['pie-chart-card__body--nom']}>
                    <div className={classes['data-block']}>
                        {Array.from({ length: 1 }).map((_, index) => (
                            <div key={index}>
                                <Placeholder
                                    as="p"
                                    animation="wave"
                                >
                                    <Placeholder xs={12} />
                                </Placeholder>
                            </div>
                        ))}
                    </div>
                </div>
            </Card.Body>
        );
    };
    return (
        <div>
            {/** MOBILE CARD */}

            <Card
                as="div"
                className={classes['pie-chart-card_chart-mobile']}
            >
                {isLoading ? renderLoadingWebPlaceholder() : renderOperationTypesPieChart()}
            </Card>

            {/** WEB CARD */}
            <Card
                as="div"
                className={classes['pie-chart-card']}
            >
                {isLoading ? renderLoadingWebPlaceholder() : renderOperationTypesPieChart()}
            </Card>
        </div>
    );
};

export default ClientOperationTypePieChart;
