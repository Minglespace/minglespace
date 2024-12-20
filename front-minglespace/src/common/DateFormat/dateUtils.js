export const formatDateToKST = (dateString) => {
  const date = new Date(dateString);
  return date
    .toLocaleString("sv-SE", { timeZone: "Asia/Seoul" })
    .replace(" ", "T");
};
