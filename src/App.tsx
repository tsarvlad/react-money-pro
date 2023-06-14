import { useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import UserPanel from './pages/UserPanel'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import NewPasswordPage from './pages/NewPasswordPage'
import GlobalRating from './pages/GlobalRating'
import PublicProfile from './pages/PublicProfile'
import AboutUs from './pages/AboutUs'
import './App.css'
import Footer from './components/Footer'


function App() {
  const [count, setCount] = useState(0)
  const isAuth = Boolean(useSelector((state: any) => state.token))


  return (
    <BrowserRouter>
      <Navbar />
      <div className="relative flex flex-col min-h-[calc(100vh-72px)] pt-[58px] sm:pt-[68px]">
        <Routes>
          <Route path='/' element={<AboutUs />} />
          <Route path='/dashboard' element={
            isAuth ? <UserPanel /> :
              <Navigate replace to='/login' />} />
          <Route path='/register' element={
            isAuth ? <Navigate replace to='/dashboard' /> :
              <RegisterPage />}
          />
          <Route path='/login' element={
            isAuth ? <Navigate replace to='/dashboard' /> :
              <LoginPage />}
          />
          <Route path='/profile/:id' element={
            isAuth ? <ProfilePage /> :
              <Navigate replace to='/dashboard' />} />
          <Route path='/profile/:id/edit' element={
            isAuth ? <EditProfilePage /> :
              <Navigate replace to='/dashboard' />} />
          <Route path='/profile/:id/newPassword' element={
            isAuth ? <NewPasswordPage /> :
              <Navigate replace to='/dashboard' />} />

          <Route path='/global' element={<GlobalRating />} />
          <Route path='/global/:id' element={<PublicProfile />} />
          {/* <Route path='/profile/:id' element={<UserProfile/>} /> */}
          {/* <Route path='/profile/:id' element={<HomePanel/>} /> */}
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}

export default App
