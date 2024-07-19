import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { TiDelete } from 'react-icons/ti';
import { API_URL } from '../../config';
import '../../styles/mycrewlist.css';

const MyCrewList = () => {
  const { user } = useSelector(state => state.user);
  const [crewData, setCrewData] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const maxCards = 5; 

  const fetchMyCrew = async () => {
    setLoading(true); // 로딩 상태 시작
    try {
      const response = await axios.get(`${API_URL}/getThisTripCrew?tripId=${user.mainTrip}`);
      const crewData = response.data.response;
      setCrewData(crewData);
      setLoading(false); // 로딩 상태 종료
    } catch (error) {
      console.error('MyCrew 가져오기 실패:', error.message);
      setLoading(false); // 로딩 상태 종료
    }
  };

  useEffect(() => {
    if (user.mainTrip && user.userId) {
      fetchMyCrew();
    }
  }, [user.mainTrip, user.userId]);

  const scrollLeft = () => {
    setStartIndex(Math.max(startIndex - maxCards, 0)); 
  };

  const scrollRight = () => {
    setStartIndex(startIndex + maxCards); 
  };

  const handleCrewDelete = async (crewId) => {
    try {
      const response = await axios.delete(`${API_URL}/deleteCrew`, {
        data: { crewId: crewId, userId: user.userId },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data['result code'] === 200) {
        fetchMyCrew(); // 데이터를 다시 가져옵니다.
      } else if(response.data['result code'] === 402){
        alert("메이트가 있는 여행은 삭제할 수 없습니다.");
      } else {
        console.error('Failed to delete trip:', response.data);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data['result code'] === 402) {
            alert("메이트가 있는 여행은 삭제할 수 없습니다.");
          } 
        } else {
          alert("트립 삭제를 할 수 없습니다.");
        }
      } else {
        alert("서버와의 통신에 문제가 발생했습니다.");
      }
      console.error('Error deleting trip:', error);
    }
  };

  const confirmAndDelete = (crewId) => {
    const confirmed = window.confirm("이 크루를 정말 삭제하시겠습니까?");
    if (confirmed) {
      handleCrewDelete(crewId);
    }
  };

  return (
    <div className="crewSection">
      <div className="section-title">
        <span>마이 크루</span>
        <div>
          <button className="scrollButton" onClick={scrollLeft}>
            &lt;
          </button>
          <button className="scrollButton" onClick={scrollRight}>
            &gt;
          </button>
        </div>
      </div>
      <div className="crewListContainer">
        {loading && ( 
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="crewList">
          <ul className="crewCards">
            {crewData.slice(startIndex, startIndex + maxCards).map((crew, index) => (
              <li key={index} className="crewCard">
                <div className="crewCardImageWrapper">
                  <img src={`data:image/jpeg;base64,${crew.banner}`} alt={crew.title} />
                  <div className="crewCardOverlay">
                    <div className="crewCardInfo">
                      <div className="crewDate">{crew.date}</div>
                      <div className="crewTitle">{crew.title}</div>
                    </div>
                    <div className="deleteCrewButton" onClick={() => confirmAndDelete(crew.crewId)}>
                      <TiDelete size={20} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyCrewList;
