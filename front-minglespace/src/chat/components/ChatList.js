﻿import React, { useEffect, useState, useRef } from "react";
import ChatListItem from "./ChatListItem";
import CreateChatRoomModal from "./CreateChatRoomModal";
import { useParams } from "react-router-dom";
import Repo from "../../auth/Repo";
import ChatApi from "../../api/ChatApi";

const initRooms = [{
  chatRoomId: 0,
  name: "",
  imageUriPath: "",
  participantCount: 0,
  lastMessage: "",
  date: ""
}];

const initMembers = [{
  wsMemberId: 0,
  userId: 0,
  email: "",
  name: "",
  imageUriPath: "",
  position: "",
  chatRole: ""
}];

const ChatList = ( isFold, onCreateRoom) => {
  const [rooms, setRooms] = useState(initRooms); // 채팅방 정보
  const [wsmembers, setWsMembers] = useState(initMembers);
  const [error, setError] = useState(null); //오류 상태
  const [isModalOpen, setIsModalOpen] = useState(false); //모달 열림/닫힘 상태
  const chatListRef = useRef(null); // 채팅방 목록을 참조하기 위한 ref

  const { workspaceId } = useParams(); //url에서 워크스페이스 아이디 가져오기

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

  //마운트 시, 채팅방 목록 가져오기
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const roomsData = await ChatApi.getChatList(workspaceId);
        setRooms(roomsData);
        console.log("chatrooms: ", roomsData);
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
        setError("채팅방 데이터를 가져오는 데 문제가 발생했습니다.");
      }
    };

    //워크스페이스 멤버 목록
    const fetchWsMembers = async () => {
      try {
        const wsmembers = await ChatApi.getwsMembers(workspaceId);
        //현재 유저 제외한 목록 만들기
        setWsMembers(wsmembers.filter((member) => member.userId !== Number(Repo.getUserId())));
        console.log("wsmembers: ", wsmembers);
      } catch (error) {
        console.error("Error fetching ws members:", error);
        setError("워크스페이스 멤버 목록을 가져오는 데 문제가 발생했습니다.");
      }
    }

    fetchChatRooms();
    fetchWsMembers();
  }, [workspaceId]);


  // 새로운 채팅방 추가 함수
  const handleCreateRoom = async (newRoomData, imageFile) => {
    try {
      const createdRoomData = await ChatApi.createChatRoom(workspaceId, newRoomData, imageFile);

      setRooms((prev) => [...prev, createdRoomData]);
    } catch (error) {
      setError("채팅방을 생성하는 중 오류가 발생했습니다.");
      console.error(error);
    }
  };



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
        {rooms.length === 0 ? (
          <p>채팅방이 없습니다. </p>
        ) : (
          rooms.map((room) => (
            <ChatListItem key={room.chatRoomId} chat={room} />
          ))
        )}
        <button className="create_button" onClick={openModal}>
          +
        </button>
        {/* 모달을 isModalOpen 상태에 따라 보여줌 */}
        <CreateChatRoomModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCreate={handleCreateRoom}
          wsMembers={wsmembers}
        />
      </div>
    </div>
  );
};

export default ChatList;
