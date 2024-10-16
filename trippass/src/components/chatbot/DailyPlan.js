import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from "../../config";
import styled from 'styled-components';
import { FaMapMarkerAlt } from "react-icons/fa"; 
import { FcCalendar } from "react-icons/fc";
import { IoIosRemoveCircle } from "react-icons/io";
import Swal from "sweetalert2";


// Styled components
const DailyPlanSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const DailyPlanList = styled.div`
  list-style: none;
  padding: 0;
  overflow-y: auto;
`;

const DailyPlanItem = styled.li`
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 10px;
  background: #fff;
`;

const PlanDate = styled.div`
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #717171;
`;

const PlanTitle = styled.div`
  display: flex;
  justify-content: space-between;
  background: #f0f4ff;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: bold;
  align-items: center;
  line-height: 1.2rem;
`;

const PlanTime = styled.div`
  font-size: 14px;
  color: #555;
  font-weight: bold;
`;

const PlanAddress = styled.div`
  font-size: 14px;
  color: #777;
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
`;

const PlanDescription = styled.div`
  font-size: 14px;
  color: #777;
  margin-top: 8px;
  margin-left: 3%;
  margin-right: 3%;
  line-height: 1.2rem;
`;

const DailyPlan = () => {
  const { user } = useSelector(state => state.user);
  const trip = useSelector(state => state.trip.trip);
  const [tripData, setTripData] = useState(null);

  // 초 단위를 HH:MM 형식으로 변환하는 함수
  const secondsToTimeString = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  // 날짜를 "YYYY년 MM월 DD일" 형식으로 변환하는 함수
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  }, []);

  // 날짜별로 그룹화하는 함수
  const groupByDate = useCallback((data) => {
    return data.reduce((acc, plan) => {
      const { date } = plan;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(plan);
      return acc;
    }, {});
  }, []);

  // 데이터를 가져오는 함수
  const fetchTripPlans = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/getTripPlans?tripId=${user.mainTrip}`);
      if (response.data['result code'] === 200) {
        let data = response.data.response;
        // 시간이 초 단위로 되어 있으면 변환
        data = data.map(plan => ({
          ...plan,
          time: typeof plan.time === 'number' ? secondsToTimeString(plan.time) : plan.time
        }));

        // 날짜와 시간 순서대로 소팅
        data = data.sort((a, b) => {
          const dateTimeA = new Date(`${a.date}T${a.time}`);
          const dateTimeB = new Date(`${b.date}T${b.time}`);
          return dateTimeA - dateTimeB;
        });

        setTripData(groupByDate(data));
      } else {
        console.error('Failed to fetch trip data:', response.data);
      }
    } catch (error) {
      console.error('일정 가져오기 실패:', error.message);
    }
  }, [user.mainTrip, secondsToTimeString, groupByDate]);

  useEffect(() => {
    if (user.mainTrip) {
      fetchTripPlans();
    }
  }, [user.mainTrip, fetchTripPlans]);

  useEffect(() => {
    if (trip === "save_plan" || trip === "update_trip_plan_confirmed" || trip === "add_plan") {
      fetchTripPlans();
    } 
  }, [trip, fetchTripPlans]);

  const handleDeleteClick = (planId) => {
    Swal.fire({
      title: "해당 여행을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "삭제",
      cancelButtonText: "취소"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${API_URL}/deleteTripPlan`, {
            params: { planId }
          });
          console.log(response.data);
          if (response.data['result code'] === 200) {
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
              title: "계획이 삭제되었습니다."
            });
            fetchTripPlans();
          }
        } catch (error) {
          console.error('Error deleting plan data:', error);
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
            title: "계획 삭제 중 오류가 발생했습니다."
          });
        }
      }
    });
  };


  return (
    <DailyPlanSection>
      <div className="dailyPlanContentTitle">{user.nickname}님의 여행 계획</div>
      <DailyPlanList>
        {tripData && Object.keys(tripData).map(date => (
          <div key={date}>
            <PlanDate><FcCalendar />&nbsp;&nbsp;{formatDate(date)}</PlanDate>
            <ul className="dailyPlanListContent">
              {tripData[date].map((plan, index) => (
                <DailyPlanItem key={index}>
                  <PlanTitle>
                    <div>{plan.title} <IoIosRemoveCircle color='#ff6666' style={{ margin: ' 0 8px 0 5px' }} onClick={() => handleDeleteClick(plan.planId)} /></div>
                    <PlanTime>{plan.time}</PlanTime>
                  </PlanTitle>
                  <PlanAddress><FaMapMarkerAlt style={{ marginRight: '4px' }} />{plan.address}</PlanAddress>
                  <PlanDescription>{plan.description}</PlanDescription>
                </DailyPlanItem>
              ))}
            </ul>
          </div>
        ))}
      </DailyPlanList>
    </DailyPlanSection>
  );
};

export default DailyPlan;
