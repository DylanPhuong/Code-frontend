// import { Box, Typography } from "@mui/material";

// const GaugeCard = ({ id, name, unit, value, color = "green" }) => {
//     return (
//         <Box
//             sx={{
//                 width: 230,
//                 height: 180,
//                 bgcolor: "#fff",
//                 borderRadius: 4,
//                 boxShadow: 3,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 position: "relative",
//                 overflow: "hidden",
//             }}
//         >
//             {/* Vòng tròn gauge */}
//             <Box
//                 sx={{
//                     position: "absolute",
//                     top: 20,
//                     width: 160,
//                     height: 160,
//                     borderRadius: "50%",
//                     border: `10px solid ${color}`,
//                     borderBottomColor: "transparent",
//                     borderLeftColor: "transparent",
//                     transform: "rotate(135deg)",
//                 }}
//             />
//             {/* Nội dung giá trị */}
//             <Typography
//                 variant="h5" fontWeight="bold" sx={{ mt: 2, zIndex: 1 }}>{value}
//             </Typography>

//             <Typography
//                 variant="body1" color="text.secondary" sx={{ zIndex: 1 }}> {unit}
//             </Typography>

//             <Typography
//                 variant="h6" sx={{ mt: 1, fontWeight: "bold", textTransform: "uppercase", zIndex: 1 }} > {name}
//             </Typography>
//         </Box>
//     );
// }
// export default GaugeCard

import { Box, Typography } from "@mui/material";

const GaugeCard = ({ id, name, unit, value, color = "green" }) => {
    return (
        <Box
            sx={{
                width: 230,
                height: 180,
                bgcolor: "#fff",
                borderRadius: 4,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Vòng tròn gauge */}
            <Box
                sx={{
                    position: "absolute",
                    top: 18,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    border: `10px solid ${color}`,
                    borderBottomColor: "transparent",
                    borderLeftColor: "transparent",
                    transform: "rotate(135deg)",
                }}
            />

            {/* Giá trị + Unit nằm trên vòng tròn */}
            <Box
                sx={{
                    position: "absolute",
                    top: 70,                // chỉnh lên/xuống toàn bộ cụm value+unit
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    zIndex: 1,
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    {value}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 0.3,
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                    }}
                >
                    {unit}
                </Typography>
            </Box>

            {/* Tên kênh ở phía dưới */}
            <Typography
                variant="h6"
                sx={{
                    mb: 1,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    zIndex: 1,
                    textAlign: "center",
                }}
            >
                {name}
            </Typography>
        </Box>
    );
};

export default GaugeCard;
