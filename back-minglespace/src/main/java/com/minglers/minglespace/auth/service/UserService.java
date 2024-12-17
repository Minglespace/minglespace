package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.AuthException;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.util.CookieManager;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.hibernate.PropertyValueException;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.Optional;

@Log4j2
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository usersRepo;
    private final JWTUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;
    private final ModelMapper modelMapper;

    public DefaultResponse signup(SignupRequest req) {
        try {
            // 이메일 중복 확인
            if (usersRepo.existsByEmail(req.getEmail())) {
                throw new AuthException(HttpStatus.BAD_REQUEST.value(), "이미 존재하는 이메일입니다.");
            }else{
                User user = new User();

                // 회원 가입 세팅
                modelMapper.map(req, user);
                user.setPassword(passwordEncoder.encode(req.getPassword()));
                user.setRole(req.getRole());
                user.setProvider("minglespace");

                // 디비 저장
                User userResult = usersRepo.save(user);

                if (userResult.getId() > 0) {
                    DefaultResponse res = new DefaultResponse();
                    res.setStatus(HttpStatus.OK);
                    res.setMsg("회원 가입 성공 : " + userResult.getEmail());
                    return res;
                }else{
                    throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "회원 가입 실패.");
                }
            }

        }catch (DataIntegrityViolationException e) {
            // 데이터 무결성 위반 예외 처리 (예: not-null 필드가 null인 경우)
            if (e.getCause() instanceof PropertyValueException) {
                PropertyValueException cause = (PropertyValueException) e.getCause();
                String message = cause.getMessage();

                // "not-null" 제약 조건 위반 메시지를 찾음
                if (message != null && message.contains("not-null property references a null or transient value")) {
                    // 예외 메시지에서 필드 이름을 추출 (예: "com.minglers.minglespace.auth.entity.User.role"에서 "role" 추출)
                    String fieldName = message.substring(message.lastIndexOf('.') + 1);
                    throw new AuthException(HttpStatus.BAD_REQUEST.value(), fieldName + " 필드는 반드시 지정되어야 합니다.");
                } else {
                    // 그 외 데이터 무결성 위반 예외 처리
                    throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "데이터베이스 오류가 발생했습니다.");
                }
            } else {
                // DataIntegrityViolationException 발생 시 다른 경우 처리
                throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "데이터 무결성 오류가 발생했습니다.");
            }
        } catch (Exception e) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "회원 가입 중 예기치 못한 오류가 발생했습니다.");
        }
    }

    public LoginResponse login(LoginRequest req, HttpServletResponse response) {

        LoginResponse res = new LoginResponse();

        try {

            // 인증 시도
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getEmail(),
                            req.getPassword())
            );

            // 유저 정보
            User user = usersRepo.findByEmail(req.getEmail()).orElseThrow();

            if(user.getVerificationCode().isEmpty()){
                // 토큰 생성
                String accessToken = jwtUtils.geneTokenAccess(user);
                String refreshToken = jwtUtils.geneTokenRefresh(user);

                // 응답 세팅
                modelMapper.map(user, res);

                // accessToken은 헤더에 넣어 준다.
                response.setHeader("Authorization", "Bearer " + accessToken);

                // refreshToken은 cookie에 넣어 준다.
                CookieManager.add(JWTUtils.REFRESH_TOKEN, refreshToken, JWTUtils.EXPIRATION_REFRESH, response);

                res.setStatus(HttpStatus.OK);
                res.setMsg("유저 로그인 성공 : " + user.getEmail());

                log.info("[MIRO] 유저 로그인 성공 accessToken : {}", accessToken);

            }else{
                res.setStatus(HttpStatus.TOO_EARLY);
                res.setMsg("먼저, 이메일 인증을 완료하세요.");
            }

        } catch (InternalAuthenticationServiceException e) {
            // 인증 서비스 예외 처리
            if (e.getCause() instanceof NoSuchElementException) {
                // 사용자가 존재하지 않는 경우
                res.setStatus(HttpStatus.NOT_FOUND); // 404 Not Found
                res.setMsg("사용자가 존재하지 않습니다.");
            } else {
                // 인증 서비스 내부 오류
                res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
                res.setMsg("인증 서비스 오류");
            }
        } catch (BadCredentialsException e) {
            // 잘못된 자격 증명 (비밀번호 틀림)
            res.setStatus(HttpStatus.UNAUTHORIZED); // 401 Unauthorized
            res.setMsg("비밀번호가 틀렸습니다.");
        } catch (Exception e) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "로그인 중 예기치 못한 오류가 발생했습니다.");
        }

        return res;
    }

