import { useSelector } from "react-redux"
import { useState, useEffect } from "react"
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Input, InputAdornment } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { setClickOverlay } from "../state";
import { useDispatch } from "react-redux";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
type AssetReport = {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

function sortDataByQuantityPrice(data: any) {
    data.sort((a: AssetReport, b: AssetReport) => b.quantity * b.price - a.quantity * a.price);
    return data
}

const EditOverlay = () => {
    const overlay = useSelector((state: any) => state.overlay)

    const isDarkTheme = useSelector((state: any) => state.isDarkTheme)
    const [data, setData] = useState<any>(false)
    const [trigger, setTrigger] = useState<boolean>(true)
    const user = useSelector((state: any) => state.user)
    const token = useSelector((state: any) => state.token)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        try {
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
                setData(sortDataByQuantityPrice(responseJson.pop().assets))
            }
            asyncFunc()
        } catch (error) {
            toast.error("Sorry, our server is not working")
        }

    }, [])

    const handleSave = async (data: any) => {
        try {
            const sendReport = await fetch(
                `${import.meta.env.VITE_PROJECT_BASE_URL}/user/${user._id}/report`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ report: data })
                }
            )
            const response = await sendReport.json();
            console.log(response)
            if (response.statusText === 'Bad Request') {
                toast.error(`Can't connect to server, sorry!`)
            } else {
                toast.success('Successfully submitted!')
            }
        } catch (error) {
            toast.error("Can't connect to server, sorry!")
        }

    }
    const deleteItem = (row: any) => {
        setData((prev: any) => prev.filter(function (data: any) {
            return row.id !== data.id
        }))
    }

    const addEmptySpace = () => {
        setTrigger(prev => !prev)
        setData((prev: any) => [...prev, { id: uuidv4(), name: "Asset", quantity: 1, price: 1 }])
        setTrigger(prev => !prev)
    }



    function tableColour(index: number) {
        return (1 + index) % 2 === 0 ? '#889fc2' : '#aab3c8'
    }

    const handleChangeName = (e: any, row: any) => {
        const updatedItem = { ...row, name: e.target.value }
        setData((prevData: any) => {
            const updatedData = prevData.map((item: any) => {
                if (item.id === row.id) {
                    return updatedItem;
                } else {
                    return item;
                }
            });
            return updatedData;
        })
    }

    const handleChangeQuantity = (e: any, row: any) => {
        const updatedItem = { ...row, quantity: e.target.value * 1 }
        setData((prevData: any) => {
            const updatedData = prevData.map((item: any) => {
                if (item.id === row.id) {
                    return updatedItem;
                } else {
                    return item;
                }
            });
            return updatedData;
        })
    }

    const handleChangePrice = (e: any, row: any) => {
        const updatedItem = { ...row, price: e.target.value * 1 }
        setData((prevData: any) => {
            const updatedData = prevData.map((item: any) => {
                if (item.id === row.id) {
                    return updatedItem;
                } else {
                    return item;
                }
            });
            return updatedData;
        })
    }

    const submitFunc =  async() => {
        await handleSave(data)
        dispatch(setClickOverlay())
        window.location.reload()
    }

    return (
        trigger && data && (<div className={`absolute bottom-0 left-0 h-full w-full 
        flex justify-center items-center 
        bg-[rgba(0,0,0,0.3)] ${overlay && 'hidden'}`
        } onClick={() => dispatch(setClickOverlay())}>
            <div className="bg-white w-full sm:w-[80%] md:w-[60%] lg:w-[45%] p-6 rounded-3xl" id='editOverlay' onClick={e => e.stopPropagation()}>
                <div className="font-extralight text-2xl text-center mb-6">Edit Portfolio</div>
                <div>
                    <TableContainer component={Paper} className="max-h-[650px] overflow-auto "
                    >
                        <Table aria-label="simple table">
                            <TableHead sx={{ background: 'rgba(213,213,213,0.5)' }} className="dark:bg-strongblue">
                                <TableRow className="[&>*]:dark:text-white [&>*]:dark:border-0 ">
                                    <TableCell>Name</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody >
                                {data.map((row: any, index: any) => (
                                    <TableRow key={index}
                                        sx={{ backgroundColor: isDarkTheme ? tableColour(index) : '' }}
                                    className="[&>*]:dark:border-b-[gray] ">
                                        <TableCell><TextField className='darkTextFields'
                                            id={`${index}_name`} variant="standard" defaultValue={row.name} onChange={(e) => handleChangeName(e, row)}></TextField></TableCell>
                                        <TableCell><TextField className='darkTextFields' id={`${index}_quantity`} size='small' variant='standard' type='number' defaultValue={row.quantity} onChange={(e) => handleChangeQuantity(e, row)}></TextField></TableCell>
                                        <TableCell><Input className='darkTextFields' id={`${index}_price`} type='number' startAdornment={<InputAdornment position='start'>$</InputAdornment>} defaultValue={row.price} onChange={(e) => handleChangePrice(e, row)}></Input></TableCell>
                                        <TableCell>
                                            <Button onClick={() => deleteItem(row)}>
                                                {isDarkTheme
                                                    ? <RemoveCircleOutlineIcon className="bg-red text-white rounded-full" />
                                                    : <CloseIcon />
                                                }</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="dark:bg-mediumblue  [&>*]:dark:border-b-[gray]">
                                    <TableCell><TextField className='darkTextFields' disabled value='Name' size='small' variant="standard" ></TextField></TableCell>
                                    <TableCell><TextField className='darkTextFields' disabled value='Quantity' size='small' variant='standard' ></TextField></TableCell>
                                    <TableCell><TextField className='darkTextFields' disabled value='$ Price' size='small' variant='standard' ></TextField></TableCell>
                                    <TableCell><Button sx={{
                                        background: '#547fa9',
                                        "&:hover": { background: "#302c29" }
                                    }} onClick={() => addEmptySpace()}
                                        className="dark:bg-blue hover:dark:bg-darkblue"
                                        variant='contained'><AddCircleOutlineIcon /></Button></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer >
                    <div className="flex justify-center">
                        <Button size='large' sx={{
                            background: '#547fa9', color: '#fff',
                            "&:hover": { background: "#302c29" }, width: '35%', mt: '3px'
                        }} onClick={submitFunc}
                            className="dark:text-white dark:border-8 dark:border-darkgreen dark:bg-strongblue dark:rounded-md dark:max-w-[8rem] dark:font-black dark:text-lg dark:text-center tracking-wider">Submit</Button></div>
                    <ToastContainer />
                </div>

            </div>
        </div >)

    )
}

export default EditOverlay

