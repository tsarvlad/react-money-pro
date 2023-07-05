import React from 'react'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MainChart from '../scenes/MainChart'
import AssetsTable from '../scenes/AssetsTable'
import EditOverlay from './EditOverlay'
import { ToastContainer, toast } from 'react-toastify'
import Spinner from '../scenes/Spinner'
import Footer from '../components/Footer'
import { useParams } from 'react-router-dom'
import { Avatar } from '@mui/material'



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

const PublicProfile = () => {
    const { id } = useParams()
    const token = useSelector((state: any) => state.token)



    const [loading, setLoading] = useState<boolean>(false)
    const [user, setUser] = useState<any>({ portfolio: [{ time: '30/12/2005' }], createdAt: '30/12/2005' })
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
                const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/user/${id}/portfolio`,
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
                const response2 = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/user/${id}/chartdata`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                const responseJson2 = await response2.json()
                setUser(responseJson2.user)
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
        <div id='profilePage' className='flex flex-col  w-full justify-between min-h-[calc(100vh-140px)]
         [&>*]:w-full [&>*]:p-8 [&>*]:rounded-xl
        relative
         dark:bg-[#f7f7f7]
        '>
            {loading && <Spinner blur={true} />}
            <div>
                <div className='flex items-center justify-center'>
                    <div className="bg-white dark:bg-darkblue dark:bg-opacity-10 rounded-lg shadow-lg p-6 w-[80%]">
                        <div className="flex items-center mb-6">
                            <div className="w-32 rounded-full overflow-hidden">
                                <img src={user.picturePath} alt="Profile Image" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                                <p className="text-gray-600">Registered: {new Date(user.createdAt).toLocaleDateString('en-GB')
                                }</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <p className="text-green-500 ml-2">Member since: {new Date(user.portfolio[0].time).toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>
                </div>
                <div className='mb-5'>
                    <div>
                        <MainChart props={{ pieData, stackedAreaChart, data, data1y, portfolio1y, stackedAreaChart1Y, allAssets }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicProfile
