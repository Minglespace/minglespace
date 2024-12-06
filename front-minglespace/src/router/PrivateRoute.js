import { useEffect } from 'react';
import Repo from '../auth/Repo';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {

  const isAuthenticated  = Repo.isAuthenticated();
  const navigate = useNavigate();

  useEffect(()=>{
    if(!isAuthenticated){
      navigate("/auth/login");
    } 
  },[]);

  if(isAuthenticated){
    return children;
  }else{
    return <>Loading...</>
  }


}

export default PrivateRoute;
