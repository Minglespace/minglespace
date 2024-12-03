package com.minglers.minglespace.common.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "image")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalname;  //원본 파일이름
    private String updatename; //수정 파일이름
    private String localpath;  // 로컬경로(수정 삭제시 실제 저장되는 경로)
    private String uripath;  // 파일 불러올때 src에 사용하는 경로


}
