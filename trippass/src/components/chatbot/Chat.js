import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from "../../config";
import '../../styles/chat.css';
import { IoIosSend } from "react-icons/io";
import botProfileImage from '../../assets/bot1.png'; 

const Chat = () => {
  const { user } = useSelector(state => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tripInfo, setTripInfo] = useState(null);

  useEffect(() => {
    const fetchTripInfo = async () => {
      try {
        const tripResponse = await axios.get(`${API_URL}/getMyTrips`, {
          params: { userId: user.userId, tripId: user.mainTrip }
        });

        if (tripResponse.data['result code'] === 200) {
          const tripInfo = tripResponse.data.response[0];
          setTripInfo(tripInfo);
        } else {
          console.error('Failed to fetch trip data:', tripResponse.data);
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
      }
    };

    fetchTripInfo();
  }, [user.userId, user.mainTrip]);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!tripInfo) return;

      try {
        const chatResponse = await axios.get(`${API_URL}/getChatMessages`, {
          params: { userId: user.userId, tripId: user.mainTrip }
        });

        if (chatResponse.data.result_code === 200) {
          const conversation = chatResponse.data.messages;
          setMessages(conversation);
        } else if (chatResponse.data.result_code === 404) {
          const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
          };

          const startDate = formatDate(tripInfo.startDate);
          const endDate = formatDate(tripInfo.endDate);

          const welcomeMessage = {
            message: `안녕하세요, ${startDate}부터 ${endDate}까지 ${tripInfo.city}로 여행을 가시는 ${user.nickname}님!\n${user.nickname}님만의 여행 플랜 만들기를 시작해볼까요?\n제가 관광지, 식당, 카페 등 다양한 장소를 추천해드릴 수 있어요!\n추천 받길 원하시는 곳의 버튼을 눌러주세요.`,
            sender: 'bot',
            isSerp: false,
            timestamp: new Date().toISOString()
          };

          await axios.post(`${API_URL}/saveChatMessage`, {
            userId: user.userId,
            tripId: user.mainTrip,
            sender: 'bot',
            message: welcomeMessage.message
          });

          setMessages([welcomeMessage]);
        } else {
          console.error('Failed to fetch chat data:', chatResponse.data);
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      }
    };

    fetchChatData();
  }, [tripInfo, user.userId, user.mainTrip, user.nickname]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (newMessage.trim()) {
      const userMessage = { message: newMessage, sender: 'user', isSerp: false, timestamp: new Date().toISOString() };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      setNewMessage('');

      try {
        // 사용자 메시지를 서버에 저장
        await axios.post(`${API_URL}/saveChatMessage`, {
          userId: user.userId,
          tripId: user.mainTrip,
          sender: 'user',
          message: newMessage
        });

        // 장소 검색 API 호출
        const response = await axios.post(`${API_URL}/callOpenAIFunction`, {
          userId: user.userId,
          tripId: user.mainTrip,
          sender: 'user',
          message: newMessage
        });

        if (response.data.result_code === 200) {
          const formatted_results_str = response.data.response;

          const serpMessage = { message: formatted_results_str, sender: 'bot', isSerp: true, timestamp: new Date().toISOString() };

          // 상태에 검색 결과 메시지 추가
          setMessages(prevMessages => [...prevMessages, serpMessage]);

          // 검색 결과 메시지를 서버에 저장
          await axios.post(`${API_URL}/saveChatMessage`, {
            userId: user.userId,
            tripId: user.mainTrip,
            sender: 'bot',
            message: formatted_results_str,
            isSerp: true
          });
        } else {
          console.error('Failed to fetch places:', response.data.message);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleButtonClick = async (userQuery) => {
    const userMessage = { message: userQuery, sender: 'user', isSerp: false, timestamp: new Date().toISOString() };
    // 먼저 사용자 메시지를 상태에 추가합니다.
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      // 사용자 메시지를 서버에 저장
      await axios.post(`${API_URL}/saveChatMessage`, {
        userId: user.userId,
        tripId: user.mainTrip,
        sender: 'user',
        message: userQuery
      });

      // 장소 검색 API 호출
      const response = await axios.post(`${API_URL}/callOpenAIFunction`, {
        userId: user.userId,
        tripId: user.mainTrip,
        sender: 'user',
        message: userQuery
      });

      if (response.data.result_code === 200) {
        const formatted_results_str = response.data.response;

        const serpMessage = { message: formatted_results_str, sender: 'bot', isSerp: true, timestamp: new Date().toISOString() };

        // 상태에 검색 결과 메시지 추가
        setMessages(prevMessages => [...prevMessages, serpMessage]);

        // 검색 결과 메시지를 서버에 저장
        await axios.post(`${API_URL}/saveChatMessage`, {
          userId: user.userId,
          tripId: user.mainTrip,
          sender: 'bot',
          message: formatted_results_str,
          isSerp: true
        });
      } else {
        console.error('Failed to fetch places:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const renderMessageWithLineBreaks = (message) => {
    if (typeof message !== 'string') {
      console.error('Invalid message format:', message);
      return null;
    }
  
    return message.split('\n').map((text, index) => (
      <React.Fragment key={index}>
        {text}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="chatContainer">
      <div className="chatMessages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chatMessage ${message.sender === 'user' ? 'myMessage' : 'otherMessage'}`}
          >
            <div className="messageText">{renderMessageWithLineBreaks(message.message)}</div>
            <img
              src={message.sender === 'user' 
                    ? `data:image/png;base64,${user.profileImage || user.socialProfileImage}` 
                    : botProfileImage}
              alt="Profile"
              className="profileImage"
            />
          </div>
        ))}
      </div>
      <div className="buttonRow">
        <button className="chatButton" onClick={() => handleButtonClick(`${tripInfo.city}에서 인기 있는 관광지 알려줘`)}>{tripInfo ? tripInfo.city : ''} 인기 관광지🗼</button>
        <button className="chatButton" onClick={() => handleButtonClick(`${tripInfo.city}에서 인기 있는 식당 알려줘`)}>{tripInfo ? tripInfo.city : ''} 인기 식당 🍽️</button>
        <button className="chatButton" onClick={() => handleButtonClick(`${tripInfo.city}에서 인기 있는 카페 알려줘`)}>{tripInfo ? tripInfo.city : ''} 인기 카페 ☕</button>
        <button className="chatButton">🔎 사용자 입력</button>
      </div>
      <div className="messageInputContainer">
        <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="messageInput"
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit" className="sendMessageButton">
          <IoIosSend style={{ verticalAlign: 'middle', fontSize: '1.2em' }} />
        </button>    
        </form>
      </div>
    </div>
  );
};

export default Chat;
