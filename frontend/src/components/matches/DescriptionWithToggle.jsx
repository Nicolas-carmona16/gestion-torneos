import { useState } from "react";
import { Button, Typography } from "@mui/material";

const DescriptionWithToggle = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 80;

  const toggleExpanded = () => setExpanded((prev) => !prev);

  if (!description)
    return (
      <Typography variant="body2">
        <strong>Descripción: </strong>N/A
      </Typography>
    );

  const shouldTruncate = description.length > maxLength;
  const displayText =
    expanded || !shouldTruncate
      ? description
      : `${description.slice(0, maxLength)}...`;

  return (
    <Typography variant="body2">
      <strong>Descripción:</strong> {displayText}
      {shouldTruncate && (
        <Button
          size="small"
          onClick={toggleExpanded}
          sx={{
            ml: 1,
            minWidth: "24px",
            padding: "2px",
            fontSize: "12px",
            borderRadius: "6px",
          }}
        >
          {expanded ? "-" : "+"}
        </Button>
      )}
    </Typography>
  );
};

export default DescriptionWithToggle;
