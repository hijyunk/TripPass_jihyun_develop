import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import { API_URL } from "../../config";
import Swal from "sweetalert2";

const PopupContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupContent = styled.div`
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PasswordPopup = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordConfirmMessage, setPasswordConfirmMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useSelector(state => state.user);

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
    return passwordRegex.test(password);
  };

  // 새 비밀번호 입력 시 유효성 검사
  const handlePasswordChange = (e) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);
    if (!validatePassword(newPasswordValue)) {
      setPasswordMessage('숫자+문자+특수문자 조합으로 8자리 이상 입력해주세요.');
    } else {
      setPasswordMessage('안전한 비밀번호입니다.');
    }
  };

  // 새 비밀번호 확인 입력 시 일치 여부 확인
  const handleConfirmPasswordChange = (e) => {
    const confirmPasswordValue = e.target.value;
    setConfirmPassword(confirmPasswordValue);
    if (newPassword === confirmPasswordValue) {
      setPasswordConfirmMessage('비밀번호가 일치합니다.');
    } else {
      setPasswordConfirmMessage('비밀번호가 일치하지 않습니다.');
    }
  };

  // 비밀번호 변경 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필드가 모두 입력되었는지 확인
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 새 비밀번호와 확인 비밀번호가 일치하는지 확인
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('userId', user.userId);
      formData.append('passwd', confirmPassword);
      const response = await axios.post(`${API_URL}/updateUserPasswd`, formData,{
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data["result code"] === 200) {
        //alert('비밀번호가 변경되었습니다!');
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "success",
          title: "비밀번호가 변경되었습니다!"
        });
        onClose();
      } else {
        setError(response.data.response);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "error",
          title: "비밀번호가 변경 중 오류가 발생했습니다."
        });
      }
    } catch (err) {
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <PopupContainer>
      <PopupContent>
        <div className="new-trip-title">비밀번호 변경</div>
        <form onSubmit={handleSubmit} className="new-trip-form">
          <div className="form-group passwordGroup">
            <label>현재 비밀번호</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group passwordGroup">
            <label>새 비밀번호</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={handlePasswordChange}
              required 
            />
          </div>
          <div className="form-group passwordGroup">
          {newPassword.length > 0 && (
              <span className={`message ${validatePassword(newPassword) ? 'success' : 'error'}`}>
                {passwordMessage}
              </span>
            )}
          </div>
          <div className="form-group passwordGroup">
            <label>새 비밀번호 확인</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={handleConfirmPasswordChange}
              required 
            />
          </div>
          <div className="form-group passwordGroup">
          {confirmPassword.length > 0 && (
              <span className={`message ${newPassword === confirmPassword ? 'success' : 'error'}`}>
                {passwordConfirmMessage}
              </span>
            )}
            {error && <p className="error-message">{error}</p>}
          </div>
          <div className="form-group btnList">
            <button type="submit">변경</button>
            <button type="reset" onClick={onClose}>닫기</button>
          </div>
        </form>
      </PopupContent>
    </PopupContainer>
  );
};

export default PasswordPopup;
