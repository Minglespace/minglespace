import React from "react";
import { MentionsInput, Mention } from "react-mentions";

const Mentions = ({ value, onChange, wsMembers, tags }) => {
  const membersData = wsMembers.map((member) => ({
    id: member.wsMemberId.toString(),
    disply: member.name,
  })); // ID를 문자열로 변환 display: member.name

  // 사용자 목록 렌더링 함수
  // const renderUserSuggestion = (
  //   suggestion,
  //   search,
  //   highlightedDisplay,
  //   index,
  //   focused
  // ) => {
  //   return (
  //     <div className={`user-suggestion ${focused ? "focused" : ""}`}>
  //       {suggestion.display}
  //     </div>
  //   );
  // };

  // const renderTagSuggestion = (
  //   suggestion,
  //   search,
  //   highlightedDisplay,
  //   index,
  //   focused
  // ) => {
  //   return (
  //     <div className={`tag-suggestion ${focused ? "focused" : ""}`}>
  //       #{suggestion.display}
  //     </div>
  //   );
  // };

  return (
    <div>
      <MentionsInput
        className="mentions-input"
        value={value}
        onChange={onChange}
        placeholder="Type a message with @mention or #tag"
      >
        <Mention
          trigger="@"
          data={wsMembers.map((member) => ({
            id: member.wsMemberId,
            display: member.name,
          }))}
          markup="@{{__id__||__display__}}"
          displayTransform={(id, display) => `@${display}`}
        />
      </MentionsInput>
    </div>
  );
};

export default Mentions;
