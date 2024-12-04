package com.minglers.minglespace.common.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.net.URLConnection;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/images")
public class ImageController {

    //클라이언트에서 통하는 이미지 경로.
    //고민 > chatRoom, user, message에 활용되는 메시지를 구분하려면 service에서 저장할 때 uripath 처리를 수정해야함
    @GetMapping("/{imageName}")
    public ResponseEntity<Resource> getImage(@PathVariable String imageName) {
        // 파일이 저장된 경로
        Path path = Paths.get("upload/" + imageName);

        try {
            // 이미지 파일 로드
            Resource resource = new UrlResource(path.toUri());

            //파일 MIME 타입 추측
            String mimeType = URLConnection.guessContentTypeFromName(imageName);

            if (mimeType == null) {
                // MIME 타입이 추측되지 않으면 기본 이미지 MIME 타입을 사용
                mimeType = "application/octet-stream";
            }

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(mimeType)) // 또는 적절한 이미지 타입으로 설정
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
