package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.UserResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.UserFriend;
import com.minglers.minglespace.auth.exception.UserFriendsException;
import com.minglers.minglespace.auth.repository.UserFriendRepository;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.FriendshipStatus;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserFriendService {

    private final UserRepository userRepository;
    private final UserFriendRepository userFriendRepository;
    private final ModelMapper modelMapper;

    //공통메서드////////////////////////////////
    //유저 정보 가져오기
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저정보를 찾을수 없습니다."));
    }
    //user로 userFriend조회
    private UserFriend findUserFriendByUser(User user){
        return userFriendRepository.findByUser(user)
                .orElseThrow(() -> new UserFriendsException(HttpStatus.NOT_FOUND.value(), "친구를 찾을수 없습니다"));
    }

    //내친구목록 조회
    public List<UserResponse> getMyFriendList(Long userId,String searchKeyword) {
        List<User> userList = userFriendRepository.findAllByUserIdAndStatus(userId, FriendshipStatus.ACCEPTED, searchKeyword);
        return userList.stream()
                .map(user-> {
                    return modelMapper.map(user, UserResponse.class);
                }).toList();
    }
}
