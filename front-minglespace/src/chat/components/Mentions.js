import React from "react";
import { MentionsInput, Mention } from "react-mentions";

const Mentions = ({ value, onChange, wsMembers, tags }) => {
  // 사용자 멘션 항목을 어떻게 렌더링할지 정의하는 함수
  const renderUserSuggestion = (query, suggestion, index, focused) => {
    return (
      <div className="user-suggestion">
        <strong>{suggestion.display}</strong> {/* 사용자 이름을 표시 */}
      </div>
    );
  };

  const renderTagSuggestion = (query, suggestion, index, focused) => {
    return (
      <div className="tag-suggestion">
        <strong>{suggestion.display}</strong>
        {/* 태그 이름을 표시 */}
      </div>
    );
  };
  return (
    <div>
      <MentionsInput
        className="mentions-input"
        value={value}
        onChange={onChange}
        placeholder="Type a message with @mention or #tag"
      >
        {/* 사용자 멘션 */}
        <Mention
          trigger="@"
          data={wsMembers}
          renderSuggestion={renderUserSuggestion}
        />
        <Mention
          trigger="#"
          data={this.requestTag}
          renderSuggestion={renderTagSuggestion}
        />
      </MentionsInput>
    </div>
  );
};

export default Mentions;
