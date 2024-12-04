package com.minglers.minglespace.common.service;

import com.minglers.minglespace.common.entity.Image;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ImageService {
    Image uploadImage(MultipartFile file) throws IOException;
    List<Image> uploadImages(List<MultipartFile> files) throws IOException;
    Image getImageById(Long id);
    void deleteImage(Long id);
}
