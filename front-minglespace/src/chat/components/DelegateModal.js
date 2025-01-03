import React, { useState } from "react";
import Repo from "../../auth/Repo";
import { useChatRoom } from "../context/ChatRoomContext";

const DelegateModal = ({ onClose, participants }) => {
  const { isModalOpen, handleDelegate } = useChatRoom();
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 멤버 상태

  const handleUserSelect = (newLeader) => {
    setSelectedUser(newLeader);
    // console.log(`사용자 ${newLeader.name} 선택됨`);
  };

  const handleDelegateAndExit = async () => {
    if (selectedUser) {
      // console.log("selected user :", selectedUser);
      await handleDelegate(selectedUser); // 새 방장으로 위임
      alert(`${selectedUser.name}님이 방장으로 위임되었습니다.`);
      setSelectedUser(null);
      onClose(); // 모달 닫기
    } else {
      alert("위임할 멤버를 선택해주세요.");
    }
  };

  if (!isModalOpen) return null;

  return (
    <div>
      <div className="delefate_modal">
        <h2>방장 위임하기</h2>
        <p>방장으로 위임할 사용자를 선택하세요</p>
        <ul>
          {participants
            .filter((member) => member.userId !== Number(Repo.getUserId()))
            .map((member) => (
              <li
                key={member.userId}
                className={
                  selectedUser?.wsMemberId === member.wsMemberId
                    ? "selected"
                    : ""
                }
              >
                {member.email}
                <button
                  className={`invite-btn ${
                    selectedUser?.wsMemberId === member.wsMemberId
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleUserSelect(member)}
                >
                  위임
                </button>
              </li>
            ))}
        </ul>
        <button
          className="create_btn"
          onClick={handleDelegateAndExit}
          disabled={!selectedUser}
        >
          나가기
        </button>
        <button className="close_btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default DelegateModal;
