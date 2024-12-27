import React from "react";
import { useChatRoom } from "../context/ChatRoomContext";

const ExitModal = ({ onClose }) => {
  const { isModalOpen, isRoomOwner, handleExit } = useChatRoom();
  if (!isModalOpen) return null;

  const handleExitModal = () => {
    // console.log("나가기 버튼 클릭 ");
    // console.log("isRoomOwner: ", isRoomOwner);
    if (isRoomOwner) {
      onClose("transfer");
    } else {
      handleExit();
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="exit_modal">
      <h1>정말로 나가시겠습니까? </h1>
      <button className="create_btn" onClick={handleExitModal}>
        {isRoomOwner ? "방장 위임 후 나가기" : "나가기"}
      </button>

      <button className="close_btn" onClick={handleClose}>
        닫기{" "}
      </button>
    </div>
  );
};

export default ExitModal;
