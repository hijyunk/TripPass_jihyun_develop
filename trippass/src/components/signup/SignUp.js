import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/signup.css';
import userImage from '../../assets/user.png'; 
import { API_URL } from "../../config";
import Swal from "sweetalert2";

const Signup = () => {
  const [id, setId] = useState('');
  const [isId, setIsId] = useState(null); 
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [sex, setSex] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [agreement, setAgreement] = useState(false);
  const [idMessage, setIdMessage] = useState('');
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordConfirmMessage, setPasswordConfirmMessage] = useState('');
  const [birthDateMessage, setBirthDateMessage] = useState('');
  const [agreementMessage, setAgreementMessage] = useState('');
  const [isNickname, setIsNickname] = useState(false);
  const [isPassword, setIsPassword] = useState(false);
  const [isPasswordConfirm, setIsPasswordConfirm] = useState(false);
  const [isSex, setIsSex] = useState(false);
  const [isBirthDate, setIsBirthDate] = useState(false);
  const [isAgreement, setIsAgreement] = useState(false);


  const navigate = useNavigate(); 
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!agreement) {
      setAgreementMessage('약관에 동의해주세요.');
      setIsAgreement(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('passwd', password);  
      formData.append('nickname', nickname);
      formData.append('sex', sex);
      formData.append('birthDate', birthDate);
      formData.append('personality', 'none');
      const blob = await fetch(userImage).then((res) => res.blob());
      const imageFile = new File([blob], 'user.png', { type: 'image/png' });

      formData.append('profileImage', imageFile);


      const response = await axios.post(`${API_URL}/insertUser`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
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
          title: "가입이 완료되었습니다!"
        });
        //alert('가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Failed to register user:', err);
      //alert('잘못된 양식입니다. 다시 입력해주세요');
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
        title: "잘못된 양식입니다. 다시 입력해주세요"
      });
    }
  };

  const onChangeId = (e) => {
    const idValue = e.target.value;
    setId(idValue);
    if (idValue.length < 2 || idValue.length > 8) {
      setIdMessage('2글자 이상 8글자 미만으로 입력해주세요.');
      setIsId(false);
    } else {
      setIdMessage('올바른 아이디 형식입니다');
      setIsId(true);
    }
  };

  const onChangeNickname = (e) => {
    const nicknameValue = e.target.value;
    setNickname(nicknameValue);
    setNicknameMessage('');
    setIsNickname(true);
  };

  const onChangePassword = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
    if (!passwordRegex.test(passwordValue)) {
      setPasswordMessage('숫자+문자+특수문자 조합으로 8자리 이상 입력해주세요');
      setIsPassword(false);
    } else {
      setPasswordMessage('안전한 비밀번호입니다');
      setIsPassword(true);
    }
  };

  const onChangePasswordConfirm = (e) => {
    const passwordConfirmValue = e.target.value;
    setPasswordConfirm(passwordConfirmValue);
    if (password === passwordConfirmValue) {
      setPasswordConfirmMessage('비밀번호가 확인되었습니다');
      setIsPasswordConfirm(true);
    } else {
      setPasswordConfirmMessage('비밀번호가 틀립니다');
      setIsPasswordConfirm(false);
    }
  };

  const onChangeSex = (e) => {
    const sexValue = e.target.value;
    setSex(sexValue);
    if (sexValue === '') {
      setIsSex(false);
    } else {
      setIsSex(true);
    }
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    setBirthDate(dateValue);
    setBirthDateMessage('');
    setIsBirthDate(true);
  };

  const handleAgreementChange = (e) => {
    const isChecked = e.target.checked;
    setAgreement(isChecked);
    if (!isChecked) {
      setAgreementMessage('약관에 동의해주세요.');
      setIsAgreement(false);
    } else {
      setAgreementMessage('');
      setIsAgreement(true);
    }
  };
  const checkIdDuplicate = async () => {
    try {
      const response = await axios.get(`${API_URL}/getUserId`, {
        params: { id: id }
      });
      if (response.data.is_duplicate === true) {
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
          title: "중복된 아이디 입니다."
        });
      } else if (response.data.is_duplicate === false) {
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
          title: "사용 가능한 아이디 입니다."
        });
      }
    } catch (error) {
      console.error('중복 확인 중 오류 발생:', error);
    }
  };

  return (
    <>
      <form className="signup-form" onSubmit={onSubmit}>
        <div className="formTitle">회원가입</div>
        <div className="formbox">
          <label>아이디</label>
          <input type="text" value={id} onChange={onChangeId} required placeholder='아이디 입력(2~8글자)' className='idCheck'/>
          <button type="button" className="idCheckBtn" onClick={checkIdDuplicate}>중복 확인</button>
          {id.length > 0 && (
            <span className={`message ${isId ? 'success' : 'error'}`}>{idMessage}</span>
          )}
        </div>

        <div className="formbox">
          <label>비밀번호</label>
          <input type="password" value={password} onChange={onChangePassword} required placeholder='비밀번호 입력 (숫자,문자,특수문자 포함 8자이상)'/>
          {password.length > 0 && (
            <span className={`message ${isPassword ? 'success' : 'error'}`}>{passwordMessage}</span>
          )}
        </div>

        <div className="formbox">
          <label>비밀번호 확인</label>
          <input type="password" value={passwordConfirm} onChange={onChangePasswordConfirm} required placeholder='비밀번호 확인' />
          {passwordConfirm.length > 0 && (
            <span className={`message ${isPasswordConfirm ? 'success' : 'error'}`}>
              {passwordConfirmMessage}
            </span>
          )}
        </div>

        <div className="formbox">
          <label>닉네임</label>
          <input type="text" value={nickname} onChange={onChangeNickname} required placeholder='닉네임을 입력해주세요' 
          className='nicknameInput'/>
          {nickname.length > 0 && (
            <span className={`message ${isNickname ? 'success' : 'error'}`}>{nicknameMessage}</span>
          )}
        </div>

        <div className="formbox half" style={{ marginRight: '40px' }}>
          <label>성별</label>
          <select value={sex} onChange={onChangeSex} required>
            <option value="">성별을 선택하세요</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
          </select>

        </div>

        <div className="formbox half">
          <label>생년월일</label>
          <input type="date" value={birthDate} onChange={handleDateChange} required min="1900-01-01" />
          {birthDateMessage.length > 0 && (
            <span className={`message ${isBirthDate ? 'success' : 'error'}`}>{birthDateMessage}</span>
          )}
        </div>

        <div className="formbox">
            <textarea
            name="postContent"
            defaultValue="
            제1조(목적) 
            이 약관은 TripPass가 운영하는 업체에서 제공하는 인터넷 관련 서비스를 이용함에 있어 트립패스 이용자의 권리․의무 및 책임사항을 규정함을 목적으로 합니다.
            제 2 조 (약관의 효력 및 변경)
            ① 이 약관은 서비스 화면이나 기타의 방법으로 이용고객에게 공지함으로써 효력을 발생합니다.
            ② 사이트는 이 약관의 내용을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력을 발생합니다.
            "
            rows={4}
          />
          <label>
            <input type="checkbox" checked={agreement} onChange={handleAgreementChange} /> 회원가입 및 약관에 동의합니다.
          </label>
          {agreementMessage.length > 0 && (
            <span className={`message ${isAgreement ? 'success' : 'error'}`}>{agreementMessage}</span>
          )}
        </div>

        <button type="submit" disabled={!isId || !isNickname || !isPassword || !isPasswordConfirm || !isSex || !isBirthDate || !isAgreement}>
          가입하기
        </button>
      </form>
    </>
  );
};

export default Signup;