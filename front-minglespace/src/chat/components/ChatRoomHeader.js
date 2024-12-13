import { useState } from "react";
import ChatRoomModal from "./ChatRoomModal";
import { FcExport } from "react-icons/fc";
import { PiUserCirclePlusFill } from "react-icons/pi";
// import e from "cors";

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

  // 헤더 클릭 핸들러
  const handleHeaderClick = (e) => {
    // 아이콘 외의 부분을 클릭했을 때 모달이 열리지 않도록
    if (
      !e.target.closest(".chatroom-invite-btn") &&
      !e.target.closest(".chatroom-exit-btn")
    ) {
      e.stopPropagation(); // 모달이 열리지 않게 하기 위해 이벤트 전파를 막음
    }
  };

  return (
    <div className="chatroom-header" onClick={handleHeaderClick}>
      {isRoomOwner && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openModal("invite");
          }}
          className="chatroom-invite-btn"
        >
          <PiUserCirclePlusFill className="icon" />
        </button>
      )}
      <ChatRoomModal
        modalType={modalType}
        isOpen={isModalOpen}
        onClose={closeModal}
        roomMembers={chatRoomInfo.participants}
        isRoomOwner={isRoomOwner}
        inviteUsers={inviteMembers}
        onInvite={handleInvite}
        onDelegate={handleDelegate}
        onExit={handleExit}
        onKick={handleKick}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          openModal("exit");
        }}
        className="chatroom-exit-btn"
      >
        <FcExport className="icon" />
      </button>
    </div>
  );
};

export default ChatRoomHeader;
