import React, { useEffect, useState } from "react";
import MileStoneTest from "./components/MileStoneComponent";

const MileStone = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1); // 상태 변경으로 강제 재렌더링
  };

  useEffect(() => {}, [refreshKey]);
  return (
    <div>
      <h1> 마일스톤 페이지</h1>
      <MileStoneTest key={refreshKey} refresh={handleRefresh} />
    </div>
  );
};

export default MileStone;
