import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronsLeft } from "react-icons/fi";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import { useLocation, useParams } from "react-router-dom";
import ChatApi from "../../api/chatApi";
import Repo from "../../auth/Repo";
import SockJS from "sockjs-client";
import { HOST_URL } from "../../api/Api";
import { Client } from "@stomp/stompjs";
import { createWebSocketClient, disconnectWebsocket, getStompClient, subToMsgByWsId, unsubFromMsgByWsId } from "../../api/websocket";
import { useWebSocket } from "../context/WebSocketContext";

const initRooms = [{
  chatRoomId: 0,
  name: "",
  imageUriPath: "",
  participantCount: 0,
  lastMessage: "",
  date: "",
  notReadMsgCount: 0
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
  const chatRoomId = new URLSearchParams(useLocation().search).get("chatRoomId");
  const validChatRoomId = chatRoomId ? chatRoomId : null;
  const socketRef = useRef(null);

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



  const handleNewMessage = (newMsg) => {
    console.log("chatapp_ newmsg: ", newMsg);
    if (validChatRoomId == null || Number(validChatRoomId) !== Number(newMsg.chatRoomId)) {
      setRooms(prev =>
        prev.map(room =>
          room.chatRoomId === newMsg.chatRoomId
            ? { ...room, notReadMsgCount: room.notReadMsgCount + 1, lastMessage: newMsg.content } : room
        )
      );
    } else {
      setRooms(prev =>
        prev.map(room =>
          room.chatRoomId === newMsg.chatRoomId
            ? { ...room, lastMessage: newMsg.content } : room
        )
      );
    }
  };

  const { isConnected, stompClientRef } = useWebSocket([
    { path: `topic/workspaces/${workspaceId}`, messageHandler: handleNewMessage }
  ]);

  ////websocket 연결
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

  // const initWebsocket = async () => {
  //   if (!socketRef.current) {
  //     socketRef.current = createWebSocketClient();

  //     // 활성화된 후 구독 처리
  //     await new Promise((resolve) => {
  //       socketRef.current.onConnect = resolve;  // WebSocket 연결되면 resolve
  //     });
  //     console.log("WebSocket Connected, Now Subscribing...");
  //     subToMsgByWsId(workspaceId, socketRef.current, handleNewMessage);
  //   }
  // };

  // initWebsocket();

  // return () => {
  //   // unsubFromMsgByWsId(workspaceId, socketRef.current);
  //   disconnectWebsocket(socketRef.current);
  // };
  // }, [workspaceId, handleNewMessage])
  // }, [workspaceId, validChatRoomId])



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
    try {
      await ChatApi.readMessage(workspaceId, chatRoomId);

      setRooms((prev) =>
        prev.map((room) => room.chatRoomId === chatRoomId ? { ...room, notReadMsgCount: 0 } : room));

    } catch (e) {
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
        onReadMsg={handleReadMsg}
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
