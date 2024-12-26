import React, { useEffect, useRef, useState } from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatApi from "../../api/chatApi";
import { useLocation, useNavigate } from "react-router-dom";
import Repo from "../../auth/Repo";
import SockJS from "sockjs-client";
import { HOST_URL } from "../../api/Api";
import { Client } from "@stomp/stompjs";
import { useChatApp } from "../context/ChatAppContext";
import { useChatRoom } from "../context/ChatRoomContext";


const ChatRoom = ({
  isFold
}) => {
  const { handleUpdateChatRoomInfo, wsMemberState, workspaceId } = useChatApp();
  const { chatRoomInfo, setChatRoomInfo, fetchRoomInfo, setIsModalOpen } = useChatRoom();

  const [replyToMessage, setReplyToMessage] = useState(null); //답글을 달 메시지 상태
  const [chatRoomId, setChatRoomId] = useState(
    new URLSearchParams(useLocation().search).get("chatRoomId")
  );

  const [page, setPage] = useState(0);//messagelist 무한 스크롤

  const location = useLocation();
  const socketRef = useRef(null);

  useEffect(() => {
    const newchatRoomId = new URLSearchParams(location.search).get(
      "chatRoomId"
    );
    setChatRoomId(newchatRoomId);
  }, [location.search]);

  useEffect(() => {
    console.log("Updated chatRoomInfo:", chatRoomInfo); // 상태가 바뀔 때마다 콘솔로 확인
  }, [chatRoomInfo]);

  useEffect(() => {
    if (!chatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");

      return;
    }
    fetchRoomInfo();

    setIsModalOpen(false);
  }, [workspaceId, chatRoomId, wsMemberState]);

  const fetchMoreMessages = async () => {
    if (!chatRoomInfo.msgHasMore) return;
    try {
      const res = await ChatApi.getMoreMessages(chatRoomId, page + 1, 50);
      if (res.messages.length > 0) {
        setChatRoomInfo((prev) => ({
          ...prev,
          messages: [...res.messages.reverse(), ...prev.messages],
          msgHasMore: Boolean(res.msgHasMore),
        }));
        setPage(page + 1);
      } else {
        setChatRoomInfo((prev) => ({
          ...prev,
          msgHasMore: false,
        }));
      }
    } catch (error) {
      console.error("추가 메시지 로드 실패: ", error);
    }
  };

  /////////////////////websocket 연결///////////////////
  useEffect(() => {
    if (!chatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");
      return;
    }

    // 이전 연결 있으면 제거
    if (socketRef.current) {
      //&& socketRef.current.active
      socketRef.current.deactivate();
      socketRef.current = null;
    }

    const socket = new SockJS(`${HOST_URL}/ws`);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${Repo.getAccessToken()}`,
      },
      onConnect: () => {
        console.log(`채팅방 ${chatRoomId}번 websocket 연결 완료`);

        ///채팅 실시간 메시지 구독
        stompClient.subscribe(`/topic/chatRooms/${chatRoomId}/msg`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          // console.log("chatRoom_ new msg: ", newMsg);

          setChatRoomInfo((prev) => ({
            ...prev,
            messages: [...prev.messages, newMsg],
          }));
        });

        //메시지 읽음/삭제 실시간 구독
        stompClient.subscribe(`/topic/chatRooms/${chatRoomId}/message-status`, (status) => {
          const statusData = JSON.parse(status.body);
          // console.log("읽음 처리 메시지", statusData);

          if (status.type === "READ") {
            ///특정 유저가 실시간으로 읽은 메시지 상태 반영
            setChatRoomInfo((prev) => ({
              ...prev,
              messages: prev.messages.map((message) => ({
                ...message,
                unReadMembers: message.unReadMembers.filter(
                  (member) =>
                    Number(member.wsMemberId) !== statusData.wsMemberId
                ),
              })),
            }));
          } else if (status.type === "DELETE") {
            setChatRoomInfo((prev) => {
              const updatedMessages = prev.messages.filter(
                (msg) => Number(msg.id) !== status.messageId
              );
              return { ...prev, messages: updatedMessages };
            });
          }
        }
        );
      },
      onWebSocketError: (error) => {
        console.error(`채팅방 ${chatRoomId}번 websocket 연결 오류:`, error);
        alert("실시간 연결 오류가 발생했습니다. 다시 시도");
        window.location.reload();
      },
      reconnectDelay: 5000, // 5초마다 자동 재연결 시도
      heartbeatIncoming: 4000, // 서버에서 4초마다 ping
      heartbeatOutgoing: 4000, // 클라이언트에서 4초마다 pong
      withCredentials: true, //쿠키, 인증정보 포함
    });

    stompClient.activate();
    socketRef.current = stompClient;

    //언마운트시 연결 종료
    return () => {
      if (socketRef.current) {
        socketRef.current.deactivate();
        socketRef.current = null;
      }
    };
  }, [chatRoomId]);


  // 메시지 전송 처리 함수 
  const handleSendMessage = async (newMessage, files) => {
    try {
      let uploadedFileIds = [];
      if (files && files.length > 0) {
        const uploadRes = await ChatApi.uploadChatFile(files);
        uploadedFileIds = uploadRes.imageIds;
      }

      const sendMessage = {
        content: newMessage.content,
        isAnnouncement: false,
        mentionedUserIds: newMessage.mentionedIds,
        replyId: newMessage.replyId,
        // sender: currentMemberInfo.name,
        workspaceId: chatRoomInfo.workSpaceId,
        // writerWsMemberId: currentMemberInfo.wsMemberId,
        imageIds: uploadedFileIds,
      };

      // console.log("Sending message:", JSON.stringify(sendMessage));
      if (socketRef && socketRef.current) {
        socketRef.current.publish({
          destination: `/app/messages/${chatRoomId}`,
          body: JSON.stringify(sendMessage),
        });
      } else {
        console.warn("websocket 미연결 or 메시지 빔");
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  // 메시지를 클릭하면 해당 메시지를 선택
  const handleMessageClick = (messages) => {
    setReplyToMessage(messages);
  };

  const handleUpdateChatRoom = async ({ updateName, image, isImageDelete }) => {
    try {
      // 서버에 업데이트 요청
      const updatedData = await ChatApi.updateChatRoom(workspaceId, chatRoomId, updateName, image, isImageDelete);
      // console.log("업데이트 정보: ", updatedData)
      if (updatedData) {
        setChatRoomInfo((prev) => ({
          ...prev,  // 기존 객체를 그대로 복사하고,
          name: updatedData.name,  // name을 새로 업데이트,
          imageUriPath: updatedData.imageUriPath,  // imageUriPath를 새로 업데이트
        }));

        handleUpdateChatRoomInfo(chatRoomId, updatedData.name, updatedData.imageUriPath);
      }
    } catch (error) {
      console.error("채팅방 업데이트 오류: ", error);
    }
  };

  return (
    <div className={`chatroom-container ${isFold ? "folded" : ""}`}>
      <ChatRoomHeader
        onUpdateChatRoom={handleUpdateChatRoom}
      />

      <MessageList
        messages={chatRoomInfo.messages}
        onMessageClick={handleMessageClick}
        fetchMoreMessages={fetchMoreMessages}
        msgHasMore={chatRoomInfo.msgHasMore}
        currentChatRoomId={chatRoomId}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        replyToMessage={replyToMessage}
        setReplyToMessage={setReplyToMessage}
        currentChatRoomId={chatRoomId}
        participants={chatRoomInfo.participants}
      />
    </div>
  );
};

export default ChatRoom;
