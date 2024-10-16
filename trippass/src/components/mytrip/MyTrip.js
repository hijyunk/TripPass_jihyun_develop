import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TripCard from './TripCard';
import { MdOutlineAddCircleOutline } from "react-icons/md";
import '../../styles/mytrip.css';
import { API_URL } from "../../config";
import { useSelector, useDispatch} from 'react-redux';
import { updateUserMainTrip } from '../../store/userSlice';
import { useNavigate } from 'react-router-dom';
import NewTrip from './NewTrip';
import Swal from "sweetalert2";

const MyTrip = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const [tripPlans, setTripPlans] = useState([]);
  const [highlightedTripId, setHighlightedTripId] = useState(user.mainTrip || null);
  const [isCreatingNewTrip, setIsCreatingNewTrip] = useState(false);



  useEffect(() => {
    const fetchTripPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMyTrips?userId=${user.userId}`);
        if (response.data['result code'] === 200) {
          setTripPlans(response.data.response);
        } else {
          console.error('Failed to fetch trip plans:', response.data);
        }
      } catch (error) {
        console.error('Error fetching trip plans:', error);
      }
    };

    fetchTripPlans();
  }, [highlightedTripId, user.userId]);

  const handleCardClick = async (tripId) => {
    setHighlightedTripId(tripId);
    dispatch(updateUserMainTrip(tripId));
    //alert("메인으로 설정되었습니다.")
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
      title: "메인으로 설정되었습니다!"
    });
    navigate('/tripPlan');
    try {
      const response = await axios.post(`${API_URL}/updateUserMainTrip`, {
        userId: user.userId,
        mainTrip: tripId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data['result code'] !== 200) {
        console.error('Failed to update main trip:', response.data);
        setHighlightedTripId(user.mainTrip);
        dispatch(updateUserMainTrip(user.mainTrip));
      }
    } catch (error) {
      console.error('Error updating main trip:', error);
      setHighlightedTripId(user.mainTrip);
      dispatch(updateUserMainTrip(user.mainTrip));
    }
  };

  const handleDelete = async (tripId) => {
    try {
      const response = await axios.delete(`${API_URL}/deleteTrip`, {
        data: { userId: user.userId, tripId: tripId },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data['result code'] === 200) {
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
          title: "여행이 삭제되었습니다."
        });
        setTripPlans(prevPlans => prevPlans.filter(trip => trip.tripId !== tripId));
        if (tripId === highlightedTripId) {
          setHighlightedTripId(null);
          dispatch(updateUserMainTrip(null));
        }
      } else {
        console.error('Failed to delete trip:', response.data);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data.detail === "크루 참여가 있는 여행은 삭제할 수 없습니다.") {
            //alert("크루 참여가 있는 여행은 삭제할 수 없습니다.");
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
              title: "크루 참여가 있는 여행은 삭제할 수 없습니다."
            });
          } else {
            //alert("요청에 문제가 있습니다.");
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
              title: "요청에 문제가 있습니다."
            });
          }
        } else {
          //alert("트립 삭제를 할 수 없습니다.");
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
            title: "트립 삭제를 할 수 없습니다."
          });
        }
      } else {
        //alert("서버와의 통신에 문제가 발생했습니다.");
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
          title: "서버와의 통신에 문제가 발생했습니다."
        });
        
      }
      console.error('Error deleting trip:', error);
    }
  };

  const handleCreateNewTrip = () => {
    const userPersonality = user.personality;
    if (userPersonality === "none") {
      //alert("여행을 시작하시기 전에 성향을 먼저 만들어볼까요?");
      Swal.fire({
        icon: 'error',
        html: '아직 여행 성향을 만들지 않으셨네요!<br>여행을 시작하시기 전에 성향을 먼저 만들어볼까요? 😎',
      })
      navigate('/user')
    }else{
      setIsCreatingNewTrip(true);
    }
  };

  return (
    <div className="MyTrip_Container">
      <div className='section-title'>마이 트립</div>
      <div className="MyTrip_CardSection">
        <div className="NewTrip_Card">
          <button className='TripCard_InsertButton' onClick={handleCreateNewTrip} >
                <MdOutlineAddCircleOutline className='TripCard_Insert' />
          </button>
          <h3>새 여행 만들기</h3>
        </div>
        {tripPlans.map((trip) => (
          <TripCard
            key={trip.tripId}
            title={trip.title}
            startDate={trip.startDate}
            endDate={trip.endDate}
            banner={trip.banner}
            isHighlighted={trip.tripId === highlightedTripId}
            onClick={() => handleCardClick(trip.tripId)}
            onDelete={() => handleDelete(trip.tripId)}
          />
        ))}
      </div>
      {isCreatingNewTrip && <NewTrip onClose={() => setIsCreatingNewTrip(false)} />}
    </div>
  );
};

export default MyTrip;
