package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.VerifyType;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.CompletableFuture;

@Log4j2
@Service
public class AuthEmailService extends EmailService {
  public AuthEmailService(JavaMailSender mailSender) {
    super(mailSender);
  }

//  private final UserRepository usersRepo;

//  public AuthEmailService(JavaMailSender mailSender, UserRepository usersRepo) {
//    super(mailSender);
//      this.usersRepo = usersRepo;
//  }

//  public DefaultResponse verify(String code, String encodedEmail) {
//
//    DefaultResponse res = new DefaultResponse();
//
//    try {
//      String email = new String(Base64.getDecoder().decode(encodedEmail), StandardCharsets.UTF_8);
//      User user = usersRepo.findByEmail(email).orElseThrow();
//      String storedCode = user.getVerificationCode();
//
//      if(storedCode.isEmpty()){
//        res.setStatus(AuthStatus.EmailVerificationAlready);
//      }else if(storedCode.equals(code)){
//        user.setVerificationCode("");
//        usersRepo.save(user);
//        res.setStatus(AuthStatus.Ok);
//      }else{
//        res.setStatus(AuthStatus.EmailVerificationCodeMismatch);
//      }
//    } catch (Exception e) {
//      res.setStatus(AuthStatus.Exception);
//    }
//
//    return res;
//  }



  public DefaultResponse checkVerifyCode(User user, String code) {

    DefaultResponse res = new DefaultResponse();

    String storedCode = user.getVerificationCode();
    if(storedCode.isEmpty()){
      res.setStatus(AuthStatus.EmailVerificationAlready);
    }else if(storedCode.equals(code)){
//      user.setVerificationCode("");
//      usersRepo.save(user);
      res.setStatus(AuthStatus.Ok);
    }else{
      res.setStatus(AuthStatus.EmailVerificationCodeMismatch);
    }

    return res;
  }

  private String geneEmailContent(String btnName, String msg, String confirmationUrl, String color){
    return "<html>"
      + "<body style='font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333;'>"
      + "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px;'>"
      + "<h2 style='color: " + color + ";'>Mingle Space Email Verification</h2>"
      + "<p>안녕하세요!<br> " + msg + "</p>"
      + "<a href='" + confirmationUrl + "' style='display: inline-block; margin: 15px 15px; padding: 15px 15px; font-size: 16px; color: #fff; background-color: " + color + "; text-decoration: none; border-radius: 5px;'>" + btnName + "</a>"
      + "<p style='margin-top: 20px;'>혹은 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>"
      + "<p><a href='" + confirmationUrl + "' style='color: #1E88E5;'>" + confirmationUrl + "</a></p>"
      + "<p style='margin-top: 30px;'>감사합니다,<br>Team Mingle Space</p>"
      + "</div>"
      + "</body>"
      + "</html>";
  }

  private String makeURL(String code, String to, VerifyType verifyType, HttpServletRequest request){
    String base = getBaseUrl(request);
    String uri = "/auth/login";
    String encodedCode = "/" + code;
    String encodedEmail = "/" + Base64.getEncoder().encodeToString(to.getBytes(StandardCharsets.UTF_8));
    String encodedVerifyType = "/" + Base64.getEncoder().encodeToString(verifyType.name().getBytes(StandardCharsets.UTF_8));

    return base + uri + encodedCode + encodedEmail + encodedVerifyType;
  }

  @Async
  public CompletableFuture<String> sendWithdrawal(String code, String to, HttpServletRequest request) {
    try {
      String confirmationUrl = makeURL(code, to, VerifyType.WITHDRAWAL, request);
      String subject = "Mingle Space Email Verification";
      String emailContent = geneEmailContent(
              "회원 탈퇴 이메일 인증하기",
              "회원탈퇴 이메일 인증을 완료하려면 아래 버튼을 클릭하세요:",
              confirmationUrl,
              "#f20306");

      send(to, subject, emailContent);

      log.info("confirmationUrl : {}", confirmationUrl);

    } catch (MessagingException e) {
      e.printStackTrace();
    }

    return CompletableFuture.completedFuture("비동기 회원탈퇴 이메일 완료 sendWithdrawal");
  }

  @Async
  public CompletableFuture<String> sendEmail(String code, String to, HttpServletRequest request) {
    try {
      String confirmationUrl = makeURL(code, to, VerifyType.SIGNUP, request);
      String subject = "Mingle Space Email Verification";
      String emailContent = geneEmailContent(
              "이메일 인증하기",
              "이메일 인증을 완료하려면 아래 버튼을 클릭하세요:",
              confirmationUrl,
              "#4CAF50");

      send(to, subject, emailContent);

      log.info("confirmationUrl : {}", confirmationUrl);

    } catch (MessagingException e) {
      e.printStackTrace();
    }

    return CompletableFuture.completedFuture("비동기 이메일 완료 sendEmail");
  }


}




