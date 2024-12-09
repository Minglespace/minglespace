package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.entity.ChatMessage;

public interface MsgReadStatusService {
  void createMsgForMembers(ChatMessage saveMsg);
  void deleteMsgReadStatus(Long chatRoomId, Long wsMemberId);
}
