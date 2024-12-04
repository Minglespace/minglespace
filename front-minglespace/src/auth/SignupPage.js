import { X, Eye, EyeOff, Check } from "lucide-react";
import React, { useState } from "react";
import { render } from "react-dom";


import AuthApi from "../api/AuthApi";
import Repo from "./Repo";


import { useNavigate } from "react-router-dom";

import "./SignupPage.css"

const SignupPage = () => {
  // const [isOpen, setIsOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "codejay2018@gmail.com",
    verificationCode: "Aa!1Aa!1",
    password: "Aa!1Aa!1",
    confirmPassword: "Aa!1Aa!1",
    name: "codejay2018",
    phone: "01012345678",
    role: "ADMIN",
    position: "CTO",
    introduction: "Test Data",
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();



  // ===============================================================
  // ===============================================================
  

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }
    if (!formData.verificationCode && verificationSent) {
      newErrors.verificationCode = "인증번호를 입력해주세요";
    }
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }
    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요";
    }
    if (!formData.phone) {
      newErrors.phone = "전화번호를 입력해주세요";
    }
    if (!formData.position) {
      newErrors.position = "직책을 입력해주세요";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted:", formData);

      await AuthApi.signup(formData).then((data) => {
        console.log(data);
        if(data.code === 200){
          Repo.setItem(data);
          navigate("/auth/login");
        }else{
          // 뭘할까?
        }        
      });
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
  const handleVerification = () => {
    if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
      setVerificationSent(true);
      console.log("Verification code sent to:", formData.email);
    } else {
      setErrors((prev) => ({
        ...prev,
        email: "올바른 이메일을 입력해주세요",
      }));
    }
  };

  const handleBack = () =>{
    navigate("/");
  }


  // if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          maxWidth: "900px",
          width: "90%",
          position: "relative",
          display: "flex",
          overflow: "hidden",
        }}
      >
        <button
          // onClick={() => setIsOpen(false)}
          onClick={handleBack}
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={24} />
        </button>

        <div
          style={{
            flex: 1,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800"
            alt="팀 협업 이미지"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            padding: "2rem",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            회원가입
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                marginBottom: "1rem",
              }}
            >
              <label>이메일</label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    border: errors.email ? "1px solid red" : "1px solid #ccc",
                  }}
                  placeholder="이메일을 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleVerification}
                  disabled={verificationSent}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: verificationSent ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  {verificationSent ? "재전송" : "인증"}
                </button>
              </div>
              {errors.email && (
                <span
                  style={{
                    color: "red",
                    fontSize: "0.8rem",
                  }}
                >
                  {errors.email}
                </span>
              )}
            </div>

            {verificationSent && (
              <div
                style={{
                  marginBottom: "1rem",
                }}
              >
                <label>인증번호</label>
                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: errors.verificationCode
                      ? "1px solid red"
                      : "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                  placeholder="인증번호를 입력하세요"
                />
                {errors.verificationCode && (
                  <span
                    style={{
                      color: "red",
                      fontSize: "0.8rem",
                    }}
                  >
                    {errors.verificationCode}
                  </span>
                )}
              </div>
            )}

            <div
              style={{
                marginBottom: "1rem",
              }}
            >
              <label>비밀번호</label>
              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: errors.password
                      ? "1px solid red"
                      : "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span
                  style={{
                    color: "red",
                    fontSize: "0.8rem",
                  }}
                >
                  {errors.password}
                </span>
              )}
            </div>

            <div
              style={{
                marginBottom: "1rem",
              }}
            >
              <label>비밀번호 확인</label>
              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: errors.confirmPassword
                      ? "1px solid red"
                      : "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span
                  style={{
                    color: "red",
                    fontSize: "0.8rem",
                  }}
                >
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <div
              style={{
                marginBottom: "1rem",
              }}
            >
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: errors.name ? "1px solid red" : "1px solid #ccc",
                  borderRadius: "4px",
                }}
                placeholder="이름을 입력하세요"
              />
              {errors.name && (
                <span
                  style={{
                    color: "red",
                    fontSize: "0.8rem",
                  }}
                >
                  {errors.name}
                </span>
              )}
            </div>

            <div
              style={{
                marginBottom: "1rem",
              }}
            >
              <label>전화번호</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: errors.phone ? "1px solid red" : "1px solid #ccc",
                  borderRadius: "4px",
                }}
                placeholder="전화번호를 입력하세요"
              />
              {errors.phone && (
                <span
                  style={{
                    color: "red",
                    fontSize: "0.8rem",
                  }}
                >
                  {errors.phone}
                </span>
              )}
            </div>

            <div
              style={{
                marginBottom: "1rem",
              }}
            >
              <label>직책</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: errors.position ? "1px solid red" : "1px solid #ccc",
                  borderRadius: "4px",
                }}
                placeholder="직책을 입력하세요"
              />
              {errors.position && (
                <span
                  style={{
                    color: "red",
                    fontSize: "0.8rem",
                  }}
                >
                  {errors.position}
                </span>
              )}
            </div>

            <div
              style={{
                marginBottom: "1rem",
              }}
            >
              <label>소개글</label>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  minHeight: "100px",
                  resize: "vertical",
                }}
                placeholder="자기소개를 입력하세요"
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                marginTop: "1rem",
              }}
            >
              회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default SignupPage;
