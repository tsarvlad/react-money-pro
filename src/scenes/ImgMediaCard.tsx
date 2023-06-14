import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


type ImgMediaCard = {
    header: string,
    content: string,
    image: string
}

export default function ImgMediaCard({ header, content, image }: ImgMediaCard) {
    const user = useSelector((state: any) => state.user)
    const navigate = useNavigate()
    return (
        <Card sx={{ maxWidth: 600 }}>
            <CardMedia
                className='brightness-[0.92] dark:brightness-[0.8]'
                component="img"
                alt="green iguana"
                height="140"
                sx={{ maxHeight: '436px' }}
                image={image}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {header}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {content}
                </Typography>
            </CardContent>
            {!user && <CardActions>
                <Button onClick={() => navigate('login')}
                    size="small">Log in</Button>
                <Button onClick={() => navigate('register')}
                    size="small">Sign up</Button>
            </CardActions>}
        </Card >
    );
}