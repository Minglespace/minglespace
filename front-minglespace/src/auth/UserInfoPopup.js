import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";

import Userinfo from "../common/Layouts/components/Userinfo";
import ProfileImage from "../common/Layouts/components/ProfileImage";

import Repo from "./Repo";
import AuthApi from "../api/AuthApi";
import { HOST_URL } from "../api/Api";
import { AuthStatus, AuthStatusOk } from "../api/AuthStatus";
import Modal from "../common/Layouts/components/Modal";

//============================================================================================
//============================================================================================
//============================================================================================
//============================================================================================
//============================================================================================
export default function UserInfoPopup() {
  const navigate = useNavigate();
  const popupRef = useRef(null); // 팝업을 참조하기 위한 ref 추가
  const buttonRef = useRef(null); // 버튼 클릭을 위한 ref 추가

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dontUseProfileImage, setDontUseProfileImage] = useState(false);
  const [userInfo, setUserInfo] = useState({
    profileImagePath: "",
    name: "",
    position: "",
    email: "",
    phone: "",
    introduction: "",
    localImage: "",
    socialLogin:"",
  });

  const [initialUserInfo, setInitialUserInfo] = useState(null); // 초기 상태 저장

  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 파일 선택
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState(null);


  useEffect(() => {

    getUserInfo();


  }, []);

  // ESC 키를 누르면 팝업을 닫는 함수
  useEffect(() => {

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if(isEditing){
          setIsEditing(false);
          return;
        }
        if(isOpen){
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isEditing]);

  // 팝업 외부 클릭 시 팝업 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (buttonRef.current && buttonRef.current.contains(e.target)) {
        return;
      }
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================

  const getUserInfo = async () => {

    const data = await AuthApi.userInfo();

    if (AuthStatusOk(data.msStatus)) {
      setUserInfo(data);
      setInitialUserInfo({ ...data }); // 초기 상태 저장
      console.log("저장 data : ", data);

    }else if(data.msStatus && AuthStatus[data.msStatus]){
      setMessage({
        title: "확인", 
        content: AuthStatus[data.msStatus].desc,  
      });
    }

  };

  const handleClickOpen = async () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      getUserInfo();
    }
  };
  
  const handleClickWithdrawal = async () => {
    const data = await AuthApi.withdrawalEmail();
    if (AuthStatusOk(data.msStatus)) {
      Repo.clearItem();
      navigate("/auth/login");
    }else if(data.msStatus && AuthStatus[data.msStatus]){
      setMessage({
        title: "확인", 
        content: AuthStatus[data.msStatus].desc,  
      });
    }
  };

  const handleClickSetting = () => {
    setIsEditing(true);
  };

  const handleClickLogout = async () => {
    await AuthApi.logout().then(()=>{
      navigate("/auth/login");
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    
    const changedFields = compareUserInfo(initialUserInfo, userInfo); // 변경된 필드 찾기

    if (Object.keys(changedFields).length > 0) {
      console.log("변경된 필드가 있으면 서버로 전송");
      userInfo.dontUseProfileImage = dontUseProfileImage;
      
      console.log("변경 before : ", changedFields);
      const data = await AuthApi.updateUserInfo(changedFields, userInfo.localImage);
      console.log("변경 after : ", data);

      if (AuthStatusOk(data.msStatus)) {
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          profileImagePath: data.profileImagePath,
          name: data.name,
          position: data.position,
          phone: data.phone,
          introduction: data.introduction,
          socialLogin: data.socialLogin,
        }));
        setIsEditing(false);
      }
    } else {
      console.log("변경된 필드가 없으면 그냥 종료");
      setIsEditing(false);
    }


    // userInfo.dontUseProfileImage = dontUseProfileImage;
    // const data = await AuthApi.updateUserInfo(userInfo, userInfo.localImage);
    // if (AuthStatusOk(data.msStatus)) {
    //   setUserInfo(prevUserInfo => ({
    //     ...prevUserInfo,
    //     profileImagePath: data.profileImagePath,
    //     name: data.name,
    //     position: data.position,
    //     phone: data.phone,
    //     introduction: data.introduction,
    //     socialLogin: data.socialLogin,
    //   }));
    //   setIsEditing(false);
    // }
  };

  // 변경된 필드만 추적하는 함수
  const compareUserInfo = (initial, current) => {
    let changes = {};
    for (let key in initial) {
      if (initial[key] !== current[key]) {
        changes[key] = current[key];
      }
    }
    return changes;
  };

  
  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setDontUseProfileImage(false);
      setSelectedImage(URL.createObjectURL(file));
      userInfo.localImage = file;
    }
  };

  const handleClickDontUseImage = () => {
    Repo.clearProfileColor();
    setSelectedImage(null);
    setDontUseProfileImage(true);
  };

  const getHostImagePath = () => {
    if (dontUseProfileImage) return null;

    if (userInfo.profileImagePath)
      return `${HOST_URL}` + userInfo.profileImagePath;
    else return null;
  };

  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================

  return (
    <div className="relative">
      <button
        onClick={handleClickOpen}
        className="user-info-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        ref={buttonRef}  // 버튼에 ref 추가
      >
        <ProfileImage
          src={selectedImage || getHostImagePath()}
          userName={userInfo.name}
          size={50}
        />
      </button>

      {message && (
        <Modal open={message !== null} onClose={() => setMessage(null)}>
          <div className="workspace_add_modal_container">
            <p className="form-title">{message.title}</p>
            <p>{message.content}</p>
            <button type="submit" className="add_button" onClick={() => setMessage(null)}>확인</button>
          </div>
        </Modal>
      )}

      {isOpen && (
        <div className="popup-content" ref={popupRef}>
          <div className="popup-header">
            {isEditing ? (
              <div className="user-info">
                <div className="profile-container">
                  <ProfileImage
                    src={selectedImage || getHostImagePath()}
                    userName={userInfo.name}
                  />
                  <button
                    className="userInfo-button"
                    onClick={() => fileInputRef.current.click()} // 버튼 클릭 시 파일 선택창 열기
                    disabled={userInfo.socialLogin}
                  >
                    변경
                  </button>
                  <button
                    className="userInfo-button"
                    onClick={handleClickDontUseImage}
                    disabled={userInfo.socialLogin}
                  >
                    제거
                  </button>
                  <input
                    className="hidden-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  ></input>
                </div>

                <label className="input-label" htmlFor="name">
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={userInfo.socialLogin}
                />
                <label className="input-label" htmlFor="position">
                  직책
                </label>
                <input
                  id="position"
                  type="text"
                  name="position"
                  value={userInfo.position}
                  onChange={handleInputChange}
                  className="input-field"
                />
                <label className="input-label" htmlFor="email">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={userInfo.socialLogin}
                />
                <label className="input-label" htmlFor="phone">
                  전화번호
                </label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={userInfo.socialLogin}
                />
                <label className="input-label" htmlFor="introduction">
                  소개
                </label>
                <textarea
                  id="introduction"
                  name="introduction"
                  value={userInfo.introduction}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            ) : (
              <Userinfo
                name={userInfo.name}
                role={userInfo.position}
                email={userInfo.email}
                src={getHostImagePath()}
              />
            )}
          </div>

          <div className="user-details">
            {!isEditing && (
              <>
                <div>
                  <p className="detail-label">전화번호</p>
                  <p className="detail-value">{userInfo.phone}</p>
                </div>
                <div>
                  <p className="detail-label">소개</p>
                  <p className="detail-value truncate">
                    {userInfo.introduction}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="popup-footer">
            {isEditing ? (
              <>
                <button onClick={handleSaveChanges} className="logout-button">
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)} // Exit edit mode
                  className="logout-button"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button onClick={handleClickWithdrawal} className="logout-button">
                  <Settings size={16} />
                  회원탈퇴
                </button>
                <button onClick={handleClickSetting} className="logout-button">
                  <Settings size={16} />
                  정보변경
                </button>
                <button onClick={handleClickLogout} className="logout-button">
                  <LogOut size={16} />
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
