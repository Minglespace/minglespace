import { useState } from "react";
import ChatRoomModal from "./ChatRoomModal";
import { FcExport } from "react-icons/fc";
import { PiUserCirclePlusFill } from "react-icons/pi";

const ChatRoomHeader = ({
  chatRoomInfo,
  inviteMembers,
  isRoomOwner,
  isModalOpen,
  setIsModalOpen,
  handleInvite,
  handleKick,
  handleDelegate,
  handleExit,
}) => {
  const [modalType, setModalType] = useState("");

  const openModal = (type) => {
    // console.log(`opening modal: ${type}`);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = (newModalType) => {
    if (newModalType) {
      setModalType(newModalType);
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="chatroom-header">
      <button
        onClick={() => openModal("invite")}
        className="chatroom-invite-btn"
      >
        <PiUserCirclePlusFill className="icon" />
      </button>

      {isRoomOwner && (
        <button
          onClick={() => openModal("invite")}
          className="chatroom-invite-btn"
        >
          <PiUserCirclePlusFill className="icon" />
        </button>
      )}
      <button onClick={() => openModal("exit")} className="chatroom-exit-btn">
        <FcExport className="icon" />
      </button>

      <ChatRoomModal
        modalType={modalType}
        isOpen={isModalOpen}
        onClose={closeModal}
        roomMembers={chatRoomInfo.participants}
        isRoomOwner={isRoomOwner}
        inviteUsers={inviteMembers} //초대할 사용자 목록
        onInvite={handleInvite} //초대 함수
        onDelegate={handleDelegate}
        onExit={handleExit}
        onKick={handleKick}
      />
    </div>
  );
};

export default ChatRoomHeader;
