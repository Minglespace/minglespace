<div align="center">
<h2>Mingle Space</h2>
팀 워크스페이스 생성, 관리, 실시간 채팅 등 협업을 통한 작업의 생산성, 소통을 증대시킬 수 있는 온라인 협업 도구 Mingle Space입니다.
</div>

## 목차
  - [개요](#개요) 
  - [프로젝트 설명](#프로젝트-설명)

## 개요
- **프로젝트 이름** : MingleSpace 🏠
- **프로젝트 기간** : 2024.11-2025.01
- **개발 언어** : React & Spring Boot
  - 사용 기술 : JWT & OAuth2.0(로그인, 회원가입), WebSocket(실시간 채팅, 알림), 외부 라이브러리(FullCalendar, React-Calendar-Timeline, React-slick)
- **멤버** (팀 Minglers)
  - 팀장 : 한형호 (메인페이지, 캘린더, 마일스톤, 할일)
  - 팀원
    - 김지현 : 채팅, About Us
    - 이영수 : 워크스페이스, 친구 & 멤버, 캘린더, 마일스톤
    - 정회광 : 로그인, 회원가입
    - 정혜린 : 채팅, 알림

## 프로젝트 설명
### 로그인 & 회원가입
|![image](https://postfiles.pstatic.net/MjAyNTAxMTJfMjg1/MDAxNzM2NjU4ODYxMjA4.Doz-uTbUNGYmJRKzWfehy-I0ZKC3bpqJORtoTjXJqscg._B216Ojv1a4ApgNiZqMy1NAnXv3bMhtkHMbSqOhUfEMg.PNG/%EB%A1%9C%EA%B7%B8%EC%9D%B8.PNG?type=w773)|![image](https://postfiles.pstatic.net/MjAyNTAxMTJfMTY5/MDAxNzM2NjU4ODYxMjA4.fmjL1_ME8N9VYFzb9yZHOKS2yzLxJAbYnqLGqjraBe4g.Mck57IGGc6gbH8YdaIp28ji7bv8_3l7wLkB4yCjDz9Qg.PNG/%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85.PNG?type=w773)|
|:---:|:---:|
|로그인|회원가입|


| Libraries | Version |
|:---------:|:-------:|
| Security  |  org.springframework.boot:spring-boot-starter-security:3.4.0   |
|  OAuth2   |  org.springframework.boot:spring-boot-starter-oauth2-client:3.4.0   |
|    JWT    |  io.jsonwebtoken:jjwt-api:0.12.5<br/>io.jsonwebtoken:jjwt-impl:0.12.5<br/>io.jsonwebtoken:jjwt-jackson:0.12.5   |

JWT (JSON Web Token)를 MingleSpace에서 인증 및 권한 부여를 처리하는데 사용하였습니다.
- Stateless Authentication
  - JWT는 세션 정보를 서버에 저장하지 않고, 클라이언트 측에서 토큰을 관리합니다.
  - 이로 인해 서버는 클라이언트의 인증 상태를 추적할 필요가 없으며, 인증 정보를 상태없이 전달하고 처리할 수 있습니다.
  - 서버 측에서 세션을 유지하지 않기 때문에 확장성이 좋아집니다.
- 확장성
  - 여러 서버나 서비스가 동일한 토큰을 사용할 수 있어 분산 시스템에서 매우 유용합니다.
  - 마이크로서비스 아키텍처나 분산 시스템에서 인증과 권한 부여를 처리하는 데 매우 유용합니다.
  - SSO (Single Sign-On): JWT는 여러 애플리케이션 간에 동일한 인증 정보를 공유할 수 있게 해 주므로, SSO(단일 로그인) 구현에 적합합니다.
- 단기 토큰과 갱신 기능
  - 단기 토큰 ( Access Token )
    - JWT는 비교적 짧은 만료 시간을 설정할 수 있어, 민감한 정보에 대해 보다 안전한 접근을 제공할 수 있습니다.
    - 만약 토큰이 탈취되더라도 짧은 기간 내에 만료되어 위험을 줄일 수 있습니다.
  - 갱신 기능 ( Refresh Token )
    - 만료된 토큰을 자동으로 처리할 수 있어 보안성을 강화할 수 있습니다.
    - 비교적 긴 만료 시간을 가지며, 만료된 Access Token을 갱신하는데 사용한다.
    - Refresh Token은 scure 설정 및 http only cookie에 넣어서 관리하여, 토큰 탈취를 예방할 수 있다.
- Logout
  - JWT는 서버 상태를 저장하지 않는 방식으로 인증을 처리하기 때문에, 서버에서 명시적으로 "로그아웃" 처리를 할 필요가 없습니다.
  - 하지만 JWT를 사용한 시스템에서 로그아웃을 처리하려면 토큰 무효화나 만료와 관련된 몇 가지 방법을 사용할 수 있습니다
  - MingleSpace에서는 블랙리스트 기법을 사용하여 로그아웃 시 특정 토큰을 무효화하고 있습니다.

OAuth 2.0을 사용하면 애플리케이션은 사용자 로그인 정보나 자격 증명을 직접 처리하지 않고,<br/>
다른 신뢰할 수 있는 서비스(Google, Kakao, Naver)를 통해 인증을 처리할 수 있습니다.
- MingleSpace에서는 Google, Kakao, Naver를 지원합니다.
- 보안성 향상
  - 사용자 자격 증명을 제3자 애플리케이션에 노출하지 않도록 해 줍니다. 이는 보안을 크게 향상시킵니다.
  - 사용자는 자신의 로그인 정보(아이디, 비밀번호)를 제3자 애플리케이션에 제공하지 않고,
  - 대신 해당 애플리케이션은 인증 서버로부터 발급받은 토큰을 통해 권한을 부여받습니다.
- 단일 로그인 (Single Sign-On, SSO)
  - OAuth 2.0은 단일 로그인(SSO) 기능을 지원하여, 사용자가 여러 애플리케이션에 대해 한번의 로그인으로 접근할 수 있게 합니다.
  - 예를 들어, 사용자가 구글 계정으로 로그인하면 구글에서 발급한 액세스 토큰을 통해 여러 서비스에 동일한 방식으로 인증을 받을 수 있습니다.
- 권한 부여 및 최소 권한 원칙 (Principle of Least Privilege)
  - **권한 부여 범위(Scope)**를 세밀하게 설정할 수 있습니다.
  - 즉, 애플리케이션이 사용자 데이터를 요청할 때, 해당 애플리케이션이 필요한 최소한의 권한만 요청할 수 있습니다.
- 확장성 및 유연성
- 리소스 서버와 클라이언트의 분리
- 모바일 및 분산 시스템 지원
---

### 메인페이지
|![image](https://postfiles.pstatic.net/MjAyNTAxMTJfMjMx/MDAxNzM2NjU5MTE1MzEx.T5iQhQRO1TZhX0IOMiGKyWIrDeichda8pfN8IvyMq4Yg.rK4GgZwRjsRZGvKLe9MZimgQrHHjHwEzm0Qh3h74iKgg.PNG/%EB%A9%94%EC%9D%B8%ED%8E%98%EC%9D%B4%EC%A7%80.PNG?type=w773)|
|:---:|
|메인 페이지|

메인페이지는 유저가 로그인 후에 최초에 보게되는 페이지로 MingleSpace의 얼굴과 같은 페이지 입니다.
- 레이아웃
  - Header : 로고, 워크스페이스 제목, 알림 및 유저정보 제공
  - SideBar : 메인메뉴, 워크스페이스 접속 메뉴, About Us 링크 제공
  - MainContainer : 협업 도구 표현 영역
- Main Content<br>
  최초 접속시에는 내가 참여중인 워크스페이스 전체에서 필요한 정보를 유저에게 시각적으로 제공해 줍니다.
  - 마일스톤 진행 현황 : React-Slick을 사용한 캐러샐 방식으로 구현하였으며, Nivo차트를 활용하여 도넛 그래프 형식으로 현재 진행 정보를 제공
  - 최신 및 마감공지, 할일 : 사용자에게 가장 먼저 처리해야 할 일정에 대해서 5개를 목록화 하여 정보를 제공
  - 최신 알림 목록 : 워크스페이스 초대, 새로운 채팅, 공지 및 할일 등록 등 나에게 해당되는 정보를 누적하여 제공하며 해당되는 페이지의 경로를 저장하여 링크기능 제공

---

### 친구페이지
|![image](https://github.com/user-attachments/assets/fffe5a8c-f339-4236-8fee-85e05f41e817)|
|:---:|
|친구 관리|

친구 페이지는 이메일을 통해 유저를 검색하고 친구 신청을 할 수 있는 페이지입니다.
  - 이메일을 통해 유 저검색 : 무한스크롤 적용
  - 친구 신청 시 수락 대기상태가 되고 상대방에게 요청을 보냄
  - 요청 수락 시 친구가 되며 워크스페이스에 바로 초대가 가능하고 상세정보를 확인할 수 있음
  - 친구 컴포넌트를 클릭 시 모달창으로 상세 정보를 확인할 수 있음 

---

### 워크스페이스 페이지
|![image](https://github.com/user-attachments/assets/4337cd71-6944-4748-be8e-874c36c7be4b)|
|:---:|
|워크스페이스 리스트|

각 프로젝트마다 워크스페이스를 개설할 수 있고 워크스페이스 내부에서 캘린더, 마일스톤, 할일부여, 채팅을 이용할 수 있습니다.
  - 워크스페이스 리스트에서는 마일스톤 진행상황을 간략하게 확인할 수 있음.
  - 권한사항으로는 리더, 서브리더, 멤버로 구분되어 있으며
  - 리더는 전체 권한을 지니고 있고, 서브리더는 캘린더 공지, 마일스톤 작성, 할일부여를 할 수 있음
    
---

### 멤버 페이지
|![image](https://github.com/user-attachments/assets/a669c2d1-de7a-46cd-8458-1ed8a4d5584f)|![image](https://github.com/user-attachments/assets/0e861487-9267-448a-843b-28863eb5a624)|
|:---:|:---:|
|리더 화면|서브리더/멤버 화면|

워크스페이스 멤버를 관리할 수 있는 페이지 입니다.
  - 친구목록, 이메일 링크를 통해 멤버를 초대할 수 있음
  - 이메일 링크 초대는 회원일 경우 만료되지않은 링크를 클릭 할 경우 워크스페이스 멤버로 가입되고
  - 비회원일 경우 회원가입 페이지로 링크가 전송되고 회원가입 완료 시점에 워크스페이스 멤버로 가입됨
  - 리더는 1명만 가능하며, 리더일 경우에만 초대나 멤버 관리 화면이 보임

---

### 채팅페이지
|![image](https://github.com/user-attachments/assets/6b431f62-5b00-4462-b465-a350278dde4a)|![image](https://github.com/user-attachments/assets/dd838ff6-d801-40c5-aded-5864bc224934)|
|:---:|:---:|
|채팅목록|채팅방|

Websocket과 Stomp를 활용해 1:N 채팅 기능을 제공하는 실시간 소통을 위한 채팅 페이지입니다. 

- 채팅목록<br>
  참여 채팅 목록 및 미확인 메시지 수, 채팅방 생성 버튼을 제공
  - 채팅목록 아이템 : 채팅방 이름 및 이미지/참여 멤버 수/미확인 메시지 수/마지막 메시지를 제공
  - 상단 총 메시지 알림 : 모든 채팅방의 총 미확인 메시지 수 제공
  - 채팅방 생성버튼: 개설할 채팅방 이미지와 이름, 참여 멤버 설정 가능
- 채팅방<br>
  특정 채팅방 정보 제공 및 소통 컴포넌트
  - 입력창 : 텍스트, 파일 전송 및 입력창 잠금, 멘션 기능 제공.
  - 채팅 메시지 : 무한 스크롤 제공. 각 메시지마다 답글/삭제/공지사항 지정 기능 제공. 메시지 미확인 멤버 정보 제공.
  - 채팅방 관리
    - **방장** 채팅방 정보 수정/참여 멤버 강퇴 및 초대/방장 위임
    - **멤버** 방 나가기
