import { Box, Stack, Typography } from "@mui/material";

const getColor = (val: string) => {
  if (val === "W") return "#4CAF50";
  if (val === "L") return "#F44336";
  return "#9E9E9E";
};

const RecentForm = ({ title, form }: { title: string; form?: string[] }) => {
  if (!form || form.length === 0) return null;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        {title}
      </Typography>

      <Stack direction="row" spacing={1}>
        {form.slice(0, 5).map((item, index) => (
          <Box
            key={index}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: getColor(item),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {item}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default RecentForm;