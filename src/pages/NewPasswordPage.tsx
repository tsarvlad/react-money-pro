import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Grid, TextField, Button, Box, Typography,
} from '@mui/material'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useForm, SubmitHandler } from 'react-hook-form'
import * as yup from 'yup'

import { useDispatch, useSelector } from 'react-redux';


import { setLogout } from '../state';

import Spinner from '../scenes/Spinner'

const loginSchema = yup.object().shape({
    currentPassword: yup.string()
        .required('No password provided.')
        .min(8, 'Password is too short.'),
    newPassword: yup.string()
        .required('No password provided.')
        .min(8, 'Password is too short.'),
    confirmNewPassword: yup.string()
        .required('No password provided.')
        .min(8, 'Password is too short.'),
})

type formSchema = {
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string

}

const NewPasswordPage = () => {
    const user = useSelector((state: any) => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [loading, setLoading] = useState<boolean>(false)



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
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver });
    const onSubmit: SubmitHandler<any> = async (data: any) => {
        onSave(data)
    }

    const onSave = async (data: any) => {
        setLoading(true)
        const formData = new FormData()

        for (let input in data) {
            formData.append(input, data[input])
        }

        console.log(formData.get('newPassword'))


        const request = await fetch(`${import.meta.env.VITE_PROJECT_BASE_URL}/auth/${user._id}/newPassword`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
        )
        const response = await request.json()
        console.log(request)
        console.log(response)
        if (!request?.ok) {
            toast.error(response.msg)
        } else {
            toast.success("You are successfully changed your info!")
            dispatch(
                setLogout()
            );
            setLoading(false)
        }

        setLoading(false)

    }

    return (
        <>
            <div id="loginWall" className='w-[100%] flex flex-col items-center bg-[rgba(232,232,232,0.5)]] min-h-[calc(100vh-140px)]'>
                <div className='flex relative flex-col mt-[6rem] items-center bg-white p-6 m-3 md:w-[750px] lg:w-[800px] shadow-md rounded-md'>
                    {loading && <Spinner />}
                    <Typography variant='h5' sx={{ m: 1 }}>Change Password</Typography>
                    <form onSubmit={handleSubmit(onSubmit)} className='w-[70%]'>
                        <Grid container spacing={1.5}>
                            <Grid item xs={12} >
                                <TextField
                                    label='Current Password'
                                    type='password'
                                    {...register('currentPassword', { required: true })}
                                    error={isTouched && Boolean(errors.currentPassword)}
                                    // helperText={isTouched && errors.currentPassword?.message}
                                    autoComplete="current-password"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    label='New password'
                                    {...register('newPassword')}
                                    type='password'
                                    error={isTouched && Boolean(errors.newPassword)}
                                    // helperText={isTouched && errors.newPassword?.message}
                                    autoComplete='new-password'
                                    fullWidth
                                    autoFocus />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    label='Confirm new password'
                                    {...register('confirmNewPassword')}
                                    type='password'
                                    error={isTouched && Boolean(errors.confirmNewPassword)}
                                    // helperText={isTouched && errors.confirmNewPassword?.message}
                                    autoComplete='new-password'
                                    fullWidth
                                    autoFocus />
                            </Grid>
                            <Grid item xs={12} >
                                <Button
                                    className=''
                                    variant='contained'
                                    type='submit'
                                    fullWidth
                                    size='large'
                                    onClick={() => setIsTouched(true)}
                                    sx={{
                                        backgroundColor: '#42587a',
                                        ":hover": { backgroundColor: '#31436e' },
                                        ":active": { backgroundColor: '#011a3f' }
                                    }}
                                >Apply Changes</Button>
                            </Grid>
                        </Grid>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </>
    )
}

export default NewPasswordPage
