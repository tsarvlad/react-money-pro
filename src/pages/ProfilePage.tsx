import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLogout } from '../state';

const ProfilePage = () => {
    const user = useSelector((state: any) => state.user)
    const [registered, since] = [new Date(user.createdAt).toLocaleDateString('en-GB'), new Date(user.portfolio[0].time).toLocaleDateString('en-GB')]
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleEditNavigation = () => {
        navigate(`/profile/${user._id}/edit`)
    }

    const handleNewPasswordNavigation = () => {
        navigate(`/profile/${user._id}/newPassword`)
    }

    const handleLogout = () => {
        dispatch(setLogout())
        navigate(`/`)
    }

    return (
        <div className='flex justify-center items-center pt-[32px]'>
            <Card sx={{ maxWidth: 1000 }}>
                <CardActionArea onClick={handleEditNavigation}>
                    <CardMedia
                        component="img"
                        image={`${user.picturePath}`}
                        alt="green iguana"
                        sx={{ maxHeight: '600px', maxWidth: '800px' }}
                    />
                    <div className='flex flex-col'>
                        <CardContent>
                            <Typography align='center' variant="h4" component="div">
                                {user.firstName} {user.lastName}
                            </Typography>
                            <Typography align='center'>Registered: {registered}</Typography>
                            <Typography align='center'>Since: {since}</Typography>
                        </CardContent>
                    </div>
                </CardActionArea>
                <CardActions className='justify-between flex mx-3'>
                    <Button onClick={handleNewPasswordNavigation} size='small'>Change Password</Button>
                    <div >
                        <Button onClick={handleEditNavigation} size="large" color="primary">
                            Edit
                        </Button>
                        <Button onClick={handleLogout} size="large" color="primary">
                            Logout
                        </Button>
                    </div>
                </CardActions>
            </Card>
        </div>)
}

export default ProfilePage
