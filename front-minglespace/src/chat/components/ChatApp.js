import React, { useEffect, useRef, useState } from "react";
import { FiChevronsLeft } from "react-icons/fi";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import { useParams } from "react-router-dom";
import ChatApi from "../../api/chatApi";
import Repo from "../../auth/Repo";

const initRooms = [{
  chatRoomId: 0,
  name: "",
  imageUriPath: "",
  participantCount: 0,
  lastMessage: "",
  date: "",
  notReadMsgCount:0
}];

const initMembers = [{
  wsMemberId: 0,
  userId: 0,
  email: "",
  name: "",
  imageUriPath: "",
  position: "",
}];

const ChatApp = () => {
  const [isFold, setFold] = useState(false); // 채팅방 목록을 접고 펼치는 상태.
  const [rooms, setRooms] = useState(initRooms); // 채팅방 정보
  const [wsmembers, setWsMembers] = useState(initMembers);
  const chatListRef = useRef(null); // 채팅방 목록을 참조하기 위한 ref
  const [error, setError] = useState(null); //오류 상태

  const { workspaceId } = useParams();

  // 채팅방 목록이 변경될 때마다 자동 스크롤
  useEffect(() => {
    if (chatListRef.current) {
      // 스크롤을 맨 아래로 이동
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
    console.log("updated_chatrooms: ", rooms);
  }, [rooms]); // rooms 배열이 변경될 때마다 실행

  //마운트 시, 채팅방 목록 가져오기
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const roomsData = await ChatApi.getChatList(workspaceId);
        setRooms(roomsData);
        // console.log("chatrooms: ", roomsData);
      } catch (e) {
        console.error("Error fetching chat rooms:", e);
        setError("채팅방 데이터를 가져오는 데 문제가 발생했습니다.");
      }
    };

    //워크스페이스 멤버 목록
    const fetchWsMembers = async () => {
      try {
        const wsmembersData = await ChatApi.getwsMembers(workspaceId);
        //현재 유저 제외한 목록 만들기
        setWsMembers(wsmembersData.filter((member) => member.userId !== Number(Repo.getUserId())));
        // console.log("wsmembersData: ", wsmembersData);

      } catch (e) {
        console.error("Error fetching ws members:", e);
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
    } catch (e) {
      setError("채팅방을 생성하는 중 오류가 발생했습니다.");
      alert(error);
      console.error(e);
    }
  };

  //메시지 읽음 처리
  const handleReadMsg = async (chatRoomId) => {
    // console.log("readMsg_chatRoomId:", typeof chatRoomId);
    try{
      await ChatApi.readMessage(workspaceId, chatRoomId);

      setRooms((prev) => 
        prev.map((room) => room.chatRoomId === chatRoomId ? {...room, notReadMsgCount:0} : room));

    }catch(e){
      setError("메시지 읽음 처리 중 오류가 발생했습니다.");
      alert(error);
      console.error(e);
    }
  }

  //채팅방 멤버 조정시 참여자 카운트 개수
  const updateRoomParticipantCount = (chatRoomId, change) => {
    // console.log("updateRoomParicipantCount: ", chatRoomId, "- ", change);
    setRooms((prevRooms) => {
      const updatedRooms = prevRooms.map((room) =>
        Number(room.chatRoomId) === Number(chatRoomId)
          ? { ...room, participantCount: Number(room.participantCount) + Number(change) }
          : room
      );
      return updatedRooms;
    });
  };

  // 채팅방 나가기 시 방 제거
  const removeRoom = (chatRoomId) => {
    setRooms((prevRooms) => prevRooms.filter(room => Number(room.chatRoomId) !== Number(chatRoomId)));
  };


  // 채팅방 목록을 접고 펼치는 함수
  const toggleFold = () => {
    setFold((prevFold) => !prevFold);
  };


  return (
    <div className={`chat_app ${isFold ? "folded" : ""}`}>
      {/* 채팅방 목록을 접고 펼치는 버튼 */}
      <button className="chat_toggle" onClick={toggleFold}>
        <FiChevronsLeft />
      </button>
      {/* ChatList 컴포넌트에 isFold 상태와 rooms 데이터를 전달 */}
      <ChatList
        isFold={isFold}
        rooms={rooms}
        onCreateRoom={handleCreateRoom}
        onReadMsg = {handleReadMsg}
        wsmembers={wsmembers} />

      <ChatRoom
        isFold={isFold}
        wsMembers={wsmembers}
        workSpaceId={workspaceId}
        updateRoomParticipantCount={updateRoomParticipantCount}
        removeRoom={removeRoom}
      />
    </div>
  );
};

export default ChatApp;
