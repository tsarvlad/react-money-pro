import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Grid, TextField, Button, Box, Typography, useMediaQuery, Link
} from '@mui/material'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useForm, SubmitHandler } from 'react-hook-form'
import * as yup from 'yup'

import { useDispatch, useSelector } from 'react-redux';

import LogoNavbar from '../components/LogoNavbar'

import { setLogin } from '../state';

import Spinner from '../scenes/Spinner'

const loginSchema = yup.object().shape({
    email: yup.string().email().required('required'),
    password: yup.string()
        .required('No password provided.')
        .min(8, 'Password is too short.'),
})

type formSchema = {
    email: string,
    password: string,
}

const LoginPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const isDarkTheme = useSelector((state: any) => state.isDarkTheme)

    const [loading, setLoading] = useState<boolean>(false)

    const login = async (data: any) => {
        setLoading(true)
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
            setLoading(false)
            if (!loggedInUser.ok) {
                toast.error(isLoggedIn.msg)
                return
            }
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
            toast.error("Sorry. Our server is not working currently.")
            setLoading(false)
        }

    }

    const isMobileScreen: Boolean = !useMediaQuery('(min-width: 1000px)')
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
    const resolver = useYupValidationResolver(loginSchema)
    const { register, handleSubmit, watch, formState: { errors } } = useForm<formSchema>({ resolver });
    const onSubmit: SubmitHandler<formSchema> = async (data: any) => {
        login(data)
    }

    return (
        <>
            <LogoNavbar />
            <div id="loginWall" className='w-[100%] flex flex-col items-center bg-[rgba(232,232,232,0.5)] min-h-[calc(100vh-140px)]'>
                <div className='flex relative flex-col mt-[6rem] items-center bg-white dark:bg-whitesmoke p-6 m-3 md:w-[750px] lg:w-[800px] shadow-md rounded-md'>
                    {loading && <Spinner />}
                    <Typography variant='h5' sx={{ m: 1 }}>Log In</Typography>
                    <Box component='form' onSubmit={handleSubmit(onSubmit)}
                        sx={{ mt: 1, width: "70%" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} >
                                <TextField
                                    label='Email'
                                    {...register('email', { required: true })}
                                    error={isTouched && Boolean(errors.email)}
                                    helperText={isTouched && errors.email?.message}
                                    autoComplete='email'
                                    defaultValue={'testaccount@gmail.com'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    label='Password'
                                    {...register('password')}
                                    type='password'
                                    error={isTouched && Boolean(errors.password)}
                                    helperText={isTouched && errors.password?.message}
                                    autoComplete='current-password'
                                    defaultValue={'testaccount'}
                                    fullWidth
                                    autoFocus />
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
                                >Log in</Button>
                            </Grid>
                            <Grid container display='grid' >
                                <Grid item display='flex' alignItems='center' justifyContent='center'>
                                    <Link href="/register" variant="body2" sx={{ mt: 2, mb: -1 }}>
                                        {"Do not have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            </div >
            <ToastContainer />
        </>
    )
}

export default LoginPage