//    public RefreshTokenResponse refreshToken(RefreshTokenRequest req, HttpServletResponse response) {
//
//        RefreshTokenResponse res = new RefreshTokenResponse();
//
//        try {
//            String refreshToken = req.getRefreshToken();
//
//            if(tokenBlacklistService.isBlacklisted(refreshToken)){
//                log.error("================================================");
//                log.error("어뷰저 딱걸림.");
//                throw new BadCredentialsException("UNAUTHORIZED 잘못된 자격 증명");
//            }
//
//            String ourEmail = jwtUtils.extractUsername(refreshToken);
//            Optional<User> opt = usersRepo.findByEmail(ourEmail);
//
//            if(opt.isPresent()){
//
//                User user = opt.get();
//
//                if (jwtUtils.isTokenValid(refreshToken, user)) {
//
//                    String newAccessToken = jwtUtils.geneTokenAccess(user);
//
//                    // accessToken은 헤더에 넣어 준다.
//                    response.setHeader("Authorization", "Bearer " + newAccessToken);
//                    //res.setAccessToken(newAccessToken);
//
//                    res.setStatus(HttpStatus.OK);
//                    res.setMsg("Refreshed Token 생성 성공");
//                }else{
//                    res.setStatus(HttpStatus.UNAUTHORIZED);  // 리프레시 토큰이 유효하지 않음
//                    res.setMsg("Invalid refresh token");
//                }
//
//            }else{
//                res.setStatus(HttpStatus.NOT_FOUND);
//            }
//
//        }catch (BadCredentialsException e){
//            res.setStatus(HttpStatus.UNAUTHORIZED);  // 리프레시 토큰이 유효하지 않음
//            res.setMsg("This token is on the blacklist");
//        }
//        catch (Exception e) {
//            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//            res.setMsg(e.getMessage());
//        }
//
//        log.info("");
//        log.info("");
//        log.info("refreshToken");
//        log.info(res.toString());
//        log.info("");
//        log.info("");
//
//        return res;
//    }

    public DefaultResponse deleteUser(Long userId) {

        DefaultResponse res = new DefaultResponse();

        try {
            Optional<User> opt = usersRepo.findById(userId);

            if (opt.isPresent()) {

                usersRepo.deleteById(userId);

                res.setStatus(HttpStatus.OK);
                res.setMsg("유저 삭제 성공 : " + userId);
            } else {
                res.setStatus(HttpStatus.NOT_FOUND);
                res.setMsg("User not found : " + userId);
            }
        } catch (Exception e) {
            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            res.setMsg("INTERNAL_SERVER_ERROR : " + userId);
        }

        log.info("");
        log.info("");
        log.info("deleteUser");
        log.info(res.toString());
        log.info("");
        log.info("");

        return res;
    }

    public UserResponse updateUser(User updateUser, Image image) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        Long userId = user.getId();

        return updateUser(userId, updateUser, image);
    }

    public UserResponse updateUser(Long userId, User updateUser, Image image) {

        UserResponse res = new UserResponse();

        try {
            Optional<User> userOptional = usersRepo.findById(userId);

            if (userOptional.isPresent()) {
                User existingUser = userOptional.get();

                modelMapper.map(updateUser, existingUser);

                if (updateUser.getPassword() != null && !updateUser.getPassword().isEmpty()) {
                    existingUser.setPassword(passwordEncoder.encode(updateUser.getPassword()));
                }

                existingUser.setImage(image);

                User savedUser = usersRepo.save(existingUser);

                modelMapper.map(savedUser, res);

                res.setStatus(HttpStatus.OK);
                res.setMsg("유저 정보 변경 성공 : " + savedUser.getId());
            } else {
                res.setStatus(HttpStatus.NOT_FOUND);
                res.setMsg("User not found : " + userId);
            }
        } catch (Exception e) {
            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            res.setMsg("INTERNAL_SERVER_ERROR : " + userId);
        }

        log.info("");
        log.info("");
        log.info("updateUser");
        log.info(res.toString());
        log.info("");
        log.info("");

        return res;
    }

    public User getUserById(Long id) {

        Optional<User> opt = usersRepo.findById(id);

        try {
            if (opt.isPresent()) {
                return opt.get();
            } else {
                throw new AuthException(HttpStatus.NOT_FOUND.value(), "유저를 찾을 수 없습니다");
            }
        }catch (Exception e){
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "예외 : 유저를 찾을 수 없습니다");
        }
    }

    public User getUserByEmail(String email) {

        Optional<User> opt = usersRepo.findByEmail(email);

        try {
            if (opt.isPresent()) {
                return opt.get();
            } else {
                throw new AuthException(HttpStatus.NOT_FOUND.value(), "유저를 찾을 수 없습니다");
            }
        }catch (Exception e){
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "예외 : 유저를 찾을 수 없습니다");
        }
    }

//    public UserResponse getUserById(Long id) {
//
//        UserResponse res = getUserResponse(usersRepo.findById(id));
//
//        log.info("");
//        log.info("");
//        log.info("getUserById");
//        log.info(res.toString());
//        log.info("");
//        log.info("");
//
//        return res;
//    }
//
//    public UserResponse getUserByEmail(String email) {
//
//        UserResponse res = getUserResponse(usersRepo.findByEmail(email));
//
//        log.info("");
//        log.info("");
//        log.info("getUserByEmail");
//        log.info(res.toString());
//        log.info("");
//        log.info("");
//
//        return res;
//    }

//    private UserResponse getUserResponse (Optional<User> optionalUser){
//
//        UserResponse res = new UserResponse();
//
//        try {
//
//            if (optionalUser.isPresent()) {
//
//                modelMapper.map(optionalUser.get(), res);
//
//                res.setStatus(HttpStatus.OK);
//                res.setMsg("유저 찾기 성공: " + res.getEmail());
//            } else {
//                res.setStatus(HttpStatus.NOT_FOUND);
//            }
//        }catch (Exception e){
//            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//
//        return res;
//    }
}
