import React from 'react'
import ProfileImage from './ProfileImage'

const Userinfo = ({ name, role, email, src }) => {
  return (
    <div className='userinfo_container'>
      <div className='userinfo_imgbox'>
        <ProfileImage size="80px" src={src} />
      </div>
      <div className='userinfo_profile_container'>
        <p className='userinfo_username'>{name}</p>
        <p className='userinfo_userrole'>{role}</p>
        <p className='userinfo_useremail'>{email}</p>
      </div>
    </div>
  )
}

export default Userinfo
