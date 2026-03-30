import { AreaChart, Area, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Treemap, ComposedChart, Line } from 'recharts';
import { ToggleButtonGroup, ToggleButton, Select, MenuItem, FormControl } from '@mui/material'
import { useState, useMemo } from 'react';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import GridViewIcon from '@mui/icons-material/GridView';
import MultilineChartIcon from '@mui/icons-material/MultilineChart';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';


type Asset = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    tags?: { [key: string]: any }
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
        allAssets: [String];
        tableData: Asset[];
    };
}


const MainChart: React.FC<Props> = ({ props: { pieData, stackedAreaChart, data, data1y, portfolio1y, stackedAreaChart1Y, allAssets, tableData } }) => {
    const isMobileScreen: Boolean = !useMediaQuery('(min-width: 600px)')

    const [chartType, setChartType] = useState('line')
    const [timeline, setTimeline] = useState('1Y')
    const [selectedTagKey, setSelectedTagKey] = useState<string>('default')

    const COLORS = [
        '#27ae60', '#f1c40f', '#e74c3c', '#3498db', '#9b59b6', '#8c7ae6', '#487eb0',
        '#1abc9c', '#2ecc71', '#e67e22', '#d35400', '#2980b9', '#8e44ad', '#34495e',
        '#f39c12', '#c0392b', '#7f8c8d', '#16a085', '#27ae60', '#9b59b6', '#f1c40f'
    ];
    const user = useSelector((state: any) => state.user)
    const token = useSelector((state: any) => state.token)
    // tags: [{ _id, name, options: [{ _id, name }] }]
    const tags = useSelector((state: any) => state.tags)

    // Helper: resolve option name for an asset's tag assignment
    const getTagValue = (assetName: string, tagId: string): string => {
        const asset = tableData.find(a => a.name === assetName)
        const optionId = asset?.tags?.[tagId]
        if (optionId === undefined || optionId === null) return 'Not set'
        const tag = tags.find((t: any) => t._id === tagId)
        const option = tag?.options?.find((o: any) => o._id === optionId)
        return option?.name ?? 'Not set'
    }

    // Pie/bar data grouped by selected tag key
    const displayPieData = useMemo(() => {
        if (selectedTagKey === 'default') return pieData
        const grouped: { [key: string]: { name: string; value: number; sum: number } } = {}
        for (const item of pieData) {
            const group = getTagValue(item.name, selectedTagKey)
            if (!grouped[group]) grouped[group] = { name: group, value: 0, sum: 0 }
            grouped[group].value += item.value
        }
        return Object.values(grouped).sort((a, b) => b.value - a.value)
    }, [selectedTagKey, pieData, tableData, tags])

    // Unique tag values (option names) used as keys in the stacked chart when grouped
    const groupedTagValues = useMemo(() => {
        if (selectedTagKey === 'default') return null
        const vals = new Set<string>()
        for (const name of allAssets) {
            vals.add(getTagValue(name as string, selectedTagKey))
        }
        return [...vals]
    }, [selectedTagKey, allAssets, tableData, tags])

    // Stacked chart data re-aggregated by tag value (option names as keys)
    const displayStackedData = useMemo(() => {
        if (selectedTagKey === 'default' || !groupedTagValues) {
            return { all: stackedAreaChart, y1: stackedAreaChart1Y }
        }
        const compute = (stacked: any[]) => stacked.map(point => {
            const newPoint: any = { name: point.name }
            for (const val of groupedTagValues) newPoint[val] = 0
            for (const assetName of allAssets) {
                const group = getTagValue(assetName as string, selectedTagKey)
                newPoint[group] = (newPoint[group] || 0) + (point[assetName as string] || 0)
            }
            return newPoint
        })
        return { all: compute(stackedAreaChart), y1: compute(stackedAreaChart1Y) }
    }, [selectedTagKey, groupedTagValues, allAssets, stackedAreaChart, stackedAreaChart1Y, tableData, tags])

    // Total for percentage calculations
    const displayTotal = displayPieData.reduce((sum, item) => sum + item.value, 0)

    // Recompute line data from stacked when tag is selected
    const filteredAssetNames = useMemo(() => {
        if (selectedTagKey === 'default') return null
        return allAssets.filter(name => {
            const asset = tableData.find(a => a.name === name)
            const optionId = asset?.tags?.[selectedTagKey]
            if (optionId === undefined || optionId === null) return getTagValue(name as string, selectedTagKey) !== 'Not set' ? true : false
            return true
        })
    }, [selectedTagKey, allAssets, tableData, tags])

    const filteredLineData = useMemo(() => {
        if (selectedTagKey === 'default') return { data, data1y }
        const names = filteredAssetNames ?? allAssets
        const compute = (stacked: any[]) => stacked.map(point => ({
            name: point.name,
            value: (names as any[]).reduce((sum: number, n: any) => sum + (point[n] || 0), 0)
        }))
        return { data: compute(stackedAreaChart), data1y: compute(stackedAreaChart1Y) }
    }, [selectedTagKey, filteredAssetNames, allAssets, stackedAreaChart, stackedAreaChart1Y, data, data1y])

    // Composed chart: balance line + monthly change bars
    const composedData = useMemo(() => {
        const compute = (source: areaChart[]) => source.map((point, index) => ({
            name: point.name,
            value: point.value,
            change: index === 0 ? 0 : point.value - source[index - 1].value
        }))
        return { data: compute(filteredLineData.data), data1y: compute(filteredLineData.data1y) }
    }, [filteredLineData])

    // Annual change for an item in displayPieData (works for both asset and group)
    const getAnnualChange = (itemName: string): number => {
        if (!portfolio1y) return 0
        if (selectedTagKey === 'default') {
            const lastYear = (portfolio1y as Asset[]).find(a => a.name === itemName)
            const current = pieData.find(p => p.name === itemName)
            if (!lastYear || !current) return 0
            return current.value - lastYear.quantity * lastYear.price
        }
        // Grouped: sum changes of all constituent assets
        let total = 0
        for (const item of pieData) {
            if (getTagValue(item.name, selectedTagKey) === itemName) {
                const lastYear = (portfolio1y as Asset[]).find(a => a.name === item.name)
                if (lastYear) total += item.value - lastYear.quantity * lastYear.price
            }
        }
        return total
    }

    // Treemap data: flat for default, nested (with children) for grouped
    const treemapData = useMemo(() => {
        if (selectedTagKey === 'default') {
            return pieData.map(item => ({ name: item.name, value: item.value }))
        }
        const grouped: { [key: string]: { name: string; children: { name: string; value: number }[] } } = {}
        for (const item of pieData) {
            const group = getTagValue(item.name, selectedTagKey)
            if (!grouped[group]) grouped[group] = { name: group, children: [] }
            grouped[group].children.push({ name: item.name, value: item.value })
        }
        return Object.values(grouped)
    }, [selectedTagKey, pieData, tableData, tags])

    const CustomTreemapContent = (props: any) => {
        const { x, y, width, height, name, value, depth, index } = props
        if (depth === 0 || width <= 0 || height <= 0) return null

        let color: string

        if (selectedTagKey === 'default') {
            // Default: stable color by original asset index
            const assetIndex = pieData.findIndex(p => p.name === name)
            color = COLORS[(assetIndex >= 0 ? assetIndex : index) % COLORS.length]
        } else if (depth === 1) {
            // Group container: colored border only — fill is covered by children anyway
            return (
                <g>
                    <rect x={x} y={y} width={width} height={height}
                        style={{ fill: 'none', stroke: '#fff', strokeWidth: 5 }} />
                </g>
            )
        } else {
            // Leaf in grouped mode: color by group so all assets in same group share a color
            const groupName = getTagValue(name, selectedTagKey)
            const groupIndex = (treemapData as any[]).findIndex(g => g.name === groupName)
            color = COLORS[(groupIndex >= 0 ? groupIndex : index) % COLORS.length]
        }

        const fontSize = Math.min(14, Math.max(9, width / 7))
        return (
            <g>
                <rect x={x} y={y} width={width} height={height}
                    style={{ fill: color, stroke: '#fff', strokeWidth: 2, opacity: 0.88 }} />
                {width > 45 && height > 22 && (
                    <text x={x + width / 2} y={y + height / 2 - (height > 44 && value ? 8 : 0)}
                        textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize, fill: '#fff', fontWeight: 'bold', pointerEvents: 'none' }}>
                        {name}
                    </text>
                )}
                {width > 55 && height > 44 && value && (
                    <text x={x + width / 2} y={y + height / 2 + fontSize}
                        textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize: fontSize - 1, fill: 'rgba(255,255,255,0.85)', pointerEvents: 'none' }}>
                        ${value.toLocaleString('en-GB')}
                    </text>
                )}
            </g>
        )
    }

    const CustomTooltipComposed: any = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload.find((p: any) => p.dataKey === 'value')?.value
            const change = payload.find((p: any) => p.dataKey === 'change')?.value
            return (
                <div className="custom-tooltip rounded-xl" style={{ backgroundColor: '#fff', padding: '8px', minWidth: '140px', border: 'none' }}>
                    <div className='text-[rgb(162,162,162)] text-sm mb-1'>{label && formatDate(label)}</div>
                    <div>Balance: <span className='font-bold text-lg'>${value?.toLocaleString('en-GB')}</span></div>
                    {change !== undefined && (
                        <div style={{ color: change >= 0 ? '#27ae60' : '#e74c3c' }}>
                            Monthly: <span className='font-bold'>{change >= 0 ? '+' : ''}${change?.toLocaleString('en-GB')}</span>
                        </div>
                    )}
                </div>
            )
        }
        return null
    }

    const CustomTooltipTreemap: any = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const { name, value } = payload[0].payload
            if (!value) return null
            return (
                <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #cccc' }}>
                    <div><span className='font-bold'>{name}</span>: <span className='font-bold text-lg'>${value.toLocaleString('en-GB')}</span></div>
                    <div className='text-sm text-gray-500'>{((value / displayTotal) * 100).toFixed(2)}% of total</div>
                </div>
            )
        }
        return null
    }

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

    const balanceAnnualChange = (d: any) => {
        let tmp: string | number = 0
        let sign = 'neutral';
        if (d) {
            tmp = d[d?.length - 1]?.value - d[d?.length - 13]?.value
            if (!tmp) return { value: '', sign }
            sign = tmp >= 0 ? 'positive' : 'negative'
            tmp = tmp.toLocaleString('en-GB')
        }
        tmp = sign === 'positive' ? `+$${tmp}` : `-${tmp}`
        return { value: tmp, sign }
    }

    const biggestAssetAnnualChange = (data: Asset[], row: any,) => {
        if (!data || !row) return
        let match = null
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
                <div className="custom-tooltip rounded-xl" style={{ backgroundColor: "#fff", padding: "5px", minWidth: '120px', border: 'none' }}>
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
            const d = [...payload]
            d.reverse()
            return (
                <div className='custom-tooltip rounded-xl' style={{ backgroundColor: '#fff', padding: '5px', minWidth: '120px', border: 'none' }}>
                    <div className="flex flex-col justify-center items-center">
                        <div className='text-sm border-b-[0.1px] mb-1 text-[rgb(162,162,162)]'>{label && formatDate(label)}</div>
                        {d.map((asset: any, index: number) => (
                            <div key={index} style={{ color: asset.fill }}>
                                <span className='text-md font-bold'>{asset.name}</span>: <span className="text-md font-bold">${Math.round(asset.value).toLocaleString('en-US')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    }

    const CustomTooltipBar: any = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "5px", border: "1px solid #cccc" }}>
                    <label><span className='font-bold'>{`${payload?.[0]?.payload?.name}`}</span> : <span style={{ textAlign: 'right', display: 'inline-block' }} className='font-bold text-lg'>${(payload[0].value).toFixed(2)}</span></label>
                    <br />
                    <label><span className='font-bold'>Net share</span> : <span style={{ textAlign: 'right', display: 'inline-block' }} className='font-bold text-lg ml-0'>{((payload[0].value / displayTotal) * 100).toFixed(2)}%</span></label>
                </div>
            );
        }
        return null;
    }

    const CustomTooltipPie: any = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: "#ffff", padding: "5px", border: "1px solid #cccc" }}>
                    <label><span className='font-bold'>{`${payload[0].name}`}</span> : <span className='font-bold text-lg'>{((payload[0].value / displayTotal) * 100).toFixed(2)}%</span></label>
                </div>
            );
        }
    }

    const stackedChartAreas = () => {
        // When grouped by tag, render one area per tag value; otherwise one per asset
        if (selectedTagKey !== 'default' && groupedTagValues) {
            return groupedTagValues.map((val, index) => (
                <Area key={index} type='monotone' dataKey={val} stackId="1" stroke={'8884d8'} fill={COLORS[index % COLORS.length]} />
            ))
        }
        return allAssets.map((item, index) => (
            <Area key={index} type='monotone' dataKey={`${item}`} stackId="1" stroke={'8884d8'} fill={COLORS[index % COLORS.length]} />
        ))
    }

    const Chart = (chartType: any) => {
        switch (chartType) {
            case 'stacked':
                return <AreaChart
                    height={300}
                    data={timeline === '1Y' ? displayStackedData.y1 : displayStackedData.all}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={CustomTooltipStackedArea} />
                    {stackedChartAreas()}
                </AreaChart>
            case "bar":
                const reversedData = [...displayPieData].reverse()
                return <BarChart width={500} height={300} data={reversedData}>
                    <CartesianGrid strokeDasharray=" 3 3" />
                    <Bar dataKey="value" name="Asset Value" fill="#8884d8" radius={[10, 10, 0, 0]}>
                        {reversedData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(reversedData.length - 1 - index) % COLORS.length]} />
                        ))}
                    </Bar>
                    <Tooltip content={<CustomTooltipBar />} cursor={{ opacity: 0.1, fill: COLORS[3] }} />
                    <XAxis dataKey="name" />
                    <YAxis />
                </BarChart>
            case "pie":
                return <PieChart width={500} height={300}>
                    <Pie data={displayPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} animationBegin={0} animationDuration={600}>
                        {displayPieData.map((_, index) => (
                            <Cell style={{ outline: 'none' }} key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ outline: 'none' }} content={CustomTooltipPie} />
                    <Legend />
                </PieChart>
            case "treemap":
                return <Treemap
                    data={treemapData}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    animationBegin={0}
                    animationDuration={300}
                    content={<CustomTreemapContent />}
                >
                    <Tooltip content={CustomTooltipTreemap} />
                </Treemap>
            case "composed":
                const composedSource = timeline === '1Y' ? composedData.data1y : composedData.data
                return <ComposedChart height={300} data={composedSource} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={CustomTooltipComposed} />
                    <Bar yAxisId="right" dataKey="change" name="Monthly change" radius={[4, 4, 0, 0]}>
                        {composedSource.map((entry: any, index: number) => (
                            <Cell key={index} fill={entry.change >= 0 ? '#27ae60' : '#e74c3c'} />
                        ))}
                    </Bar>
                    <Line yAxisId="left" type="monotone" dataKey="value" stroke="#8884d8" dot={false} strokeWidth={2} name="Balance" animationBegin={0} animationDuration={600} />
                </ComposedChart>
            default:
                return <AreaChart
                    height={300}
                    data={timeline === '1Y' ? data1y : data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                        <div className='text-xs font-bold text-secondarysky dark:text-[#DDDFEB] main-header'>{displayPieData ? displayPieData[0]?.name : undefined}</div>
                        <div className='text-2xl  text-white value'>${displayPieData ? displayPieData[0]?.value.toLocaleString('en-GB') : undefined}</div>
                        <div className='text-xs text-lightblue change'>{data1y && displayPieData && portfolio1y && selectedTagKey === 'default' ? biggestAssetAnnualChange(portfolio1y, displayPieData[0]) : ''}</div>
                    </div>
                    <div className='hidden sm:flex flex-col items-start panel-3'>
                        <div className='text-xs font-bold  text-secondarysky dark:text-[#DDDFEB] main-header'>ASSETS</div>
                        <div className='text-2xl  text-white value'>{displayPieData ? displayPieData.length.toLocaleString('en-GB') : 0}</div>
                    </div>
                </div>
            </div>

            <div className='chart-container flex justify-center items-center '>
                <div className="chart h-[350px] w-full sm:w-[75%] ">
                    <div className='flex justify-center mt-5 mb-[1.5px]'>
                        <div className='flex justify-between w-[75%] sm:w-[95%]'>
                            <div className='flex items-center gap-2'>
                                <ToggleButtonGroup exclusive size="small" value={chartType} onChange={handleChangeChart} aria-label="Small sizes">
                                    <ToggleButton value="line" key="line">
                                        <ShowChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value="stacked" key="stacked">
                                        <SsidChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value="bar" key="bar">
                                        <BarChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value="pie" key="pie">
                                        <PieChartIcon />
                                    </ToggleButton>
                                    <ToggleButton value="treemap" key="treemap">
                                        <GridViewIcon />
                                    </ToggleButton>
                                    <ToggleButton value="composed" key="composed">
                                        <MultilineChartIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                <FormControl size="small">
                                    <Select
                                        value={selectedTagKey}
                                        onChange={(e) => setSelectedTagKey(e.target.value)}
                                        sx={{ fontSize: '0.8rem', minWidth: 130 }}
                                    >
                                        <MenuItem value="default">Default</MenuItem>
                                        {tags.map((tag: any) => (
                                            <MenuItem key={tag._id} value={tag._id}>{tag.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="self-end hidden sm:block font-extralight">
                                {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', timeZoneName: 'long' })}
                            </div>
                            {['bar', 'pie', 'treemap'].includes(chartType) ? '' : <ToggleButtonGroup exclusive
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
                        {chartType === 'treemap' && selectedTagKey !== 'default' && (
                            <div className='flex justify-center flex-wrap gap-3 mt-2'>
                                {(treemapData as any[]).map((group, i) => (
                                    <div key={i} className='flex items-center gap-1'>
                                        <div style={{ width: 12, height: 12, backgroundColor: COLORS[i % COLORS.length], borderRadius: 2, opacity: 0.88 }} />
                                        <span className='text-sm'>{group.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </>
    )
}

export default MainChart
