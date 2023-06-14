import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import SavingsIcon from '@mui/icons-material/Savings';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import { setIsDarkTheme, setLogout } from '../state';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';



const pages = ['Global', 'Portfolio', 'About us'];
const settings = ['Settings', 'Dashboard', 'Logout'];
const linksWithoutNavbar = ['/login', '/register'];

const defaultDarkSettings: string = 'dark:text-white dark:font-black'

function Navbar() {
    const isMobileScreen: Boolean = !useMediaQuery('(min-width: 1000px)')
    const { pathname } = useLocation()
    const user = useSelector((state: any) => state.user)
    const userToken = useSelector((state: any) => state.token)
    const isDarkTheme = useSelector((state: any) => state.isDarkTheme)
    const isAuth = Boolean(userToken)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const mobileDrawer = isAuth ? pages : [...pages, 'Log In', 'Sign Up']
    const userTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleThemeChange = () => {
        dispatch(setIsDarkTheme())
    }

    useEffect(() => {
        if (document.documentElement.classList.contains('dark') || Boolean(!isDarkTheme)) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            return
        }
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark')
    }, [isDarkTheme])


    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleUserMenuItemClick = (link: string) => {
        handleCloseUserMenu()
        switch (link) {
            case 'Settings':
                navigate(`/profile/${user._id}`)
                return 1
            case 'Dashboard':
                navigate('/dashboard')
                return 0
            case 'Logout':
                dispatch(setLogout())
                navigate('/')
                return 1
            default:
                return 0
        }
    }

    const handleMobileDrawerClick = (page: string) => {
        handleCloseNavMenu()
        switch (page) {
            case 'Global':
                navigate('/global')
                return 1
            case 'Portfolio':
                navigate('/dashboard')
                return 1
            case 'About us':
                navigate('/')
                return 1
            case 'Sign In':
                navigate('/login')
                return 1
            case 'Sign Up':
                navigate('/register')
                return 1
            default:
                return 0
        }
    }

    const navbarTheme = createTheme({
        palette: {
            primary: {
                main: '#fff'
            }
        }
    })

    if (linksWithoutNavbar.some((item) => pathname.includes(item))) return null;


    // React.useEffect(() => {
    //     if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    //         document.documentElement.classList.add('dark')
    //     } else {
    //         document.documentElement.classList.remove('dark')
    //     }
    // }, [])

    return (
        <ThemeProvider theme={navbarTheme}>
            <AppBar id='navbarWall' position="absolute" color={'primary'} sx={{ boxShadow: 2 }}  >
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <SavingsIcon className={defaultDarkSettings} sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography className={defaultDarkSettings}
                            variant="h6"
                            noWrap
                            component="a"
                            href="/dashboard"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'secondary',
                                textDecoration: 'none',
                            }}
                        >
                            FINSTRA
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton className={defaultDarkSettings}
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {mobileDrawer.map((page) => (
                                    <MenuItem key={page} onClick={() => handleMobileDrawerClick(page)}>
                                        <Typography textAlign="center" color="black">{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        <SavingsIcon className={defaultDarkSettings} sx={{ display: { xs: 'flex', md: 'none' }, ml: 11, mr: 1 }} />
                        <Typography className={defaultDarkSettings}
                            variant="h5"
                            noWrap
                            component="a"
                            href=""
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            FINSTRA
                        </Typography>
                        <IconButton className={defaultDarkSettings} onClick={handleThemeChange} sx={{ display: { xs: 'flex', md: 'none' }, px: 0, ml: 3, mr: 2, }}>
                            {isDarkTheme ? <NightsStayIcon /> : <LightModeIcon />}
                        </IconButton>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Button className={`${defaultDarkSettings.slice(0, 16).toString() + ' font-bold'}`}
                                    key={page}
                                    onClick={() => handleMobileDrawerClick(page)}
                                    sx={{ my: 2, color: 'black', display: 'block' }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>
                        {!isMobileScreen && (<IconButton className={defaultDarkSettings} onClick={handleThemeChange} sx={{ marginRight: '10px' }} >
                            {isDarkTheme ? <NightsStayIcon /> : <LightModeIcon />}
                        </IconButton>)}
                        {isAuth ?
                            <Box sx={{ flexGrow: 0 }}>
                                <Tooltip title="Open settings">
                                    <>
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                            <Avatar alt="Remy Sharp" src={user?.picturePath ? user.picturePath : "/static/images/avatar/2.jpg"} />
                                        </IconButton>
                                    </>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settings.map((setting) => (
                                        <MenuItem key={setting} onClick={() => handleUserMenuItemClick(setting)}>
                                            <Typography textAlign="center">
                                                {setting}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                            : (isMobileScreen ? '' : (<Stack direction='row' className='[&>*]:text-white'>
                                <Button
                                    onClick={() => navigate('/login')}
                                    sx={{ my: 2, color: !isDarkTheme ? 'black' : 0, display: 'block' }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    onClick={() => navigate('/register')}
                                    sx={{ my: 2, color: !isDarkTheme ? 'black' : 0, display: 'block' }}
                                >
                                    Sign Up
                                </Button>
                            </Stack>
                            ))}

                    </Toolbar>
                </Container>
            </AppBar >
        </ThemeProvider >
    );
}
export default Navbar;