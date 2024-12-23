
# Spring Boot Security & JWT
- id 'org.springframework.boot' version '3.4.0'
- implementation 'org.springframework.boot:spring-boot-starter-security'
- testImplementation 'org.springframework.security:spring-security-test'
- runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.5'
- implementation 'io.jsonwebtoken:jjwt-api:0.12.5'
- runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.5'
- 
- JWT에서 accesstoken, refreshtoken 발급해서 운영한다.
- accesstoken은 만료시간을 짧게 가져가서 블랙리스트에서 관리하지 않는다
- 로그아웃시 refreshtoken을 블랙리스트에 넣는다
- 탈취한 토큰으로 accesstoken 재발급 시도시 블랙리스트에서 체크하여 거부한다.
- 일정주기로 서버에서 만료시간이 지난 refreshtoken을 제거한다.

```bazaar
1. 블랙리스트 코드 - 완료
1. refresh token을 httponly 쿠키에서 관리 할지 고민중
2. 블랙리스트 서버를 현재 rdb이다. 추천은 redis이다 적용할지
```
---

# Signup - 완료
- react : /auth/signup
- rest : /api/auth/signup <- 예정 

```bazaar
1. api - 완료
2. ui 기본 - 완료
3. 유효성 검사 코드 테스트 해야 예정
4. inline css -> scss로 변경 예정

```

### 5.1 이메일 인증 - 완료

- Flow
  - a. 회원가입시 인증코드를 발급해서 User 테이블에 등록한다. - 완료
    - User 테이블에 인증코드 등록 - 완료 
    - a.1. 링크 형식
      - 폼 : base-url/auth/verify/code/email 
      - 예 : http://localhost:3000/auth/verify/asdf1234/asdf@asdf.com
      - 위 형식을 암호화 처리함
        - http://localhost:3000/auth/verify/asdf1234/234u12o1o2i34p
    - base url - react 주소 사용중
      - 현재 : http://localhost:3000 사용
      - 원서버 방식으로 정해지면, 서버 주소로 변경되어야 함
        - http://localhost:8080
        - 이때, react와 rest의 url충돌 이슈를 처리해야 함.
          - react : http://localhost:3000/**
          - rest : http://localhost:8080/api/**
  - b. 회원가입 응답으로 유저에게 이메일 인증후에 가입완료 됨을 공지한다 - 완료
    - 이메일 확인 팝업 공지하고, 로그인으로 이동 - 완료
    - 이메일 발송의로 응답시간인 길어지는 이슈 - 완료
      - 이메일 발송을 비동기 처리한다.
  - c. 로그인시도시 이메일 인증을 완료하라고 공지한다.
  - d. 이메일 인증 이메일 클릭시
    - d.1. User 테이블에 인증코드가 등록되어있다면
      - d.1.1. 인증코드를 지우고 로그인 페이지로 이동후 가입완료 메시지 처리
      - alert으로 공지하고 추후 공통 팝업으로 대체한다.
    - d.2. 없다면,
      - d.2.1. 로그인 페이지로 이동후, 이미 인증완료 되었다고 메시지 처리
      - alert으로 공지하고 추후 공통 팝업으로 대체한다.
  - e. 로그인 시
    - e.1. 해당 유저의 인증코드가 있다면, 
      - c.처리를 한다.
      - alert으로 공지하고 추후 공통 팝업으로 대체한다.
    - e.2. 없다면, 로그인 정상 로직을 실행

---
# Login - 완료
- react : /auth/login
- rest : /api/auth/login

```bazaar
1. api - 완료
2. ui 기본 - 완료
3. 유효성 검사 코드 테스트 해야 예정 
4. LoginPage.css 파일 -> scss로 작업 예정
```
---
# Logout - 완료
- react : /auth/logout
- rest : /api/auth/logout

```bazaar
1. 현재 로그아웃 버튼 - 완료
2. 추후 회원정보 (팝업 및 수정 창) 예정 : 완료되면, 흡수 작업 필요
```
---

# 회원정보 (팝업 및 수정 창) - 완료
- UserInfoPopup.js
- 유저 프로필 사진 등록 기능(디폴트 : 첫글자)
- 이메일 변경은 미지원 : 추후 논의 필요
- 회원 탈퇴 미지원 : 추후 논의 필요
---
# REACT Api 구조 변경 - 완료

- Api.js 고통 모듈 제공

    - access, refresh 토큰 관련 작업


- 컨텐츠 마다 Api사용해서 패킷 서비스 만듬

    - AuthApi.js
    - WorkspaceApi.js


- 사용

    - AuthApi.login()
    - WorkspaceApi.getList()

---

# 로그인 상태에 따라 접근 가능한 페이지 처리 - 완료
- React 에서  PrivateRoute 추가하여 로그이 여부 판단
  - 로그인 : 해당 페이지 사용
  - 비로그인 : 로그인 페이지 이동
- 코드
  ```js
  const PrivateRoute = ({children}) => {
  
    const isAuthenticated  = Repo.isAuthenticated();
    const navigate = useNavigate();
  
    useEffect(()=>{
      if(!isAuthenticated){
        navigate("/auth/login");
      } 
    },[]);
  
    if(isAuthenticated){
      return children;
    }else{
      return <>Loading...</>
    }
  }
  ```
  ```js
  const SuspenseWithPrivateRoute = ({ page: Page }) => {
    return (
      <Suspense fallback={Loading}>
        <PrivateRoute>
          <Page/>
        </PrivateRoute>
      </Suspense>
    )
  }
  ```
