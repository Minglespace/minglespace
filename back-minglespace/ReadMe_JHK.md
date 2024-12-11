
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

카카오
네이버
구으글
```