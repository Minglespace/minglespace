import React, { useRef, useState } from "react";
import Repo from "../../auth/Repo";
import default_img from "../../asset/imgs/profile1.png";

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
  onUpdateChatRoom,
}) => {
  const [newChatRoomData, setNewChatRoomData] = useState(
    initCreateChatRoomRequest
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); //선택된 사용자
  const [selectedTab, setSelectedTab] = useState("info");
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
      setSelectedImage(URL.createObjectURL(file));
      setNewChatRoomData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  // 채팅방 정보 저장 및 업데이트
  const handleSave = (e) => {
    // onUpdateChatRoom으로 부모에게 변경된 채팅방 정보를 전달
    if (newChatRoomData.name && newChatRoomData.image) {
      onUpdateChatRoom(newChatRoomData); // 부모로 변경된 정보를 전달
      alert("채팅방 정보가 업데이트되었습니다.");
      onClose();
    } else {
      alert("채팅방 이름과 이미지를 모두 입력해주세요.");
    }
  };

  return (
    <div className="modal_wrapper">
      <div className="modal_content">
        <h1>채팅방 관리</h1>

        {/* 탭 선택 */}
        <div className="tabs">
          <button
            className={selectedTab === "info" ? "active" : ""}
            onClick={() => setSelectedTab("info")}
          >
            채팅방정보
          </button>
          <button
            className={selectedTab === "invite" ? "active" : ""}
            onClick={() => setSelectedTab("invite")}
          >
            초대/강퇴
          </button>
        </div>

        {/* 채팅방 정보 수정 섹션 */}
        {selectedTab === "info" && (
          <div className="info_section">
            <div className="modal_img">
              <img
                className="chat_create_Img"
                src={selectedImage || default_img}
                alt="채팅방 이미지"
              />
            </div>

            <button
              className="select_img_btn"
              onClick={() => fileInputRef.current.click()} // 버튼 클릭 시 파일 선택창 열기
            >
              변경
            </button>

            <input
              className="hidden-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <input
              className="chatroom_name"
              type="text"
              value={newChatRoomData.name}
              onChange={handleInputChange}
              placeholder="채팅방 이름을 입력해주세요"
            />
          </div>
        )}

        {/* 초대/강퇴 섹션 */}
        {selectedTab === "invite" && (
          <div className="invite_section">
            <h2>채팅방 초대/강퇴하기</h2>
            <div className="invite-friends-list">
              <p>강퇴할 멤버를 선택하세요:</p>
              <ul>
                {participants
                  .filter(
                    (member) => member.userId !== Number(Repo.getUserId())
                  )
                  .map((member) => (
                    <li key={member.wsMemberId}>
                      {member.email}
                      <button
                        className="invite-btn"
                        onClick={() => handleKick(member)}
                      >
                        강퇴
                      </button>
                    </li>
                  ))}
              </ul>

              <p>초대할 멤버를 선택하세요:</p>
              <ul>
                {inviteUsers.length === 0 ? (
                  <li>초대할 멤버가 없습니다.</li>
                ) : (
                  inviteUsers.map((member) => (
                    <li key={member.wsMemberId}>
                      {member.email}
                      <button
                        className="invite-btn"
                        onClick={() => handleInvite(member)}
                      >
                        초대
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
        <button className="close_btn" onClick={handleSave}>
          확인
        </button>
        {/* 모달 닫기 버튼 */}
        <button className="close_btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default InviteFriendModal;
