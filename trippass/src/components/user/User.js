// src/components/User.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPencilAlt } from "react-icons/fa";
import ProfilePopup from './ProfilePopup';
import PasswordPopup from './PasswordPopup';
import UserDeletePopup from './UserDeletePopup';
import '../../styles/userpage.css';

const User = () => {
  const { isAuthenticated, user } = useSelector(state => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handlePasswordPopupOpen = () => { 
    setShowPasswordPopup(true);
  };

  const handlePasswordPopupClose = () => { 
    setShowPasswordPopup(false);
  };

  const handleDeletePopupOpen = () => {
    setShowDeletePopup(true);
  };

  const handleDeletePopupClose = () => {
    setShowDeletePopup(false);
  };


  return (
    <div className="profile-container">
      <div className="section-user-info">
        <div className="section-title">회원정보</div>
        {isAuthenticated && (
          <div className="profile-content">
            <div className="profile-image-container">
            {user.profileImage ? (
                <img src={`data:image/jpeg;base64,${user.profileImage}`} alt="user profile" className="profile-image" />
              ) : (
                user.socialProfileImage && (
                  <img src={user.socialProfileImage} alt="user profile" className="profile-image" />
                )
              )}
              <div className="profile-update" onClick={handlePopupOpen}><FaPencilAlt /></div>
              <div className="user-name">{user.nickname} 님</div>
            </div>
            <div className="profile-details-container">
              <div className="details-grid">
                <div className="details-label">아이디</div>
                <div className="details-value">{user.id}</div>
                <div className="details-label">비밀번호</div>
                <div className="details-value"><button className="password-button" onClick={handlePasswordPopupOpen}>비밀번호 수정</button></div>
                <div className="details-label">생년월일</div>
                <div className="details-value">{user.birthDate}</div>
                <div className="details-label">성별</div>
                <div className="details-value">{user.sex}</div>
              </div>
            </div>
          </div>
        )}
        <div className="userDelete">
          {isAuthenticated && <button className="userDeleteButton" onClick={handleDeletePopupOpen}>회원 탈퇴</button>}
        </div>
      </div>
      {showPopup && <ProfilePopup onClose={handlePopupClose} />}
      {showPasswordPopup && <PasswordPopup onClose={handlePasswordPopupClose} />}
      {showDeletePopup && <UserDeletePopup onClose={handleDeletePopupClose} />}
    </div>
  );
};

export default User;
