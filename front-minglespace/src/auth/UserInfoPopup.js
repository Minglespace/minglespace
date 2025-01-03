import React, { useEffect, useRef, useState } from "react";
import Repo from "./Repo";
import AuthApi from "../api/AuthApi";
import Userinfo from "../common/Layouts/components/Userinfo";
import ProfileImage from "../common/Layouts/components/ProfileImage";

import { HOST_URL } from "../api/Api";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { AuthStatus, AuthStatusOk } from "../api/AuthStatus";
import ModalMessage from "../common/Layouts/components/ModalMessage";

//============================================================================================
//============================================================================================
//============================================================================================
export default function UserInfoPopup() {
  const navigate = useNavigate();

  const popupRef = useRef(null); // 팝업을 참조하기 위한 ref 추가
  const buttonRef = useRef(null); // 버튼 클릭을 위한 ref 추가
  const fileInputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 파일 선택
  const [message, setMessage] = useState(null);

  const [initialUserInfo, setInitialUserInfo] = useState(null); // 초기 상태 저장
  const [userInfo, setUserInfo] = useState({
    profileImagePath: "",
    name: "",
    position: "",
    email: "",
    phone: "",
    introduction: "",
    localImage: "",
    socialLogin: "",
  });
  //============================================================================================
  //============================================================================================
  //============================================================================================
  // 처음 로딩시 유저정보를 불러온다.
  useEffect(() => {
    getUserInfo();
  }, []);

  // ESC 키를 누르면 팝업을 닫는 함수
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (isEditing) {
          setIsEditing(false);
          return;
        }

        if (isOpen) {
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
  const getUserInfo = async () => {
    const data = await AuthApi.userInfo();
    if (AuthStatusOk(data.msStatus)) {

      data.dontUseProfileImage = (data.profileImagePath) ? false : true;
      setUserInfo(data);
      Repo.setItem(data);
      Repo.setUserName(data.name);
    } else if (data.msStatus && AuthStatus[data.msStatus]) {
      setMessage({
        title: "확인",
        content: AuthStatus[data.msStatus].desc,
        callbackOk: () => { setMessage(null); }
      });
    }
  };

  const handleClickOpen = async () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleClickWithdrawalEmail = async () => {
    setMessage({
      title: "확인",
      content: "회원탈퇴를 진행하시겠습니까?",
      callbackYes: () => {
        setMessage(null);
        sendWithdrawalEmail();
      },
      callbackNo: () => {
        setMessage(null);
      }
    });
  };

  const sendWithdrawalEmail = async () => {
    const data = await AuthApi.withdrawalEmail();
    if (AuthStatusOk(data.msStatus)) {
      setMessage({
        title: "확인",
        content: "회원탈퇴 인증 이메일을 보냈습니다.",
        callbackOk: () => {
          setMessage(null);
          Repo.clearItem();
          navigate("/auth/login");
        }
      });
    } else if (data.msStatus && AuthStatus[data.msStatus]) {
      const msg = (data.msStatus === AuthStatus.MSG_FROM_SERVER.value)
        ? data.msgFromServer : AuthStatus[data.msStatus].desc;
      setMessage({
        title: "확인",
        content: msg,
        callbackOk: () => { setMessage(null); }
      });
    }
  }

  const handleClickSetting = () => {
    userInfo.localImage = null;
    setSelectedImage(null);
    console.log("handleClickSetting userInfo : ", userInfo);
    console.log("handleClickSetting selectedImage : ", selectedImage);
    setInitialUserInfo({ ...userInfo }); // 초기 상태 저장
    setIsEditing(true);
  };

  const handleClickLogout = async () => {
    await AuthApi.logout().then(() => {
      navigate("/auth/login");
    });
    Repo.clearItem();
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
      console.log("변경 before : ", changedFields);
      const data = await AuthApi.updateUserInfo(changedFields, userInfo.localImage);
      console.log("변경 after : ", data);

      if (AuthStatusOk(data.msStatus)) {
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          profileImagePath: data.profileImagePath,
          dontUseProfileImage: (data.profileImagePath) ? false : true,
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
      setSelectedImage(URL.createObjectURL(file));
      userInfo.localImage = file;
      userInfo.dontUseProfileImage = false;
    } else {
      console.log("handleImageChange 여기로 들어오는 경우는?");
    }
  };

  const handleClickDontUseImage = () => {
    // 이미지 사용하지 않기로 설정
    setSelectedImage(null);
    setUserInfo(prevUserInfo => ({
      ...prevUserInfo,
      dontUseProfileImage: true,
      localImage: null, // 로컬 이미지도 삭제
    }));
    console.log("handleClickDontUseImage userInfo : ", userInfo);
  };


  const getHostImagePath = () => {
    return (userInfo.profileImagePath) ? `${HOST_URL}` + userInfo.profileImagePath : null;
  };

  const getImageUrl = () => {
    // dontUseProfileImage가 true일 경우 이미지 비사용 상태
    if (userInfo.dontUseProfileImage === true) {
      console.log(" getImageUrl dontUseProfileImage : ", userInfo.dontUseProfileImage);
      return null;
    } else if (selectedImage !== null) {
      console.log(" getImageUrl selectedImage : ", selectedImage);
      return selectedImage;
    } else {
      const path = getHostImagePath();
      console.log(" getImageUrl getHostImagePath : ", path);
      return path;
    }
  };

  //============================================================================================
  //============================================================================================
  //============================================================================================
  return (
    <div className="relative">
      {/* 로그인 프로필 이미지 버튼 */}
      <button
        onClick={handleClickOpen}
        className="user-info-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        ref={buttonRef}  // 버튼에 ref 추가
      >
        {/* 프로필 이미지 버튼 */}
        <ProfileImage
          src={getHostImagePath()}
          userName={userInfo.name}
          size={50}
        />
      </button>

      {/* 모달 팝업 */}
      <ModalMessage message={message} />

      {/* 유저 정보 팝업 */}
      {isOpen && (
        <div className="popup-content" ref={popupRef}>
          <div className="popup-header">
            {/* 유저 정보 변경 팝업 */}
            {isEditing ? (
              <div className="user-info">
                {/* <p>dontUseProfileImage : {userInfo.dontUseProfileImage.toString()}</p>
                <p>selectedImage : {selectedImage || '없음'}</p>
                <p>getHostImagePath() : {getHostImagePath()}</p> */}
                <div className="profile-container">
                  {/* 유저 프로필 : 유저정보 변경 팝업  */}
                  <ProfileImage
                    src={getImageUrl()}
                    userName={userInfo.name}
                  />
                  <button
                    className="select_img_btn"
                    onClick={() => fileInputRef.current.click()} // 버튼 클릭 시 파일 선택창 열기
                    disabled={userInfo.socialLogin}
                  >
                    변경
                  </button>
                  <button
                    className="delete_img_btn"
                    onClick={handleClickDontUseImage}
                    disabled={userInfo.socialLogin}
                  >
                    삭제
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
                  disabled
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
              //{/* 유저 프로필 : 유저정보 팝업  */}
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
                <button onClick={handleSaveChanges} className="auth-button-save">
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)} // Exit edit mode
                  className="auth-button-cancel"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button onClick={handleClickWithdrawalEmail} className="auth-button-withdrawal">
                  <Settings size={16} />
                  회원탈퇴
                </button>
                <button onClick={handleClickSetting} className="auth-button-change">
                  <Settings size={16} />
                  정보변경
                </button>
                <button onClick={handleClickLogout} className="auth-button-logout">
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
