import React, { useEffect, useState, useRef } from "react";
import ChatListItem from "./ChatListItem";
import CreateChatRoomModal from "./CreateChatRoomModal";

const ChatList = ({ isFold, rooms = [], onCreateRoom }) => {
  const [error, setError] = useState(null); // 오류 상태
  const [isModalOpen, setIsModalOpen] = useState(false); //모달 열림/닫힘 상태
  const chatListRef = useRef(null); // 채팅방 목록을 참조하기 위한 ref

  //모달을 여는 함수
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달을 닫는 함수
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 채팅방 목록이 변경될 때마다 자동 스크롤
  useEffect(() => {
    if (chatListRef.current) {
      // 스크롤을 맨 아래로 이동
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [rooms]); // rooms 배열이 변경될 때마다 실행

  // useEffect(() => {
  //   const fetchChatRooms = async () => {
  //     setRooms(dummyRooms);

  // try {
  //   if (!pb) {
  //     console.error("pb 객체가 없다 ");
  //     setError("채팅 데이터를 가져올 수 없습니다.");
  //     setRooms(dummyRooms); // 더미 데이터 설정
  //     return;
  //   }
  //   const roomsData = await pb.collection("chats").getFullList();
  //   setRooms(roomsData);
  // } catch (error) {
  //   console.error("Error fetching chat rooms: ", error);
  //   setError("채팅방 데이터를 가져오는 데 문제가 발생했습니다.");
  //   setRooms(dummyRooms);
  // }
  //  };

  //   fetchChatRooms();
  // }, []);

  return (
    <div>
      <div className={`chat_list_container ${isFold ? "collapsed" : ""}`}>
        {!isFold && <h1>채팅방 목록</h1>}
        {/* isFold 상태가 false일 때만 '채팅방 목록'을 보여줌 */}
        {rooms.length === 0 ? (
          <p>채팅방이 없습니다. </p>
        ) : (
          rooms.map((room) => <ChatListItem key={room.id} chat={room} />)
        )}
        <button className="create_button" onClick={openModal}>
          +
        </button>
        {/* 모달을 isModalOpen 상태에 따라 보여줌 */}
        <CreateChatRoomModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCreate={(newRoom) => onCreateRoom(newRoom)}
        />
      </div>
    </div>
  );
};

export default ChatList;
