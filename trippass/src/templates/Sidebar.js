import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from 'react-redux';
import "../styles/layout.css"; 
import { PiAirplaneTiltBold } from "react-icons/pi";
import { PiAlienBold } from "react-icons/pi";
import { RiRobot2Line } from "react-icons/ri";
import { LuCalendarDays } from "react-icons/lu";
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

const Sidebar = () => {
  const { isAuthenticated, user } = useSelector(state => state.user);
  const [tripData, setTripData] = useState(null);
  const navigate = useNavigate();

  const handleChatbotClick = (event) => {
    event.preventDefault();  // 기본 링크 이동 동작을 막습니다.
    if (user && user.mainTrip) {
      navigate('/chat');
    } else if (user && user.mainTrip === null) {
      Swal.fire({
        icon: 'error',
        title: '아직 여행 계획이 없어요!',
        text: '계획을 먼저 만들어볼까요?',
      })
      //alert("아직 여행 계획이 없어요! 계획을 먼저 만들어볼까요?");
      navigate('/mytrip');
    }
  };

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMyTrips?tripId=${user.mainTrip}`);
        if (response.data['result code'] === 200) {
          const data = response.data.response[0];
          setTripData(data);
        } else {
          console.error('Failed to fetch trip data:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch trip data:', error);
      }
    };

    if (user && user.mainTrip) {
      fetchTripData();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        {isAuthenticated ? (
          tripData ? (
            <div className="planInsert">
              <div className="planInsertText">
                <div className="description">{formatDate(tripData.startDate)} ~ {formatDate(tripData.endDate)}</div>
                <div className="planInsertBtn">
                  {tripData.title} 
                </div>
              </div>
            </div>
          ) : (
            <NavLink to="/myTrip" className="planInsert">
              <div className="planInsertText">
                <div className="description">아직 여행계획이 없어요!</div>
                <div className="planInsertBtn">
                함께 여행 계획을 만들어볼까요?
                </div>
              </div>
            </NavLink>
          )
        ) : (
          <div className="planInsert">
            <div className="planInsertText">
              <div className="description">아직 여행계획이 없어요!</div>
              <div className="planInsertBtn">
                로그인 후 이용 가능합니다
              </div>
            </div>
          </div>
        )}
        <ul>
          <li>
            <NavLink
              to="/myTrip"
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#F3F5F8' : '',
                padding: isActive ? '' : '',
                borderRadius: isActive ? '13px' : '',
                color: isActive ? '#5F6165' : ''
              })}
            >
              <PiAirplaneTiltBold size={24} />&nbsp;
              MY TRIP
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tripPlan"
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#F3F5F8' : '',
                padding: isActive ? '' : '',
                borderRadius: isActive ? '13px' : '',
                color: isActive ? '#5F6165' : ''
              })}
            >
              <LuCalendarDays size={22} />&nbsp;
              TRIP PLAN
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tripCrew"
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#F3F5F8' : '',
                padding: isActive ? '' : '',
                borderRadius: isActive ? '13px' : '',
                color: isActive ? '#5F6165' : ''
              })}
            >
              <PiAlienBold size={24} />&nbsp;
              TRIP CREW
            </NavLink>
          </li>
            <li>
              <NavLink
                to="/chat"
                onClick={handleChatbotClick}
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#F3F5F8' : '',
                  padding: isActive ? '' : '',
                  borderRadius: isActive ? '13px' : '',
                  color: isActive ? '#5F6165' : ''
                })}
              >
                <RiRobot2Line size={24} />&nbsp;
                CHATBOT
              </NavLink>
            </li>
        </ul>
      </div>
      <div className="sidebar-user">
        {isAuthenticated && user && (
          <NavLink
            to="/user"
            style={({ isActive }) => ({
              color: isActive ? '#2c2c2c' : '',
            })}
          >
            <div className="userProfile">
              {user.profileImage ? (
                <img src={`data:image/jpeg;base64,${user.profileImage}`} alt="user profile" className="profile-image" />
              ) : (
                user.socialProfileImage && (
                  <img src={user.socialProfileImage} alt="user profile" className="profile-image" />
                )
              )}
            </div>
            <div className="userName">
              {user.nickname}님
            </div>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
