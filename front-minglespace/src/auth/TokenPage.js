import React, { useEffect } from 'react'
import api from '../api/Api'
import Repo from './Repo';
import { useNavigate } from 'react-router-dom';

const TokenPage = () => {

  const navigate = useNavigate();

  useEffect(()=>{

    setTimeout(() => {
      const res = api.axiosPure.get("/auth/token");
      console.log("res : ", res);
      // const accessToken = res.data.accessToken;
      // Repo.setAccessToken(accessToken);

      navigate("/main");

    }, 5000);

    
  }, []);


  return (
    <>TokenPage</>
  )
}

export default TokenPage
