import React, { useEffect, useState, useRef } from "react";
import ChatListItem from "./ChatListItem";
import CreateChatRoomModal from "./CreateChatRoomModal";
import { FiChevronsLeft } from "react-icons/fi";

// 더미 데이터
const dummyRooms = [
  {
    id: 1,
    name: "채팅방 1",
    members: ["member1", "member2"],
    messages: [{ text: "안녕하세요", sender: "member1" }],
    unreadCount: 2,
    img: "/src/asset/imgs/profile1.png",
  },
  {
    id: 2,
    name: "채팅방 2",
    members: ["member2", "member3"],
    messages: [{ text: "반갑습니다!", sender: "member3" }],
    unreadCount: 4,
    img: "/src/asset/imgs/profile1.png",
  },
  {
    id: 3,
    name: "채팅방 3",
    members: ["member3", "member4, member5"],
    messages: [{ text: "집에 가자!", sender: "member4" }],
    unreadCount: 5,
    img: "/src/asset/imgs/profile1.png",
  },
];

const ChatList = ({ me }) => {
  // console.log(pb);
  const [rooms, setRooms] = useState([dummyRooms]); // 채팅방 상태
  const [error, setError] = useState(null); //오류 상태
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

  // 새로운 채팅방 추가 함수
  const handleCreateRoom = (newRoom) => {
    setRooms((prevRooms) => [
      ...prevRooms,
      { ...newRoom, id: prevRooms.length + 1 },
    ]);
  };

  // 채팅방 목록이 변경될 때마다 자동 스크롤
  useEffect(() => {
    if (chatListRef.current) {
      // 스크롤을 맨 아래로 이동
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [rooms]); // rooms 배열이 변경될 때마다 실행

  useEffect(() => {
    const fetchChatRooms = async () => {
      setRooms(dummyRooms);

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
    };

    fetchChatRooms();
  }, []);

  return (
    <div>
      <div className="chat_list_container">
        <h1>채팅방 목록 </h1>
        <button className="chat_toggle">
          <FiChevronsLeft />
        </button>
        {rooms.length === 0 ? (
          <p>채팅방이 없습니다. </p>
        ) : (
          rooms.map((room) => (
            <ChatListItem key={room.id} chat={room} me={me} />
          ))
        )}
        <button className="create_button" onClick={openModal}>
          +
        </button>

        {/* 모달을 isModalOpen 상태에 따라 보여줌  */}
        <CreateChatRoomModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCreate={handleCreateRoom}
        />
      </div>
    </div>
  );
};

export default ChatList;
