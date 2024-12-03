import BasicLayout from "../common/Layouts/BasicLayout";
import Chat from "../chat/Chat";
import React from "react";

const ChatPage = () => {
  return (
    <BasicLayout props="1">
      <Chat />
    </BasicLayout>
  );
};

export default ChatPage;
