import BasicLayout from "../common/Layouts/BasicLayout";
import Chat from "../chat/Chat";
import React from "react";
import { ChatAppProvider } from "../chat/context/ChatAppContext";
import { ChatRoomProvider } from "../chat/context/ChatRoomContext";

const ChatPage = () => {
  return (
    <BasicLayout props="1">
      <ChatAppProvider>
        <Chat />
      </ChatAppProvider>
    </BasicLayout>
  );
};

export default ChatPage;
