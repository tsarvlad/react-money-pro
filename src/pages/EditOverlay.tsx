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
    const [expandedTag, setExpandedTag] = useState<string | null>(null)
    const [editingTagId, setEditingTagId] = useState<string | null>(null)
    const [editingTagValue, setEditingTagValue] = useState("")
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null)
    const [editingOptionValue, setEditingOptionValue] = useState("")
    
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
            if (!response.ok) throw new Error("Server error")
            const updatedTags = await response.json()
            if (Array.isArray(updatedTags)) {
                dispatch(setTags({ tags: updatedTags }))
                setNewOptionName(prev => ({ ...prev, [tagId]: "" }))
                toast.success("Option added!")
            } else {
                toast.error("Failed to add option")
            }
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
        bg-[rgba(0,0,0,0.6)] ${overlay && 'hidden'}`
        } onClick={() => dispatch(setClickOverlay())}>
            <div
                id='editOverlay'
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%)',
                    borderRadius: '18px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.9)',
                    border: '1px solid #888',
                    padding: '0',
                    overflow: 'hidden',
                }}
                className="w-full sm:w-[90%] md:w-[80%] lg:w-[60%]"
            >
                {/* iOS 6 chrome title bar */}
                <div style={{
                    background: 'linear-gradient(180deg, #6e6e6e 0%, #4a4a4a 45%, #3a3a3a 50%, #525252 100%)',
                    padding: '14px 20px 12px',
                    borderBottom: '1px solid #222',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <span style={{
                        color: '#fff',
                        fontSize: '17px',
                        fontWeight: '700',
                        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                        letterSpacing: '0.5px',
                        textShadow: '0 -1px 0 rgba(0,0,0,0.6)',
                    }}>Edit Portfolio</span>
                </div>

                <div style={{ padding: '16px 24px 20px' }}>
                {/* iOS 6 segmented control */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '16px',
                }}>
                    <div style={{
                        display: 'inline-flex',
                        borderRadius: '9px',
                        border: '1px solid #4a7abf',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}>
                        {(['portfolio', 'tags'] as const).map((tab, i) => {
                            const active = view === tab
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setView(tab)}
                                    style={{
                                        padding: '7px 28px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                                        letterSpacing: '0.3px',
                                        border: 'none',
                                        borderLeft: i > 0 ? '1px solid #4a7abf' : 'none',
                                        cursor: 'pointer',
                                        textShadow: active ? '0 -1px 0 rgba(0,0,0,0.4)' : '0 1px 0 rgba(255,255,255,0.7)',
                                        color: active ? '#fff' : '#2a5a9f',
                                        background: active
                                            ? 'linear-gradient(180deg, #5b9bd5 0%, #3a7abf 45%, #2d6aaf 50%, #4a8fd0 100%)'
                                            : 'linear-gradient(180deg, #fafafa 0%, #e8e8e8 45%, #d8d8d8 50%, #efefef 100%)',
                                        transition: 'none',
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            )
                        })}
                    </div>
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
                                                        value={row.tags?.[tag._id] ?? ""}
                                                        onChange={(e) => handleChangeAssetTag(row.id, tag._id, e.target.value as string)}
                                                        variant="standard"
                                                        size="small"
                                                        fullWidth
                                                        displayEmpty
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
                    <div style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>

                        {/* "Manage Tags" section label */}
                        <div style={{
                            textTransform: 'uppercase',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#555',
                            letterSpacing: '0.8px',
                            marginBottom: '6px',
                            paddingLeft: '6px',
                            textShadow: '0 1px 0 rgba(255,255,255,0.8)',
                        }}>Manage Tags</div>

                        {/* Create tag row — iOS 6 inset grouped input */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '18px',
                            alignItems: 'center',
                        }}>
                            <input
                                placeholder="New tag name"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleCreateTag() }}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    borderRadius: '8px',
                                    border: '1px solid #aaa',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), inset 0 1px 2px rgba(0,0,0,0.1)',
                                    background: 'linear-gradient(180deg, #e2e2e2 0%, #f5f5f5 100%)',
                                    outline: 'none',
                                    color: '#222',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <button
                                onClick={handleCreateTag}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    borderRadius: '8px',
                                    border: '1px solid #2a6099',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    background: 'linear-gradient(180deg, #5b9bd5 0%, #3a7abf 45%, #2d6aaf 50%, #4a8fd0 100%)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                                    textShadow: '0 -1px 0 rgba(0,0,0,0.4)',
                                    letterSpacing: '0.2px',
                                    whiteSpace: 'nowrap',
                                    fontFamily: 'inherit',
                                }}
                            >
                                Create
                            </button>
                        </div>

                        {/* Tags list */}
                        <div style={{ maxHeight: '460px', overflowY: 'auto', paddingRight: '2px' }}>
                            {safeTags.map((tag: any) => {
                                const isOpen = expandedTag === tag._id
                                const isEditingTag = editingTagId === tag._id
                                return (
                                    <div key={tag._id} style={{ marginBottom: '8px' }}>

                                        {/* Tag row header */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 12px',
                                                borderRadius: isOpen ? '10px 10px 0 0' : '10px',
                                                background: 'linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%)',
                                                border: '1px solid #aaa',
                                                borderBottom: isOpen ? '1px solid #bbb' : '1px solid #aaa',
                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 3px rgba(0,0,0,0.15)',
                                                cursor: isEditingTag ? 'default' : 'pointer',
                                            }}
                                            onClick={() => { if (!isEditingTag) setExpandedTag(isOpen ? null : tag._id) }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                                {/* Chevron */}
                                                {!isEditingTag && (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        width: '14px',
                                                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s ease',
                                                        color: '#666',
                                                        fontSize: '12px',
                                                        userSelect: 'none',
                                                        flexShrink: 0,
                                                    }}>▶</span>
                                                )}

                                                {isEditingTag ? (
                                                    /* ── Edit mode ── */
                                                    <input
                                                        autoFocus
                                                        value={editingTagValue}
                                                        onChange={(e) => setEditingTagValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") { handleRenameTag(tag._id, editingTagValue); setEditingTagId(null) }
                                                            if (e.key === "Escape") setEditingTagId(null)
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            flex: 1,
                                                            padding: '4px 8px',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            borderRadius: '6px',
                                                            border: '1px solid #4a7abf',
                                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                                                            background: 'linear-gradient(180deg, #e0e8f5 0%, #f0f4fb 100%)',
                                                            outline: 'none',
                                                            color: '#222',
                                                            fontFamily: 'inherit',
                                                        }}
                                                    />
                                                ) : (
                                                    /* ── View mode ── */
                                                    <span style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#222',
                                                        textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                                                        flex: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}>{tag.name}</span>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0, marginLeft: '8px' }} onClick={(e) => e.stopPropagation()}>
                                                {isEditingTag ? (
                                                    <>
                                                        {/* Confirm */}
                                                        <button
                                                            onClick={() => { handleRenameTag(tag._id, editingTagValue); setEditingTagId(null) }}
                                                            title="Confirm"
                                                            style={{
                                                                width: '26px', height: '26px', borderRadius: '50%',
                                                                border: '1px solid #2a7a00',
                                                                background: 'linear-gradient(180deg, #6dd46d 0%, #3aaa00 50%, #2a8800 100%)',
                                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 3px rgba(0,0,0,0.3)',
                                                                color: '#fff', fontSize: '14px', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontFamily: 'inherit',
                                                            }}
                                                        >✓</button>
                                                        {/* Cancel */}
                                                        <button
                                                            onClick={() => setEditingTagId(null)}
                                                            title="Cancel"
                                                            style={{
                                                                width: '26px', height: '26px', borderRadius: '50%',
                                                                border: '1px solid #888',
                                                                background: 'linear-gradient(180deg, #ddd 0%, #aaa 100%)',
                                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.2)',
                                                                color: '#444', fontSize: '14px', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontFamily: 'inherit',
                                                            }}
                                                        >✕</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* Pencil */}
                                                        <button
                                                            onClick={() => { setEditingTagId(tag._id); setEditingTagValue(tag.name) }}
                                                            title="Rename"
                                                            style={{
                                                                width: '26px', height: '26px', borderRadius: '50%',
                                                                border: '1px solid #888',
                                                                background: 'linear-gradient(180deg, #f5f5f5 0%, #d5d5d5 100%)',
                                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 3px rgba(0,0,0,0.2)',
                                                                color: '#444', fontSize: '13px', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontFamily: 'inherit',
                                                            }}
                                                        >✎</button>
                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => handleDeleteTag(tag._id)}
                                                            title="Delete"
                                                            style={{
                                                                width: '26px', height: '26px', borderRadius: '50%',
                                                                border: '1px solid #a00',
                                                                background: 'linear-gradient(180deg, #f55 0%, #c00 50%, #a00 100%)',
                                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.3)',
                                                                color: '#fff', fontSize: '15px', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontFamily: 'inherit',
                                                            }}
                                                        >×</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded panel */}
                                        {isOpen && (
                                            <div style={{
                                                border: '1px solid #aaa',
                                                borderTop: 'none',
                                                borderRadius: '0 0 10px 10px',
                                                background: 'linear-gradient(180deg, #e8e8e8 0%, #f2f2f2 100%)',
                                                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1), 0 2px 3px rgba(0,0,0,0.12)',
                                                padding: '12px',
                                            }}>
                                                {/* Add option row */}
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                                                    <input
                                                        placeholder="New option"
                                                        value={newOptionName[tag._id] || ""}
                                                        onChange={(e) => setNewOptionName(prev => ({ ...prev, [tag._id]: e.target.value }))}
                                                        onKeyDown={(e) => { if (e.key === "Enter") handleAddOption(tag._id) }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '6px 10px',
                                                            fontSize: '13px',
                                                            borderRadius: '7px',
                                                            border: '1px solid #aaa',
                                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                                                            background: 'linear-gradient(180deg, #ddd 0%, #f0f0f0 100%)',
                                                            outline: 'none',
                                                            color: '#222',
                                                            fontFamily: 'inherit',
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleAddOption(tag._id)}
                                                        style={{
                                                            padding: '6px 14px',
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            borderRadius: '7px',
                                                            border: '1px solid #2a6099',
                                                            cursor: 'pointer',
                                                            color: '#fff',
                                                            background: 'linear-gradient(180deg, #5b9bd5 0%, #3a7abf 45%, #2d6aaf 50%, #4a8fd0 100%)',
                                                            boxShadow: '0 2px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
                                                            textShadow: '0 -1px 0 rgba(0,0,0,0.4)',
                                                            whiteSpace: 'nowrap',
                                                            fontFamily: 'inherit',
                                                        }}
                                                    >Add</button>
                                                </div>

                                                {/* Option chips */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                                    {tag.options && tag.options.map((option: any) => {
                                                        const isEditingOption = editingOptionId === option._id
                                                        return (
                                                            <div key={option._id} style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                padding: '4px 6px 4px 10px',
                                                                borderRadius: '12px',
                                                                border: isEditingOption ? '1px solid #4a7abf' : '1px solid #aaa',
                                                                background: isEditingOption
                                                                    ? 'linear-gradient(180deg, #e0e8f5 0%, #f0f4fb 100%)'
                                                                    : 'linear-gradient(180deg, #fdfdfd 0%, #e4e4e4 100%)',
                                                                boxShadow: isEditingOption
                                                                    ? 'inset 0 2px 4px rgba(0,0,0,0.12)'
                                                                    : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.15)',
                                                            }}>
                                                                {isEditingOption ? (
                                                                    <input
                                                                        autoFocus
                                                                        value={editingOptionValue}
                                                                        onChange={(e) => setEditingOptionValue(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === "Enter") { handleRenameOption(option._id, editingOptionValue); setEditingOptionId(null) }
                                                                            if (e.key === "Escape") setEditingOptionId(null)
                                                                        }}
                                                                        style={{
                                                                            border: 'none',
                                                                            background: 'transparent',
                                                                            fontSize: '12px',
                                                                            fontWeight: '600',
                                                                            color: '#222',
                                                                            outline: 'none',
                                                                            width: `${Math.max((editingOptionValue.length || 4), 4) * 8}px`,
                                                                            fontFamily: 'inherit',
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        fontWeight: '600',
                                                                        color: '#333',
                                                                    }}>{option.name}</span>
                                                                )}

                                                                {/* Option action buttons */}
                                                                {isEditingOption ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => { handleRenameOption(option._id, editingOptionValue); setEditingOptionId(null) }}
                                                                            title="Confirm"
                                                                            style={{
                                                                                width: '18px', height: '18px', borderRadius: '50%',
                                                                                border: '1px solid #2a7a00',
                                                                                background: 'linear-gradient(180deg, #6dd46d 0%, #3aaa00 50%, #2a8800 100%)',
                                                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                                                                                color: '#fff', fontSize: '11px', cursor: 'pointer',
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                padding: 0, flexShrink: 0, fontFamily: 'inherit',
                                                                            }}
                                                                        >✓</button>
                                                                        <button
                                                                            onClick={() => setEditingOptionId(null)}
                                                                            title="Cancel"
                                                                            style={{
                                                                                width: '18px', height: '18px', borderRadius: '50%',
                                                                                border: '1px solid #888',
                                                                                background: 'linear-gradient(180deg, #ddd 0%, #aaa 100%)',
                                                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                                                                                color: '#444', fontSize: '11px', cursor: 'pointer',
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                padding: 0, flexShrink: 0, fontFamily: 'inherit',
                                                                            }}
                                                                        >✕</button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => { setEditingOptionId(option._id); setEditingOptionValue(option.name) }}
                                                                            title="Rename"
                                                                            style={{
                                                                                width: '18px', height: '18px', borderRadius: '50%',
                                                                                border: '1px solid #888',
                                                                                background: 'linear-gradient(180deg, #f5f5f5 0%, #d5d5d5 100%)',
                                                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                                                                                color: '#444', fontSize: '11px', cursor: 'pointer',
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                padding: 0, flexShrink: 0, fontFamily: 'inherit',
                                                                            }}
                                                                        >✎</button>
                                                                        <button
                                                                            onClick={() => handleDeleteOption(option._id)}
                                                                            title="Delete"
                                                                            style={{
                                                                                width: '18px', height: '18px', borderRadius: '50%',
                                                                                border: '1px solid #888',
                                                                                background: 'linear-gradient(180deg, #bbb 0%, #888 100%)',
                                                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                                                                                color: '#fff', fontSize: '12px', cursor: 'pointer',
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                padding: 0, flexShrink: 0, fontFamily: 'inherit',
                                                                            }}
                                                                        >×</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
                <ToastContainer theme={isDarkTheme ? "dark" : "light"} />
                </div>{/* end padding wrapper */}
            </div>
        </div >)
    )
}

export default EditOverlay
