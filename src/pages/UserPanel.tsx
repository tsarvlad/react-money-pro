// @ts-nocheck
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MainChart from '../scenes/MainChart'
import AssetsTable from '../scenes/AssetsTable'
import EditOverlay from './EditOverlay'
import { ToastContainer, toast } from 'react-toastify'
import Spinner from '../scenes/Spinner'
import Footer from '../components/Footer'

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

function sortDataByQuantityPrice(data: any) {
    data.sort((a: Asset, b: Asset) => b.quantity * b.price - a.quantity * a.price);
    return data
}

const UserPanel = () => {
    const user = useSelector((state: any) => state.user)
    const token = useSelector((state: any) => state.token)

    const [loading, setLoading] = useState<boolean>(false)
    const [pieData, setPieData] = useState<pieChart[]>([{ name: 'unknown', value: 0, sum: 0 }])
    const [stackedAreaChart, setStackedAreaChart] = useState<any[]>([{ 'unknown': null }])
    const [allAssets, setAllAssets] = useState<string[]>(['unknown', 'unknown'])
    const [data, setData] = useState<areaChart[]>([{ name: 'unknown', value: 0 }])
    const [data1y, setData1y] = useState<areaChart[]>([{ name: 'unknown', value: 0 }])
    const [stackedAreaChart1Y, setStackedAreaChart1Y] = useState<any[]>([{ 'unknown': null }])
    const [portfolio1y, setPortfolio1y] = useState<Asset[] | undefined>(undefined)
    const [tableData, setTableData] = useState<Asset[]>([{ id: '', name: 'unknown', quantity: 1, price: 1 }])
    const [tablelastYearData, setLastYearData] = useState<Asset[]>([{ id: '', name: 'unknown', quantity: 1, price: 1 }])

    useEffect(() => {
        try {
            setLoading(true)
            const asyncFunc = async () => {
                const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/user/${user._id}/portfolio`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                const responseJson = await response.json()
                setTableData(sortDataByQuantityPrice(responseJson.pop().assets))
                setLastYearData(responseJson[responseJson.length - 13]?.assets)

                const response2 = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/user/${user._id}/chartdata`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                const responseJson2 = await response2.json()
                setData(responseJson2.areaChart)
                setStackedAreaChart(responseJson2.stackedAreaChart)
                setAllAssets(responseJson2.allAssets)
                setPieData(responseJson2.pieChart)
                setData1y(responseJson2.areaChart.slice(-12))
                setStackedAreaChart1Y(responseJson2.stackedAreaChart.slice(-12))
                setPortfolio1y(responseJson2.portfolio[responseJson2.portfolio.length - 13]?.assets)
                setLoading(false)
            }
            asyncFunc()

        } catch (error) {
            setLoading(false)
            toast.error("Sorry, our server is not working")
        }

    }, [])

    return (
        <div id='userPanelBackgroundWall' className='justify-center relative
         dark:bg-[#f7f7f7]
         min-h-[calc(100vh-140px)]
         '>
            {loading && <Spinner blur={true} />}
            <MainChart props={{ pieData, stackedAreaChart, data, data1y, portfolio1y, stackedAreaChart1Y, allAssets }} />
            <div className='assets-container flex justify-center items-center mt-20 mb-8'>
                <div className="table w-[80%]">
                    <AssetsTable tableData={tableData} tableLastYearData={tablelastYearData} />
                </div>
            </div>
            < EditOverlay />
            <ToastContainer />

        </div>)
}

export default UserPanel
