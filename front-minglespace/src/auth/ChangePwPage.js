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

    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;

  }, [formData]);

  useEffect(() => {
    validate();
  }, [formData, validate]);


  //===============================================================================================
  //===============================================================================================
  //===============================================================================================
  const handleClickRequest = async (e) => {
    e.preventDefault();
    if (validate()) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                  <div className="input">
                    비밀번호를 변경하면<br/>이메일 인증후 반영됩니다.
                  </div>
                </div>

                <div className="divider-container">
                  <div className="divider"></div>
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
