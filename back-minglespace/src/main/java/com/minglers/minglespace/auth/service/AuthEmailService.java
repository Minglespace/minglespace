package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.common.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.CompletableFuture;

@Log4j2
@Service
public class AuthEmailService extends EmailService {

  private final UserRepository usersRepo;

  public AuthEmailService(JavaMailSender mailSender, UserRepository usersRepo) {
    super(mailSender);
      this.usersRepo = usersRepo;
  }

  @Async
  public CompletableFuture<String> sendEmail(String code, String to, HttpServletRequest request) {
    try {

      String base = getBaseUrl(request);
//      String uri = "/auth/verify";
      String uri = "/auth/login";
      String encodedCode = "/" + code; // 암호화 필요
      String encodedEmail = "/" + Base64.getEncoder().encodeToString(to.getBytes(StandardCharsets.UTF_8));

      // 이메일 인증 내용
      String subject = "Mingle Space Email Verification";
      String confirmationUrl = base + uri + encodedCode + encodedEmail;

      // HTML로 꾸민 이메일 내용
      String emailContent = "<html>"
              + "<body style='font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333;'>"
              + "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px;'>"
              + "<h2 style='color: #4CAF50;'>Mingle Space Email Verification</h2>"
              + "<p>안녕하세요!<br> 이메일 인증을 완료하려면 아래 버튼을 클릭하세요:</p>"
              + "<a href='" + confirmationUrl + "' style='display: inline-block; margin: 15px 15px; padding: 15px 15px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;'>이메일 인증하기</a>"
              + "<p style='margin-top: 20px;'>혹은 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>"
              + "<p><a href='" + confirmationUrl + "' style='color: #1E88E5;'>" + confirmationUrl + "</a></p>"
              + "<p style='margin-top: 30px;'>감사합니다,<br>Team Mingle Space</p>"
              + "</div>"
              + "</body>"
              + "</html>";

      // 이메일 인증 링크 발송
      send(to, subject, emailContent);

      // for delay test
      //Thread.sleep(2000);
    } catch (MessagingException e) {
      e.printStackTrace();
    }

    return CompletableFuture.completedFuture("비동기 이메일 완료 sendEmail");
  }

  public DefaultResponse verify(String code, String encodedEmail) {

    DefaultResponse res = new DefaultResponse();

    try {

      // 이메일 디코딩
      String email = new String(Base64.getDecoder().decode(encodedEmail), StandardCharsets.UTF_8);

      // 유저 정보
      User user = usersRepo.findByEmail(email).orElseThrow();

      String storedCode = user.getVerificationCode();

      if(storedCode.isEmpty()){
        res.setStatus(HttpStatus.ALREADY_REPORTED);
        res.setMsg("이미 유저 이메일 인증 성공 : " + user.getEmail());
      }else if(user.getVerificationCode().equals(code)){
        user.setVerificationCode("");
        usersRepo.save(user);
        res.setStatus(HttpStatus.OK);
        res.setMsg("유저 이메일 인증 성공 : " + user.getEmail());
      }else{
        res.setStatus(HttpStatus.NOT_FOUND);
        res.setMsg("유저 이메일 인증 실패 : " + user.getEmail());
      }

    } catch (Exception e) {
      res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
      res.setMsg("서버 오류");
    }

    log.info("");
    log.info("");
    log.info("verify");
    log.info(res.toString());
    log.info("");
    log.info("");

    return res;

  }

}




