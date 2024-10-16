import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePersonality } from "../../store/userActions";
import moneyImg from '../../assets/profile/money.png';
import foodImg from '../../assets/profile/food.png';
import transportImg from '../../assets/profile/transport.png';
import scheduleImg from '../../assets/profile/schedule.png';
import photoImg from '../../assets/profile/photo.png';

const groupedPreferences = {
  money: [
    { id: 'money1', img: moneyImg, label: '넉넉한 게 최고!\n이왕 가는 거 FLEX' },
    { id: 'money2', img: moneyImg, label: '아낄 수 있으면\n아끼는 걸로' }
  ],
  food: [
    { id: 'food1', img: foodImg, label: '웨이팅도 괜찮아\n검증된 맛집' },
    { id: 'food2', img: foodImg, label: '끌리는 대로~\n아무거나 먹어요' }
  ],
  transport: [
    { id: 'transport1', img: transportImg, label: '터벅터벅\n대중교통 + 뚜벅이' },
    { id: 'transport2', img: transportImg, label: '시간 체력 아끼자\n무조건 택시파' }
  ],
  schedule: [
    { id: 'schedule1', img: scheduleImg, label: '느긋하게 여유롭게\n즐기면서 천천히' },
    { id: 'schedule2', img: scheduleImg, label: '이왕 온 여행\n알차게 돌아다녀요' }
  ],
  photo: [
    { id: 'photo1', img: photoImg, label: '눈으로 담자\n대충 흔적만' },
    { id: 'photo2', img: photoImg, label: '남는 건 사진뿐\n인생샷은 필수!' }
  ]
};

const UserPersonality = () => {
  const dispatch = useDispatch();
  const [preferences, setPreferences] = useState({
    money: null,
    food: null,
    transport: null,
    schedule: null,
    photo: null
  });
  const [editing, setEditing] = useState(false);
  const { user } = useSelector(state => state.user);

  useEffect(() => {
    if (user && user.personality && user.personality !== "none") {
      try {
        const parsedPersonality = JSON.parse(user.personality);
        setPreferences(parsedPersonality);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
  }, [user]);

  const handlePreferenceClick = (group, preferenceId) => {
    setPreferences((prevPreferences) => ({
      ...prevPreferences,
      [group]: prevPreferences[group] === preferenceId ? null : preferenceId
    }));
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveClick = async () => {
    if (Object.values(preferences).every(value => value !== null)) {
      try {
        const personality = JSON.stringify(preferences);
        await dispatch(updatePersonality(user.userId, personality));
        setEditing(false);
      } catch (error) {
        console.error("Error updating personality:", error);
      }
    }
  };

  return (
    <div className="section-travel-preferences">
      <h3 className="section-title">나의 여행 성향</h3>
      {user ? (
        user.personality === "none" && !editing ? (
          <div className="no-preferences">
            아직 선택하신 내역이 없어요 😣
          </div>
        ) : (
          <>
            {editing ? (
              <div className="preferences-grid">
                {Object.keys(groupedPreferences).map((group) => (
                  <div key={group} className="preference-group">
                    <img src={groupedPreferences[group][0].img} alt={group} className="preference-image" />
                    {groupedPreferences[group].map((preference) => (
                      <div
                        key={preference.id}
                        className={`preference-label ${preferences[group] === preference.id ? 'selected' : ''}`}
                        onClick={() => handlePreferenceClick(group, preference.id)}
                      >
                        {preference.label.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="preferences-icons">
                {Object.values(preferences).filter(value => value !== null).map((preferenceId) => {
                  const preference = Object.values(groupedPreferences).flat().find((p) => p.id === preferenceId);
                  return (
                    <div key={preference.id} className="preference-icon">
                      <img src={preference.img} alt={preference.label} />
                      <p style={{ margin: "2vh 0" }}>{preference.label}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )
      ) : null}
      <button 
        className="edit-button" 
        onClick={editing ? handleSaveClick : handleEditClick}
      >
        {editing ? '수정 완료' : '결과 수정'}
      </button>
    </div>
  );
}

export default UserPersonality;