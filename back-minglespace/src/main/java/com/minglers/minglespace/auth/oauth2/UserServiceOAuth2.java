package com.minglers.minglespace.auth.oauth2;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.AuthException;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.Provider;
import com.minglers.minglespace.auth.type.WithdrawalType;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;

@Log4j2
@Service
@RequiredArgsConstructor
public class UserServiceOAuth2 extends DefaultOAuth2UserService {

  private final UserRepository userRepository;
  private final ImageService imageService;

  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

    OAuth2User oAuth2User = super.loadUser(userRequest);
    log.info("[MIRO] 소셜로부터 인증 정보가 왔어요.");

    // google
    {
      //log.info("[MIRO] loadUser oAuth2User : {}", oAuth2User);
      /**
       Name:
       [117687004761420672776],
       Granted Authorities: [[
       OAUTH2_USER,
       SCOPE_https://www.googleapis.com/auth/userinfo.email,
       SCOPE_https://www.googleapis.com/auth/userinfo.profile,
       SCOPE_openid]],
       User Attributes: [{
       sub=117687004761420672776,

       name=jay code,
       given_name=jay,
       family_name=code,
       picture=https://lh3.googleusercontent.com/a/ACg8ocJI-FlXTNwba09UGLzrYRIk0AiYy2FxW3yzB-YLbVRqIV8OHw=s96-c,
       email=codejay2018@gmail.com,

       email_verified=true
       }]
       **/
    }
    // naver
    {
      //log.info("[MIRO] loadUser oAuth2User : {}", oAuth2User);
      /**
      Name: [{
       id=_EUppVWBwjpGB3673g57YrtiIfZjFSl8IKCktlKacuI,
       profile_image=https://ssl.pstatic.net/static/pwe/address/img_profile.png,
       email=minglespace0@naver.com,
       mobile=010-7688-7221,
       mobile_e164=+821076887221,
       name=한형호}],
       Granted Authorities:
       [[OAUTH2_USER]],
       User Attributes: [{
       resultcode=00,
       message=success,
       response={
       id=_EUppVWBwjpGB3673g57YrtiIfZjFSl8IKCktlKacuI,
       profile_image=https://ssl.pstatic.net/static/pwe/address/img_profile.png,
       email=minglespace0@naver.com,
       mobile=010-7688-7221,
       mobile_e164=+821076887221,
       name=한형호}}]
      **/
    }
    // kakao
    {
      //log.info("[MIRO] loadUser oAuth2User : {}", oAuth2User);
      /**
       Name: [3837939843],
       Granted Authorities: [[OAUTH2_USER, SCOPE_account_email, SCOPE_profile_image, SCOPE_profile_nickname]],
       User Attributes: [{
       id=3837939843,
       connected_at=2024-12-17T03:50:51Z,
       properties={
       nickname=Mingler,
       profile_image=http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg,
       thumbnail_image=http://img1.kakaocdn.net/thumb/R110x110.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg
       },
       kakao_account={
       profile_nickname_needs_agreement=false,
       profile_image_needs_agreement=false,
       profile={

       nickname=Mingler,
       thumbnail_image_url=http://img1.kakaocdn.net/thumb/R110x110.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg,
       profile_image_url=http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg,

       is_default_image=true,
       is_default_nickname=false
       },
       has_email=true,
       email_needs_agreement=false,
       is_email_valid=true,
       is_email_verified=true,

       email=minglespace0@kakao.com

       }}]
       **/
    }

    String registrationId = userRequest.getClientRegistration().getRegistrationId();

    ResponseOAuth2 responseOAuth2 = null;

    if(registrationId.equals("naver")){
      responseOAuth2 = new ResponseOAuth2Naver(oAuth2User.getAttributes());
    }else if(registrationId.equals("google")){
      responseOAuth2 = new ResponseOAuth2Google(oAuth2User.getAttributes());
    }else if(registrationId.equals("kakao")){
      responseOAuth2 = new ResponseOAuth2Kakao(oAuth2User.getAttributes());
    }else{
      log.info("responseOAuth2 : {}", responseOAuth2.toString());
      return null;
    }

    Optional<User> userOpt = userRepository.findByEmail(responseOAuth2.getEmail());

    User user = null;

    if(userOpt.isPresent()){
      user = userOpt.get();
    }else{
      user = new User();
      user.setWithdrawalType(WithdrawalType.NOT);

      // 신규 소셜유저 비번은 필요없지만 에러방지 위해 넣어준다.
      user.setPassword("password");
      user.setRole("ROLE_USER");
    }

    // 1. 소셜 로그인 중인데, 자체계정의 유저가 찾아진 경우
    Provider provider = user.getProvider();
    if (provider != null && !provider.equals(responseOAuth2.getProvider())) {
      log.info("[MIRO] 이미 등록한 이메일(소셜 포함) 유저 입니다.");

      log.info("[MIRO] getEmail : {}", responseOAuth2.getEmail());
      log.info("[MIRO] getProvider 소셜 : {}", responseOAuth2.getProvider());
      log.info("[MIRO] getProvider DB : {}", user.getProvider());

      return new OAuth2UserMs(user, AuthStatus.AlreadyJoinedEmail);
    }

    // 소셜에서 받은 정보로 채움
    user.setName(responseOAuth2.getName());
    user.setEmail(responseOAuth2.getEmail());
    user.setPhone(responseOAuth2.getPhone());
    user.setProvider(responseOAuth2.getProvider());

    try {
      String profileImage = responseOAuth2.getProfileImage();
      if(profileImage != null && !profileImage.isEmpty()){
        Image saveFile = imageService.uploadImageFromUrl(profileImage);
        user.setImage(saveFile);
      }
    } catch (IOException | InterruptedException e) {
      throw new RuntimeException(e);
    }

    // userservice 사용하게 수정 필요
    // 디비 저장
    User userResult = userRepository.save(user);

    if (userResult.getId() > 0) {
      return new OAuth2UserMs(user, AuthStatus.Ok);
    }else{
      throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "회원 가입 실패.");
    }

  }
}
