package com.minglers.minglespace.auth.security;

import com.minglers.minglespace.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Log4j2
@Component
public class JWTUtils {


    private final SecretKey secretKey;

    // ACCESS TOKEN 만료시간
    public static final long EXPIRATION_ACCESS = 60 * 60 * 1000;           // 60 분

    // REFRESH TOKEN 만료시간
    public static final long EXPIRATION_REFRESH = 6 * 60 * 60 * 1000;       // 6 시간

    // 주기적으로 만료된 토큰을 삭제하는 메서드
    public static final long BLACKLIST_UPDATE_TIME = 60 * 60 * 1000;        // 1 시간


    public static final String ACCESS_TOKEN = "accessToken";
    public static final String REFRESH_TOKEN = "refreshToken";


    public JWTUtils(@Value("${spring.jwt.secret}") String secreteString) {
        //log.info("[MIRO] JWT secret 로드 : {}", secreteString);
        this.secretKey = new SecretKeySpec(
                secreteString.getBytes(StandardCharsets.UTF_8),
                Jwts.SIG.HS256.key().build().getAlgorithm());
    }

    public String geneTokenAccess(User user){
        return geneToken(user, ACCESS_TOKEN, EXPIRATION_ACCESS);
    }

    public String geneTokenRefresh(User user){
        return geneToken(user, REFRESH_TOKEN, EXPIRATION_REFRESH);
    }

    private String geneToken(User user, String type, Long expiration){
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("type",type)
                .claim("userId",user.getId())
                .claim("role", user.getRole())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    public Long extractUserId(String token) { return extractClaims(token, claims -> claims.get("userId", Long.class));}


    private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction) {
        return claimsTFunction.apply(Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public LocalDateTime extractExpiration(String token) {
        Date expirationDate = extractClaims(token, Claims::getExpiration);

        return expirationDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token, Claims::getExpiration).before(new Date());
    }

}
