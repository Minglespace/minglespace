import React, { useState } from "react";

const DelegateModal = ({ isOpen, onClose, onTransfer }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  // 더미 데이터 (채팅방 멤버 목록)
  const roomMembers = [
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
    { id: 3, name: "User 3" },
    { id: 4, name: "User 4" },
  ];
  if (!isOpen) return null;

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    console.log(`사용자 ${user.name} 선택됨`);
  };

  const handleTransfer = () => {
    console.log("selectedUser 값: ", selectedUser);
    if (selectedUser) {
      onTransfer(selectedUser); // 새 방장으로 위임
      alert(`${selectedUser.name}님이 방장으로 위임되었습니다.`);
      onClose(); // 모달 닫기
    } else {
      alert("사용자를 선택해주세요.");
    }
  };

  return (
    <div>
      <div className="delefate_modal">
        <h2>방장 위임하기</h2>
        <p>방장으로 위임할 사용자를 선택하세요</p>
        <ul>
          {roomMembers.map((member) => (
            <li key={member.id}>
              {member.name}
              <button onClick={() => handleUserSelect(member)}>위임</button>
            </li>
          ))}
        </ul>
        <button className="create_btn" onClick={handleTransfer}>
          확인{" "}
        </button>
        <button className="close_btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default DelegateModal;
