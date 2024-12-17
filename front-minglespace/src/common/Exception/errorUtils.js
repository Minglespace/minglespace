export const getErrorStatus = (error) => {
  return error?.response?.status || "알 수 없는 에러코드";
};

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || "알 수 없는 에러메세지";
};