- 호출

  ```js
  {
    path: "/workspace/:workspaceId/chat",
    element: (<SuspenseWithPrivateRoute page={Chat}/>)
  },
  {
    path: "/auth/login",
    element: (<Suspense fallback={Loading}><Login /></Suspense>)
  },  
  ```
---
# OAuth2
```angular2html
Google - 완료
Naver - 완료
Kakao - 완료
```
### 처리 1 - application.properties에 비번이 있으면, github애 push error 
* 파일 분리하고, 비빈관련 파일은 .ignore에 등록한다.
* 개발중 이면
* application.properties <- develop 선택
* application-develop.properties <- 기본 설정이 있다
* application-develop-auth.properties <- 비빈등이 있다
* 서비스 시점이 되면 
* application.properties <- sevice 선택
* application-sevice.properties <- 기본 설정이 있다
* application-sevice-auth.properties <- 비빈등이 있다

### 이슈 1
* 회원가입시 다른 플렛폼(소셜 -> 자체)의 이메일이 중복할경우 어떻게 할 것인가.
* 가입을 거부(Join하지 않고)하게 처리했다.
### 이슈 2
* 브라우저에 이미 로그인 되어 있는 경우, 해당 계정으로만 로그인 된다.
* 다른 계정으로 로그인 하고 싶은경우, 브라우저에서 로그아웃한 상태로 소셜로그인을 시도해야 한다.
* ? 브라우저에 로그인 되어있어도, 어떤계정을 사용할지 선택할 수 있나 ?
---
# 회원탈퇴
### FLOW
```angular2html
1. UserInfoPopup창에서 회원 탈퇴 버튼을 통해 진행한다.
1.1. 초기값은 User.withdrawalType : withdrawalType.NOT
1.2. Withdrawal table에 등록한다.
1.2.1. Withdrawal 신청일
 
2. 회원탈퇴 신청창을 띄워 진행한다.
2.1. 회원탈퇴 신청창
2.1.1. 신청은 이메일 인증을 통해 완료된다.
2.1.2. 신청시에 공지후 로그아웃 처리한다.
2.1.2.1. 공지 : 일정기간이 지나기 전에는 탈퇴 신청을 취소 할 수 있다. 
2.1.2.2. 공지 : 이메일 인증을 통해서 회원탈퇴 페이지로 이동 한다.
2.1.3. User.withdrawalType 변경 : withdrawalType.EMAIL
2.1.4. withdrawal table에 등록 : userId, email, verifyCode, regDate
2.2. 패킷 : /auth/withdrawal/인증타입/인증코드
2.3. 신청이후 이메일 인증 없이 로그인시 
2.3.1. 회원 탈퇴 페이지로 이동
2.3.2. 탈퇴 신청, 즉시 탈퇴 버튼들을 비활성화 한다.
2.3.3. 이메일 인증 완료해야 활성화 된다는 공지 해야한다.
2.3.4. 이메일 인증 코드 재전송 버튼을 보여준다.  

3. 이메일 인증
3.1. 이메일 인증 링크를 통해 로그인 하면, 회원탈퇴 페이지로 이동한다.
3.2.1. User.withdrawalType 변경 : withdrawalType.ABLE
3.2.1. 회원탈퇴 페이지
3.2.1.1. 회원 정보(사진, 이름, 이메일, 직책)
3.2.1.2. 회원 탈퇴 신청일
3.2.1.3. 회원 탈퇴 완료일
3.2.1.4. 버튼 
3.2.1.4.1. 탈퇴 신청
3.2.1.4.2. 즉시 탈퇴
3.2.1.4.3. 탈퇴 취소

4. 탈퇴 신청
4.1. User.withdrawalType 변경 : withdrawalType.DELIVERATION
4.1.1 Withdrawal table : 만료일 등록
4.2. 로그아웃 시킴
4.3. 이후 로그인시 강재로 회원탈퇴 페이지로 이동
4.4. 만료시간 체크방식을 고민해봐야 한다.
4.4.1. 서버 재기동시
4.4.2. 유저가 로그인 시도시
4.4.3. DB예서 타이머 이벤트?

5. 즉시 탈퇴
5.1. 탈퇴 처리 후 로그아웃 처리한다.
5.2. 이후 로그인시 신규유저로 처리된다.

6. 탈퇴 취소
6.1. User.withdrawalType 변경 : withdrawalType.NOT
6.2. 로그아웃 시킴

7. 탈퇴 처리
7.1. 해당 유저의 User.email을 변경 : email@eamil.com.탈퇴처리일
7.1.1. 해당 이메일로 재가입을 가능하게 하기 위한 처리이다.
7.2. 해당 유저의 User.withdrawalType 변경 : withdrawalType.DONE
```

### TABLE
```bazaar
Withdrawal 
id,
userId,
email,
verifyCode,
regDate,
expireDate, 
cancelDate,
```
### 논의
1. 탈퇴를 진행중인 유저, 탈퇴완료한 유저는 다른 유저에게 어떻게 보여지나?
