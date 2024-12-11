import React, { useState } from "react";
import ChatListItem from "./ChatListItem";
import CreateChatRoomModal from "./CreateChatRoomModal";
import { IoLogoWechat } from "react-icons/io5";

const ChatList = ({
  isFold,
  rooms,
  onCreateRoom,
  onReadMsg,
  wsMembers,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false); //모달 열림/닫힘 상태

  console.log("wsmembers:", wsMembers);
  //모달을 여는 함수
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달을 닫는 함수
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className={`chat_list_container ${isFold ? "collapsed" : ""}`}>
        {!isFold && <h1>채팅방 목록</h1>}
        {/* isFold 상태가 false일 때만 '채팅방 목록'을 보여줌 */}
        {rooms && rooms.length === 0 ? (
          <div className="no-chatroom-selected">
            <IoLogoWechat />
            <p>채팅방이 없습니다. </p>
            <p>채팅방을 생성해주세요.</p>
          </div>
        ) : (
          rooms.map((room) => (
            <ChatListItem
              key={room.chatRoomId}
              chat={room}
              onReadMsg={onReadMsg}
            />
          ))
        )}
        {/* 이슈)생성 버튼 위치 조정 필요 -> 스크롤하면 같이 올라감 + 스크롤이 토글 침범*/}
        <button className="create_button" onClick={openModal}>
          +
        </button>
        {/* 모달을 isModalOpen 상태에 따라 보여줌 */}
        <CreateChatRoomModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCreate={onCreateRoom}
          wsMembers={wsMembers}
        />
      </div>
    </div>
  );
};

export default ChatList;
