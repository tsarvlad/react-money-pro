import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid, TextField, IconButton } from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DeleteOutlined } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from '../scenes/Spinner';
import { setLogin } from '../state'
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup'



const registerSchema = yup.object().shape({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    email: yup.string().email('Not valid email').required('Required'),
    password: yup.string()
        .required('No password provided.')
        .min(8, 'Password is too short.'),
})

type formSchema = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    picture: any,
    picturePath: any
}



export default function Checkout() {
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [step, setStep] = useState<boolean>(false)
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

    const user = useSelector((state: any) => state.user)

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
        onSave(data)
    }

    const stepNext = () => {
        setStep(true)

    }

    const stepBack = () => {
        setStep(false)
    }

    const onSave = async (data: any) => {
        setLoading(true)
        const formData: FormData = new FormData()

        for (let input in data) {
            formData.append(input, data[input])
        }
        if (picture) {
            formData.append('picture', picture[0])
            formData.append('picturePath', picture[0].name)
        }

        const savedUserResponse = await fetch(
            `${import.meta.env.VITE_PROJECT_BASE_URL}/user/${user._id}/edit`,
            {
                method: "POST",
                body: formData
            }
        )

        const savedUser = await savedUserResponse.json()
        setLoading(false)

        if (savedUserResponse.statusText === 'Bad Request') {
            toast.error(savedUser.msg)
        } else {
            toast.success("You are successfully changed your info!")
            dispatch(
                setLogin({
                    user: savedUser.user,
                    token: savedUser.token
                })
            );
            setLoading(false)
            navigate(`/profile/${user._id}`)
        }

    }

    useEffect(() => {
        if (errors.email?.message === 'Not valid email') {
            setStep(false)
        }
    }, [errors.email])

    return (
        <>
            {loading && <Spinner />}
            <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography gutterBottom component="h1" variant="h5" align="center">
                        {step ? 'Verify your identity' : 'Edit Profile Information'}
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {step
                            ? (
                                <div className='flex justify-center mt-4'>
                                    <TextField
                                        type="password"
                                        {...register('password')}
                                        label="Password"
                                        autoComplete="current-password"
                                        variant="outlined"
                                        fullWidth
                                    />
                                </div>
                            ) :
                            (<Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        {...register('firstName')}
                                        label="First name"
                                        defaultValue={user.firstName}
                                        fullWidth
                                        autoComplete="given-name"
                                        variant="standard"
                                        error={Boolean(errors.firstName)}
                                        helperText={errors.firstName?.message}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        {...register('lastName')}
                                        label="Last name"
                                        defaultValue={user.lastName}
                                        fullWidth
                                        autoComplete="family-name"
                                        variant="standard"
                                        error={Boolean(errors.lastName)}
                                        helperText={errors.lastName?.message}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        {...register('email')}
                                        label="Email Address"
                                        defaultValue={user.email}
                                        fullWidth
                                        autoComplete="email"
                                        variant="standard"
                                        error={Boolean(errors.email)}
                                        helperText={errors.email?.message}
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ mt: 1 }}>
                                    <Box component='section' sx={{
                                        flex: 1,
                                        height: picture ? undefined : '6rem',
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
                            </Grid>)}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {step && (
                                <Button onClick={stepBack} sx={{ mt: 3, ml: 1 }}>
                                    Back
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                type={'submit'}
                                onClick={() => {
                                    setIsTouched(true)
                                    stepNext()
                                }}
                                sx={{
                                    mt: 3, ml: 1,
                                    backgroundColor: '#42587a',
                                    ":hover": { backgroundColor: '#31436e' },
                                    ":active": { backgroundColor: '#011a3f' }
                                }}
                            >
                                {step ? 'Confirm' : 'Next'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container >
            <ToastContainer />
        </>
    );
}
