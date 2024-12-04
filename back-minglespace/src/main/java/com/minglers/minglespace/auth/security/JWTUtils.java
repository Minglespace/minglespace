package com.minglers.minglespace.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
public class JWTUtils {

    private final SecretKey Key;

    // ACCESS TOKEN 만료시간
    private static final long EXPIRATION_TIME_A = 60 * 60 * 1000;           // 60 분
    //private static final long EXPIRATION_TIME_A = 1 * 60 * 1000;            // 5 분 for test

    // REFRESH TOKEN 만료시간
    private static final long EXPIRATION_TIME_R = 6 * 60 * 60 * 1000;       // 6 시간
    //public static final long EXPIRATION_TIME_R = 5 * 60 * 1000;             // 10 분 for test

    // 주기적으로 만료된 토큰을 삭제하는 메서드
    public static final long BLACKLIST_UPDATE_TIME = 60 * 60 * 1000;        // 1 시간
    //public static final long BLACKLIST_UPDATE_TIME = 2 * 60 * 1000;         // 3 분 for test


    public JWTUtils() {
        String secreteString = "843567893696976453275974432697R634976R738467TR678T34865R6834R8763T478378637664538745673865783678548735687R3";
//        String secreteString = "gw0U1UG3gIeaFthTwc4gyxgrFa7ZD8ci";
        byte[] keyBytes = Base64.getDecoder().decode(secreteString.getBytes(StandardCharsets.UTF_8));
        this.Key = new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_A))
                .signWith(Key)
                .compact();
    }

    public String generateRefreshToken(Map<String, Object> claims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_R))
                .signWith(Key)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction) {
        return claimsTFunction.apply(Jwts.parser().verifyWith(Key).build().parseSignedClaims(token).getPayload());
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
