package com.minglers.minglespace.sampleData;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.UserFriend;
import com.minglers.minglespace.auth.repository.UserFriendRepository;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.FriendshipStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Random;

@SpringBootTest
public class SampleDataTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFriendRepository userFriendRepository;

    private final char[] FIRST_NAMES = {'김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'};
    private final char[] MIDDLE_LAST_NAMES = {'가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'};
    public String generateRandomKoreanName() {
        Random random = new Random(); // 성 선택
        char firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)]; // 이름 두 글자 선택
        char middleName = MIDDLE_LAST_NAMES[random.nextInt(MIDDLE_LAST_NAMES.length)];
        char lastName = MIDDLE_LAST_NAMES[random.nextInt(MIDDLE_LAST_NAMES.length)]; // 최종 이름 생성
         return "" + firstName + middleName + lastName;
    }

    private final String[] DOMAINS = {"gmail.com", "yahoo.com", "naver.com", "outlook.com", "example.com"};
    private final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public String generateRandomEmail() {
        StringBuilder username = new StringBuilder(10);
        Random random = new Random(); // 랜덤한 사용자 이름 생성
        for (int i = 0; i < 10; i++) {
            username.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        } // 랜덤한 도메인 선택
     String domain = DOMAINS[random.nextInt(DOMAINS.length)]; // 최종 이메일 주소 생성
     return username.toString() + "@" + domain;
    }


    @Test
    public void insertUserTest() {
        userRepository.save(User.builder()
                .name(generateRandomKoreanName())
                .email("abc@abc.abc")
                .introduction("안녕하세요")
                .password(passwordEncoder.encode("123123"))
                .phone("000-0000-0000")
                .deleteFlag(false)
                .position("사원")
                .role("ADMIN")
                .verificationCode("")
                .build());
        for (int i = 0; i < 100; i++) {
            userRepository.save(User.builder()
                    .name(generateRandomKoreanName())
                    .email(generateRandomEmail())
                    .introduction("안녕하세요")
                    .password(passwordEncoder.encode("123123"))
                    .phone("000-0000-0000")
                    .deleteFlag(false)
                    .position("사원")
                    .role("ADMIN")
                    .verificationCode("")
                    .build());
        }
    }
    @Test
    public void insertFriendTest() {
        User user = userRepository.findById(1L).orElseThrow();
        for (int i = 102; i < 200; i++) {
            User userfriend = userRepository.findById((long) i).orElseThrow();
            userFriendRepository.save(UserFriend.builder()
                    .user(user)
                    .friend(userfriend)
                    .friendshipStatus(FriendshipStatus.ACCEPTED)
                    .build());
            userFriendRepository.save(UserFriend.builder()
                    .user(userfriend)
                    .friend(user)
                    .friendshipStatus(FriendshipStatus.ACCEPTED)
                    .build());
        }
    }
}
