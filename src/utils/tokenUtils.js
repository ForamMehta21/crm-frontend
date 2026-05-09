import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiryTime = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000;
  } catch (error) {
    return null;
  }
};

export const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const thresholdSeconds = thresholdMinutes * 60;
    return decoded.exp - currentTime < thresholdSeconds;
  } catch (error) {
    return true;
  }
};
