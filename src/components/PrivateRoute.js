import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { admin } = useSelector((state) => state.auth);
  return admin ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
