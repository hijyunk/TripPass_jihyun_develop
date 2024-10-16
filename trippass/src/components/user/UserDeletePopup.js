import React, { useState , useEffect} from 'react';
import '../../styles/userpage.css';
import sadBot from "../../assets/sadBot.png"
import { useSelector , useDispatch} from 'react-redux';
import { logout } from '../../store/userSlice';
import styled from 'styled-components';
import axios from 'axios';
import { API_URL } from "../../config";
import { IoHeartCircleOutline } from "react-icons/io5";
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

const UserDeletePopup = ({ onClose }) => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [tripPlans, setTripPlans] = useState([]);

  useEffect(() => {
    const fetchTripPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMyTrips?userId=${user.userId}`);
        if (response.data['result code'] === 200) {
          setTripPlans(response.data.response);
        } else {
          console.error('Failed to fetch trip plans:', response.data);
        }
      } catch (error) {
        console.error('Error fetching trip plans:', error);
      }
    };

    fetchTripPlans();
  }, [user.userId]);
  const handleConfirm = (event) => {
      event.preventDefault();
      try {
        axios
          .delete(`${API_URL}/deleteUser?userId=${user.userId}`)
          .then((response) => {
            if (response.data['result code'] === 200) {
              const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.onmouseenter = Swal.stopTimer;
                  toast.onmouseleave = Swal.resumeTimer;
                }
              });
              Toast.fire({
                icon: "info",
                title: "탈퇴되었습니다.안녕히 가세요."
              });
              onClose();
              dispatch(logout());
            } else {
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
                title: "회원 탈퇴 실패하였습니다."
              });
            }
          })
          .catch((error) => {
            console.error('Error deleting user:', error);
          });
      } catch (error) {
        console.error('Error deleting user:', error);
    }
  };

  return (
    <PopupContainer>
        <PopupContent>
          <div className="new-trip-title">회원 탈퇴</div>
          <form className="new-trip-form" >
            <div className="deleteBot">
                <img src={sadBot} alt="sad bot" />
            </div>
            <div className="deleteBot-text">
                정말로 탈퇴하시겠어요?<br />{user.nickname}님의 소중한 추억들이 사라져요...
            </div>
            <div className="deleteBot-text-list">
                <div className="deleteBot-text-title">
                  <IoHeartCircleOutline style={{color: "#ff6d6d"}}/>&nbsp;{user.nickname}님의 소중한 추억<IoHeartCircleOutline style={{color: "#ff6d6d"}}/>
                </div>
                {tripPlans.map(tripPlan => (
                    <div key={tripPlan.tripId}>
                        <ul>
                            <li>{tripPlan.title}</li>
                        </ul>
                    </div>
                ))}
            </div>
            <div className="form-group btnList">
              <button type="submit" onClick={handleConfirm}>탈퇴하기</button>
              <button type="button" className="userDeletePopupButton" onClick={onClose}>함께하기</button>
            </div>
          </form>
        </PopupContent>
    </PopupContainer>
  );
};

export default UserDeletePopup;
