package com.minglers.minglespace.chat.repository.specification;

import com.minglers.minglespace.chat.entity.ChatMessage;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
//동적 쿼리 생성하는 클래스.
public class ChatMessageSpecification {

  //ChatMessage엔티티에서 chatRoomId를 비교해 일치하는 레코드를 조회하는 조건 생성
  public static Specification<ChatMessage> hasChatRoomId(Long chatRoomId){
    //(쿼리 기준 엔티티, 쿼리 정렬/조건/그룹화 설정 등, 조건 생성 객체)
    return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("chatRoom").get("id"), chatRoomId);
  }

  public static Specification<ChatMessage> contentContainKeywords(List<String> keywords){
    return ((root, query, criteriaBuilder) -> {
      //기본적으로 and 연결 조건 생성. Predicate: 쿼리 조건 담아 실행 가능한 상태 객체
      Predicate combinedPredicate = criteriaBuilder.conjunction();
      for (String keyword: keywords){
        combinedPredicate = criteriaBuilder.and(combinedPredicate, criteriaBuilder.like(root.get("content"), "%"+keyword+"%"));
      }
      return combinedPredicate;
    });
  }
}
