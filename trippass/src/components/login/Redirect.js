import React, { useEffect } from 'react';
import { API_URL } from "../../config";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../store/userSlice';
import { useDispatch } from 'react-redux';

const Redirect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const code = new URL(window.location.href).searchParams.get("code");
        const response = await axios.get(`${API_URL}/login/callback?code=${code}`);
        dispatch(loginSuccess(response.data));
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/tripPlan');
      } catch (error) {
        console.error('카카오 로그인 실패:', error.message);
      }
    };

    fetchData(); 

  }, [dispatch, navigate]); 

  return (
    <></>
  );
};

export default Redirect;
