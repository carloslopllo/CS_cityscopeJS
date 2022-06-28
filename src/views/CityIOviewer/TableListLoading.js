import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";

export default function TableListLoading() {
  const [progress, setProgress] = React.useState(0);

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
  }));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Box sx={{ width: "100%", position: "fixed", bottom: "0px" }}>
      <BorderLinearProgress variant="determinate" value={progress} />
    </Box>
  );
}
