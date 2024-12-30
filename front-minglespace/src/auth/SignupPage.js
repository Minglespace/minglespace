import { X, Eye, EyeOff } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthApi from "../api/AuthApi";
import Modal from "../common/Layouts/components/Modal";
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
  const isFirstRender = useRef(true); // 렌더링을 처음 했는지 확인할 수 있는 useRef
  const [formData, setFormData] = useState({
    email: "codejay2018@gmail.com",
    verificationCode: "Aa!1Aa!1",
    password: "Aa!1Aa!1",
    confirmPassword: "Aa!1Aa!1",
    name: "codejay2018",
    phone: "01012345678",
    role: "ROLE_ADMIN",
    position: "CTO",
    introduction: "Test Data",
    inviteWorkspace: false,
  });

  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/.test(formData.password)) {
      newErrors.password = "최소 8자 이상이며, 대소문자, 특수문자가 포함해야 합니다.";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }
    
    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요";
    }
    
    if (!formData.phone) {
      newErrors.phone = "전화번호를 입력해주세요";
    } else if (!/^(01[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}|0[2-9]{1}[0-9]{1}-?[0-9]{3,4}-?[0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = "올바른 전화번호 형식이 아닙니다";
    }

    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  useEffect(() => {
    // 첫 번째 렌더링 이후에만 validate 실행
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    validate();
  }, [formData, validate]);

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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted:", formData);
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
            callbackOk: ()=>{setMessage(null)}
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
              <label>이메일</label>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? "error" : ""}`}
                  placeholder="이메일을 입력하세요"
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>비밀번호</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${errors.password ? "error" : ""}`}
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
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label>비밀번호 확인</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input ${errors.confirmPassword ? "error" : ""}`}
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
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? "error" : ""}`}
                placeholder="이름을 입력하세요"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label>전화번호</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input ${errors.phone ? "error" : ""}`}
                placeholder="전화번호를 입력하세요"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label>직책</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`input ${errors.position ? "error" : ""}`}
                placeholder="직책을 입력하세요"
              />
              {errors.position && (
                <span className="error-message">{errors.position}</span>
              )}
            </div>

            <div className="form-group">
              <label>소개글</label>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                className="input"
                placeholder="자기소개를 입력하세요"
              />
            </div>

            <button type="submit" className="submit-button">
              회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
