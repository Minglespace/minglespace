import React, { useEffect } from 'react'
import api from '../api/Api'
import Repo from './Repo';
import { useNavigate } from 'react-router-dom';

//===============================================================
// 소셜 로그인 로그인시 성공시
// accessToken은 클라이언트에게 http only cookie로 전달된다.
// 프론트에서 접근할 수 없기에
// 빈 패킷을 보내면 서버는 토큰을 cookie에서 꺼내서  body에 보내준다.
// 프론트는 응답으로 받은 토큰을 localStorage 저장하여
// 로그인 상태를 유지한다.
//===============================================================
const TokenPage = () => {

  const navigate = useNavigate();

  useEffect(()=>{
    getAccessToken();
  }, []);

  const getAccessToken = async () =>{
    const res = await api.axiosIns.get("/auth/token");
    // const accessToken = res.data.accessToken;
    // Repo.setAccessToken(accessToken);
    navigate("/main");
  }

  return (
    <></>
  )
}

export default TokenPage
