import { useState } from "react";
import ChatRoomModal from "./ChatRoomModal";
import { FcExport } from "react-icons/fc";
import { PiUserCirclePlusFill } from "react-icons/pi";
import Repo from "../../auth/Repo";

const ChatRoomHeader = ({chatRoomInfo, inviteMembers}) => {
  const [isModalOpen, setIsModelOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isRoomOwner, setIsRoomOwner] = useState();

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
      {/* <PiUserCirclePlusFill className="chatroom_plus" />
      <FcExport className="chatroom_export" /> */}

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
        roomMembers={chatRoomInfo.participants}
        isRoomOwner={isRoomOwner}
        inviteUsers={inviteMembers} //초대할 사용자 목록
        onInvite={handleInvite} //초대 함수
        onTransfer={handleTransfer}
      />
    </div>
  );
};

export default ChatRoomHeader;
