package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.entity.ChatMessage;

import java.util.Set;

public interface MsgReadStatusService {
  void createMsgForMembers(ChatMessage saveMsg, Set<Long> activeUserIds);
  String deleteMsgReadStatus(Long chatRoomId, Long userId, Long workspaceId);
}
