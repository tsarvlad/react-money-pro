import { createSlice } from '@reduxjs/toolkit'

function clearStorage() {
    const domain = window.location.hostname;
    localStorage.clear();
    sessionStorage.clear();
    Object.keys(localStorage).forEach(key => {
        if (key.includes(domain)) {
            localStorage.removeItem(key);
        }
    });
    Object.keys(sessionStorage).forEach(key => {
        if (key.includes(domain)) {
            sessionStorage.removeItem(key);
        }
    });
}

const initialState = {
    user: null,
    token: null,
    overlay: false,
    isDarkTheme: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLogin: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
        },
        setLogout: (state) => {
            state.user = null
            state.token = null
            clearStorage()
        },
        setClickOverlay: (state) => {
            state.overlay = !state.overlay
        },
        setIsDarkTheme: (state) => {
            state.isDarkTheme = !state.isDarkTheme
        }
    }
})

export const { setLogin, setLogout, setClickOverlay, setIsDarkTheme } = authSlice.actions;
export default authSlice.reducer;
