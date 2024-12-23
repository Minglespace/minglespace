import BasicLayout from "../common/Layouts/BasicLayout";
import Chat from "../chat/Chat";
import React from "react";
import { ChatAppProvider } from "../chat/context/ChatAppContext";

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
