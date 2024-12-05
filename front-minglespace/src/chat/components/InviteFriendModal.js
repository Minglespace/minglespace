import React, { useState } from "react";

const InviteFriendModal = ({ isOpen, onClose, inviteUsers, participants, onInvite, onTransfer }) => {
  const [selectedUser, setSelectedUser] = useState(null); //선택된 사용자
  if (!isOpen) return null;

  const handleUserSelect = (user) => {
    // setSelectedUser(user); // 사용자를 선택하면 selectedUser상태 업데이트
    console.log(`선택된 사용자: ${user.name}`);
  };

  const handleInvite = () => {
    if (selectedUser) {
      // onInvite(selectedUser);
      // alert(`${selectedUser.name}님이 초대되었습니다.`);
      onClose();
    } else {
      alert("초대할 멤버를 선택해주세요.");
    }
  };
  return (
    <div className="invite_modal">
      <h1> 채팅방 멤버 초대하기</h1>
      <p>초대할 멤버를 선택하세요 : </p>
      <ul>
        {/* invitableUsers가 정의되지 않았을 때 기본값을 빈 배열로 설정 */}
        {inviteUsers.length === 0 ? (
          <li>초대할 친구가 없습니다.</li>
        ) : (
          inviteUsers.map((user) => (
            <li key={user.wsMemberId}>
              {user.email}
              <button onClick={() => handleUserSelect(user)}>초대</button>
            </li>
          ))
        )}
      </ul>
      <button onClick={handleInvite}>확인 </button>
      <button onClick={onClose}>닫기</button>
    </div>
  );
};

export default InviteFriendModal;
