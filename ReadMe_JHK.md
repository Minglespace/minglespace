
# Signup
- /auth/signup

done
```bazaar
1. api
2. ui 기본
```
todo
```bazaar
1. 유효성 검사 코드 테스트 해야한다.
2. inline css -> scss로 변경 필요
3. 이메일 인증 처리
```
---
# Login
- /auth/login

done
```bazaar
1. api
2. ui 기본
```
todo
```bazaar
1. 유효성 검사 코드 테스트 해야한다.
2. LoginPage.css 파일 -> scss로 작업해야 한다.
```
---
# Logout
- /auth/logout

done
```bazaar
1. 현재 로그아웃 버튼
```
todo
```bazaar
추후 회원정보창이 완료되면, 흡수 작업 필요
```
---
# Token
- accesstoken은 관리하지 않는다
- 로그아웃시 refreshtoken을 블랙리스트에 넣는다
- 탈취한 토큰으로 accesstoken 재발급 시도시 블랙리스트에서 체크하여 거부한다.
- 일정주기로 서버에서 만료시간이 지난 refreshtoken을 제거한다.

done
```bazaar
1. 블랙리스트 코드 테스트 완료
```
todo
```bazaar
1. refresh token을 httponly 쿠키에서 관리 할지
2. 블랙리스트 서버를 현재 rdb이다. 추천은 redis이다 적용할지
```
---

# 회원정보
- email,
- image_id,
- introduction,
- name,
- password,
- phone,
- position,

todo
```bazaar
UI
    유저 정보 표시 및 변경 기능
    유저 탈퇴 기능
    로그 아웃 버튼 여기로 이동
```
# front-end Api 구조

- Api.js 고통 모듈 제공

    - access, refresh 토큰 관련 작업


- 컨텐츠 마다 Api사용해서 패킷 서비스 만듬

    - AuthApi.js
    - WorkspaceApi.js


- 사용

    - AuthApi.login()
    - WorkspaceApi.getList()

---
# OAuth2
```angular2html

카카오
네이버
구으글
```
