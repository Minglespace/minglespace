package com.minglers.minglespace.sampleData;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.UserFriend;
import com.minglers.minglespace.auth.repository.UserFriendRepository;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.FriendshipStatus;
import com.minglers.minglespace.auth.type.Provider;
import com.minglers.minglespace.auth.type.WithdrawalType;
import com.minglers.minglespace.milestone.dto.MilestoneGroupRequestDTO;
import com.minglers.minglespace.milestone.entity.MilestoneGroup;
import com.minglers.minglespace.milestone.entity.MilestoneItem;
import com.minglers.minglespace.milestone.repository.MilestoneGroupRepository;
import com.minglers.minglespace.milestone.repository.MilestoneItemRepository;
import com.minglers.minglespace.milestone.service.MilestoneService;
import com.minglers.minglespace.milestone.type.TaskStatus;
import com.minglers.minglespace.workspace.dto.WorkspaceRequestDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import com.minglers.minglespace.workspace.role.WSMemberRole;
import com.minglers.minglespace.workspace.service.WorkspaceService;
import com.minglers.minglespace.workspace.service.WorkspaceServiceImpl;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SampleDataTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFriendRepository userFriendRepository;

    @Autowired
    private WSMemberRepository wsMemberRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private MilestoneService milestoneService;

    @Autowired
    private MilestoneGroupRepository milestoneGroupRepository;

    @Autowired
    private MilestoneItemRepository milestoneItemRepository;

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

    private String[] userPosition = {"사원","대리","과장","부장"};
    public String generateRandomPosition(){
        Random random = new Random();
        return userPosition[random.nextInt(userPosition.length)];
    }
    @Test
    @Order(1)
    @Transactional
    @Commit
    public void insertUserTest() {
        userRepository.save(User.builder()
                .name(generateRandomKoreanName())
                .email("test@naver.com")
                .introduction("안녕하세요")
                .password(passwordEncoder.encode("qwQW123!"))
                .phone("000-0000-0000")
                .withdrawalType(WithdrawalType.NOT)
                .position(generateRandomPosition())
                .role("ADMIN")
                .provider(Provider.MINGLESPACE)
                .verificationCode("")
                .build());
        userRepository.save(User.builder()
                .name(generateRandomKoreanName())
                .email(generateRandomEmail())
                .introduction("안녕하세요")
                .password(passwordEncoder.encode("qwQW123!"))
                .phone("000-0000-0000")
                .withdrawalType(WithdrawalType.DONE)
                .position(generateRandomPosition())
                .role("ADMIN")
                .provider(Provider.MINGLESPACE)
                .verificationCode("")
                .build());
        for(int i = 0; i<50; i ++){
            userRepository.save(User.builder()
                    .name(generateRandomKoreanName())
                    .email(generateRandomEmail())
                    .introduction("안녕하세요")
                    .password(passwordEncoder.encode("123123"))
                    .phone("000-0000-0000")
                    .withdrawalType(WithdrawalType.NOT)
                    .position(generateRandomPosition())
                    .role("ADMIN")
                    .provider(Provider.MINGLESPACE)
                    .verificationCode("")
                    .build());
        }

    }
    @Test
    @Transactional
    @Order(2)
    @Commit
    public void insertFriendTest() {
        User user = userRepository.findById(1L).orElseThrow();
        for (int i = 2; i < 25; i++) {
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
    private String[] wsTitle = {"밍글 개발자 전용", "디자인 스튜디오",
            "데브옵스 센트럴", "데이터 분석 연구소", "고객 성공 팀"};
    private String[] wsDesc = {"밍글밍글","디자이너들이 창의적인 디자인 작업을 수행하고 협력하는 워크스페이스입니다.",
            "개발자와 운영팀이 협력하여 지속적인 통합과 배포를 위한 프로세스를 관리하는 공간입니다.",
            "데이터 과학자와 분석가들이 데이터를 수집, 분석하고 인사이트를 도출하는 공간입니다.",
            "고객의 성공을 돕기 위해 지원과 서비스를 제공하는 팀의 공간입니다.",
    };
    @Test
    @Transactional
    @Order(3)
    @Commit
    public void insertWorkSpace(){
        User user = userRepository.findById(1L).orElseThrow();
        for (int i = 0; i < 4; i++) {
            workspaceService.resister(user.getId(),WorkspaceRequestDTO.builder()
                    .name(wsTitle[i])
                    .wsdesc(wsDesc[i])
                    .build());
        }
    }

    @Test
    @Transactional
    @Order(4)
    @Commit
    public void insertWorkSpaceMember(){
        WorkSpace workSpace = workspaceRepository.findById(1L).orElseThrow();
        for (int i = 2; i < 10; i++) {
            User user = userRepository.findById((long) i).orElseThrow();
            WSMember wsMember = WSMember.builder()
                    .user(user)
                    .workSpace(workSpace)
                    .role(WSMemberRole.MEMBER)
                    .build();
            wsMemberRepository.save(wsMember);
        }

        WorkSpace workSpace2 = workspaceRepository.findById(2L).orElseThrow();
        for (int i = 10; i < 20; i++) {
            User user = userRepository.findById((long) i).orElseThrow();
            WSMember wsMember = WSMember.builder()
                    .user(user)
                    .workSpace(workSpace2)
                    .role(WSMemberRole.MEMBER)
                    .build();
            wsMemberRepository.save(wsMember);
        }
    }
    //maxLength = 30
    private String[] msGroup = {"기획(Planning)", "분석(Analysis)",
            "설계(Design)", "개발(Development)", "Test", "배포(Deployment)"};
    @Test
    @Transactional
    @Order(5)
    @Commit
    public void insertMileStone(){
        WorkSpace workSpace = workspaceRepository.findById(1L).orElseThrow();
        for (int i = 0; i < 6; i++) {
            milestoneGroupRepository.save(MilestoneGroup.builder()
                    .workspace(workSpace)
                    .title(msGroup[i])
                    .build());
        }
        milestoneItemRepository.save(MilestoneItem.builder()
                        .end_time(1736127900000L)
                        .start_time(1735225200000L)
                        .taskStatus(TaskStatus.COMPLETED)
                        .title("목표 설정")
                        .milestoneGroup(milestoneGroupRepository.findById(1L).get())
                        .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1736599500000L)
                .start_time(1735669800000L)
                .taskStatus(TaskStatus.IN_PROGRESS)
                .title("요구사항 수집")
                .milestoneGroup(milestoneGroupRepository.findById(1L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1736892000000L)
                .start_time(1735884000000L)
                .taskStatus(TaskStatus.IN_PROGRESS)
                .title("요구사항 분석")
                .milestoneGroup(milestoneGroupRepository.findById(2L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1737026100000L)
                .start_time(1736128800000L)
                .taskStatus(TaskStatus.ON_HOLD)
                .title("와이어프레임 제작")
                .milestoneGroup(milestoneGroupRepository.findById(3L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1737160200000L)
                .start_time(1736179200000L)
                .taskStatus(TaskStatus.NOT_START)
                .title("UI설계")
                .milestoneGroup(milestoneGroupRepository.findById(3L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1736678700000L)
                .start_time(1736092800000L)
                .taskStatus(TaskStatus.NOT_START)
                .title("DB 설계")
                .milestoneGroup(milestoneGroupRepository.findById(3L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1737848700000L)
                .start_time(1736670600000L)
                .taskStatus(TaskStatus.NOT_START)
                .title("프론트 진행")
                .milestoneGroup(milestoneGroupRepository.findById(4L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1737848700000L)
                .start_time(1736670600000L)
                .taskStatus(TaskStatus.NOT_START)
                .title("백엔드 진행")
                .milestoneGroup(milestoneGroupRepository.findById(4L).get())
                .build());

        ////////두번째 워크스페이스////////////////////////
        WorkSpace workSpace2 = workspaceRepository.findById(2L).orElseThrow();
        for (int i = 0; i < 6; i++) {
            milestoneGroupRepository.save(MilestoneGroup.builder()
                    .workspace(workSpace2)
                    .title(msGroup[i])
                    .build());
        }
        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1736127900000L)
                .start_time(1735225200000L)
                .taskStatus(TaskStatus.COMPLETED)
                .title("목표 설정")
                .milestoneGroup(milestoneGroupRepository.findById(7L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1736599500000L)
                .start_time(1735669800000L)
                .taskStatus(TaskStatus.COMPLETED)
                .title("요구사항 수집")
                .milestoneGroup(milestoneGroupRepository.findById(7L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1736892000000L)
                .start_time(1735884000000L)
                .taskStatus(TaskStatus.COMPLETED)
                .title("요구사항 분석")
                .milestoneGroup(milestoneGroupRepository.findById(8L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1737026100000L)
                .start_time(1736128800000L)
                .taskStatus(TaskStatus.ON_HOLD)
                .title("와이어프레임 제작")
                .milestoneGroup(milestoneGroupRepository.findById(9L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1737160200000L)
                .start_time(1736179200000L)
                .taskStatus(TaskStatus.IN_PROGRESS)
                .title("UI설계")
                .milestoneGroup(milestoneGroupRepository.findById(9L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1736678700000L)
                .start_time(1736092800000L)
                .taskStatus(TaskStatus.NOT_START)
                .title("DB 설계")
                .milestoneGroup(milestoneGroupRepository.findById(9L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1737848700000L)
                .start_time(1736670600000L)
                .taskStatus(TaskStatus.NOT_START)
                .title("프론트 진행")
                .milestoneGroup(milestoneGroupRepository.findById(10L).get())
                .build());

        milestoneItemRepository.save(MilestoneItem.builder()
                .end_time(1737848700000L)
                .start_time(1736670600000L)
                .taskStatus(TaskStatus.NOT_START)
                .title("백엔드 진행")
                .milestoneGroup(milestoneGroupRepository.findById(10L).get())
                .build());

    }

}