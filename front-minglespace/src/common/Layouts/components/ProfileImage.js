import React from "react";
import {IoPersonSharp} from "react-icons/io5";

const ProfileImage = ({src}) => {
    return (
        <>
            {
                src ? (
                    <img className="round_user_image" src={src} alt="Profile"/>
                ) : (
                    <IoPersonSharp className="user_alt_icon"/>
                )
            }
        </>
    );
};

export default ProfileImage;
