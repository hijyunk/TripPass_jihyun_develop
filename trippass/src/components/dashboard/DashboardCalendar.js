import React, { useEffect, useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';
import "../../styles/schedule.css";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import { FaMapMarkerAlt } from "react-icons/fa"; // 아이콘 임포트
import { RiTeamLine } from 'react-icons/ri'; // RiTeamLine 아이콘 임포트
import { IoArrowForwardCircleSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트
import Swal from "sweetalert2";


const colors = [
  '#4177A6', // Blue
  '#D9D0C1', // Beige
  '#FBAFC5', // Pink
  '#DFACF6', // Lavender
  '#BBD6FD', // Light Blue
  '#BDD9F5',  // Pale Blue
  '#BFADBF', // Light Grey
  '#F2EEAD', // Pale Yellow
  '#FDD5DA', // Light Pink
];

const CalendarWrapper = styled.div`
  display: flex;
  background-color: #ffffff;
  margin-right: 20px;
  border-radius: 20px;
  align-items: stretch; /* 높이를 자동으로 맞추기 위해 추가 */
`;

const StyledCalendar = styled(Calendar)`
  background-color: #ffffff;
  padding: 30px;  
  border-radius: 20px;
  border: none;
  flex-grow: 1; /* 높이를 자동으로 맞추기 위해 추가 */

  .react-calendar {
    border: none;
    font-weight: bold; 
  }

  .react-calendar__tile--active {
    background-color: #DFE1FF;
    color: black;
  }

  .react-calendar__tile--active:hover {
    background-color: #DFE1FF; /* 선택된 날짜의 배경 색상 */
  }

  .react-calendar__tile:not(.react-calendar__tile--active):hover {
    background: #DFE1FF; /* 선택되지 않은 날짜에 hover 시 배경을 없앰 */
  }

  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
    border-bottom: none;
  }

  .react-calendar__navigation {
    display: block;
    height: 5px;
    margin: 0 1px 30px 10px;
  }

  .react-calendar__navigation__label > span {
    font-weight: bold;
    color: #474747;
    font-size: 17px;
  }

  .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus {
    background: #DFE1FF;
  }

  .react-calendar__tile--now {
    background: #DFE1FF;
  }

  .react-calendar__tile--highlighted {
    background-color: #EAEAEA; /* 여행 날짜의 배경색 설정 */
  }
`;

const ScheduleContainer = styled.div`
  padding: 40px 40px 30px 10px;
  width: 70%;
  flex-grow: 1; /* 높이를 자동으로 맞추기 위해 추가 */
  overflow-y: auto;
`;

const ScheduleTitle = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  margin: 20px 0 10px;
  display: flex;
  align-items: center;
`;

const ScheduleItem = styled.div`
  margin-bottom: 10px; /* 일정 항목 간의 여백 추가 */
`;

const NoPlansMessage = styled.div`
  margin-top: 20px;
  padding-top : 40px;
  font-size: 1.2em;
  color: #888;
  text-align: center;
  line-height: 1.5em;
  letter-spacing: -0.5px;
`;

const DashboardCalendar = () => {
  const { user } = useSelector(state => state.user);
  const [date, setDate] = useState(new Date());
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tripPlans, setTripPlans] = useState([]);
  const scheduleRefs = useRef({});
  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMyTrips?tripId=${user.mainTrip}`);
        if (response.data['result code'] === 200) {
          const tripData = response.data.response[0];
          const startDate = new Date(tripData.startDate);
          const endDate = new Date(tripData.endDate);

          const dates = [];
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
          setHighlightedDates(dates);
          setDate(startDate); // 여행 시작 날짜로 초기화
        } else {
          console.error('Failed to fetch trip data:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch trip data:', error);
      }
    };

    if (user.mainTrip) {
      fetchTripData();
    }
  }, [user.mainTrip]);

  useEffect(() => {
    const fetchTripPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/getTripPlans?tripId=${user.mainTrip}`);
        if (response.data['result code'] === 200) {
          const plans = response.data.response;
          // 날짜와 시간별로 정렬
          plans.sort((a, b) => {
            const dateA = new Date(`${a.date}T${new Date(a.time * 1000).toISOString().substr(11, 8)}`);
            const dateB = new Date(`${b.date}T${new Date(b.time * 1000).toISOString().substr(11, 8)}`);
            return dateA - dateB;
          });
          setTripPlans(plans);
        } else {
          console.error('Failed to fetch trip plans:', response.data);
        }
      } catch (error) {
        console.error('Error fetching trip plans:', error);
      }
    };

    if (user.mainTrip) {
      fetchTripPlans();
    }
  }, [user.mainTrip]);

  const onChange = (date) => {
    setDate(date);
    setSelectedDate(date); // 선택된 날짜 업데이트
    // 선택된 날짜로 스크롤 이동
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1); // 선택된 날짜에 하루를 더함
    const dateKey = nextDay.toISOString().split('T')[0];
    if (scheduleRefs.current[dateKey]) {
      scheduleRefs.current[dateKey].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      if (highlightedDates.some(d => d.toDateString() === date.toDateString())) {
        return 'react-calendar__tile--highlighted';
      }
      if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
        return 'react-calendar__tile--active';
      }
    }
    return null;
  };

  const groupedPlans = tripPlans.reduce((acc, plan) => {
    if (!acc[plan.date]) {
      acc[plan.date] = [];
    }
    acc[plan.date].push(plan);
    return acc;
  }, {});

  const handleClickChat = () => {
    if(user.mainTrip){
      navigate('/chat');
    }else if(user.mainTrip === null){
      //alert("아직 여행 계획이 없어요! 계획을 먼저 만들어볼까요?");
      Swal.fire({
        icon: 'error',
        title: '아직 여행 계획이 없어요!',
        text: '계획을 먼저 만들어볼까요? 😎',
      })
      navigate('/mytrip');
    }
  };

  return (
    <CalendarWrapper>
      <StyledCalendar
        value={date}
        onChange={onChange}
        prevLabel={null}
        prev2Label={null}
        nextLabel={null}
        next2Label={null}
        calendarType="gregory"
        view="month"
        showNeighboringMonth={false}
        formatDay={(locale, date) => date.toLocaleString("en", {day: "numeric"})}
        tileClassName={tileClassName}
      />
      <ScheduleContainer>
          <div className="schedule">
          {tripPlans.length === 0 ? (
            <NoPlansMessage>
              아직 여행 계획이 없어요! <br /> 챗봇과 함께 여행 계획을 만들러 가볼까요?<br/><br/>
              <IoArrowForwardCircleSharp
                onClick={handleClickChat} 
                style={{ cursor: 'pointer', fontSize: '2em' }} // 포인터 커서 추가
              />
            </NoPlansMessage>
          ) : (
            <ul>
              {Object.keys(groupedPlans).map((date, index) => (
                <li key={date} ref={el => scheduleRefs.current[date] = el}>
                  <ScheduleTitle>
                    <FaMapMarkerAlt style={{ color: colors[index % colors.length], marginRight: '10px' }} />
                    {new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  </ScheduleTitle>
                  {groupedPlans[date].map(plan => (
                    <ScheduleItem key={plan.planId}>
                      <div className="scheduleTitle">
                        {plan.title} {plan.crewId && <RiTeamLine style={{ color: "#A1A1A1" }} />}
                      </div>
                      <div className="scheduleContent">
                        {new Date(plan.date + 'T' + new Date(plan.time * 1000).toISOString().substr(11, 8)).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - {plan.place}
                      </div>
                    </ScheduleItem>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScheduleContainer>
    </CalendarWrapper>
  );
};

export default DashboardCalendar;
