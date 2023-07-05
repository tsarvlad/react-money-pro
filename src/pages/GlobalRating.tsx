import * as React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Avatar, } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import UserPanel from './UserPanel';
import Spinner from '../scenes/Spinner';
import useMediaQuery from '@mui/material/useMediaQuery';



const displayChange1Y = (number: number, withDollar: boolean) => {
    let string = Math.abs(number).toLocaleString('en-GB')
    return withDollar
        ? number > 0 ? `+$${string}` : `-$${string}`
        : number > 0 ? `+${string}%` : `-${string}%`
}


function ticker(sign: boolean) {
    let positivestring = `w-full whitespace-nowrap text-center text-green text-lg dark:text-white dark:border-2 dark:border-darkgreen dark:bg-green dark:rounded-md dark:max-w-[12rem] dark:font-black dark:text-lg dark:text-center`
    let negativestring = `w-full whitespace-nowrap text-center text-red text-lg dark:text-white dark:border-2 dark:border-darkred dark:bg-red dark:rounded-md dark:max-w-[12rem] dark:font-black dark:text-lg dark:text-center`
    return sign ? positivestring : negativestring
}

function pecentrageTicker(sign: boolean) {
    let positivestring = 'w-full whitespace-nowrap text-center text-lg text-green'
    let negativestring = 'w-full whitespace-nowrap text-center text-lg text-red'
    return sign ? positivestring : negativestring
}

