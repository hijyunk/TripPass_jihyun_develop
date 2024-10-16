import React, { useState, useEffect } from "react";
import "../../styles/memo.css";
import { FaPencilAlt } from "react-icons/fa";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from "../../config";
import ReactMarkdown from 'react-markdown';

const Memo = () => {
  const { user } = useSelector(state => state.user);
  const [memo, setMemo] = useState("");
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const fetchMemo = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMyTrips?tripId=${user.mainTrip}`);
        const tripData = response.data.response[0];
        setMemo(tripData.memo || '아직 메모가 없어요');
      } catch (error) {
        console.error('메모 가져오기 실패:', error.message);
      }
    };

    if (user.mainTrip && user.mainTrip) {
      fetchMemo();
    }
  }, [user.mainTrip]); 
  
  const handleSaveMemo = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('tripId', user.mainTrip);
      formData.append('memo', memo);

      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      await axios.post(`${API_URL}/updateMyTripsMemo`, formData.toString(), config);
    } catch (error) {
      console.error('메모 업데이트 실패:', error.message);
    }
    setIsEditing(false);
  };

  return (
    <div className="memo">
      <div className="memoTitle">
        <span># 메모</span>
        <button className="editButton" onClick={() => setIsEditing(true)}>
          <FaPencilAlt />
        </button>
      </div>
      {isEditing ? (
        <div className="memoContent">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요..."
          ></textarea>
          <button className="saveButton" onClick={handleSaveMemo}>
            저장
          </button>
        </div>
      ) : (
        <div className="memoContent">
          <ReactMarkdown>{memo}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Memo;
