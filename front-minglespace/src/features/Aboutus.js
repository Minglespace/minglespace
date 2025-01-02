import React from "react";
import { FcCollaboration, FcConferenceCall } from "react-icons/fc";
import {
  FaComments,
  FaClipboardList,
  FaCalendar,
  FaTasks,
  FaRocket,
} from "react-icons/fa";
import Footer from "../common/Layouts/section/Footer";

const Aboutus = () => {
  return (
    <div className="features-container">
      <section className="intro-section">
        <h1 className="site-header">
          <FaRocket className="rocket-icon" />
          스마트워크로 팀워크와 업무 효율성을 극대화하세요.
        </h1>
        <p className="site-description">
          <span style={{ fontWeight: "bold" }}>MingleSpace</span>는 팀의
          생산성을 높이고, 효율적인 협업을 지원하는 혁신적인 스마트워크
          플랫폼입니다. 팀원들과의 실시간 소통, 프로젝트 관리, 일정 조율 등 모든
          업무를 한 곳에서 관리할 수 있습니다.
        </p>
      </section>
      {/* 주요 기능 1 */}
      <div className="feature-section">
        <h1 className="feature-header">주요 기능</h1>
        <h2 className="section-title">
          <FcCollaboration className="collabo-icon" size={35} />
          언제 어디서나 간편하게 소통하는
        </h2>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="icon-container">
              <FaComments size={40} />
            </div>
            <h3>채팅</h3>

            <p>실시간 채팅으로 팀원들과 언제 어디서나 소통하세요.</p>
          </div>
          <div className="feature-card">
            <div className="icon-container">
              <FaClipboardList size={40} />
            </div>
            <h3>워크보드</h3>
            <p>팀 프로젝트와 업무를 한 눈에 확인하고 관리하세요.</p>
          </div>
        </div>
      </div>
      {/* 주요 기능 2 */}
      <div className="feature-section">
        <h2 className="section-title">
          <FcConferenceCall className="conference-icon" size={40} />
          함께 일할 때 효율이 배가 되는
        </h2>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="icon-container">
              <FaCalendar size={40} />
            </div>
            <h3>캘린더</h3>
            <p>팀 일정과 프로젝트 마일스톤을 손쉽게 관리하고 조율하세요.</p>
          </div>
          <div className="feature-card">
            <div className="icon-container">
              <FaTasks size={40} />
            </div>
            <h3>마일스톤</h3>
            <p>프로젝트의 목표와 중요한 날짜를 설정해 효율적으로 진행하세요.</p>
          </div>
          <div className="feature-card">
            <div className="icon-container">
              <FaTasks size={40} />
            </div>
            <h3>할 일 관리</h3>
            <p>팀원들과 할 일을 공유하고, 개인 업무도 쉽게 관리하세요.</p>
          </div>
        </div>
      </div>
      {/* CTA 섹션 */}
      <div className="cta-section">
        <p>
          지금 바로 <strong>[MingleSpace]</strong>을 통해 팀의 업무 효율을
          높여보세요!
        </p>
        {/* <button className="cta-button">더 알아보기</button> */}
      </div>
      <Footer />
    </div>
  );
};

export default Aboutus;
