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

로그인 회원가입에 대한 설명이 기술되는 줄
- JWT<br>
  JWT는 000기술 구현
- OAuth2.0<br>
  OAuth2.0은 000기술 구현

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
