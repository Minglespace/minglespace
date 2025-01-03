import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer>
      <div className="footer">
        <div className="footer-contnent">
          <p>&copy; 2025 MingleSpace. All rights reserved.</p>
        </div>
        <div className="footer-info">
          <p>
            <strong>Contact</strong>: 전화번호 - 010-1234-5678 | 이메일 -
            minglespace0@gmail.com
          </p>
          <p>
            <strong>Company</strong>: MingleSpace | 서울 구로구 디지털로 306
          </p>
          <p>
            <strong>Follow us:</strong>
          </p>
          <ul className="social-links">
            <li>
              <a
                href="https://www.youtube.com/c/minglespace"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube
                  size={20}
                  style={{ marginRight: "8px", marginBottom: "-7px" }}
                />{" "}
                YouTube
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/minglespace"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter
                  size={20}
                  style={{ marginRight: "8px", marginBottom: "-7px" }}
                />{" "}
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/minglespace"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram
                  size={20}
                  style={{ marginRight: "8px", marginBottom: "-7px" }}
                />
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
