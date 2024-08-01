import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { API_URL } from "../../config";
import '../../styles/chat.css';
import { IoIosSend } from "react-icons/io";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import botProfileImage from '../../assets/bot1.png';

import { updateTripPlace, deleteTripPlace } from '../../store/tripSlice';


// Marker 아이콘 설정 (기본 아이콘이 제대로 표시되지 않는 경우)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Chat = () => {
  const { user } = useSelector(state => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tripInfo, setTripInfo] = useState(null);
  const [geoCoordinates, setGeoCoordinates] = useState([]); // 좌표 저장
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTripInfo = async () => {
      try {
        const tripResponse = await axios.get(`${API_URL}/getMyTrips`, {
          params: { userId: user.userId, tripId: user.mainTrip }
        });

        if (tripResponse.data['result code'] === 200) {
          setTripInfo(tripResponse.data.response[0]);
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
          setMessages(chatResponse.data.messages.map(msg => ({ ...msg, currentPage: 0 }))); // 메시지 초기화 시 페이지 상태 추가
          scrollToBottom();
        } else if (chatResponse.data.result_code === 404) {
          const welcomeResponse = await axios.get(`${API_URL}/getWelcomeMessage`, {
            params: { userId: user.userId, tripId: user.mainTrip }
          });

          if (welcomeResponse.data.result_code === 200) {
            const welcomeMessage = {
              message: welcomeResponse.data.welcome_message,
              sender: 'bot',
              isSerp: false,
              timestamp: new Date().toISOString()
            };

            setMessages([welcomeMessage]);
            scrollToBottom();
          } else {
            console.error('Failed to fetch welcome message:', welcomeResponse.data.message);
          }
        } else {
          console.error('Failed to fetch chat data:', chatResponse.data);
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      }
    };

    fetchChatData();
  }, [tripInfo, user.userId, user.mainTrip]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 사용자 메세지 직접 입력 
  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (newMessage.trim()) {
      const userMessage = { message: newMessage, sender: 'user', isSerp: false, timestamp: new Date().toISOString() };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      setNewMessage('');

      try {
        await axios.post(`${API_URL}/saveChatMessage`, {
          userId: user.userId,
          tripId: user.mainTrip,
          sender: 'user',
          message: newMessage,
        });

        // 챗봇 API 호출
        const response = await axios.post(`${API_URL}/callOpenAIFunction`, {
          userId: user.userId,
          tripId: user.mainTrip,
          sender: 'user',
          message: newMessage,
        });

        if (response.data.result_code === 200) {
          const formatted_results_str = response.data.response;
          const isSerp = response.data.isSerp;

          const serpMessage = { message: formatted_results_str, sender: 'bot', isSerp, timestamp: new Date().toISOString(), currentPage: 0 };
          const geo = response.data.geo; // 추가된 geo 데이터를 받습니다.

          setMessages(prevMessages => [...prevMessages, serpMessage]);
          if (isSerp) {
            setGeoCoordinates(geo); // geo 좌표를 상태에 저장합니다.
            dispatch(deleteTripPlace());
          } else {
            dispatch(updateTripPlace());
          }

          await axios.post(`${API_URL}/saveChatMessage`, {
            userId: user.userId,
            tripId: user.mainTrip,
            sender: 'bot',
            message: formatted_results_str,
            isSerp: isSerp
          });
        } else {
          console.error('Failed to fetch places:', response.data.message);
        }
      } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
      }
    }
  };

  const handleButtonClick = async (userQuery) => {
    const userMessage = { message: userQuery, sender: 'user', isSerp: false, timestamp: new Date().toISOString() };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      await axios.post(`${API_URL}/saveChatMessage`, {
        userId: user.userId,
        tripId: user.mainTrip,
        sender: 'user',
        message: userQuery
      });

      const response = await axios.post(`${API_URL}/callOpenAIFunction`, {
        userId: user.userId,
        tripId: user.mainTrip,
        sender: 'user',
        message: userQuery
      });

      if (response.data.result_code === 200) {
        const formatted_results_str = response.data.response;
        const isSerp = true;
        const serpMessage = { message: formatted_results_str, sender: 'bot', isSerp, timestamp: new Date().toISOString(), currentPage: 0 };
        const geo = response.data.geo;
      
        setMessages(prevMessages => [...prevMessages, serpMessage]);
        setGeoCoordinates(geo);
        dispatch(deleteTripPlace());

        await axios.post(`${API_URL}/saveChatMessage`, {
          userId: user.userId,
          tripId: user.mainTrip,
          sender: 'bot',
          message: formatted_results_str,
          isSerp: isSerp
        });
      } else {
        console.error('Failed to fetch places:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handleUserInputButtonClick = async () => {
    const botMessage = "어느 장소를 입력하고 싶으신가요? 정확한 장소명을 입력해주세요.";
    const botChatMessage = { message: botMessage, sender: 'bot', isSerp: false, timestamp: new Date().toISOString() };

    setMessages(prevMessages => [...prevMessages, botChatMessage]);

    try {
      await axios.post(`${API_URL}/saveChatMessage`, {
        userId: user.userId,
        tripId: user.mainTrip,
        sender: 'bot',
        message: botMessage
      });
    } catch (error) {
      console.error('Error saving bot message:', error);
    }
  };

  const renderMessageWithLineBreaks = (message) => {
    if (typeof message !== 'string') {
      console.error('Invalid message format:', message);
      return null;

    }

    return message.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const renderSerpMessages = (serpMessage, messageIndex) => {
    if (!serpMessage || !serpMessage.message) {
      console.error('serpMessage 또는 serpMessage.message가 정의되지 않았습니다.');
      return <div>Loading...</div>; // 데이터가 아직 로드되지 않았거나 오류가 있는 경우
    }

    const allLocations = serpMessage.message.split(/\*/).filter(location => location.trim() !== '');
    const startIndex = serpMessage.currentPage * 4;
    const endIndex = startIndex + 4;
    const locationsToShow = allLocations.slice(startIndex, endIndex);
    const geoCoordinatesToShow = geoCoordinates.slice(startIndex, endIndex);

    return (
      <>
        <div className="serpChatMessageContainer">

        <div className="serpChatMessage">

            <img
              src={botProfileImage}
              alt="Profile"
              className="profileImage"
            />
            <div className="messageText">
              {locationsToShow.map((location, index) => (

                <div key={index}>{renderMessageWithLineBreaks(location)}</div>
              ))}
              {allLocations.length > 4 && (
                <div className="pagination">
                  {serpMessage.currentPage > 0 && (
                    <button
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      onClick={() =>
                        setMessages(prevMessages =>
                          prevMessages.map((msg, idx) =>
                            idx === messageIndex
                              ? { ...msg, currentPage: msg.currentPage - 1 }
                              : msg
                          )
                        )
                      }
                    >
                      <FaChevronLeft />
                    </button>
                  )}
                  {endIndex < allLocations.length && (
                    <button
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      onClick={() =>
                        setMessages(prevMessages =>
                          prevMessages.map((msg, idx) =>
                            idx === messageIndex
                              ? { ...msg, currentPage: msg.currentPage + 1 }
                              : msg
                          )
                        )
                      }
                    >
                      <FaChevronRight />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>


          {geoCoordinatesToShow.length > 0 && (
            <MapContainer
              center={[geoCoordinatesToShow[0][0], geoCoordinatesToShow[0][1]]}
              zoom={13}
              style={{ height: "300px", width: "400px", marginTop: "10px", marginLeft: "63px" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {geoCoordinatesToShow.map((coord, index) => {
                const locationData = locationsToShow[index];
                if (!locationData) {
                  return null;
                }

                const location = locationData.split('\n')[0]; // 첫 번째 줄에서 장소 이름과 번호 추출
                return (
                  <Marker key={index} position={[coord[0], coord[1]]}>
                    <Popup>
                      {location}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </>
    );
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="chatContainer">
      <div className="chatMessages">
        {messages.map((message, index) => {
          if (message.isSerp) {
            return <div className="serpMessage" key={index}>{renderSerpMessages(message, index)}</div>;
          } else {
            return (
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
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="buttonRow">
        <button className="chatButton" onClick={() => handleButtonClick(`${tripInfo.city}에서 인기 있는 관광지 알려줘`)}>{tripInfo ? tripInfo.city : ''} 인기 관광지🗼</button>
        <button className="chatButton" onClick={() => handleButtonClick(`${tripInfo.city}에서 인기 있는 식당 알려줘`)}>{tripInfo ? tripInfo.city : ''} 인기 식당 🍽️</button>
        <button className="chatButton" onClick={() => handleButtonClick(`${tripInfo.city}에서 인기 있는 카페 알려줘`)}>{tripInfo ? tripInfo.city : ''} 인기 카페 ☕</button>
        <button className="chatButton" onClick={handleUserInputButtonClick}>🔎 사용자 입력</button>
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
