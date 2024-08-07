import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import '../../styles/signup.css';
import { loginSuccess, loginFailure } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL, KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI } from "../../config";
import axios from 'axios';


const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append('id', id);
      formData.append('passwd', password);

      const config = {
        baseURL: API_URL, 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const response = await axios.post('/login', formData.toString(), config);

      dispatch(loginSuccess(response.data));
      localStorage.setItem('user', JSON.stringify(response.data));

      navigate('/myTrip');

    } catch (error) {
      // 로그인 실패 시 오류 메시지 처리
      const errorMessage = error.response && error.response.data && error.response.data.detail
        ? error.response.data.detail
        : '로그인에 실패했습니다. 다시 시도해주세요.';
        
      dispatch(loginFailure(errorMessage));

      // 로그인 실패 알림
      toast.error(errorMessage, {
        position: "top-center"
      });
    }
  };

  const handleKakaoLogin = async () => {
    try {
      window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
   } catch (error) {
      console.error('카카오 로그인 실패:', error.message);
   }
  };

  return (
    <>
      <ToastContainer /> 
      <form className="login-form" onSubmit={onSubmit}>
        <div className="formTitle">로그인</div>
        <div className="formbox">
          <label>아이디</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>

        <div className="formbox">
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit">로그인</button>
        <div className="signup">
          <Link to="/signup">회원가입</Link>
        </div>
        <ul className="loginList">
          <li>──────&nbsp;&nbsp;<span>간편 로그인</span>&nbsp;&nbsp;──────</li>
          <li className="googleLogin">구글 계정으로 로그인</li>
          <li className="kakaoLogin" onClick={handleKakaoLogin}>카카오 계정으로 로그인</li>
        </ul>
      </form>
    </>
  );
};

export default Login;
