import { useState } from "react";
import ChatRoomModal from "./ChatRoomModal";
import { FcExport } from "react-icons/fc";
import { PiUserCirclePlusFill } from "react-icons/pi";

const ChatRoomHeader = () => {
  const [isModalOpen, setIsModelOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isRoomOwner, setIsRoomOwner] = useState(true);
  const members = [
    { id: 1, name: "친구1" },
    { id: 2, name: "친구2" },
    { id: 3, name: "친구3" },
  ];

  const dummyUsers = [
    { id: 1, name: "사용자1" },
    { id: 2, name: "사용자2" },
    { id: 3, name: "사용자3" },
  ];

  const openModal = (type) => {
    console.log(`opening modal: ${type}`);
    setModalType(type);
    setIsModelOpen(true);
  };

  const closeModal = (newModalType) => {
    if (newModalType) {
      setModalType(newModalType);
    } else {
      setIsModelOpen(false);
    }
  };

  const handleTransfer = (newOwner) => {
    // 새로운 방장으로 변경하는 로직
    console.log("새 방장:", newOwner.name);
    setIsRoomOwner(false); // 방장이 아니라면 false로 설정
  };

  const handleInvite = (newUser) => {
    console.log("초대된 사용자:", newUser.name); // 초대 완료 메시지
  };

  return (
    <div className="chatroom_header">
      <button onClick={() => openModal("exit")} className="exit-btn">
        <FcExport className="icon" />
      </button>

      <button onClick={() => openModal("invite")} className="invite-btn">
        <PiUserCirclePlusFill className="icon" />
      </button>

      <ChatRoomModal
        modalType={modalType}
        isOpen={isModalOpen}
        onClose={closeModal}
        friends={members}
        isRoomOwner={isRoomOwner}
        inviteUsers={dummyUsers} //초대할 사용자 목록
        onInvite={handleInvite} //초대 함수
        onTransfer={handleTransfer}
      />
    </div>
  );
};

export default ChatRoomHeader;
