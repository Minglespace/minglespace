import React from "react";
import {IoPersonSharp} from "react-icons/io5";

const ProfileImage = ({src, userName}) => {

  const profileImage = src || null; 
  
  const renderProfileImage = () => {
    if (profileImage) {

      return <img 
        src={profileImage} 
        className="round_user_image"
        alt="Profile" 
        // style={{ width: '100px', height: '100px', borderRadius: '50%' }} 
        />;
      
    //   <img className="round_user_image" src={src} alt="Profile"/>
      
    } else {
      // 이미지가 없으면 이름의 첫 글자로 기본 이미지를 생성
      const firstLetter = userName.charAt(0).toUpperCase();  // 유저 이름의 첫 글자 추출
      const backgroundColor = getRandomColor();  // 배경 색을 랜덤으로 설정
      return (
        <div
        className="round_user_image"
          style={{
            // width: '100px',
            // height: '100px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor,
            color: 'white',
            fontSize: '40px',
          }}
        >
          {firstLetter}
        </div>
      );
    }
  };

  // 랜덤 배경 색을 생성하는 함수
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return <>{renderProfileImage()}</>;

    // return (
    //     <>
    //         {
    //             src ? (
    //                 <img className="round_user_image" src={src} alt="Profile"/>
    //             ) : (
    //                 <IoPersonSharp className="user_alt_icon"/>

    //             )
    //         }
    //     </>
    // );
};

export default ProfileImage;
