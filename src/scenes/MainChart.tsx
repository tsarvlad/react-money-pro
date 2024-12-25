import { AreaChart, Area, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ToggleButtonGroup, ToggleButton } from '@mui/material'
import { useState } from 'react';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';


type Asset = {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

type pieChart = {
    name: string;
    value: number;
    sum: number;
}

type areaChart = {
    name: string;
    value: number;
}

type Props = {
    props: {
        pieData: [pieChart];
        stackedAreaChart: [any];
        data: [areaChart];
        data1y: [areaChart];
        stackedAreaChart1Y: [any];
        portfolio1y: [Asset] | undefined;
        allAssets: [String]
    };
}


const MainChart: React.FC<Props> = ({ props: { pieData, stackedAreaChart, data, data1y, portfolio1y, stackedAreaChart1Y, allAssets } }) => {
    const isMobileScreen: Boolean = !useMediaQuery('(min-width: 600px)')

    const [chartType, setChartType] = useState('line')
    const [timeline, setTimeline] = useState('1Y')

    const COLORS = [
        '#27ae60', '#f1c40f', '#e74c3c', '#3498db', '#9b59b6', '#8c7ae6', '#487eb0',
        '#1abc9c', '#2ecc71', '#e67e22', '#d35400', '#2980b9', '#8e44ad', '#34495e',
        '#f39c12', '#c0392b', '#7f8c8d', '#16a085', '#27ae60', '#9b59b6', '#f1c40f'
    ];
    const user = useSelector((state: any) => state.user)
    const token = useSelector((state: any) => state.token)


    const handleChangeTimeline = (
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        type: string,
    ) => {
        if (type !== null) {
            if (type === timeline) return 0
            setTimeline(type);
        }
    }

    const handleChangeChart = (e: React.MouseEvent<HTMLElement, MouseEvent>, type: string) => {
        if (type !== null) {
            if (type === chartType) return 0
            setChartType(type);
        }
    }


    function formatDate(inputDate: any) {
        const [month, year] = inputDate.split('/');
        const dateObj = new Date(parseInt(`20${year}`), month - 1);
        const formattedMonth = dateObj.toLocaleString('default', { month: 'long' });
        const formattedYear = dateObj.getFullYear();
        return `${formattedMonth} ${formattedYear}`;
    }


    const balanceAnnualChange = (data: any) => {
        let tmp: string | number = 0
        let sign = 'neutral';
        if (data) {
            tmp = data[data?.length - 1]?.value - data[data?.length - 13]?.value
            if (!tmp) return { value: '', sign }
            sign = tmp >= 0 ? 'positive' : 'negative'
            tmp = tmp.toLocaleString('en-GB')
        }
        tmp = sign === 'positive' ? `+$${tmp}` : `-${tmp}`
        return { value: tmp, sign }
    }

    const biggestAssetAnnualChange = (data: Asset[], row: any,) => {
        if (!data || !row) {
            return
        }

        let match = null
        // return JSON.stringify(data)
        let [returnable, tmp] = ['+$0', 0]
        for (let asset of data) {
            if (asset.id === row.id || asset.name === row.name) {
                match = asset
                break
            }
        }
        if (match) {
            tmp = row.value - match.quantity * match.price
            returnable = tmp >= 0 ? `+$${tmp.toLocaleString('en-GB')}` : `-$${tmp.toLocaleString('en-GB')}`
        }
        return returnable

    }

    const CustomTooltipArea: any = ({ active, payload, label }: any) => {
        if (active) {
            return (
                <div
                    className="custom-tooltip rounded-xl"
                    style={{
                        backgroundColor: "#fff",
                        padding: "5px",
                        minWidth: '120px',
                        border: 'none'
                    }}
                >
                    <div className='flex flex-col justify-center items-center'>
                        <div className='text-[rgb(162,162,162)]'>{label && formatDate(label)}</div>
                        <div className='text-2xl value'>${payload && payload[0]?.value.toLocaleString('en-GB')}</div>
                    </div>
                </div>
            );
        }
    }


    const CustomTooltipStackedArea: any = ({ active, payload, label }: any) => {
        if (active) {
            const data = payload
            data.reverse()
            return (
                <div className='custom-tooltip rounded-xl'
                    style={{
                        backgroundColor: '#fff',
                        padding: '5px',
                        minWidth: '120px',
                        border: 'none'
                    }}>
                    <div className="flex flex-col justify-center items-center">
                        <div className='text-sm border-b-[0.1px] mb-1 text-[rgb(162,162,162)]'>{label && formatDate(label)}</div>
                        {/* <div className=' value'>${payload && payload[0]?.value.toLocaleString('en-GB')}</div> */}
                        {data.map((asset: any, index: number) => {
                            return <div style={{ color: asset.fill }}>
                                <span className='text-md font-bold'>{asset.name}</span>: <span className="text-md font-bold">${Math.round(asset.value).toLocaleString('en-US')}</span>
                            </div>
                        })}
                    </div>
                </div >
            )
        }
    }

    const CustomTooltipBar: any = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="custom-tooltip"
                    style={{
                        backgroundColor: "#fff",
                        padding: "5px",
                        border: "1px solid #cccc"
                    }}
                >
                    <label><span className='font-bold'>{`${payload?.[0]?.payload?.name}`}</span> : <span  style={{ textAlign: 'right',display: 'inline-block' }}
                                                                                                          className='font-bold text-lg'>${(payload[0].value).toFixed(2)}</span></label>
                    <br/>
                    <label><span className='font-bold'>{`Net share`}</span> : <span   style={{ textAlign: 'right',display: 'inline-block' }}
                                                                                      className='font-bold text-lg ml-0'>{((payload[0].value / data[data?.length - 1].value) * 100).toFixed(2)}%</span></label>

                </div>
            );
        }
        return null;
    }

    const CustomTooltipPie: any = ({ active, payload, label }: any) => {
        if (active) {
            return (
                <div
                    className="custom-tooltip"
                    style={{
                        backgroundColor: "#ffff",
                        padding: "5px",
                        border: "1px solid #cccc"
                    }}
                >
                    <label><span className='font-bold'>{`${payload[0].name}`}</span> : <span className='font-bold text-lg'>{((payload[0].value / data[data?.length - 1].value) * 100).toFixed(2)}%</span></label>
                </div>
            );
        }
    }

    const stackedChartAreas = () => {
        return allAssets.map((item, index) => {
            return <Area
                key={index}
                type='monotone'
                dataKey={`${item}`}
                stackId="1"
                stroke={'8884d8'}
                fill={COLORS[index]}
            />
        })
    }

    const Chart = (chartType: any) => {
        switch (chartType) {
            case 'stacked':
                return <AreaChart
                    height={300}
                    data={timeline === '1Y' ? stackedAreaChart1Y : stackedAreaChart}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={CustomTooltipStackedArea} />
                    {stackedChartAreas()}
                </AreaChart>
            case "bar":
                const reversedPieData = [...pieData].reverse()
                return <BarChart width={500} height={300} data={reversedPieData}>
                    <CartesianGrid strokeDasharray=" 3 3" />
                    <Bar
                        dataKey="value"
                        name="Asset Value"
                        fill="#8884d8"
                        radius={[10, 10, 0, 0]} //rounding for bars
                    >
                        {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[pieData.length - 1 - index % COLORS?.length]} />
                        ))}
                    </Bar>
                    <Tooltip content={<CustomTooltipBar />} cursor={{ opacity: 0.1, fill: COLORS[3] }} />
                    <XAxis dataKey="name" />
                    <YAxis />
                </BarChart>
            case "pie":
                return <PieChart width={500} height={300}>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                    >
                        {pieData.map((entry: any, index: number) => (
                            <Cell
                                style={{ outline: 'none' }}
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS?.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ outline: 'none' }} content={CustomTooltipPie} />
                    <Legend />
                </PieChart>
            default:
                return <AreaChart
                    // width={500}
                    height={300}
                    data={timeline === '1Y' ? data1y : data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip wrapperStyle={{ outline: 'none' }} content={CustomTooltipArea} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </AreaChart>
        }
    }

    return (
        <>
            <div className='panel-controller flex justify-center items-center mt-6'>
                <div className='panel sm:[&>*]:w-[30%] flex m:flex-row justify-around text-left items-center w-[75%] bg-sky dark:bg-mediumblue rounded-lg'>
                    <div className='flex flex-col items-start panel-1 py-4'>
                        <div className='text-xs font-bold text-secondarysky dark:text-[#DDDFEB] lightblue main-header'>TOTAL BALANCE</div>
                        <div className='text-2xl text-white value'>${data ? data[data?.length - 1]?.value.toLocaleString('en-GB') : 0}</div>
                        <div className={`text-xs text-lightblue change`}>{balanceAnnualChange(data)?.value}</div>
                    </div>
                    <div className='hidden sm:flex flex-col items-start panel-2 py-4 px-2 border-[rgba(213,231,213,0.2)] border-x-[1.5px]'>
                        <div className='text-xs font-bold text-secondarysky dark:text-[#DDDFEB] main-header'>{pieData ? pieData[0]?.name : undefined}</div>
                        <div className='text-2xl  text-white value'>${pieData ? pieData[0]?.value.toLocaleString('en-GB') : undefined}</div>
                        <div className='text-xs text-lightblue change'>{data1y && pieData && portfolio1y ? biggestAssetAnnualChange(portfolio1y, pieData[0]) : ''}</div>
                    </div>
                    <div className='hidden sm:flex flex-col items-start panel-3'>
                        <div className='text-xs font-bold  text-secondarysky dark:text-[#DDDFEB] main-header'>ASSETS</div>
                        <div className='text-2xl  text-white value'>{pieData ? pieData.length.toLocaleString('en-GB') : 0}</div>
                    </div>
                </div>
            </div>

            <div className='chart-container flex justify-center items-center '>
                <div className="chart h-[350px] w-full sm:w-[75%] ">
                    <div className='flex justify-center mt-5 mb-[1.5px]'>
                        <div className='flex justify-between w-[75%] sm:w-[95%]'>
                            <ToggleButtonGroup exclusive size="small" value={chartType} onChange={handleChangeChart} aria-label="Small sizes"
                            // orientation={`${isMobileScreen ? 'vertical' : 'horizontal'}`}
                            >
                                <ToggleButton value="line" key="line">
                                    <ShowChartIcon />
                                </ToggleButton>,
                                <ToggleButton value="stacked" key="stacked">
                                    <SsidChartIcon />
                                </ToggleButton>,
                                <ToggleButton value="bar" key="bar">
                                    <BarChartIcon />
                                </ToggleButton>,
                                <ToggleButton value="pie" key="pie">
                                    <PieChartIcon />
                                </ToggleButton>,
                            </ToggleButtonGroup>
                            <div className="self-end hidden sm:block font-extralight">
                                {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', timeZoneName: 'long' })}
                            </div>
                            {['bar', 'pie'].includes(chartType) ? '' : <ToggleButtonGroup exclusive
                                // orientation={`${isMobileScreen ? 'vertical' : 'horizontal'}`}
                                size="small" value={timeline} onChange={handleChangeTimeline} aria-label="Small sizes">
                                <ToggleButton value="1Y" key="1Y">
                                    1Y
                                </ToggleButton>,
                                <ToggleButton value="ALL" key="ALL">
                                    All
                                </ToggleButton>,
                            </ToggleButtonGroup>}
                        </div>
                    </div>

                    <div className={`w-full h-full pt-4 pb-3 px-2`}>
                        <div className={`w-full h-full ${chartType === 'pie' && 'bg-[rgba(212,212,212,0.2)] dark:bg-[rgba(212,212,212,0.5)]'} rounded-xl`}>
                            <ResponsiveContainer >
                                {Chart(chartType)}
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default MainChart
