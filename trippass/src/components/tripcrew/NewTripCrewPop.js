import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';
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
  height: 80vh;
  overflow-y: scroll;
  width: 30vw;
`;

const NewTripCrewPop = ({ onClose }) => {
  const { user } = useSelector(state => state.user);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [crewName, setCrewName] = useState('');
  const [crewContact, setCrewContact] = useState('');
  const [crewNum, setCrewNum] = useState('');
  const [crewNote, setCrewNote] = useState('');

  useEffect(() => {
    const fetchTripPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/getTripPlans?tripId=${user.mainTrip}`);
        const plans = response.data.response;

        // 날짜별로 그룹화 및 정렬
        const groupedPlans = plans.reduce((acc, plan) => {
          const date = new Date(plan.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });

          const time = new Date(plan.time * 1000).toISOString().substr(11, 5);

          if (!acc[date]) {
            acc[date] = [];
          }

          acc[date].push({
            ...plan,
            displayTime: time,
          });

          return acc;
        }, {});

        const sortedGroupedPlans = Object.keys(groupedPlans)
          .sort((a, b) => new Date(a) - new Date(b))
          .reduce((acc, date) => {
            acc[date] = groupedPlans[date].sort((a, b) => a.time - b.time);
            return acc;
          }, {});

        setScheduleData(sortedGroupedPlans);
      } catch (error) {
        console.error('일정 가져오기 실패:', error.message);
      }
    };

    if (user.mainTrip) {
      fetchTripPlans();
    }
  }, [user.mainTrip]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedPlan('');
  };

  const handlePlanChange = (e) => {
    setSelectedPlan(e.target.value);
  };

  const handleCrewNameChange = (e) => {
    setCrewName(e.target.value);
  };

  const handlecrewContactChange = (e) => {
    setCrewContact(e.target.value);
  };

  const handlecrewNumChange = (e) => {
    setCrewNum(e.target.value);
  };

  const handlecrewNoteChange = (e) => {
    setCrewNote(e.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const previewURL = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreview(previewURL);
    }
  };

  const sortedDates = Object.keys(scheduleData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('planId', selectedPlan);
      formData.append('title', crewName);
      formData.append('contact', crewContact);
      formData.append('numOfMate', crewNum);
      formData.append('note', crewNote);
      formData.append('crewLeader', user.userId);
      if (file) {
        formData.append('banner', file);
      }

      await axios.post(`${API_URL}/insertCrew`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onClose();
      //alert('크루가 추가되었습니다.');
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
        title: "크루가 추가되었습니다!"
      });
      window.location.reload();
      onClose();
    } catch (error) {
      //console.error('크루 추가 실패:', error.message);
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
        title: "크루 생성 중 오류가 발생했습니다."
      });
    }
  };

  return (
    <PopupContainer>
      <PopupContent>
        <div className="new-trip-title">새로운 크루 만들기</div>
        <form className="new-trip-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              타이틀
            </label>
              <input type="text" name="crewName" value={crewName} onChange={handleCrewNameChange} maxLength={15} />
          </div>
          <div className="form-group">
            <label>
            </label>
            <small>{crewName.length} / 15 자 이하 작성해주세요</small>
          </div>
          <div className="form-group">
            <label>
            날짜</label>
            <select name="scheduleDate" value={selectedDate} onChange={handleDateChange}>
              <option value="">--- 선택하세요 ---</option>
              {sortedDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
          <label>
            일정</label>
            <select name="schedulePlan" value={selectedPlan} onChange={handlePlanChange} disabled={!selectedDate}>
              <option value="">--- 선택하세요 ---</option>
              {selectedDate && scheduleData[selectedDate].map(plan => (
                <option key={plan.planId} value={plan.planId}>{`${plan.displayTime} ${plan.title}`}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>
              연락처</label>
              <input type="text" name="crewContact" value={crewContact} onChange={handlecrewContactChange} />
          </div>
          <div className="form-group">
            <label>
              인원</label>
              <input type="number" name="crewNum" value={crewNum} min ="2" max = "4" onChange={handlecrewNumChange} />
          </div>
          <div className="form-group">
            <label>
              소개</label>
              <textarea name="note" maxLength="200" value={crewNote} onChange={handlecrewNoteChange} />
          </div>
          <div className="form-group">
            <label>
            </label>
            <small>{crewNote.length} / 200 자 이하 작성해주세요</small>
          </div>
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

export default NewTripCrewPop;