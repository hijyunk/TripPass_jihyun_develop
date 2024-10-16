import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import styled from 'styled-components';
import { updateTrip } from "../../store/tripSlice";
import Swal from "sweetalert2";

const PopupContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgb(0 0 0 / 18%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const PopupContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  overflow-y: scroll;
  width: 30vw;
`;

const NewTripPlanPopup = ({ onClose, placeInfo }) => {
  const { user } = useSelector(state => state.user);
  const [tripDates, setTripDates] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTripPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMyTrips`, {
          params: { userId: user.userId, tripId: user.mainTrip }
        });
        const tripResponse = response.data.response;
        if (tripResponse.length > 0) {
          const { startDate, endDate } = tripResponse[0]; 
          const dates = generateDateRange(startDate, endDate);
          setTripDates(dates);
        }
      } catch (error) {
        console.error('Error fetching trip plans:', error);
      }
    };
    fetchTripPlans();
  }, [user.userId, user.mainTrip]);

  const generateDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateArray = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dateArray.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const value = `${String(hour).padStart(2, '0')}:00:00`; 
      const label = `${String(hour).padStart(2, '0')}:00`;
      options.push({ value, label });
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try{
        const formData = new FormData(event.target);
        formData.append('userId', user.userId);
        formData.append('tripId', user.mainTrip);
        formData.append('title', formData.get('title'));
        formData.append('date', formData.get('scheduleDate'));
        formData.append('time', formData.get('scheduleTime'));
        formData.append('place', placeInfo.place);
        formData.append('address', placeInfo.address);
        formData.append('latitude', placeInfo.latitude);
        formData.append('longitude', placeInfo.longitude);
        formData.append('description', placeInfo.description);
    
        const response = await axios.post(`${API_URL}/insertTripPlans`, formData,
            {headers: {
                'Content-Type': 'multipart/form-data'
            }}
        )
    
        if (response.data['result code'] === 200) {
            //alert('일정를 추가했습니다.');
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
              title: "일정을 추가했습니다!"
            });
            dispatch(updateTrip("add_plan"));
            onClose();
        } else {
            console.error('Failed to add trip plan:', response.data);
        }
    }
    catch(error){
      console.log("Error adding trip plan:", error);
    }

  };

  return (
    <PopupContainer>
      <PopupContent>
        <div className="new-trip-title">일정 추가하시겠어요?</div>
        <form className="new-trip-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>타이틀</label>
            <input type="text" name="title" placeholder='여행 타이틀을 입력하세요' defaultValue={placeInfo.place} />
          </div>
          <div className="form-group">
            <label>날짜</label>
            <select name="scheduleDate">
              <option value="">--- 선택하세요 ---</option>
              {tripDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>시간</label>
            <select name="scheduleTime">
              <option value="">--- 선택하세요 ---</option>
              {timeOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-group btnList">
            <button type="submit">저장</button>
            <button type="reset" onClick={onClose}>닫기</button>
          </div>
        </form>
      </PopupContent>
    </PopupContainer>
  );
};

export default NewTripPlanPopup;