const columns: GridColDef[] = [

    {
        field: 'index',
        headerName: 'Power',
        width: 70,
        align: 'center',
        headerAlign: 'center',
        disableColumnMenu: true,
        renderCell: (params: any) => {
            return (
                <>
                    <div className='text-sm'>{params.value}</div >
                </>
            )
        }
    },
    {
        field: 'picturePath', headerName: "", width: 70, sortable: false,
        renderCell: (params: any) => {
            return (
                <Link className="hover:opacity-75" to={`/global/${params.row.id}`}>
                    <Avatar src={params.value}></Avatar>
                </Link>
            )
        }
    },
    {
        field: 'fullName',
        headerName: 'Full name',
        disableColumnMenu: true,
        sortable: false,
        align: 'left',
        headerAlign: 'center',
        width: 200,
        renderCell: (params: any) => {
            return (
                <>
                    <Link to={`/global/${params.row.id}`}>
                        <div className='text-lg font-medium hover:text-sky'>{params.row.firstName} {params.row.lastName}</div >
                    </Link>
                </>
            )
        }
        // valueGetter: (params: GridValueGetterParams) =>
        //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    },

    {
        field: 'value',
        headerName: 'Net Worth',
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        width: 300,
        renderCell: (params: any) => {
            return (
                <>
                    <div className='font-extrabold text-xl'>${params.value.toLocaleString('en-GB')}</div>
                </>
            )
        }
    },
    {
        field: 'change',
        headerName: 'Change 1Y',
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        width: 200,
        renderCell: (params: any) => {
            return (
                <>
                    <div className={`font-bold ${ticker(Boolean(params.value > 0))} text-[${params.value > 0 ? `#85bb65` : `#aa381e`}]`}>{displayChange1Y(params.value, true)}</div >
                </>
            )
        }
    },
    {
        field: 'percentage',
        headerName: '%',
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        width: 100,
        renderCell: (params: any) => {
            return (
                <>
                    <div className={`font-bold ${pecentrageTicker(Boolean(params.value > 0))} text-[${params.value > 0 ? `#85bb65` : `#aa381e`}]`}>{displayChange1Y(params.value, false)}</div >
                </>
            )
        }
    },
];

const tabletColumns: GridColDef[] = [
        {
            field: 'index',
            headerName: 'Power',
            width: 70,
            align: 'center',
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params: any) => {
                return (
                    <>
                        <div className='text-sm'>{params.value}</div >
                    </>
                )
            }
        },
        {
            field: 'picturePath', headerName: "", width: 70, sortable: false,
            renderCell: (params: any) => {
                return (
                    <Link className="hover:opacity-75" to={`/global/${params.row.id}`}>
                        <Avatar src={params.value}></Avatar>
                    </Link>
                )
            }
        },
        {
            field: 'fullName',
            headerName: 'Full name',
            disableColumnMenu: true,
            sortable: false,
            align: 'left',
            headerAlign: 'center',
            width: 180,
            renderCell: (params: any) => {
                return (
                    <>
                        <Link to={`/global/${params.row.id}`}>
                            <div className='text-lg font-medium hover:text-sky'>{params.row.firstName} {params.row.lastName}</div >
                        </Link>
                    </>
                )
            }
            // valueGetter: (params: GridValueGetterParams) =>
            //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
        },
    
        {
            field: 'value',
            headerName: 'Net Worth',
            type: 'number',
            align: 'center',
            headerAlign: 'center',
            width: 250,
            renderCell: (params: any) => {
                return (
                    <>
                        <div className='font-extrabold text-xl'>${params.value.toLocaleString('en-GB')}</div>
                    </>
                )
            }
        },
        
]

const laptopColumns: GridColDef[] = [
    {
        field: 'index',
        headerName: 'Power',
        width: 70,
        align: 'center',
        headerAlign: 'center',
        disableColumnMenu: true,
        renderCell: (params: any) => {
            return (
                <>
                    <div className='text-sm'>{params.value}</div >
                </>
            )
        }
    },
    {
        field: 'picturePath', headerName: "", width: 70, sortable: false,
        renderCell: (params: any) => {
            return (
                <Link className="hover:opacity-75" to={`/global/${params.row.id}`}>
                    <Avatar src={params.value}></Avatar>
                </Link>
            )
        }
    },
    {
        field: 'fullName',
        headerName: 'Full name',
        disableColumnMenu: true,
        sortable: false,
        align: 'left',
        headerAlign: 'center',
        width: 180,
        renderCell: (params: any) => {
            return (
                <>
                    <Link to={`/global/${params.row.id}`}>
                        <div className='text-lg font-medium hover:text-sky'>{params.row.firstName} {params.row.lastName}</div >
                    </Link>
                </>
            )
        }
        // valueGetter: (params: GridValueGetterParams) =>
        //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    },

    {
        field: 'value',
        headerName: 'Net Worth',
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        width: 250,
        renderCell: (params: any) => {
            return (
                <>
                    <div className='font-extrabold text-xl'>${params.value.toLocaleString('en-GB')}</div>
                </>
            )
        }
    },
    {
        field: 'change',
        headerName: 'Change 1Y',
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        width: 200,
        renderCell: (params: any) => {
            return (
                <>
                    <div className={`font-bold ${ticker(Boolean(params.value > 0))} text-[${params.value > 0 ? `#85bb65` : `#aa381e`}]`}>{displayChange1Y(params.value, true)}</div >
                </>
            )
        }
    },
    
]

const mobileColumns: GridColDef[] = [
    {
        field: 'index',
        headerName: 'Power',
        width: 70,
        align: 'center',
        headerAlign: 'center',
        disableColumnMenu: true,
        renderCell: (params: any) => {
            return (
                <>
                    <div className='text-sm'>{params.value}</div >
                </>
            )
        }
    },
    {
        field: 'picturePath', headerName: "", width: 70, sortable: false,
        renderCell: (params: any) => {
            return (
                <Link className="hover:opacity-75" to={`/global/${params.row.id}`}>
                    <Avatar src={params.value}></Avatar>
                </Link>
            )
        }
    },
    {
        field: 'value',
        headerName: 'Net Worth',
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        width: 200,
        renderCell: (params: any) => {
            return (
                <>
                    <div className='font-extrabold text-xl'>${params.value.toLocaleString('en-GB')}</div>
                </>
            )
        }
    },
]


export default function DataTable() {
    const isMobileScreen: boolean = !useMediaQuery('(min-width: 580px)')
    const isTabletScreen: boolean = !useMediaQuery('(min-width: 780px)')
    const isLaptopScreen: boolean = !useMediaQuery('(min-width: 960px)')
    const [id, index, lastName, firstName, value, picturePath, change, percentage] = [0, 1, 'Oistrkh', 'Heifetz', 100_000, 'https://res.cloudinary.com/dblahw3li/image/upload/v1681108691/Portfolio/pozf2pz73iclr4pdt2il.jpg', 1, 1000]
    const [data, setData] = React.useState(
        [
            // { id: id, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 1, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 2, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 3, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 4, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 5, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 6, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 7, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 8, index, lastName, firstName, value, picturePath, change, percentage },
            // { id: id + 9, index, lastName, firstName, value, picturePath, change, percentage },
        ]
    )
    const [loading, setLoading] = React.useState<boolean>(false)
    const [sortModel, setSortModel] = React.useState<any>([{ field: 'value', sort: 'desc' }])
    const token = useSelector((state: any) => state.token)
    React.useEffect(() => {
        try {
            const asyncFetch = async () => {
                setLoading(true)
                const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/user/stats`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                )
                const responseJson = await response.json()
                setData(responseJson)
                setLoading(false)
            }
            asyncFetch()
        } catch (error) {
            setLoading(false)
        }
    }, [])

    const displayType = (mobile:boolean,tablet:boolean,mobilec:GridColDef[],tabletc:GridColDef[],c:GridColDef[]): any => {
        if (mobile) {
            return mobilec
        }
        else if (tablet) {
            return tabletc
        }
        else return c
    }
    
    return (
        <div id='globalWall' className='min-h-[calc(100vh-140px)]'>
            {loading && <Spinner blur={true} />}
            <div className="mt-11 w-full text-center text-3xl font-thin">The Power Players</div>
            <div className='flex justify-center'>
                <div className="mt-5" style={{ height: 631, width: 942 }}>
                    <DataGrid
                        rows={data}
                        columns={
                            isMobileScreen ? mobileColumns 
                            : isTabletScreen ? tabletColumns 
                            : isLaptopScreen ? laptopColumns
                            : columns
                        }
                        autoPageSize={true}
                        sortModel={sortModel}
                        onSortModelChange={(model) => setSortModel(model)}
                        isRowSelectable={() => false}

                    />
                </div>
            </div>
        </div >
    );

}

