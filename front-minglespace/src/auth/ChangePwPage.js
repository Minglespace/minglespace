import React, { useCallback, useEffect, useState } from 'react'
import AuthApi from '../api/AuthApi';
import { useNavigate } from 'react-router-dom';
import { AuthStatus, AuthStatusOk } from '../api/AuthStatus';
import { Eye, EyeOff, X } from 'lucide-react';
import ModalMessage from '../common/Layouts/components/ModalMessage';

const ChangePwPage = () => {

  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  //===============================================================================================
  //===============================================================================================
  //===============================================================================================
  
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
  
      case "confirmPassword":
        if (formData.password && value !== formData.password) {
          newError.confirmPassword = "비밀번호가 일치하지 않습니다";
        }
        break;
  
      default:
        break;
    }
  
    return newError;
  };

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

  const handleClickRequest = async (e) => {
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
      setMessage({
        title: "확인", 
        content: "비밀번호를 변경 하시겠습니까?",  
        callbackYes: ()=>{
          setMessage(null);
          sendChangePw();
        },
        callbackNo: ()=>{
          setMessage(null);
        }
      });
    }
  };

  const sendChangePw = async () => {
    await AuthApi.changePw(formData).then((data) => {
      if (AuthStatusOk(data.msStatus)) {
        setMessage({
          title: "확인",
          content: "비밀번호 변경이 완료 되었습니다. 이메일 인증을 진행해 주세요.",
          callbackOk: ()=>{navigate("/auth/login")}
        });
      } else if (data.msStatus && AuthStatus[data.msStatus]) {
        setMessage({
          title: "확인",
          content: AuthStatus[data.msStatus].desc,
          callbackOk: ()=>{setMessage(null)}
        });
      }
    })
    .catch((error)=>{
      console.log("sendChangePw exception : ", error);
    });
  }

  const handlePopupClose = () =>{
    navigate("/auth/login");
  };


  //===============================================================================================
  //===============================================================================================
  //===============================================================================================
  return (
    <div className="modal-overlay_login_page">
      <div className="modal-container_login_page">

        {/* 모달 팝업 */}
        <ModalMessage message={message} />

        {/* 닫기 */}
        <button onClick={handlePopupClose} className="signup-page-close-button">
          <X size={24} />
        </button>

        {/* 왼쪽의 협업 이미지 */}
        <div className="image-container">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800"
            alt="팀 협업 이미지"
            className="modal-image"
          />
        </div>

        {/* 오른쪽 패널 */}
        <div className="form-container">
          <div className="form-wrapper">
            <h2 className="form-title">비밀번호 변경</h2>
              {/* 폼 */}
              <form onSubmit={handleClickRequest}>

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

                <div className="form-group">
                  <label className="input-label">비밀번호 확인</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field ${errors.confirmPassword ? "error" : ""}`}
                      placeholder="비밀번호를 다시 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  <span className="auth-error-message" 
                    style={{visibility: errors.confirmPassword ? 'visible' : 'hidden'}}>
                    {errors.confirmPassword || 'blank'} 
                  </span>    
                </div>

                <div className="form-group">
                  <div className="input input-label">
                    비밀번호를 변경하면<br/>이메일 인증후 반영됩니다.
                  </div>
                </div>

                <button type="submit" className="submit-button">변경하기</button>

              </form>
          </div>
        </div>
      </div>
    </div>

    
  )
}

export default ChangePwPage
