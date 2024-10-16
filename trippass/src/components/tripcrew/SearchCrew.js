import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import NewTripCrewPop from './NewTripCrewPop';
import { LuMapPin } from "react-icons/lu";
import { RiTeamLine } from "react-icons/ri";
import Swal from "sweetalert2";
const groupedPreferences = {
  money: [
    { id: 'money1', label: '넉넉한 게 최고!' },
    { id: 'money2', label: '아끼는 걸로' }
  ],
  food: [
    { id: 'food1', label: '웨이팅도 괜찮아' },
    { id: 'food2', label: '끌리는 대로' }
  ],
  transport: [
    { id: 'transport1', label: '터벅터벅' },
    { id: 'transport2', label: '무조건 택시' }
  ],
  schedule: [
    { id: 'schedule1', label: '즐기면서 천천히' },
    { id: 'schedule2', label: '알차게 돌아다녀요' }
  ],
  photo: [
    { id: 'photo1', label: '눈으로 담자' },
    { id: 'photo2', label: '인생샷은 필수!' }
  ]
};

const keyTranslations = {
  money: '💵 경비',
  food: '🍽️ 음식',
  transport: '🚥 교통',
  schedule: '⏰ 일정',
  photo: '📷 사진'
};

const SearchCrew = () => {
  const { user } = useSelector(state => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [searchCrewData, setSearchCrewData] = useState([]);
  const [sortedCrewData, setSortedCrewData] = useState([]);
  const [sortOption, setSortOption] = useState('전체');
  const [showClosed, setShowClosed] = useState(false);

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const calculateSimilarity = (personality1, personality2) => {
    try {
      personality1 = JSON.parse(personality1);
      personality2 = JSON.parse(personality2);
    } catch (e) {
      console.error('Failed to parse personality data as JSON');
      return 0;
    }
  
    if (typeof personality1 !== 'object' || typeof personality2 !== 'object') {
      console.error('Personality data must be objects');
      return 0;
    }
  
    const keys = Object.keys(personality1);
    let matchCount = 0;
  
    keys.forEach(key => {
      if (personality1[key] === personality2[key]) {
        matchCount++;
      }
    });
  
    return matchCount * 20; 
  };

  const handleToggleChange = () => {
    setShowClosed(!showClosed);
  };

  useEffect(() => {
    const fetchCrewData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getCrewCalc?mainTrip=${user.mainTrip}&userId=${user.userId}`);
        const crewData = response.data.response;
        const updatedCrewData = await Promise.all(crewData.map(async (crew) => {
          const tripMateList = crew.tripmate.split(',');
          const tripMateInfo = await Promise.all(tripMateList.map(async (userId) => {
            try {
              const userDataResponse = await axios.get(`${API_URL}/getUser`, {
                params: { userId }
              });
              return userDataResponse.data.response[0];
            } catch (error) {
              console.error(`유저 정보 가져오기 실패 (${userId}):`, error.message);
              return null;
            }
          }));
          return { ...crew, tripMateInfo: tripMateInfo.filter(info => info !== null) };
        }));
        setSearchCrewData(updatedCrewData);
        setSortedCrewData(updatedCrewData);
      } catch (error) {
        console.error('크루 정보 및 트립메이트 정보 가져오기 실패:', error.message);
      }
    };

    if (user && user.mainTrip) {
      fetchCrewData();
    }
  }, [user, user.mainTrip]);

  useEffect(() => {
    const getSortedCrewData = () => {
      let filteredData = [...searchCrewData];
  
      // '마감 제외' 토글 적용
      if (showClosed) {
        filteredData = filteredData.filter(crew => crew.tripmate.split(',').length < crew.numOfMate);
      }
  
      // 정렬 옵션 적용
      if (sortOption === '추천순') {
        filteredData.sort((a, b) => {
          const aSimilarity = a.tripMateInfo.reduce((sum, mate) => sum + calculateSimilarity(mate.personality, user.personality), 0) / a.tripMateInfo.length;
          const bSimilarity = b.tripMateInfo.reduce((sum, mate) => sum + calculateSimilarity(mate.personality, user.personality), 0) / b.tripMateInfo.length;
          
          return bSimilarity - aSimilarity;
        });
      }
  
      setSortedCrewData(filteredData);
    };
  
    getSortedCrewData();
  }, [sortOption, searchCrewData, user.personality, showClosed]);

  const handleJoinRequest = async (crewId) => {
    try {
      const formData = new FormData();
      formData.append('userId', user.userId);
      formData.append('tripId', user.mainTrip);
      formData.append('crewId', crewId);
      const response = await axios.post(`${API_URL}/insertJoinRequests`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      //console.log('신청하기 결과:', response.data);
      //alert('크루 가입 신청이 완료되었습니다');
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
        title: "크루 가입 신청이 완료되었습니다!"
      });
    } catch (error) {
      //alert('크루 가입 신청에 실패하였습니다.');
      //console.error('신청하기 실패:', error.message);
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
        title: "크루 가입 신청에 실패하였습니다."
      });
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12;
    return `${ampm} ${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <>
      <div className='searchCrewSection'>
        <div className='section-title'>
          <span>크루 찾기</span>
          <div>
            <span className="toggle-label">마감 제외</span>
            <label className="switch">
              <input className="toggleBtn" type="checkbox" checked={showClosed} onChange={handleToggleChange} />
              <span className="slider round"></span>
            </label>
            <select className='selectSort' value={sortOption} onChange={handleSortChange}>
              <option value="전체">전체</option>
              <option value="추천순">추천순</option>
            </select>
          </div>
        </div>
        <div className='searchCrewListContainer'>
          <div className="searchCrewList">
            <ul className="searchCrewCards">
              {sortedCrewData.map((crew, index) => (
                <li key={index} className="searchCrewCard">
                  <div className="searchCrewCardImg">
                    <img src={`data:image/jpeg;base64,${crew.banner}`} alt={crew.title} />
                  </div>
                  <div className="searchCrewCardInfo">
                    <div className="searchCrewTitle">{crew.title}</div>
                    <div className="searchCrewDate">{crew.date}  {formatTime(crew.time)}</div>
                    <div className="searchCrewAddress"><LuMapPin />&nbsp;{crew.address}</div>
                    <div className="searchCrewNote">{crew.note}</div>
                    <div className="searchCrewNum">
                      <RiTeamLine className="crewNumIcon" /> 
                      <span className='crewNumText'> {crew.tripmate.split(',').length} / {crew.numOfMate}</span>
                    </div>
                  </div>
                  <div className="searchCrewCardMate">
                    <ul>
                      {crew.tripMateInfo && crew.tripMateInfo.map((userData, idx) => {
                        const personalities = Array.isArray(userData.personality) ? userData.personality : [userData.personality];
                        return (
                          <li className="searchCrewCardMates" key={idx}>
                            <div className="searchCrewCardMateImg">
                              <img src={`data:image/jpeg;base64,${userData.profileImage}`} alt={userData.nickname}/>
                            </div>
                            <div className="crewDetails">
                              <div className='crewNickname'>{userData.nickname}</div>
                              {personalities.map((personality, i) => {
                                const similarity = calculateSimilarity(personality, user.personality);
                                return <div className='crewSimilarity' key={i}>성향이 {similarity}% 일치합니다.</div>;
                              })}
                            </div>
                            <div className="personalityDetails">
                              <div className='personalityTitle'>성향 보기</div>
                              <ul className='personalityList'>
                                {Object.entries(JSON.parse(userData.personality)).map(([key, value]) => {
                                  const isMatching = JSON.parse(user.personality)[key] === value;
                                  return (
                                    <li key={key} style={{ fontWeight: isMatching ? 'bold' : 'normal' }}>
                                      {keyTranslations[key]}: {
                                        groupedPreferences[key] ?
                                        groupedPreferences[key].find(preference => preference.id === value).label : value
                                      }
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div 
                      className={`joinReqBtn ${crew.tripmate.split(',').length === crew.numOfMate ? 'closed' : ''}`} 
                      onClick={() => handleJoinRequest(crew.crewId)}
                    >
                      {crew.tripmate.split(',').length === crew.numOfMate ? '신청마감' : '신청하기'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="newCrewButton" onClick={handlePopupOpen}>
        +
      </div>
      {showPopup && <NewTripCrewPop onClose={handlePopupClose} />}
    </>
  );
};

export default SearchCrew;