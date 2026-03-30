import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Input, InputAdornment,
    Select, MenuItem, FormControl, Box, IconButton, Typography, Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { setClickOverlay, setTags } from "../state";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import classNames from "classnames";
import { useNavigate } from "react-router-dom";

type Tag = {
    _id: string;
    name: string;
    options: any[];
}

type AssetReport = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    tags?: { [tagId: string]: string };
}

function sortDataByQuantityPrice(data: any) {
    data.sort((a: AssetReport, b: AssetReport) => b.quantity * b.price - a.quantity * a.price);
    return data
}

const EditOverlay = () => {
    const overlay = useSelector((state: any) => state.overlay)
    const isDarkTheme = useSelector((state: any) => state.isDarkTheme)
    const tags = useSelector((state: any) => state.tags)
    const [data, setData] = useState<AssetReport[]>([])
    const [trigger, setTrigger] = useState<boolean>(true)
    const [newTagName, setNewTagName] = useState("")
    const [newOptionName, setNewOptionName] = useState<{ [tagId: string]: string }>({})
    const [view, setView] = useState<"portfolio" | "tags">("portfolio")
    
    const user = useSelector((state: any) => state.user)
    const token = useSelector((state: any) => state.token)
    const dispatch = useDispatch()

    const fetchTags = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/tags`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            })
            const fetchedTags = await response.json()
            if (Array.isArray(fetchedTags)) {
                dispatch(setTags({ tags: fetchedTags }))
            } else {
                dispatch(setTags({ tags: [] }))
            }
        } catch (error) {
            console.error("Failed to fetch tags", error)
            dispatch(setTags({ tags: [] }))
        }
    }

    useEffect(() => {
        const asyncFunc = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/user/${user._id}/portfolio`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                const responseJson = await response.json()
                const lastPortfolio = responseJson.pop()
                if (lastPortfolio && lastPortfolio.assets) {
                    setData(sortDataByQuantityPrice(lastPortfolio.assets))
                }
                await fetchTags()
            } catch (error) {
                toast.error("Sorry, our server is not working")
            }
        }
        asyncFunc()
    }, [])

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return
        try {
            const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/tags`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newTagName })
            })
            const updatedTags = await response.json()
            if (Array.isArray(updatedTags)) {
                dispatch(setTags({ tags: updatedTags }))
            }
            setNewTagName("")
            toast.success("New tag created!")
        } catch (error) {
            toast.error("Failed to create tag")
        }
    }

    const handleAddOption = async (tagId: string) => {
        const optionName = newOptionName[tagId]
        if (!optionName?.trim()) return
        try {
            const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/tags/${tagId}/option`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: optionName })
            })
            const updatedTags = await response.json()
            if (Array.isArray(updatedTags)) {
                dispatch(setTags({ tags: updatedTags }))
            }
            setNewOptionName(prev => ({ ...prev, [tagId]: "" }))
            toast.success("Option added!")
        } catch (error) {
            toast.error("Failed to add option")
        }
    }

    const handleRenameOption = async (optionId: string, newName: string) => {
        if (!newName.trim()) return
        try {
            const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/tags/option/${optionId}/rename`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newName })
            })
            const updatedTags = await response.json()
            if (Array.isArray(updatedTags)) {
                dispatch(setTags({ tags: updatedTags }))
            }
            toast.success("Option renamed!")
        } catch (error) {
            toast.error("Failed to rename option")
        }
    }

    const handleDeleteOption = async (optionId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/tags/option/${optionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })
            const updatedTags = await response.json()
            if (Array.isArray(updatedTags)) {
                dispatch(setTags({ tags: updatedTags }))
            }
            toast.success("Option deleted!")
        } catch (error) {
            toast.error("Failed to delete option")
        }
    }

    const handleRenameTag = async (tagId: string, newName: string) => {
        if (!newName.trim()) return
        try {
            const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/tags/${tagId}/rename`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newName })
            })
            const updatedTags = await response.json()
            if (Array.isArray(updatedTags)) {
                dispatch(setTags({ tags: updatedTags }))
            }
            toast.success("Tag renamed!")
        } catch (error) {
            toast.error("Failed to rename tag")
        }
    }

    const handleDeleteTag = async (tagId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/tags/${tagId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })
            const updatedTags = await response.json()
            if (Array.isArray(updatedTags)) {
                dispatch(setTags({ tags: updatedTags }))
            }
            toast.success("Tag deleted!")
        } catch (error) {
            toast.error("Failed to delete tag")
        }
    }

    const handleSave = async (data: any) => {
        try {
            const sendReport = await fetch(
                `${import.meta.env.VITE_PROJECT_BASE_URL}/user/${user._id}/report`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ report: data })
                }
            )
            const response = await sendReport.json();
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
        const temp = data.filter((item: any) => item.id !== row.id)
        setData(temp)
    }

    const addEmptySpace = () => {
        setData((prev: any) => [...prev, { id: uuidv4(), name: "Asset", quantity: 1, price: 1, tags: {} }])
    }

    function tableColour(index: number) {
        return (1 + index) % 2 === 0 ? '#889fc2' : '#aab3c8'
    }

    const handleChangeAsset = (id: string, field: string, value: any) => {
        setData((prevData: any) =>
            prevData.map((item: any) => (item.id === id ? { ...item, [field]: value } : item))
        )
    }

    const handleChangeName = (e: any, row: any) => {
        handleChangeAsset(row.id, 'name', e.target.value)
    }
    const handleChangeQuantity = (e: any, row: any) => {
        handleChangeAsset(row.id, 'quantity', Number(e.target.value))
    }
    const handleChangePrice = (e: any, row: any) => {
        handleChangeAsset(row.id, 'price', Number(e.target.value))
    }

    const handleChangeAssetTag = (id: string, tagId: string, value: string) => {
        setData((prevData: any) =>
            prevData.map((item: any) => {
                if (item.id === id) {
                    const updatedTags = { ...(item.tags || {}), [tagId]: value };
                    return { ...item, tags: updatedTags };
                }
                return item;
            })
        )
    }

    const submitFunc = async () => {
        await handleSave(data)
        dispatch(setClickOverlay())
        window.location.reload()
    }

    const safeTags = Array.isArray(tags) ? tags : [];

    return (
        trigger && data && (<div className={`fixed top-0 left-0 h-screen w-screen 
        flex justify-center items-start pt-20 z-[1200]
        bg-[rgba(0,0,0,0.4)] ${overlay && 'hidden'}`
        } onClick={() => dispatch(setClickOverlay())}>
            <div className="bg-white w-full sm:w-[90%] md:w-[80%] lg:w-[60%] p-6 rounded-3xl" id='editOverlay' onClick={e => e.stopPropagation()}>
                <div className="font-extralight text-2xl text-center mb-6">Edit Portfolio</div>
                
                <div className="flex justify-center gap-4 mb-4">
                    <Button 
                        onClick={() => setView("portfolio")} 
                        variant={view === "portfolio" ? "contained" : "outlined"}
                        sx={{ borderRadius: '20px' }}
                    >
                        Portfolio
                    </Button>
                    <Button 
                        onClick={() => setView("tags")} 
                        variant={view === "tags" ? "contained" : "outlined"}
                        sx={{ borderRadius: '20px' }}
                    >
                        Tags
                    </Button>
                </div>

                {view === "portfolio" ? (
                    <div>
                        <TableContainer component={Paper} className="max-h-[650px] overflow-auto"
                        >
                            <Table aria-label="simple table">
                                <TableHead sx={{ background: 'rgba(213,213,213,0.5)' }} className="dark:bg-strongblue">
                                    <TableRow className="[&>*]:dark:text-white [&>*]:dark:border-0 ">
                                        <TableCell>Name</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Price</TableCell>
                                        {safeTags.map((tag: any) => (
                                            <TableCell key={tag._id}>{tag.name}</TableCell>
                                        ))}
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
                                            
                                            {safeTags.map((tag: any) => (
                                                <TableCell key={tag._id}>
                                                    <Select
                                                        value={row.tags?.[tag._id] || ""}
                                                        onChange={(e) => handleChangeAssetTag(row.id, tag._id, e.target.value as string)}
                                                        variant="standard"
                                                        size="small"
                                                        fullWidth
                                                        className="darkTextFields"
                                                    >
                                                        <MenuItem value=""><em>None</em></MenuItem>
                                                        {tag.options?.map((option: any) => (
                                                            <MenuItem key={option._id} value={option._id}>{option.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </TableCell>
                                            ))}

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
                                        {safeTags.map((tag: any) => (
                                            <TableCell key={tag._id}><TextField className='darkTextFields' disabled value={tag.name} size='small' variant='standard' ></TextField></TableCell>
                                        ))}
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
                                "&:hover": { background: "#302c29" }, width: '35%', mt: '10px'
                            }} onClick={submitFunc}
                                className="dark:text-white dark:border-8 dark:border-darkgreen dark:bg-strongblue dark:rounded-md dark:max-w-[8rem] dark:font-black dark:text-lg dark:text-center tracking-wider">Submit</Button></div>
                    </div>
                ) : (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Manage Tags</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <TextField
                                label="New Tag Name"
                                variant="outlined"
                                size="small"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" onClick={handleCreateTag} startIcon={<AddCircleOutlineIcon />}>
                                Create
                            </Button>
                        </Box>
                        <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {safeTags.map((tag: any) => (
                                <Accordion key={tag._id} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                                            <TextField
                                                variant="standard"
                                                defaultValue={tag.name}
                                                onClick={(e) => e.stopPropagation()}
                                                onBlur={(e) => handleRenameTag(tag._id, (e.target as HTMLInputElement).value)}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag._id); }} color="error">
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <TextField
                                                size="small"
                                                label="New Option"
                                                value={newOptionName[tag._id] || ""}
                                                onChange={(e) => setNewOptionName(prev => ({ ...prev, [tag._id]: e.target.value }))}
                                            />
                                            <IconButton onClick={() => handleAddOption(tag._id)} color="primary">
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {tag.options && tag.options.map((option: any) => (
                                                <Paper key={option._id} variant="outlined" sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TextField
                                                        variant="standard"
                                                        defaultValue={option.name}
                                                        onBlur={(e) => handleRenameOption(option._id, (e.target as HTMLInputElement).value)}
                                                        sx={{ width: 80 }}
                                                        InputProps={{ disableUnderline: true }}
                                                    />
                                                    <IconButton size="small" onClick={() => handleDeleteOption(option._id)}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Paper>
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </Box>
                )}
                <ToastContainer theme={isDarkTheme ? "dark" : "light"} />
            </div>
        </div >)
    )
}

export default EditOverlay
