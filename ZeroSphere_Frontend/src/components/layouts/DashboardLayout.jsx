import React, { useContext } from 'react'
import {UserContext} from "../../context/userContext";
import NavBar from "./NavBar";
const DashboardLayout = ({children, activeMenu}) => {
    const {user} = useContext(UserContext);
  return (
    <div className=''>
        <NavBar activeMenu={activeMenu} />

        {user && (
            <div className='flex'>
                <div className='max-[1080px]:hidden'>
                    <SideMenu activeMenu={activeMenu} />
                </div>
            </div>
        )
        }
    </div>
  )
}

export default DashboardLayout;