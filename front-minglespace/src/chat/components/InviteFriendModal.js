import React, { useRef, useState } from "react";
import Repo from "../../auth/Repo";

const initCreateChatRoomRequest = {
  name: "",
  workspaceId: 0,
  participantIds: [],
};

const InviteFriendModal = ({
  isOpen,
  onClose,
  inviteUsers,
  participants,
  onInvite,
  onKick,
}) => {
  const [newChatRoomData, setNewChatRoomData] = useState(
    initCreateChatRoomRequest
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); //선택된 사용자
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  //폼에서 채팅방 이름을 변경하는 함수
  const handleInputChange = (e) => {
    setNewChatRoomData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

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

  // 이미지 변경 함수
  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null; // 파일이 있는지 확인
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // 선택된 파일을 미리보기로 사용
    }
  };

  return (
    <div className="invite_modal">
      {/* 친구 초대/ 강퇴 */}
      <h1> 채팅방 초대/강퇴하기</h1>
      <div className="invite-friends-list">
        <p>강퇴할 멤버를 선택하세요: </p>
        <ul>
          {participants
            .filter((member) => member.userId !== Number(Repo.getUserId()))
            .map((member) => (
              <li key={member.wsMemberId}>
                {member.email}
                {/* <button className="invite-btn" onClick={() => handleKick(member)}>강퇴</button> */}
                <button
                  className="close_btn"
                  onClick={() => handleKick(member)}
                >
                  강퇴
                </button>
              </li>
            ))}
        </ul>
        <p>초대할 멤버를 선택하세요 : </p>
        <ul>
          {/* invitableUsers가 정의되지 않았을 때 기본값을 빈 배열로 설정 */}
          {inviteUsers.length === 0 ? (
            <li>초대할 친구가 없습니다.</li>
          ) : (
            inviteUsers.map((member) => (
              <li key={member.wsMemberId}>
                {member.email}
                <button
                  className="close_btn"
                  onClick={() => handleInvite(member)}
                >
                  초대
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* <button className="create_btn" onClick={handleInvite}>
        확인
      </button> */}
      <button className="close_btn" onClick={onClose}>
        닫기
      </button>
    </div>
  );
};

export default InviteFriendModal;
