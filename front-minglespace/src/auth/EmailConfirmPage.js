import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./EmailConfirmPage.css";
import AuthApi from '../api/AuthApi';

const EmailConfirmPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(null);

  useEffect(() => {
    // URLSearchParams로 쿼리 파라미터에서 token 추출
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    setCode(codeParam); // code 값 상태로 설정
    console.log("EmailConfirmPage code : ", codeParam);
  }, []);

  const handleClick = () => {
    console.log("EmailConfirmPage handleClick code : ", code);

    if (code) {
      AuthApi.confirm(code).then((data) => {
        if (data.code === 200) {
          navigate("/auth/login");
        }
      });
    } else {
      console.error("code is missing");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h4 className="form-title">이메일 인증하기<br />이메일 인증하면 회원등록이 완료됩니다.</h4>
        <button type="submit" className="submit-button" onClick={handleClick}>확인</button>
      </div>
    </div>
  );
};

export default EmailConfirmPage;
