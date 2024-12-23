import React, { useEffect, useState } from "react";

import { X, Eye, EyeOff } from "lucide-react";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Repo from "./Repo";
import AuthApi from "../api/AuthApi";
import Modal from "../common/Layouts/components/Modal";
import { HOST_URL } from "../api/Api";
import { AuthStatus, AuthStatusOk } from "../api/AuthStatus";

const LoginPage = () => {
  //================================================================================================
  //================================================================================================
  //================================================================================================
  //================================================================================================
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "codejay2018@gmail.com",
    password: "Aa!1Aa!1",
  });
  const [message, setMessage] = useState(null);

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const { code, encodedEmail } = useParams();
  const { msg } = useParams();

  //================================================================================================
  //================================================================================================
  //================================================================================================
  //================================================================================================
  useEffect(() => {
    if (msg && AuthStatus[msg]) {
      console.log("msg : ", msg);

      setMessage({
        title: "확인",
        content: AuthStatus[msg].desc,
      });
    } else if (code && encodedEmail) {
      console.log("code : ", code);
      console.log("encodedEmail : ", encodedEmail);

      setTimeout(() => {
        AuthApi.verify(code, encodedEmail).then((data) => {
          if (AuthStatusOk(data.msStatus)) {
            setIsOpenPopup(true);
          } else {
            setIsOpenPopup(false);
          }
        });
      }, 1000);
    } else {
      setIsOpenPopup(false);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  //================================================================================================
  //================================================================================================
  //================================================================================================
  //================================================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {

      const {email, password} = formData;
      const data = await AuthApi.login(email, password);
      
      if(AuthStatusOk(data.msStatus)){
        Repo.setItem(data);
        // navigate("/main");
        navigate(getUriPath(), { replace: true });
      } else if (data.msStatus && AuthStatus[data.msStatus]) {
        setMessage({
          title: "확인",
          content: AuthStatus[data.msStatus].desc,
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClickMsgPopup = () => {
    setMessage(null);
    navigate("/auth/login");
  };

  const handleClickPopup = () => {
    setIsOpenPopup(false);
  };

  const getUriPath = () => {
    const uri = location.state?.from || "main";
    if (uri === "main") {
      return `/main`;
    } else {
      const segments = uri.split("/");
      return `/${segments[1]}/${segments[2]}`;
    }
  };

  const handleClickGoogle = () => {
    const url = `${HOST_URL}/oauth2/authorization/google`;
    window.location.href = url;
  };
  const handleClickNaver = () => {
    const url = `${HOST_URL}/oauth2/authorization/naver`;
    window.location.href = url;
  };
  const handleClicKakao = () => {
    const url = `${HOST_URL}/oauth2/authorization/kakao`;
    window.location.href = url;
  };

  //================================================================================================
  //================================================================================================
  //================================================================================================
  //================================================================================================
  return (
    <div className="modal-overlay_login_page">
      <div className="modal-container_login_page">
        <div className="image-container">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800"
            alt="팀 협업 이미지"
            className="modal-image"
          />
        </div>

        <Modal open={message !== null} onClose={handleClickMsgPopup}>
          {message && (
            <div className="workspace_add_modal_container">
              <p className="form-title">{message.title}</p>
              <p>{message.content}</p>
              <button
                type="submit"
                className="add_button"
                onClick={handleClickMsgPopup}
              >
                확인
              </button>
            </div>
          )}
        </Modal>

        <Modal open={isOpenPopup} onClose={handleClickPopup}>
          <div className="workspace_add_modal_container">
            <p className="form-title">이메일 인증완료</p>
            <p>회원가입이 완료 되었습니다.</p>
            <button
              type="submit"
              className="add_button"
              onClick={handleClickPopup}
            >
              확인
            </button>
          </div>
        </Modal>

        <div className="form-container">
          <div className="form-wrapper">
            <h2 className="form-title">로그인</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="input-group">
                <label className="input-label">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? "input-error" : ""}`}
                  placeholder="이메일을 입력하세요"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">비밀번호</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field ${
                      errors.password ? "input-error" : ""
                    }`}
                    placeholder="비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <button type="submit" className="submit-button">
                로그인
              </button>
            </form>

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

            <div className="footer-links">
              <Link to={`/auth/signup`}>비밀번호 찾기</Link>
              <Link to={`/auth/signup`}>회원가입</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
