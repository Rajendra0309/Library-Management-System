import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Chip,
    Button,
    Stack,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";

const MemberCard = ({ member, onViewProfile }) => {
    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "0.3s",
                "&:hover": {
                    transform: "translateY(-4px)",
                },
            }}
        >
            <CardContent>
                <Stack spacing={2} alignItems="center">
                    <Avatar
                        src={member?.profileImage}
                        sx={{ width: 72, height: 72 }}
                    >
                        <PersonIcon />
                    </Avatar>

                    <Typography variant="h6" fontWeight="bold">
                        {member?.name}
                    </Typography>

                    <Typography color="text.secondary">
                        {member?.email}
                    </Typography>

                    <Typography variant="body2">
                        ID: {member?.membershipId}
                    </Typography>

                    <Chip
                        label={member?.status}
                        color={
                            member?.status === "active"
                                ? "success"
                                : member?.status === "suspended"
                                    ? "warning"
                                    : "error"
                        }
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => onViewProfile(member?.id)}
                    >
                        View Profile
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default MemberCard;