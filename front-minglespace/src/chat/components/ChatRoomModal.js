import React from "react";
import ExitModal from "./ExitModal";
import InviteFriendModal from "./InviteFriendModal";
import DelegateModal from "./DelegateModal";

const ChatRoomModal = ({
  modalType,
  isOpen,
  onClose,
  roomMembers,
  isRoomOwner,
  inviteUsers,
  onInvite,
  onDelegate,
  onKick,
  onExit,
  onUpdateChatRoom,
}) => {
  if (!isOpen) return null;

  // console.log(`Rendering modal: ${modalType}`);
  // console.log("ChatRoomModal_isRoomOwner: ", isRoomOwner);
  // console.log("InviteFriendModal_ props:", inviteUsers);

  const handleUpdateChatRoom = (updatedData) => {
    // 여기서 updatedData는 채팅방 정보를 업데이트하는 함수
    if (onUpdateChatRoom) {
      onUpdateChatRoom(updatedData); // 부모에게 전달된 onUpdateChatRoom 함수 호출
    } else {
      console.error("onUpdateChatRoom is not defined");
    }
  };

  const renderModal = () => {
    switch (modalType) {
      case "exit":
        return (
          <ExitModal
            isOpen={isOpen}
            onClose={onClose}
            isRoomOwner={isRoomOwner}
            onExit={onExit}
          />
        );
      case "invite":
        console.log("InviteFriendModal props:", inviteUsers);
        return (
          <InviteFriendModal
            isOpen={isOpen}
            onClose={onClose}
            inviteUsers={inviteUsers}
            participants={roomMembers}
            onInvite={onInvite}
            onKick={onKick}
            onUpdateChatRoom={handleUpdateChatRoom}
          />
        );
      case "transfer":
        console.log("delegateModal 렌더링");
        return (
          <DelegateModal
            isOpen={isOpen}
            onClose={onClose}
            participants={roomMembers}
            onDelegate={onDelegate}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="chatroom-modal-wrapper" onClick={onClose}>
      <div
        className="chatroom-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModal()}
      </div>
    </div>
  );
};

export default ChatRoomModal;
