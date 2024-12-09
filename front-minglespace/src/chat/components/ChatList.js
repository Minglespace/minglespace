import React, { useState } from "react";
import ChatListItem from "./ChatListItem";
import CreateChatRoomModal from "./CreateChatRoomModal";

const ChatList = ({ isFold, rooms, onCreateRoom, onReadMsg, wsmembers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); //모달 열림/닫힘 상태

  //모달을 여는 함수
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달을 닫는 함수
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div >
      <div className={`chat_list_container ${isFold ? "collapsed" : ""}`}>
        {!isFold && <h1>채팅방 목록</h1>}
        {/* isFold 상태가 false일 때만 '채팅방 목록'을 보여줌 */}
        {rooms.length === 0 ? (
          <p>채팅방이 없습니다. </p>
        ) : (
          rooms.map((room) => (
            <ChatListItem key={room.chatRoomId} chat={room} onReadMsg={onReadMsg} />
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
          wsMembers={wsmembers}
        />
      </div>
    </div>
  );
};

export default ChatList;
