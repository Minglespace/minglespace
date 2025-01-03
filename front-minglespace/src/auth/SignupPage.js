import { X, Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthApi from "../api/AuthApi";
import { AuthStatus, AuthStatusOk } from "../api/AuthStatus";
import ModalMessage from "../common/Layouts/components/ModalMessage";

//========================================================================
//========================================================================
//========================================================================
const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    position: "",
    introduction: "",
    role: "ROLE_ADMIN",
    inviteWorkspace: false,
  });

  //워크스페이스에 비회원 초대를 받았을 경우
  useEffect(() => {
    if (location.state) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        inviteWorkspace: true,
      }));
    }
  }, [location.state]);
  //========================================================================
  //========================================================================
  //========================================================================
  const fieldsToSkip = [
    "verificationCode",
    "introduction",
    "role",
    "inviteWorkspace",
  ];
  
  const validateField = (name, value) => {
    if (fieldsToSkip.includes(name)) {
      return {}; // 유효성 검사를 하지 않음
    }
  
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
  
      case "name":
        if (!value) {
          newError.name = "이름을 입력해주세요";
        }
        break;
  
      case "phone":
        if (!value) {
          newError.phone = "전화번호를 입력해주세요";
        } else if (!/^(01[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}|0[2-9]{1}[0-9]{1}-?[0-9]{3,4}-?[0-9]{4})$/.test(value)) {
          newError.phone = "올바른 전화번호 형식이 아닙니다";
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
      // 검사할 필드인지 확인
      if (fieldsToSkip.includes(field)) 
        return;  // 유효성 검사 제외
  
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
      await AuthApi.signup(formData).then((data) => {
        console.log("Form submitted data : ", data);
        if (AuthStatusOk(data.msStatus)) {
          setMessage({
            title: "회원가입", 
            content: AuthStatus.SinupRegiDone.desc,  
            callbackOk: handlePopupCloseGotoLogin
          });
  
        } else if (data.msStatus && AuthStatus[data.msStatus]) {
          setMessage({
            title: "회원가입",
            content: AuthStatus[data.msStatus].desc,
            callbackOk: () => { setMessage(null) }
          });
        }
      });
    }
  };

  const handlePopupCloseGotoLogin = () => {
    navigate("/auth/login", { state: { from: location.state?.from } });
  };

  //========================================================================
  //========================================================================
  //========================================================================
  return (
    <div className="signup-page-overlay">
      <div className="signup-page-container">

        {/* 모달 팝업 */}
        <ModalMessage message={message} />

        {/* 닫기 */}
        <button onClick={handlePopupCloseGotoLogin} className="signup-page-close-button">
          <X size={24} />
        </button>

        {/* 왼쪽의 협업 이미지 */}
        <div className="image-container">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800"
            alt="팀 협업 이미지"
            className="signup-image"
          />
        </div>

        {/* 오른쪽 패널 */}
        <div className="form-container">
          <h2 className="form-title">회원가입</h2>
          {/* 폼 */}
          <form onSubmit={handleSubmit}>

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
              <label className="input-label">이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? "error" : ""}`}
                placeholder="이름을 입력하세요"
              />
              <span className="auth-error-message" 
                style={{visibility: errors.name ? 'visible' : 'hidden'}}>
                {errors.name || 'blank'} 
              </span>                  
            </div>

            <div className="form-group">
              <label className="input-label">전화번호</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input-field ${errors.phone ? "error" : ""}`}
                placeholder="전화번호를 입력하세요"
              />
              <span className="auth-error-message" 
                style={{visibility: errors.phone ? 'visible' : 'hidden'}}>
                {errors.phone || 'blank'} 
              </span>                  
            </div>

            <div className="form-group">
              <label className="input-label">직책</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`input-field ${errors.position ? "error" : ""}`}
                placeholder="직책을 입력하세요"
              />
              {errors.position && (
                <span className="auth-error-message">{errors.position}</span>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">소개글</label>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                className="input-field text-area"
                placeholder="자기소개를 입력하세요"
              />
            </div>

            <button type="submit" className="submit-button">
              회원가입
            </button>

            {/* <button type="submit" className="submit-button" disabled={!validateAll()}>
              회원가입
            </button> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
