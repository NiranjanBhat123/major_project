import {Navigate, useLocation} from 'react-router-dom';

const ProtectedRoute = ({children}) => {
  const location = useLocation();
  const accessToken = localStorage.getItem('accessToken');

  if(!accessToken) return <Navigate to="/" state={{from: location}} replace/>;

  return children;
};

export default ProtectedRoute;
