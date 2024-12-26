import React, { useEffect, useState } from 'react'
import AuthApi from '../api/AuthApi';
import Button from '../common/Layouts/components/Button';
import { useNavigate } from 'react-router-dom';
import Repo from './Repo';
import { AuthStatus, AuthStatusOk } from '../api/AuthStatus';
import Modal from '../common/Layouts/components/Modal';

const WithdrawalPage = () => {

  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(()=>{
    sendWithdrawalInfo();
  }, []);

  //===============================================================================================
  //===============================================================================================
  //===============================================================================================

  const sendWithdrawalInfo = async () => {
    await AuthApi.withdrawalInfo()
      .then((data)=>{
        if(data){
          setInfo(data);
        }else{
          Repo.clearItem();
          navigate("/auth/login");
        }
      })
      .catch((error)=>{
        console.log("sendWithdrawalInfo exception : ", error);
      });
  }

  const handleClickEnroll = () =>{
    setMessage({
      title: "확인", 
      content: "회원탙퇴 신청을 하시겠습니까?",  
      callbackYes: ()=>{
        setMessage(null);
        sendWithdrawalEnroll();
      },
      callbackNo: ()=>{
        setMessage(null);
      }
    });
  };

  const sendWithdrawalEnroll = async () => {
    await AuthApi.withdrawalEnroll()
    .then((data)=>{
      if(AuthStatusOk(data.msStatus)){
        setMessage({
          title: "확인", 
          content: "회원탙퇴 신청이 완료되었습니다.\n 일정기간 이후 자동 탈퇴가 완료 됩니다.\n 기간내에 회원탈퇴 취소가 가능합니다.",  
          callbackOk: ()=>{
            setMessage(null);
            Repo.clearItem();
            navigate("/auth/login");
          }
        });
      }else if(data.msStatus && AuthStatus[data.msStatus]){
        setMessage({
          title: "확인", 
          content: AuthStatus[data.msStatus].desc,  
          callbackOk: ()=>{setMessage(null)}
        });
      }
    })
    .catch((error)=>{
      console.log("sendWithdrawalEnroll exception : ", error);
    });
  }

  const handleClickImmediately = () =>{
    setMessage({
      title: "확인", 
      content: "즉시 회원탙퇴 하시겠습니까?",  
      callbackYes: ()=>{
        setMessage(null);
        sendWithdrawalImmediately();
      },
      callbackNo: ()=>{
        setMessage(null);
      }
    });
  };

  const sendWithdrawalImmediately = async () => {
    await AuthApi.withdrawalImmediately()
    .then((data)=>{
      if(AuthStatusOk(data.msStatus)){
        setMessage({
          title: "확인", 
          content: "회원탙퇴가 완료되었습니다.",  
          callbackOk: ()=>{
            setMessage(null);
            Repo.clearItem();
            navigate("/auth/login");
          }
        });

      }else if(data.msStatus && AuthStatus[data.msStatus]){
        setMessage({
          title: "확인", 
          content: AuthStatus[data.msStatus].desc,  
          callbackOk: ()=>{setMessage(null)}
        });
      }
    })
    .catch((error)=>{
      console.log("sendWithdrawalImmediately exception : ", error);
    });
  }

  const handleClickCancel = () =>{
    setMessage({
      title: "확인", 
      content: "회원탙퇴를 취소하시겠습니까?",  
      callbackYes: ()=>{
        setMessage(null);
        sendWithdrawalCancel();
      },
      callbackNo: ()=>{
        setMessage(null);
      }
    });
  };

  const sendWithdrawalCancel = async () => {
    await AuthApi.withdrawalCancel()
      .then(()=>{
        setMessage({
          title: "확인", 
          content: "회원탈퇴신청이 취소 되었습니다.",  
          callbackOk: ()=>{
            setMessage(null);
            handleClickLogout();
          }
        });
      })
      .catch((error)=>{
        console.log("sendWithdrawalCancel exception : ", error);
      });
  }

  const handleClickReEmail = () =>{
    setMessage({
      title: "확인", 
      content: "회원탙퇴 이메일 인증을 재전송 하시겠습니까?",  
      callbackYes: ()=>{
        setMessage(null);
        sendWithdrawalReEmail();
      },
      callbackNo: ()=>{
        setMessage(null);
      }
    });
  };

  const sendWithdrawalReEmail = async () => {
    await AuthApi.withdrawalEmail()
      .then((data)=>{
        if(AuthStatusOk(data.msStatus)){
          setMessage({
            title: "확인", 
            content: "회원탈퇴 인증 이메일이 전송 되었습니다.",  
            callbackOk: ()=>{
              setMessage(null);
              handleClickLogout();
            }
          });
        }else if(data.msStatus && AuthStatus[data.msStatus]){
          setMessage({
            title: "확인", 
            content: AuthStatus[data.msStatus].desc,  
            callbackOk: ()=>{setMessage(null)}
          });
        }
      })
      .catch((error)=>{
        console.log("sendWithdrawalReEmail exception : ", error);
      });
  }

  const handleClickLogout = async () =>{
    await AuthApi.logout()
      .then(()=>{
        navigate("/auth/login");
      })
      .catch((error)=>{
        console.log("handleClickLogout exception : ", error);
      });
  };
  //===============================================================================================
  //===============================================================================================
  //===============================================================================================
  const formatDate = (dateString) => {
    if(dateString === null || dateString === "undefined")
      return "";

    const date = new Date(dateString);
  
    // 연, 월, 일, 시, 분을 각각 추출
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 1월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
  
    // 원하는 형식으로 반환
    return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
  };
  const getWithdrawalMessage = (withdrawalType) => {
    switch (withdrawalType) {
      case 'EMAIL':
        return '이메일 인증을 완료하세요.';
      case 'ABLE':
        return '회원 탈퇴가 가능합니다.';
      case 'DELIVERATION':
        return '회원 탈퇴 숙려기간 중입니다.';
      default:
        return withdrawalType;
    }
  };
  
  //===============================================================================================
  //===============================================================================================
  //===============================================================================================
  return (
    <div>

      {message && (
        <Modal open={message !== null} onClose={message.callbackOk || message.callbackNo }>
          <div className="workspace_add_modal_container">
            <p className="form-title">{message.title}</p>
            <p>{message.content}</p>
            {message.callbackOk && <button type="submit" className="add_button" onClick={message.callbackOk}>확인</button> }
            {message.callbackYes && <button type="submit" className="add_button" onClick={message.callbackYes}>네</button> }
            {message.callbackNo && <button type="submit" className="add_button" onClick={message.callbackNo}>아니요</button> }
          </div>
        </Modal>
      )}


      {info && (
        <>
          <p>{info.email}</p>
          <p>{info.name}</p>
          <p>{getWithdrawalMessage(info.withdrawalType)}</p>
          <p>{info.expireDate && `${formatDate(info.expireDate)} 이후에 회원탈퇴 처리 됩니다.`}</p>
        </>
      )}


      <Button btnStyle="add_button" title="회원 탈퇴 신청" onClick={handleClickEnroll} /><br></br>
      <Button btnStyle="add_button" title="회원 탈퇴 즉시" onClick={handleClickImmediately} /><br></br>
      <Button btnStyle="add_button" title="회원 탈퇴 취소" onClick={handleClickCancel} /><br></br>
      <Button btnStyle="add_button" title="회원 탈퇴 이메일 인증 재전송" onClick={handleClickReEmail} /><br></br>
      <Button btnStyle="exit_button" title="로그아웃" onClick={handleClickLogout} />

      </div>
  )
}

export default WithdrawalPage