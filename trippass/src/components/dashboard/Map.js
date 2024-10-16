import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaMapMarkerAlt } from "react-icons/fa";
import { renderToString } from 'react-dom/server';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_URL } from '../../config';

const defaultMarker = { id: 1, position: [37.5759, 126.9768], popupText: "여행을 떠나볼까요?" };

const colors = [
  '#4177A6', '#D9D0C1', '#FBAFC5', '#DFACF6', '#BBD6FD', '#BDD9F5', '#BFADBF', '#F2EEAD', '#FDD5DA'
];

const CustomMarker = ({ position, popupText, color }) => {
  const icon = L.divIcon({
    html: renderToString(
      <FaMapMarkerAlt
        style={{
          color: color,
          fontSize: '30px',
          stroke: '#666',
          strokeWidth: '30px'
        }}
      />
    ),
    className: '',
  });

  return (
    <Marker position={position} icon={icon}>
      <Popup>{popupText}</Popup>
    </Marker>
  );
};

const Map = () => {
  const { user } = useSelector(state => state.user);
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(null);

  useEffect(() => {
    const fetchTripPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/getTripPlans?tripId=${user.mainTrip}`);
        if (response.data['result code'] === 200) {
          const plans = response.data.response;

          // 날짜별로 소팅
          plans.sort((a, b) => new Date(a.date) - new Date(b.date));

          const dateToColor = {};
          let colorIndex = 0;

          // 날짜별로 색상 지정
          const markersData = plans.map(plan => {
            if (!dateToColor[plan.date]) {
              dateToColor[plan.date] = colors[colorIndex % colors.length];
              colorIndex++;
            }

            return {
              id: plan.planId,
              position: [plan.latitude, plan.longitude],
              title: plan.title,
              place: plan.place,
              popupText: `${plan.title} - ${plan.place}`,
              date: plan.date,
              color: dateToColor[plan.date]
            };
          });

          // 마커의 평균 좌표 계산
          if (markersData.length > 0) {
            const averageLat = markersData.reduce((sum, marker) => sum + marker.position[0], 0) / markersData.length;
            const averageLng = markersData.reduce((sum, marker) => sum + marker.position[1], 0) / markersData.length;
            setCenter([averageLat, averageLng]);
            setMarkers(markersData);
          } else {
            setMarkers([defaultMarker]);
            setCenter(defaultMarker.position);
          }
        } else {
          console.error('Failed to fetch trip plans:', response.data);
          setMarkers([defaultMarker]);
          setCenter(defaultMarker.position);
        }
      } catch (error) {
        console.error('Error fetching trip plans:', error);
        setMarkers([defaultMarker]);
        setCenter(defaultMarker.position);
      }
    };

    if (user.mainTrip) {
      fetchTripPlans();
    } else {
      setMarkers([defaultMarker]);
      setCenter(defaultMarker.position);
    }
  }, [user.mainTrip]);

  if (!center) {
    return <div>Loading...</div>;
  }

  return (
    <MapContainer center={center} zoom={12} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map(marker => (
        <CustomMarker key={marker.id} position={marker.position} popupText={marker.popupText} color={marker.color} />
      ))}
    </MapContainer>
  );
};

export default Map;
