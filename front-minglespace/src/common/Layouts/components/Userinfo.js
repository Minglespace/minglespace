import React from 'react'
import ProfileImage from './ProfileImage'
import Button from './Button'

const Userinfo = ({name, role, email, src, title, btnStyle}) => {
    return (
        <div className="userInfo_container">
            <ProfileImage src={src}/>
            <div className="userInfo_context">
                <div>
                    <h2>{name}</h2>
                    <p>{role}</p>
                </div>
                <p>{email}</p>
            </div>
        </div>
    )
}

export default Userinfo
