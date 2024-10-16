import React from 'react';
import { TiDelete } from "react-icons/ti";
import '../../styles/mytrip.css';
import Swal from "sweetalert2";

const TripCard = ({ title, startDate, endDate, banner, isHighlighted, onClick, onDelete }) => {
  const imageUrl = `data:image/jpeg;base64,${banner}`;
  const imageClass = isHighlighted ? 'TripCard_Image' : 'TripCard_Image TripCard_Image_Dark';

  const handleDeleteClick = () => {
    // if (window.confirm("해당 여행을 삭제하시겠습니까?")) {
    //   onDelete();
    // }
    Swal.fire({
      title: "해당 여행을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "삭제",
      cancelButtonText: "취소"
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete();
      }
    });
  };

  return (
    <div className="TripCard_Card">
      <div className="TripCard_ImageContainer">
        <img src={imageUrl} alt={title} className={imageClass} />
        <div className="TripCard_Overlay">
          <div className="TripCard_OverlayTopContent">
            <div className="TripCard_Title">{title}</div>
            {!isHighlighted && (
            <button className='TripCard_DeleteButton' onClick={handleDeleteClick}>
              <TiDelete className='TripCard_Delete' />
            </button>
            )}
          </div>
          <div className="TripCard_OverlayMiddleContent">
          {!isHighlighted && (
              <div className="TripCard_MainText" onClick={onClick}>메인으로 설정하기</div>
          )}
          </div>
          <div className="TripCard_OverlayBottomContent">
              <div className="TripCard_Date">{`${startDate} ~ ${endDate}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
