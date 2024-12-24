package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.UserResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.UserFriend;
import com.minglers.minglespace.auth.exception.UserFriendsException;
import com.minglers.minglespace.auth.repository.UserFriendRepository;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.FriendshipStatus;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.entity.Notification;
import com.minglers.minglespace.common.service.NotificationService;
import com.minglers.minglespace.common.type.NotificationType;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserFriendService {

  private final UserRepository userRepository;
  private final UserFriendRepository userFriendRepository;
  private final ModelMapper modelMapper;
  private final NotificationService notificationService;

  //공통메서드////////////////////////////////
  //유저 정보 가져오기
  private User findUserById(Long userId) {
    return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("유저정보를 찾을수 없습니다."));
  }

  //친구 정보 가져오기
  private User findFriendById(Long friendId) {
    return userRepository.findById(friendId)
            .orElseThrow(() -> new IllegalArgumentException("친구 정보를 찾을수 없습니다."));
  }

  //userFriend 조회
  private UserFriend findByUserIdAndFriendId(Long userId, Long friendId){
    return userFriendRepository.findByUserIdAndFriendId(userId,friendId)
            .orElseThrow(()->new UserFriendsException(HttpStatus.NOT_FOUND.value(), "친구 정보조회 실패"));
  }

  /////////////////////////////////////////////////////////////

  //내친구목록 조회
  @Transactional(readOnly = true)
  public List<UserResponse> getMyFriendList(Long userId,String searchKeyword) {
    List<User> userList = userFriendRepository.findAllByUserIdAndStatus(userId, FriendshipStatus.ACCEPTED, searchKeyword);
    return userList.stream()
            .map(user-> {
              UserResponse userResponse = modelMapper.map(user, UserResponse.class);
              String imageUriPath = Optional.ofNullable(user.getImage())
                      .map(Image::getUripath).orElse("");
              userResponse.setProfileImagePath(imageUriPath);
              return userResponse;
            }).toList();
  }

  //친구삭제
  @Transactional
  public List<UserResponse> remove(Long userId, Long friendId) {
    User user = findUserById(userId);
    User friend = findFriendById(friendId);

    userFriendRepository.deleteByUserIdAndFriendId(userId,friendId);
    userFriendRepository.deleteByUserIdAndFriendId(friendId,userId);//양방향 삭제(상대쪽에서도삭제)

    return getMyFriendList(userId, "");
  }
  //친구 제외한 유저목록 조회
  @Transactional(readOnly = true)
  public Slice<UserResponse> getNonFriendList(Long userId, String searchKeyword, Pageable pageable){
    Slice<User> userList = userRepository.findNonFriends(userId, searchKeyword, pageable);

    return userList.map(user->{
      UserResponse userResponse = modelMapper.map(user, UserResponse.class);
      String imageUriPath = Optional.ofNullable(user.getImage())
              .map(Image::getUripath).orElse("");
      userResponse.setProfileImagePath(imageUriPath);
      return userResponse;
    });
  }

  //친구 추가
  @Transactional
  public UserResponse addFriend(Long userId, Long friendId){
    User user = findUserById(userId);
    User friend = findFriendById(friendId);

    //db에 친구 요청정보 저장 Request는 친구 신청상태
    UserFriend savedFriendRequest = userFriendRepository.save(UserFriend
            .builder()
            .user(user)
            .friend(friend)
            .friendshipStatus(FriendshipStatus.REQUEST)
            .build());
    //요청받은 친구쪽은 대기상태 pending
    UserFriend savedFriendPending = userFriendRepository.save(UserFriend
            .builder()
            .user(friend)
            .friend(user)
            .friendshipStatus(FriendshipStatus.PENDING)
            .build());

    notificationService.sendNotification(friend.getId(), user.getName()+"님으로부터 친구 요청이 도착했습니다.", "/myfriends" , NotificationType.FRIEND);

    return modelMapper.map(friend, UserResponse.class);
  }

  //친구 수락
  @Transactional
  public List<UserResponse> acceptFriend(Long userId, Long friendId){
    //요청받은 사람이 수락하면 요청한 사람도 상태를 accepted로 바꿔줌
    UserFriend userFriend = findByUserIdAndFriendId(userId, friendId);
    userFriend.ChangeFriendshipStatus(FriendshipStatus.ACCEPTED);
    userFriendRepository.save(userFriend);

    UserFriend friendUser = findByUserIdAndFriendId(friendId,userId);
    friendUser.ChangeFriendshipStatus(FriendshipStatus.ACCEPTED);
    userFriendRepository.save(friendUser);
    return friendPendingList(userId);
  }
  //친구 거절
  @Transactional
  public List<UserResponse> refuseFriend(Long userId, Long friendId){
    User validUser = findUserById(userId);
    User validFriend = findFriendById(friendId);

    userFriendRepository.deleteByUserIdAndFriendId(userId,friendId);
    userFriendRepository.deleteByUserIdAndFriendId(friendId,userId);//양방향 삭제(상대쪽에서도삭제)
    return friendPendingList(userId);
  }
  //친구 신청목록
  @Transactional(readOnly = true)
  public List<UserResponse> friendRequestList(Long userId){
    User validUser = findUserById(userId);

    List<User> userList = userFriendRepository.findAllByUserIdAndStatus(userId,FriendshipStatus.REQUEST,null);
    return userList.stream().map((user)->{
      return modelMapper.map(user, UserResponse.class);
    }).toList();
  }

  //친구 요청온 목록
  @Transactional(readOnly = true)
  public List<UserResponse> friendPendingList(Long userId){
    User validUser = findUserById(userId);

    List<User> userList = userFriendRepository.findAllByUserIdAndStatus(userId,FriendshipStatus.PENDING,null);
    return userList.stream().map((user)->{
      return modelMapper.map(user, UserResponse.class);}).toList();
  }
}
