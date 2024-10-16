import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import bannerImage from "../../assets/banner.png";
import bot from "../../assets/bot1.png";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';

const BannerWrapper = styled.div`
  width: 100%;
  height: 250px;
  background-image: url(${props => props.bannerImage});
  background-size: cover;
  background-position: center;
  display: flex;
  border-radius: 15px;
  position: relative;
  justify-content: center;
  align-items: center;
`;

const BannerText = styled.div`
  font-weight: bold;
  position: absolute;
  left: 3%;
  bottom: -11%;
  background: rgba(255, 255, 255, 0.80059);
  box-shadow: 0px 9px 17px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(13.5914px);
  border-radius: 12px;
  width: 94%;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  padding-right: 20px; /* 오른쪽 여백 추가 */
`;

const BannerTextLeft = styled.div`
  display: flex;
  align-items: center;
`;

const BannerBotImage = styled.img`
  margin-right: 10px;
`;

const TripInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TripTitle = styled.div`
  font-size: 1.2em;
  margin-bottom: 5px; /* TripTitle과 TripDates 사이의 여백 추가 */
  color: #575F6A;
`;

const TripDates = styled.div`
  font-size: 0.9em;
  color: #454545;
  font-weight: 300; /* 글씨를 더 얇게 설정 */
`;

const DDay = styled.div`
  font-size: 1.4em;
  color: #454545;
  margin-right: 20px; /* DDay 오른쪽 여백 추가 */
`;

const DashboardBanner = () => {
  const { isAuthenticated, user } = useSelector(state => state.user);
  const [tripData, setTripData] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(bannerImage);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMyTrips?tripId=${user.mainTrip}`);
        if (response.data['result code'] === 200) {
          const data = response.data.response[0];
          setTripData(data);
          if (data.banner) {
            const blob = new Blob([new Uint8Array(atob(data.banner).split('').map(char => char.charCodeAt(0)))], { type: 'image/jpeg' });
            setBannerUrl(URL.createObjectURL(blob));
          }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const calculateDDay = (startDate) => {
  const today = new Date();
  const start = new Date(startDate);
  const diffTime = start - today; // startDate와 today의 차이를 계산
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `D - ${diffDays}`;
  } else if (diffDays < 0) {
    return `D + ${Math.abs(diffDays)}`;
  } else {
    return 'D-DAY';
  }
};

return (
  <BannerWrapper bannerImage={bannerUrl}>
    {isAuthenticated && (
      <BannerText>
        <BannerTextLeft>
          <BannerBotImage src={bot} alt="여행봇" />
          {tripData ? (
            <TripInfo>
              <TripTitle>{tripData.title}</TripTitle>
              <TripDates>{formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}</TripDates>
            </TripInfo>
          ) : (
            <TripTitle>안녕하세요 {user.nickname}님! 함께 여행 계획을 만들어 떠나볼까요?</TripTitle>
          )}
        </BannerTextLeft>
        {tripData && <DDay>{calculateDDay(tripData.startDate)}</DDay>}
      </BannerText>
    )}
  </BannerWrapper>
);

};
export default DashboardBanner;
