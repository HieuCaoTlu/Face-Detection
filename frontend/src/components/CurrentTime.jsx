import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
// Component hiển thị thời gian hiện tại theo múi giờ Việt Nam
export default function CurrentTime() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh", // Múi giờ Việt Nam
      };

      setCurrentTime(new Date().toLocaleString("vi-VN", options));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000); // Cập nhật mỗi giây

    return () => clearInterval(intervalId); // Dọn dẹp khi component unmount
  }, []);

  return <Typography variant="h5">{currentTime}</Typography>;
};