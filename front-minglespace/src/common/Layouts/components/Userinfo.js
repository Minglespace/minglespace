import React from 'react'
import ProfileImage from './ProfileImage'
import Button from './Button'

const Userinfo = ({ name, role, email, src, title, btnStyle }) => {
  return (
    <>
      <ProfileImage size="50px" src={src} />
      <h3>{name}</h3>
      <h4>{role}</h4>
      <h4>{email}</h4>
    </>
  )
}

export default Userinfo
