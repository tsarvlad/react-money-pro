import React from 'react'
import ImgMediaCard from '../scenes/ImgMediaCard'
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material'
import LoginIcon from '@mui/icons-material/Login';
import { useSelector } from 'react-redux';

const AboutUs = () => {
    const navigate = useNavigate()
    const user = useSelector((state: any) => state.user)
    return (
        <div className="min-h-[calc(100vh-140px)] xl:w-[80%]'">
            <div className="header sm:[&>*]:w-[47%] p-24 pt-14 px-32 justify-between flex flex-col sm:flex-row">
                <div className='flex flex-col'>
                    {/* <h3 className='text-3xl'>Keep a record of your money</h3> */}
                    <p className='text-8xl font-thin my-10'>Watch your spending</p>
                    <h2 className='text-5xl font-light'>Use Finsta app to gain retrospective insights into your money management and make informed decisions based on your record.</h2>
                    <div className="button-group flex mt-auto mb-12
                    gap-4 [&>*]:px-8 [&>*]:py-6 [&>*]:rounded-full [&>*]:text-4xl [&>*:nth-child(1)]: [&>*:nth-child(1)]: [&>*:nth-child(1)]: [&>*]:transition-all [&>*]:duration-500
                    ">
                        {user ? <>
                            <button className='bg-blue hover:bg-strongblue hover:text-[whitesmoke]'
                                onClick={() => navigate('/dashboard')}>Dashboard</button>
                            <button className='hover:shadow-xl hover:bg-[whitesmoke]'
                                onClick={() => navigate('/global')}>Users</button></>
                            :
                            <>
                                <button className='bg-blue hover:bg-strongblue hover:text-[whitesmoke]'
                                    onClick={() => navigate('/register')}>Sign up  </button>
                                <button className='hover:shadow-xl hover:bg-[whitesmoke]'
                                    onClick={() => navigate('/login')}>Log in</button>
                            </>
                        }
                    </div>
                </div>
                <div>
                    <img className='rounded-4xl' src="src/assets/image-dashboard.png" alt="Demonstration of Finstra Dashboard" />
                </div>
            </div>
            <div className="created-for-people bg-mediumblue pt-16 pb-12 px-32 [&>*]:text-white [&>*]:text-center flex flex-col"
            >
                <div className='text-5xl'>Clear view of people's financial net worth</div>
                <div className='flex justify-center'>
                    <div className='text-xl mt-4 w-[80%]'>
                        FINSTA provides users with a specil chance to see a complete global view of everyone's money. With strong security measures, we offer an exceptional glimpse into the financial world, promoting responsibility, informed choices, and the potential for global collaboration in managing finances.</div>
                </div>
                <div className='text-lg mt-8'>You can disable listing of your account in settings</div>
                <button className='w-[200px] bg-gray self-center p-7 mt-6
                rounded-full text-2xl font-bold first-letter [&>*]:whitesmoke
                hover:scale-[0.9] hover:position:absolute hover:shadow-2xl  hover:border-[rgba(0,0,0,0.2)]
                '
                    onClick={() => navigate('/global')}><p>Global list</p></button>
            </div>
            <div className="benefits-of-looking-on-pas my-20 mb-16">
                <div className='text-5xl text-center my-16'>It's crucial to monitor your expenses.</div>
                <div className="cards-section flex justify-center gap-28
                [&>*]:transition-all [&>*]:duration-200 [&>*]:drop-shadow-lg [&>*]:	
                ">
                    <div className='hover:-translate-y-4 hover:scale-[104%] hover:drop-shadow-2xl'
                        onClick={() => navigate('/global')}>
                        <ImgMediaCard header='Global Users' image='src\assets\global-users-dashboard.png'
                            content='Explore the complete financial portfolios of all users and identify the assets held by influential individuals with significant financial power.'
                        />
                    </div>
                    <div className='hover:-translate-y-4 hover:scale-[104%] hover:drop-shadow-2xl'
                        onClick={() => navigate('/dashboard')}>
                        <ImgMediaCard header='Personal Dashboard' image='src\assets\image-dashboard-dark.png'
                            content='Access your personal financial portfolio dashboard and compare it with the portfolios of users worldwide.' />
                    </div>


                </div>
            </div>
        </div >
    )
}


export default AboutUs
