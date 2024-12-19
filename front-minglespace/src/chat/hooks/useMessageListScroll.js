import { useEffect, useRef, useState } from 'react'

const useMessageListScroll = ({ messages, currentMemberInfo, msgHasMore, fetchMoreMessages, currentChatRoomId }) => {
  const messageListRef = useRef(null);
  const isAtBottom = useRef(true);
  const originFirstMessageTimestamp = useRef(0);

  const previousScrollTop = useRef(0);
  const previousScrollHeight = useRef(0);

  const [newMessageVisible, setNewMessageVisible] = useState(null); //새 메시지 미리보기
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // console.log("스크롤을 위한 채팅방 id;", currentChatRoomId);
    setIsInitialLoad(true);
  }, [currentChatRoomId]);

  useEffect(() => {
    // console.log("isInitialLoad:", isInitialLoad);
    // console.log("messages:", messages.length);
    if (!messageListRef.current || !isInitialLoad || messages[messages.length - 1]?.chatRoomId !== Number(currentChatRoomId)) return;

    // console.log("isInitialLoad2222:", isInitialLoad);

    setIsInitialLoad(false);
    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    });

    setNewMessageVisible(false);
    originFirstMessageTimestamp.current = messages[0]?.date;
  }, [isInitialLoad, messages, currentChatRoomId]);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    const oldestMessage = messages[0];

    if (latestMessage?.date > originFirstMessageTimestamp.current) {
      if (latestMessage.writerWsMemberId === currentMemberInfo.wsMemberId) {
        setNewMessageVisible(null); // 미리보기 표시하지 않음
        messageListRef.current.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else if (!isAtBottom.current) {
        const newMessageContent = latestMessage?.content;
        setNewMessageVisible(newMessageContent && newMessageContent.trim() ? newMessageContent : '(파일)');
      } else {
        setNewMessageVisible(null);
        messageListRef.current.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }

    if (oldestMessage?.date < originFirstMessageTimestamp.current) {
      setNewMessageVisible(null);
      if (messageListRef.current) {
        const newScrollTop = previousScrollTop.current + (messageListRef.current.scrollHeight - previousScrollHeight.current);
        messageListRef.current.scrollTop = newScrollTop;
      }
    }

    originFirstMessageTimestamp.current = oldestMessage?.date;
    previousScrollHeight.current = messageListRef.current.scrollHeight;
  }, [messages, currentMemberInfo]);

  const handleScroll = () => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      isAtBottom.current = scrollHeight - scrollTop === clientHeight;

      if (scrollTop === 0 && msgHasMore) {
        console.log('Fetching more messages...');
        fetchMoreMessages();
      }

      if (scrollTop !== 0) {
        previousScrollTop.current = scrollTop;
      }
      previousScrollHeight.current = scrollHeight;
    }
  };

  const handleNewMessageClick = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    setNewMessageVisible(null);
  };

  return {
    messageListRef,
    newMessageVisible,
    handleScroll,
    handleNewMessageClick,
  };
}

export default useMessageListScroll
