import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Grid, TextField, Button, Box, Typography, IconButton, Link
} from '@mui/material'

import { DeleteOutlined } from '@mui/icons-material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useForm, SubmitHandler } from 'react-hook-form'
import * as yup from 'yup'

import { useDropzone } from 'react-dropzone'
import { useDispatch, useSelector } from 'react-redux';

import LogoNavbar from '../components/LogoNavbar';
import Spinner from '../scenes/Spinner'
import '../App.css'

import { setLogin } from '../state';


const registerSchema = yup.object().shape({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    email: yup.string().email('Not valid email').required('Required'),
    password: yup.string()
        .required('No password provided.')
        .min(8, 'Password is too short.'),
    confirmPassword: yup.string()
        .required('No password provided.')
        .min(8, 'Password is too short.'),
})

type formSchema = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
}

const RegisterPage = () => {
    // DropZone
    const [picture, setPicture] = useState<any>()
    const onDrop = useCallback((acceptedFiles: any) => {
        setPicture(acceptedFiles)
    }, [])
    const {
        getRootProps,
        getInputProps,
        isDragActive
    } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
    })

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const isDarkTheme = useSelector((state: any) => state.isDarkTheme)
    const [loading, setLoading] = useState<boolean>(false)

    const login = async (data: any) => {
        try {
            const loggedInUser = await fetch(
                `${import.meta.env.VITE_PROJECT_BASE_URL}/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                }
            )
            const isLoggedIn = await loggedInUser.json()
            if (isLoggedIn) {
                dispatch(
                    setLogin({
                        user: isLoggedIn.user,
                        token: isLoggedIn.token
                    })
                );
                toast.success('Successfully logged in!')
                navigate('/dashboard')

            } else {
                toast.error(isLoggedIn?.msg)
            }
        } catch {
            toast.error("Sorry, our server is not working currently")
            setLoading(false)
        }
    }

    const registerAndLogin = async (data: any) => {
        try {
            setLoading(true)
            const formData: FormData = new FormData()
            for (let input in data) {
                formData.append(input, data[input])
            }
            // Image append
            if (!picture) {
                toast.error("Please, select image")
                return
            }

            formData.append('picture', picture[0])
            formData.append('picturePath', picture[0].name)

            const savedUserResponse = await fetch(
                `${import.meta.env.VITE_PROJECT_BASE_URL}/auth/register`,
                {
                    method: "POST",
                    body: formData,
                }
            )
            const savedUser = await savedUserResponse.json();
            setLoading(false)
            if (savedUserResponse.statusText === 'Bad Request') {
                toast.error(savedUser.msg)
            } else {
                login(data)
                toast.success("You are successfully registered!")
            }
        } catch {
            toast.error("Sorry, our server is not working currently")
            setLoading(false)
        }
    }

    // const isMobileScreen: Boolean = !useMediaQuery('(min-width: 1000px)')
    const [isTouched, setIsTouched] = useState<boolean>(false)
    //This is not my code, it's taken from docs
    const useYupValidationResolver = (validationSchema: any) =>
        useCallback(
            async (data: any) => {
                try {
                    const values = await validationSchema.validate(data, {
                        abortEarly: false
                    });

                    return {
                        values,
                        errors: {}
                    };
                } catch (errors: any) {

                    return {
                        values: {},
                        errors: errors.inner.reduce(
                            (allErrors: any, currentError: any) => ({
                                ...allErrors,
                                [currentError.path]: {
                                    type: currentError.type ?? "validation",
                                    message: currentError.message
                                }
                            }),
                            {}
                        )
                    };
                }
            },
            [validationSchema]
        );
    const resolver = useYupValidationResolver(registerSchema)
    const { register, handleSubmit, watch, formState: { errors } } = useForm<formSchema>({ resolver });
    const onSubmit: SubmitHandler<formSchema> = async (data: any) => {
        registerAndLogin(data)
    }

    return (
        <>
            <LogoNavbar />
            <div id="registerWall" className='w-[100%] min-h-[calc(100vh-136px)] flex flex-col items-center bg-[rgba(232,232,232,0.5)] overflow-auto'>
                <div className='flex relative flex-col mt-[6rem] justify-center items-center bg-white  p-6 md:w-[750px] l g:w-[800px] shadow-md rounded-md'>
                    <Typography variant='h5' sx={{ mt: '2px', mb: '12px' }}>Create Personal Account</Typography>
                    {loading && <Spinner />}
                    <Box component='form' onSubmit={handleSubmit(onSubmit)}
                        sx={{ mt: 1, width: "70%" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label='First name'
                                    fullWidth
                                    autoFocus
                                    {...register('firstName')}
                                    autoComplete='given-name'
                                    error={isTouched && Boolean(errors.firstName)}
                                    helperText={isTouched && errors.firstName?.message}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label='Last name'
                                    {...register('lastName')}
                                    error={isTouched && Boolean(errors.lastName)}
                                    helperText={isTouched && errors.lastName?.message}
                                    autoComplete='family-name'
                                    fullWidth />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    label='Email'
                                    {...register('email', { required: true })}
                                    error={isTouched && Boolean(errors.email)}
                                    helperText={isTouched && errors.email?.message}
                                    autoComplete='email'
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label='Password'
                                    {...register('password')}
                                    type='password'
                                    error={isTouched && Boolean(errors.password)}
                                    helperText={isTouched && errors.password?.message}
                                    autoComplete='new-password'
                                    fullWidth
                                    autoFocus />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label='Confirm Password'
                                    {...register('confirmPassword')}
                                    type='password'
                                    error={isTouched && Boolean(errors.confirmPassword)}
                                    helperText={isTouched && errors.confirmPassword?.message}
                                    fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <Box component='section' sx={{
                                    flex: 1,
                                    height: picture ? undefined : '3.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    padding: '20px',
                                    borderWidth: '2px',
                                    borderRadius: '2px',
                                    borderStyle: 'dashed',
                                    backgroundColor: '#fafafa',
                                    color: '#bdbdbd',
                                    outline: 'none',
                                    transition: 'border .24s ease-in-out',
                                }}>
                                    <Typography>Avatar</Typography>
                                    <div id='dropzoneArea' {...getRootProps({ className: 'dropzone' })}>
                                        <input {...getInputProps()}
                                            name='picture' />
                                        {picture ? (<Typography variant='body1'>Accepted:</Typography>)
                                            : (isDragActive ? (
                                                <Typography variant='body1'>
                                                    Drop it here!
                                                </Typography>
                                            ) : (
                                                <Typography variant='body1'>Drag 'n click, or click to select image</Typography>
                                            ))}
                                    </div>
                                    <aside>
                                        {picture ? (
                                            <>
                                                <IconButton
                                                    onClick={() => setPicture(null)}
                                                >
                                                    <Typography variant='body2'>{picture[0].name}</Typography> <DeleteOutlined />
                                                </IconButton>
                                            </>
                                        ) : (undefined)}
                                    </aside>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    type='submit'
                                    fullWidth
                                    size='large'
                                    onClick={() => setIsTouched(true)}
                                    sx={{
                                        backgroundColor: isDarkTheme ? '#42587a' : 0,
                                        ":hover": { backgroundColor: isDarkTheme ? '#31436e' : 0 },
                                        ":active": { backgroundColor: isDarkTheme ? '#011a3f' : 0 }
                                    }}
                                >Register

                                </Button>
                            </Grid>
                            <Grid container display='grid' >
                                <Grid item display='flex' alignItems='center' justifyContent='center'>
                                    <Link href="/login" variant="body2" sx={{ mt: 2, mb: -1 }}>
                                        {"Already have an account? Log In"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            </div>
            <ToastContainer />
        </>
    )
}

export default RegisterPage
