import React, { useEffect, useRef, useState } from "react";
import Repo from "../../auth/Repo";
import default_img from "../../asset/imgs/profile1.png";
import { HOST_URL } from "../../api/Api";
import { useChatRoom } from "../context/ChatRoomContext";

const initUpdateRoom = {
  name: "",
  image: null,
  isImageDelete: "false",
};

const InviteFriendModal = ({ onClose, participants, onUpdateChatRoom }) => {
  const {
    chatRoomInfo,
    isModalOpen,
    inviteMembers,
    handleInvite,
    handleKick,
    handleDelegate,
    showAlertMessage
  } = useChatRoom();
  const [updateRoom, setUpdateRoom] = useState(initUpdateRoom);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTab, setSelectedTab] = useState("info");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatRoomInfo) {
      setUpdateRoom((prev) => ({
        ...prev,
        name: chatRoomInfo.name,
      }));

      chatRoomInfo.imageUriPath
        ? setSelectedImage(`${HOST_URL}${chatRoomInfo.imageUriPath}`)
        : setSelectedImage(null);
    }
  }, [chatRoomInfo]);

  if (!isModalOpen) return null;

  //폼에서 채팅방 이름을 변경하는 함수
  const handleInputChange = (e) => {
    setUpdateRoom((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  // 이미지 변경 함수
  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null; // 파일이 있는지 확인
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setUpdateRoom((prev) => ({
        ...prev,
        image: file,
        isImageDelete: "true",
      }));
      // setIsImageDelete("true");
    }
  };

  const handleImageDelete = () => {
    setSelectedImage(null);
    setUpdateRoom((prev) => ({
      ...prev,
      image: null,
      isImageDelete: "true",
    }));

    // setIsImageDelete("true");
  };

  const handleSave = () => {
    if (updateRoom.name || selectedImage || updateRoom.isImageDelete) {
      onUpdateChatRoom({
        updateName: updateRoom.name,
        image: updateRoom.image,
        isImageDelete: updateRoom.isImageDelete,
      });
      showAlertMessage("채팅방 정보가 업데이트되었습니다.");
      onClose();
    } else {
      alert("채팅방 이름과 이미지를 모두 입력해주세요.");
    }
  };

  const handleInviteModal = async (addMember) => {
    if (addMember) {
      await handleInvite(addMember);
      showAlertMessage(`${addMember.name}님이 초대되었습니다.`);
      onClose();
    } else {
      alert("초대할 멤버를 선택해주세요.");
    }
  };

  const handleKickModal = async (kickMember) => {
    if (kickMember) {
      await handleKick(kickMember);
      showAlertMessage(`${kickMember.name}님이 강퇴되었습니다.`);
      onClose();
    } else {
      alert("강퇴할 멤버를 선택해주세요.");
    }
  };

  const handleDelegateModal = async (newLeader) => {
    if (newLeader) {
      await handleDelegate(newLeader);
      showAlertMessage(`${newLeader.name}님이 방장으로 위임되셨습니다.`);
      onClose();
    } else {
      alert("위임할 멤버를 선택해주세요.");
    }
  };

  return (
    <div className="invite_modal_wrapper">
      <div className="invite_modal_content">
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
            초대/강퇴/위임
          </button>
        </div>

        {/* 채팅방 정보 수정 섹션 */}
        {selectedTab === "info" && (
          <div className="info_section">
            <div className="modal_img">
              <img
                className="chat_update_Img"
                src={selectedImage ? `${selectedImage}` : default_img}
                alt="채팅방 이미지"
              />
            </div>

            <button
              className="select_img_btn"
              onClick={() => fileInputRef.current.click()} // 버튼 클릭 시 파일 선택창 열기
            >
              변경
            </button>
            <button
              className="delete_img_btn"
              onClick={handleImageDelete} // 버튼 클릭 시 파일 선택창 열기
            >
              삭제
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
              value={updateRoom.name}
              onChange={handleInputChange}
              placeholder="채팅방 이름을 입력해주세요"
            />
          </div>
        )}

        {/* 초대/강퇴 섹션 */}
        {selectedTab === "invite" && (
          <div className="invite_section">
            <div className="invite-friends-list">
              <p>강퇴할 멤버를 선택하세요:</p>
              <ul>
                {participants.filter(
                  (member) => member.userId !== Number(Repo.getUserId())
                ).length === 0 ? (
                  <li>강퇴할 멤버가 없습니다.</li>
                ) : (
                  participants
                    .filter(
                      (member) => member.userId !== Number(Repo.getUserId())
                    )
                    .map((member) => (
                      <li key={member.wsMemberId}>
                        {member.email}
                        <button
                          className="invite-btn kick"
                          onClick={() => handleKickModal(member)}
                        >
                          강퇴
                        </button>
                      </li>
                    ))
                )}
              </ul>

              <p>초대할 멤버를 선택하세요:</p>
              <ul>
                {inviteMembers.length === 0 ? (
                  <li>초대할 멤버가 없습니다.</li>
                ) : (
                  inviteMembers.map((member) => (
                    <li key={member.wsMemberId}>
                      {member.email}
                      <button
                        className="invite-btn"
                        onClick={() => handleInviteModal(member)}
                      >
                        초대
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <p>위임할 멤버를 선택하세요:</p>
              <ul>
                {participants.filter(
                  (member) => member.userId !== Number(Repo.getUserId())
                ).length === 0 ? (
                  <li>위임할 멤버가 없습니다.</li>
                ) : (
                  participants
                    .filter(
                      (member) => member.userId !== Number(Repo.getUserId())
                    )
                    .map((member) => (
                      <li key={member.wsMemberId}>
                        {member.email}
                        <button
                          className="invite-btn delegate"
                          onClick={() => handleDelegateModal(member)}
                        >
                          위임
                        </button>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>
        )}
        <button className="create_btn" onClick={handleSave}>
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
