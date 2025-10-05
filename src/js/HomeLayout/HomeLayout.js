import { Grid, Card, Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { fetchAllChannels } from '../../Services/APIDevice'
const HomeLayout = () => {

    const [tags, setTags] = useState([]);

    useEffect(() => {
        fetchChannel();
    }, []);

    const fetchChannel = async () => {
        let response = await fetchAllChannels();
        console.log('tag name data: ', response)
        // if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
        //     const rowsWithId = response.DT.DT.map((item) => {

        //     });
        // }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Grid
                container
                spacing={2}
                justifyContent="center" // Giúp căn giữa khi chưa đủ 3 cột
            >
                {tags.map((tag) => (
                    <Grid
                        item
                        key={tag.id}
                        xs={12}
                        sm={6}
                        md={3} // 👉 3 cột trên màn hình >= md
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Card
                            sx={{
                                width: 400,
                                height: 180,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 4,
                                boxShadow: 3,
                                textAlign: "center",
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold">
                                {tag.value}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {tag.unit}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ mt: 1, fontWeight: "bold", textTransform: "uppercase" }}
                            >
                                {tag.name}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
export default HomeLayout
