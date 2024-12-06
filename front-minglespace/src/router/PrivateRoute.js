import Repo from '../auth/Repo';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {

  const isAuthenticated  = Repo.isAuthenticated();
  const navigate = useNavigate();

  if(isAuthenticated){
    return children;
  }else{
    navigate("/auth/login");
    return null;
  }
}

export default PrivateRoute;