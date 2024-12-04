package com.minglers.minglespace.common.service;

import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.repository.ImageRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ImageServiceImpl implements ImageService{
    private final ImageRepository imageRepository;

    @Value("${org.zerock.upload.path}")
    private String uploadPath;

    //폴더 없으면 생성
    @PostConstruct
    public void init(){
        File tempFolder = new File(uploadPath);

        if (!tempFolder.exists()){
            boolean folderCreated = tempFolder.mkdirs();
            if (folderCreated){
                System.out.println("upload folder created at: "+ tempFolder.getAbsolutePath());
            }else{
                System.out.println("failed to create upload folder at: "+tempFolder.getAbsolutePath());
            }
        }

        System.out.println("upload path: "+ tempFolder.getAbsolutePath());
        uploadPath = tempFolder.getAbsolutePath();
    }

    //단일 파일 처리
    @Override
    public Image uploadImage(MultipartFile file) throws IOException {
        // 파일 이름
        String originalName = file.getOriginalFilename();
        log.info("uploadImage_originFilename: "+ originalName);

        // 서버에 저장할 파일 이름 _ 중복 방지
        String updatedName = System.currentTimeMillis() + "_" + originalName;
        log.info("uploadImage_renameFilename : "+ updatedName);

        // 파일 저장 경로
        String localPath = uploadPath + File.separator + updatedName;
        String uriPath = "/images/" + updatedName;  // 클라이언트에서 파일을 불러올 때 URI 경로

        // 로컬에 파일 저장
        File destFile = new File(localPath); //실제 저장할 파일 객체
        file.transferTo(destFile); //업로드 file에서 데이터 추출해 destFile에 저장

        // Image 엔티티 생성
        Image image = new Image();
        image.setOriginalname(originalName);
        image.setUpdatename(updatedName);
        image.setLocalpath(localPath);
        image.setUripath(uriPath);

        // 이미지 정보를 DB에 저장
        return imageRepository.save(image);
    }


    //여러 파일 처리 - test 필요
    @Override
    public List<Image> uploadImages(List<MultipartFile> files) throws IOException{
        List<Image> imageList = new ArrayList<>();

        for (MultipartFile file : files){
            imageList.add(uploadImage(file));
        }

        return imageList;
    }


    // 파일 조회 (Read)
    @Override
    public Image getImageById(Long id) {
        return imageRepository.findById(id).orElse(null);
    }

    // 파일 삭제 (Delete) - test 필요
    @Override
    public void deleteImage(Long id) {
        Image image = getImageById(id);
        if (image != null) {
            File file = new File(image.getLocalpath());
            if (file.exists()) {
                file.delete();
            }
            imageRepository.delete(image);
        }
    }
}
