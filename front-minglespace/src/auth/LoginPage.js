﻿import React, { useEffect, useState } from "react";
import AuthApi from "../api/AuthApi";
import Repo from "./Repo";

import { HOST_URL_BASE } from "../api/Api";
import { Eye, EyeOff } from "lucide-react";
import { AuthStatus, AuthStatusOk } from "../api/AuthStatus";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ModalMessage from "../common/Layouts/components/ModalMessage";

const LoginPage = () => {
  //================================================================================================
  //================================================================================================
  //================================================================================================
  //================================================================================================
  const navigate = useNavigate();
  const location = useLocation();

  const {code, encodedEmail, encodedVerifyType} = useParams();
  const {msg} = useParams();

  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  //================================================================================================
  //================================================================================================
  //================================================================================================
  //================================================================================================
  useEffect(() => {
    if (msg && AuthStatus[msg]) {
      // 메시지 처리
      setMessage({
        title: "확인", 
        content: AuthStatus[msg].desc,  
        callbackOk: handleClickMsgPopup
      });
    }else if(code && encodedEmail && encodedVerifyType){
      // 인증 이메일 링크 처리
      setTimeout(() => {
      sendVerify(code, encodedEmail, encodedVerifyType);
      }, 1000);
    }
  }, []);

  const sendVerify = (code, encodedEmail, encodedVerifyType) => {
    AuthApi.verify(code, encodedEmail, encodedVerifyType).then((data) => {
      console.log("AuthApi.verify data : ", data);
      const title = "로그인";
      if (AuthStatusOk(data.msStatus)) {
        if(data.verifyType === "SIGNUP"){
          setMessage({
            title: title, 
            content: AuthStatus.SinupDone.desc,  
            callbackOk: ()=>{setMessage(null)}
          });
        }else if(data.verifyType === "WITHDRAWAL"){
          setMessage({
            title: title, 
            content: AuthStatus.WithdrawalAble.desc,  
            callbackOk: handleClickMsgPopup
          });
        }else if(data.verifyType === "CHANGE_PW"){
          setMessage({
            title: title, 
            content: AuthStatus.ChangePasswordDone.desc,  
            callbackOk: handleClickMsgPopup
          });
        }else{
          console.log("새로운 타입이 추가되었는지 확인하세요.");
        }
      } else {
        console.log("AuthApi.verify 오류 : ", AuthStatus[data.msStatus].desc);
        setMessage({
          title: title, 
          content: AuthStatus[data.msStatus].desc,  
          callbackOk: ()=>{setMessage(null)}
        });
      }
    });
  }
   
  const validateField = (name, value) => {
  
    const newError = {};
  
    switch (name) {
      case "email":
        if (!value) {
          newError.email = "이메일을 입력해주세요";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newError.email = "올바른 이메일 형식이 아닙니다";
        }
        break;
  
      case "password":
        if (!value) {
          newError.password = "비밀번호를 입력해주세요";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/.test(value)) {
          newError.password = "최소 8자 이상이며, 대소문자, 특수문자가 포함해야 합니다.";
        }
        break;
  
      default:
        break;
    }
  
    return newError;
  };
  //================================================================================================
  //================================================================================================
  //================================================================================================
  //================================================================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      const newErrors = validateField(name, value);

      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        if (newErrors[name]) {
          updatedErrors[name] = newErrors[name];
        } else {
          delete updatedErrors[name];
        }
        return updatedErrors;
      });
      return newFormData;
    });
  };

  const validateAll = () => {
    let formValid = true;
  
    Object.keys(formData).forEach((field) => {
  
      const fieldValue = formData[field];
      const fieldError = errors[field];
      // formData 필드가 비어있거나 errors 필드에 오류가 있으면 formValid를 false로 설정
      if (!fieldValue || fieldValue.trim() === "" || fieldError) {
        formValid = false;
      }
    });
  
    return formValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form 제출 전에 모든 필드의 유효성 검사
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const fieldValue = formData[field];
      const fieldError = validateField(field, fieldValue);
      if (fieldError && fieldError[field]) {
        newErrors[field] = fieldError[field]; // 각 필드에 오류 메시지를 저장
      }
    });
    
    // 모든 오류를 상태에 설정
    setErrors(newErrors);    


    if (validateAll()) {

      const {email, password} = formData;
      const data = await AuthApi.login(email, password);
      
      if(AuthStatusOk(data.msStatus)){

        Repo.setItem(data);

        if(data.withdrawalType === "EMAIL"
        || data.withdrawalType === "ABLE"
        || data.withdrawalType === "DELIVERATION"){
          navigate("/auth/withdrawal");
        }else{
          navigate(getUriPath(location), { replace: true });
        }
      }else if(data.msStatus && AuthStatus[data.msStatus]){
        setMessage({
          title: "확인", 
          content: AuthStatus[data.msStatus].desc,  
          callbackOk: handleClickMsgPopup
        });
      }
    }
  };

  const handleClickMsgPopup = () => {
    setMessage(null);
    navigate("/auth/login");
  };

  const getUriPath = () => {
    const uri = location.state?.from || "/main";
    return uri;
  };

  const handleClickGoogle = () => {
    const url = `${HOST_URL_BASE}/oauth2/authorization/google`;
    window.location.href = url;
  };
  const handleClickNaver = () => {
    const url = `${HOST_URL_BASE}/oauth2/authorization/naver`;
    window.location.href = url;
  };
  const handleClicKakao = () => {
    const url = `${HOST_URL_BASE}/oauth2/authorization/kakao`;
    window.location.href = url;
  };

  //================================================================================================
  //================================================================================================
  //================================================================================================
  //================================================================================================
  return (
    <div className="modal-overlay_login_page">
      <div className="modal-container_login_page">
        {/* 모달 팝업 */}
        <ModalMessage message={message} />

        {/* 왼쪽 협업 이미지 */}
        <div className="image-container">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800"
            alt="팀 협업 이미지"
            className="modal-image"
          />
        </div>
        {/* 왼쪽 패널 */}
        <div className="form-container">
          <div className="form-wrapper">
            {/* 폼 */}
            <h2 className="form-title">로그인</h2>
            <form onSubmit={handleSubmit} className="form">

              <div className="form-group">
                <label className="input-label">이메일</label>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? "error" : ""}`}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                <span className="auth-error-message" 
                  style={{visibility: errors.email ? 'visible' : 'hidden'}}>
                  {errors.email || 'blank'} 
                </span>              
              </div>

              <div className="form-group">
                <label className="input-label">비밀번호</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field ${errors.password ? "error" : ""}`}
                    placeholder="비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <span className="auth-error-message" 
                  style={{visibility: errors.password ? 'visible' : 'hidden'}}>
                  {errors.password || 'blank'} 
                </span>    
              </div>

              <button type="submit" className="submit-button">
                로그인
              </button>
            </form>
            {/* 소셜 로그인 */}
            <div className="social-login">
              <div className="divider-container">
                <div className="divider"></div>
                <span className="divider-text">또는</span>
              </div>
              <div className="social-buttons">
                <button className="google-button" onClick={handleClickGoogle}>
                  <img
                    src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
                    alt="Google"
                    className="social-icon"
                  />
                  Google로 계속하기
                </button>
                <button className="kakao-button" onClick={handleClicKakao}>
                  <img
                    src="https://developers.kakao.com/static/images/pc/product/icon/kakaoTalk.png"
                    alt="Kakao"
                    className="social-icon"
                  />
                  카카오로 계속하기
                </button>
                <button className="naver-button" onClick={handleClickNaver}>
                  <img
                    src="https://www.naver.com/favicon.ico"
                    alt="Naver"
                    className="social-icon"
                  />
                  네이버로 계속하기
                </button>
              </div>
            </div>
            {/* 기타 링크 */}
            <div className="footer-links">
              <Link to={`/auth/changepw`}>비밀번호 변경</Link>
              <Link to={`/auth/signup`}>회원가입</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
