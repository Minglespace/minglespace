import React, { useState } from "react";
import Repo from "../../auth/Repo";

const InviteFriendModal = ({ isOpen, onClose, inviteUsers, participants, onInvite, onKick }) => {
  const [selectedUser, setSelectedUser] = useState(null); //선택된 사용자
  if (!isOpen) return null;

  const handleInvite = async (addMember) => {
    if (addMember) {
      await onInvite(addMember);
      alert(`${addMember.name}님이 초대되었습니다.`);
      onClose();
    } else {
      alert("초대할 멤버를 선택해주세요.");
    }
  };

  const handleKick = async (kickMember) => {
    if (kickMember) {
      await onKick(kickMember);
      alert(`${kickMember.name}님이 강퇴되었습니다.`);
      onClose();
    } else {
      alert("초대할 멤버를 선택해주세요.");
    }
  };

  return (
<<<<<<< HEAD
    <div className="invite_modal">
      <h1> 채팅방 멤버 초대하기</h1>
      <p>초대할 멤버를 선택하세요 : </p>
      <ul>
        {/* invitableUsers가 정의되지 않았을 때 기본값을 빈 배열로 설정 */}
        {inviteUsers.length === 0 ? (
          <li>초대할 친구가 없습니다.</li>
        ) : (
          inviteUsers.map((member) => (
            <li key={member.wsMemberId}>
              {member.email}
              <button onClick={() => handleInvite(member)}>초대</button>
            </li>
          ))
        )}
        {participants
          .filter((member) => member.userId !== Number(Repo.getUserId()))
          .map((member) => (
            <li key={member.wsMemberId}>
              {member.email}
              <button onClick={() => handleKick(member)}>강퇴</button>
            </li>
          ))
        }
      </ul>
      {/* <button onClick={handleInvite}>확인 </button> */}
      <button onClick={onClose}>닫기</button>
=======
    <div className="invite-modal">
      <h1> 채팅방 멤버 초대하기</h1>
      <div className="friends-list">
        <p>초대할 멤버를 선택하세요 : </p>
        <ul>
          {/* invitableUsers가 정의되지 않았을 때 기본값을 빈 배열로 설정 */}
          {inviteUsers.length === 0 ? (
            <li>초대할 친구가 없습니다.</li>
          ) : (
            inviteUsers.map((member) => (
              <li key={member.id}>
                {member.name}
                <button
                  className="invite-btn"
                  onClick={() => handleUserSelect(member)}
                >
                  초대
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      <button className="create_btn" onClick={handleInvite}>
        확인{" "}
      </button>
      <button className="close_btn" onClick={onClose}>
        닫기
      </button>
>>>>>>> feature/채팅_입력창_UI
    </div>
  );
};

export default InviteFriendModal;
