import React, { useEffect, useRef, useState } from "react";
import { FiChevronsLeft } from "react-icons/fi";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import { useLocation } from "react-router-dom";
import { IoLogoWechat } from "react-icons/io5";
import { useChatApp } from "../context/ChatAppContext";

// const initRooms = [{
//   chatRoomId: 0,
//   name: "",
//   imageUriPath: "",
//   participantCount: 0,
//   lastMessage: "",
//   date: "",
//   notReadMsgCount: 0
// }];

// const initMembers = [
//   {
//     wsMemberId: 0,
//     userId: 0,
//     email: "",
//     name: "",
//     imageUriPath: "",
//     position: "",
//   },
// ];

const ChatApp = () => {
  const {roomsState, validChatRoomId, setValidChatRoomId} =useChatApp();

  const [isFold, setFold] = useState(false); // 채팅방 목록을 접고 펼치는 상태.
  const location = useLocation();
  // const chatListRef = useRef(null); // 채팅방 목록을 참조하기 위한 ref


  console.log("chatapp_리렌더");

  // useEffect(() => {
  //   if (chatListRef.current) {
  //     chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
  //   }
  // }, [roomsState]); 

  useEffect(() => {  
    const chatRoomId = new URLSearchParams(location.search).get("chatRoomId");
    console.log("쿼리 변화 감지 하고 있니, ", chatRoomId);
    setValidChatRoomId(chatRoomId);
  }, [location.search, location.pathname, setValidChatRoomId]);


  const toggleFold = () => {
    setFold((prevFold) => !prevFold);
  };

  return (
    <div className={`chat_app ${isFold ? "folded" : ""}`}>
      <button className="chat_toggle" onClick={toggleFold}>
        <FiChevronsLeft />
      </button>
      <ChatList
        isFold={isFold}
      />
      {validChatRoomId === null ? (
        <div className="no-chat-selected">
          <IoLogoWechat />
          <span>채팅방을 선택해주세요.</span>
        </div>
      ) : (
        <ChatRoom
          isFold={isFold}
        />
      )}
    </div>
  );
};

export default ChatApp;


  ////websocket 연결 <<옮겼지만 디테일 수정 필요
  // useEffect(() => {
  //   if (socketRef.current) {
  //     socketRef.current.deactivate();
  //     socketRef.current = null;
  //   }

  //   const socket = new SockJS(`${HOST_URL}/ws`);

  //   const stompClient = new Client({
  //     webSocketFactory: () => socket,
  //     connectHeaders: {
  //       Authorization: `Bearer ${Repo.getAccessToken()}`
  //     },
  //     onConnect: () => {
  //       console.log("chatapp _ websocket 연결 성공");

  //       stompClient.subscribe(`/topic/workspaces/${workspaceId}`, (msg) => {
  //         const newMsg = JSON.parse(msg.body);
  //         console.log("chatapp에 새 메시지 도착", newMsg);


  //         ////채팅방 미참여중이면 카운팅 올리기
  //         if (validChatRoomId == null || Number(validChatRoomId) !== Number(newMsg.chatRoomId)) {
  //           setRooms(prev =>
  //             prev.map(room =>
  //               room.chatRoomId === newMsg.chatRoomId
  //                 ? { ...room, notReadMsgCount: room.notReadMsgCount + 1, lastMessage: newMsg.content } : room
  //             )
  //           );
  //         } else {
  //           setRooms(prev =>
  //             prev.map(room =>
  //               room.chatRoomId === newMsg.chatRoomId
  //                 ? { ...room, lastMessage: newMsg.content } : room
  //             )
  //           );
  //         }

  //       });
  //     },
  //     onWebSocketError: (error) => {
  //       console.error(`채팅 목록 _ 웹소켓 연결 오류 : `, error);
  //     },
  //     reconnectDelay: 5000,  // 5초마다 자동 재연결 시도
  //     heartbeatIncoming: 4000,  // 서버에서 4초마다 ping
  //     heartbeatOutgoing: 4000,  // 클라이언트에서 4초마다 pong
  //     withCredentials: true,
  //   });

  //   stompClient.activate();
  //   socketRef.current = stompClient;

  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.deactivate();
  //       socketRef.current = null;
  //     }
  //   };


  // }, [workspaceId, validChatRoomId])


  // //마운트 시, 채팅방 목록 가져오기 <<옮기기
  // useEffect(() => {
  //   const fetchChatRooms = async () => {
  //     try {
  //       const roomsData = await ChatApi.getChatList(workspaceId);
  //       setRooms(roomsData);
  //     } catch (e) {
  //       // console.log("chatrooms: ", roomsData);
  //       // setError("채팅방 데이터를 가져오는 데 문제가 발생했습니다.");
  //     }
  //   };

  //   //워크스페이스 멤버 목록
  //   const fetchWsMembers = async () => {
  //     try {
  //       const wsmembersData = await ChatApi.getwsMembers(workspaceId);
  //       //현재 유저 제외한 목록 만들기
  //       setWsMembers(
  //         wsmembersData.filter(
  //           (member) => member.userId !== Number(Repo.getUserId())
  //         )
  //       );
  //       // console.log("wsmembersData: ", wsmembersData);
  //     } catch (e) {
  //       console.error("Error fetching ws members:", e);
  //       // setError("워크스페이스 멤버 목록을 가져오는 데 문제가 발생했습니다.");
  //     }
  //   };

  //   fetchChatRooms();
  //   fetchWsMembers();
  // }, [workspaceId]);



  // 새로운 채팅방 추가 함수<<<옮김
  // const handleCreateRoom = async (newRoomData, imageFile) => {
  //   try {
  //     const createdRoomData = await ChatApi.createChatRoom(
  //       workspaceId,
  //       newRoomData,
  //       imageFile
  //     );

  //     setRooms((prev) => [...prev, createdRoomData]);
  //   } catch (e) {
  //     // setError("채팅방을 생성하는 중 오류가 발생했습니다.");
  //     // alert(error);
  //     console.error(e);
  //   }
  // };

  //메시지 읽음 처리 <<옮김
  // const handleReadMsg = async (chatRoomId) => {
  //   // console.log("readMsg_chatRoomId:", typeof chatRoomId);
  //   try {
  //     await ChatApi.readMessage(workspaceId, chatRoomId);

  //     setRooms((prev) =>
  //       prev.map((room) =>
  //         room.chatRoomId === chatRoomId
  //           ? { ...room, notReadMsgCount: 0 }
  //           : room
  //       )
  //     );
  //   } catch (e) {
  //     // setError("메시지 읽음 처리 중 오류가 발생했습니다.");
  //     // alert(error);
  //     console.error(e);
  //   }
  // };

  //채팅방 멤버 조정시 참여자 카운트 개수 << 옮김
  // const updateRoomParticipantCount = (chatRoomId, change) => {
  //   // console.log("updateRoomParicipantCount: ", chatRoomId, "- ", change);
  //   setRooms((prevRooms) => {
  //     const updatedRooms = prevRooms.map((room) =>
  //       Number(room.chatRoomId) === Number(chatRoomId)
  //         ? {
  //           ...room,
  //           participantCount: Number(room.participantCount) + Number(change),
  //         }
  //         : room
  //     );
  //     return updatedRooms;
  //   });
  // };

  // 채팅방 나가기 시 방 제거 << 옮김
  // const removeRoom = (chatRoomId) => {
  //   setRooms((prevRooms) =>
  //     prevRooms.filter((room) => Number(room.chatRoomId) !== Number(chatRoomId))
  //   );
  // };