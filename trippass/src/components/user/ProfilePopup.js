import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { updateProfileImage } from '../../store/userSlice';
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
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-y: scroll;
  width: 30vw;
`;

const ProfilePopup = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const previewURL = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreview(previewURL);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('userId', user.userId);
      formData.append('profileImage', file);
      const response = await axios.post(`${API_URL}/updateUserProfileImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data["result code"] === 200) {
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
          title: "프로필 사진이 업데이트 되었습니다!"
        });
        const profileImage = response.data.response;
        dispatch(updateProfileImage(profileImage));
        onClose();
      } else {
        //alert('프로필 사진 업데이트에 실패하였습니다');
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
          title: "프로필 사진 업데이트에 실패하였습니다."
        });
      }
      onClose();
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <PopupContainer>
      <PopupContent>
        <div className="new-trip-title">프로필 사진 변경</div>
        <form className="new-trip-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>이미지</label>
            <input type="file" className='fileInput' accept="image/*" onChange={handleFileChange} />
          </div>
          {preview && (
            <div className="form-group">
              <img src={preview} alt="미리보기" />
            </div>
          )}
          <div className="form-group btnList">
            <button type="submit">저장</button>
            <button type="reset" onClick={onClose}>닫기</button>
          </div>
        </form>
      </PopupContent>
    </PopupContainer>
  );
};

export default ProfilePopup;
