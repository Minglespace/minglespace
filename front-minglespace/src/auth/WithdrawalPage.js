import React from 'react'
import AuthApi from '../api/AuthApi';
import Button from '../common/Layouts/components/Button';
import { AuthStatusOk } from '../api/AuthStatus';
import { useNavigate } from 'react-router-dom';

const WithdrawalPage = () => {

    const navigate = useNavigate();
  
  const handleClickEnroll = async () =>{
    await AuthApi.withdrawalEnroll()
      .then((data)=>{
      })
      .catch((error)=>{
        console.log();
      });
  };
  const handleClickImmediately = async () =>{
    await AuthApi.withdrawalImmediately()
      .then((data)=>{
      })
      .catch((error)=>{
        console.log();
      });
  };
  const handleClickCancel = async () =>{
    await AuthApi.withdrawalCancel()
      .then((data)=>{
        handleClickLogout();
      })
      .catch((error)=>{
        console.log();
      });
  };
  const handleClickLogout = async () =>{
    await AuthApi.logout()
      .then(()=>{
        navigate("/auth/login");
      })
      .catch((error)=>{
        console.log();
      });
  };

  return (
    <div>

      <Button btnStyle="add_button" title="회원 탈퇴 신청" onClick={handleClickEnroll} /><br></br>
      <Button btnStyle="add_button" title="회원 탈퇴 즉시" onClick={handleClickImmediately} /><br></br>
      <Button btnStyle="add_button" title="회원 탈퇴 취소" onClick={handleClickCancel} /><br></br>
      <Button btnStyle="exit_button" title="로그아웃" onClick={handleClickLogout} />

      </div>
  )
}

export default WithdrawalPage