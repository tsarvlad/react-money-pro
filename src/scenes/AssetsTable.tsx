//@ts-nocheck
import { useEffect, useState } from 'react'
import { Table, Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, colors } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setClickOverlay } from '../state';
import useMediaQuery from '@mui/material/useMediaQuery';
import classNames from 'classnames';
const COLORS = {
    green: '#85bb65',
    red: '#aa381e'
}


type AssetReport = {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

type Props = {
    tableData: [AssetReport];
    tableLastYearData: [AssetReport];
}

function ticker(sign: string) {
    let positivestring = `text-green dark:text-white dark:border-2 dark:border-darkgreen dark:bg-green dark:rounded-md dark:max-w-[8rem] dark:font-black dark:text-lg dark:text-center whitespace-nowrap`
    let negativestring = `text-red dark:text-white dark:border-2 dark:border-darkred dark:bg-red dark:rounded-md dark:max-w-[8rem] dark:font-black dark:text-lg dark:text-center whitespace-nowrap`
    return sign ? positivestring : negativestring
}

function tableColour(index: number) {
    return (1 + index) % 2 === 0 ? '#889fc2' : '#aab3c8'
}

function calculatePercentage(data: any, value: number) {
    let sum = 0
    for (let asset of data) {
        sum += asset.quantity * asset.price
    }
    return (value / sum * 100).toFixed(2)
}

function calculateAnnualChange(data: AssetReport[], row: AssetReport) {
    let match = null
    let returnable = { value: "New Asset", sign: true }

    if (!data || !row) {
        return returnable
    }

    for (let asset of data) {
        if (asset.id === row.id || asset.name === row.name) {
            match = asset
            break
        }
    }
    if (match) {
        let [lastYear, today] = [match.quantity * match.price, row.quantity * row.price]
        if (today > lastYear) {
            const difference = today - lastYear
            const percentageChange = (difference / lastYear) * 100;
            returnable = {
                value: `+ $${Math.abs(Math.round(difference * 100) / 100).toLocaleString('en-GB')}`,
                sign: true
            };
        } else {
            const difference = lastYear - today;
            const percentageChange = (difference / lastYear) * 100;
            returnable = {
                value: `- $${Math.abs(Math.round(difference * 100) / 100)} `,
                sign: false
            };
        }
    }
    console.log(data, row)
    return returnable
}



const AssetsTable: React.FC<Props> = ({ tableData, tableLastYearData }) => {
    const isMobileScreen: Boolean = !useMediaQuery('(min-width: 600px)')
    const isDarkTheme = useSelector((state: any) => state.isDarkTheme)
    const dispatch = useDispatch()
    return (
        <>
            <div className='flex justify-center mb-2'>
                <div className='flex flex-row justify-between w-[98%]'>
                    <div className='text-xl dark:text-[#010101]'>Your Assets</div>
                    <Button sx={{ background: '#547fa9', "&:hover": { background: '#302c29', } }} size='medium' variant='contained' onClick={() => dispatch(setClickOverlay())}
                        className='dark:bg-mediumblue
                        '>Edit</Button>
                </div>

            </div>
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead sx={{ background: 'rgba(213,213,213,0.5)' }} className='dark:bg-strongblue'>
                        <TableRow className='[&>*]:dark:text-lightblue [&>*]:dark:font-bold [&>*]:dark:text-sm'>
                            <TableCell>Name</TableCell>
                            {isMobileScreen ? '' : <>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Price</TableCell>
                            </>}
                            <TableCell>Value</TableCell>
                            {isMobileScreen ? '' : <>
                                <TableCell>% of portfolio</TableCell>
                            </>}

                            <TableCell>Annual change</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row, index) => (
                            <TableRow key={index} className={
                                classNames(
                                    '[&>*]:dark:text-white',
                                    '[&>*]:dark:text-lg',
                                    '[&>*]:dark:font-semibold',
                                )}
                                sx={{
                                    backgroundColor: isDarkTheme ? tableColour(index) : ''
                                }}
                            >
                                <TableCell>{row.name}</TableCell>
                                {isMobileScreen ? '' : <>
                                    <TableCell>{row.quantity.toLocaleString('en-GB')}</TableCell>
                                    <TableCell>{row.price}</TableCell>
                                </>}
                                <TableCell>${Math.round(row.price * row.quantity).toLocaleString('en-GB')}</TableCell>
                                {isMobileScreen ? '' : <>
                                    <TableCell>{calculatePercentage(tableData, row.price * row.quantity)}%</TableCell>
                                </>}
                                <TableCell>
                                    <Typography className={ticker(calculateAnnualChange(tableLastYearData, row)?.sign)}>
                                        {calculateAnnualChange(tableLastYearData, row)?.value}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer >
            <ToastContainer />
        </>
    )
}

export default AssetsTable
