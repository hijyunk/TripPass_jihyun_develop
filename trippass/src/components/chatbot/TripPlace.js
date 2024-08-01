import React, { useState, useEffect } from "react";
import { useSelector ,useDispatch } from 'react-redux';
import { FcCalendar } from "react-icons/fc";
import { RiMapPinAddLine } from "react-icons/ri";
import axios from 'axios';
import { API_URL } from "../../config";
import NewTripPlacePop from './NewTripPlanPopup';
import { deleteTripPlace } from '../../store/tripSlice';



const TripPlace = () => {
  const { user } = useSelector(state => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [tripInfo, setTripInfo] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const dispatch = useDispatch();


  const handlePopupOpen = (placeInfo) => {
    setSelectedPlace(placeInfo);
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedPlace(null);
  };


  const fetchTripPlaceInfo = async () => {
    try {
      const tripResponse = await axios.get(`${API_URL}/getSavePlace`, {
        params: { userId: user.userId, tripId: user.mainTrip }
      });

      if (tripResponse.data['result_code'] === 200) {
        const updatedTripInfo = tripResponse.data.response.map(place => ({
          place: place.title,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          description: place.description
        }));
        setTripInfo(updatedTripInfo);    
      } else {
        console.error('Failed to fetch trip data:', tripResponse.data);
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
    }
  };

  useEffect(() => {
    if (user.userId && user.mainTrip) {
      fetchTripPlaceInfo();
    }
  }, [user.userId, user.mainTrip]);

  useEffect(() => {
    const checkSessionStorage = () => {
      const tripPlaceStatus = sessionStorage.getItem('tripPlace');
      if (tripPlaceStatus === 'update') {
        fetchTripPlaceInfo();
      }
    };
    checkSessionStorage();
    const interval = setInterval(checkSessionStorage, 1000); 
    return () => clearInterval(interval);
  }, []);



  return (
    <>
      <div className="tripPlaceSection">
        <div className="tripPlaceTitle">
          <RiMapPinAddLine />&nbsp;&nbsp;저장한 장소
        </div>
        <div className="tripPlaceContent">
          <ul>
            {tripInfo && tripInfo.map((info, index) => (
              <li key={index}>
                <div className="tripPlaceName">
                  {info.place}
                </div>
                <div className="tripPlaceCalendar">
                  <FcCalendar onClick={() => handlePopupOpen(info)} size={22} />
                </div>
                {showPopup && selectedPlace && <NewTripPlacePop onClose={handlePopupClose} placeInfo={selectedPlace}/>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default TripPlace;
