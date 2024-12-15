package com.minglers.minglespace.auth.oauth2;

import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.AuthException;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.service.AuthEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Log4j2
@Service
@RequiredArgsConstructor
public class UserServiceOAuth2 extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final AuthEmailService authEmailService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        log.info("[MIRO] 소셜로부터 인증 정보가 왔어요.");
        log.info("[MIRO] loadUser oAuth2User : {}", oAuth2User.getName());
        // 구글 정보
        //[MIRO] loadUser oAuth2User :
        // Name: [117687004761420672776],
        // Granted Authorities: [[
        // OAUTH2_USER,
        // SCOPE_https://www.googleapis.com/auth/userinfo.email,
        // SCOPE_https://www.googleapis.com/auth/userinfo.profile,
        // SCOPE_openid]],
        // User Attributes: [{
        // sub=117687004761420672776,
        // name=jay code,
        // given_name=jay,
        // family_name=code,
        // picture=https://lh3.googleusercontent.com/a/ACg8ocJI-FlXTNwba09UGLzrYRIk0AiYy2FxW3yzB-YLbVRqIV8OHw=s96-c,
        // email=codejay2018@gmail.com,
        // email_verified=true}]

        // 네이버 정보
        //[{
        // id=_EUppVWBwjpGB3673g57YrtiIfZjFSl8IKCktlKacuI,
        // email=minglespace0@naver.com,
        // mobile=010-7688-xxxx,
        // mobile_e164=+82107688xxxx,
        // name=한형호}],
        // Granted Authorities: [[OAUTH2_USER]],
        // User Attributes: [{
        // resultcode=00,
        // message=success,
        // response={
        // id=_EUppVWBwjpGB3673g57YrtiIfZjFSl8IKCktlKacuI,
        // email=minglespace0@naver.com,
        // mobile=010-7688-xxxx,
        // mobile_e164=+82107688xxxx,
        // name=한형호}}]


        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        ResponseOAuth2 responseOAuth2 = null;

        if(registrationId.equals("naver")){
            responseOAuth2 = new ResponseOAuth2Naver(oAuth2User.getAttributes());
        }else
        if(registrationId.equals("google")){
            responseOAuth2 = new ResponseOAuth2Google(oAuth2User.getAttributes());
        }else
        if(registrationId.equals("kakao")){
            responseOAuth2 = new ResponseOAuth2Kakao(oAuth2User.getAttributes());
        }
        else{
            return null;
        }

        Optional<User> userOpt = userRepository.findByEmail(responseOAuth2.getEmail());

        if (userOpt.isPresent()) {
            log.info("[MIRO] 기존 유저 입니다.");
            log.info("[MIRO] 유저 정보 갱신 필요.");

            return new OAuth2UserMs(userOpt.get());
        }else{

            log.info("[MIRO] 신규 유저 입니다.");

            User user = new User();

            // 소셜에서 받은 정보로 채움
            user.setName(responseOAuth2.getName());
            user.setEmail(responseOAuth2.getEmail());
            user.setPhone(responseOAuth2.getPhone());
            user.setProvider(responseOAuth2.getProvider());

            // 소셜유저 비번은 필요없지만 에러방지 위해 넣어준다.
            user.setPassword("password");
            user.setRole("ROLE_USER");
            user.setIntroduction("");
            user.setPosition("");

            // 디비 저장
            User userResult = userRepository.save(user);

            if (userResult.getId() > 0) {
                return new OAuth2UserMs(user);
            }else{
                throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "회원 가입 실패.");
            }
        }
    }
}
