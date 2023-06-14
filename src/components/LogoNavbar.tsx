import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import SavingsIcon from '@mui/icons-material/Savings';
import { useSelector } from 'react-redux';


function LogoNavbar() {

    const navbarTheme = createTheme({
        palette: {
            primary: {
                main: '#fff'
            }
        }
    })

    const isDarkTheme = useSelector((state: any) => state.isDarkTheme)

    return (
        <ThemeProvider theme={navbarTheme}>
            <AppBar position="absolute" id="navbarWall" color={'primary'} sx={{ boxShadow: 2 }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters className='[&>*]:dark:text-white'>
                        <SavingsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                textDecoration: 'none',
                            }}
                        >
                            FINSTRA
                        </Typography>
                        <SavingsIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                        <Typography
                            variant="h5"
                            noWrap
                            component="a"
                            href="/"
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
                    </Toolbar>
                </Container>
            </AppBar>
        </ThemeProvider>
    );
}
export default LogoNavbar;