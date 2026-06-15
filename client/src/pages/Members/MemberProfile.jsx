import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Divider,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  CheckCircleOutline as ActiveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getMemberById, updateMember, updateMemberStatus, getMemberHistory } from '../../services/memberService';

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Profile Mode
  const [editMode, setEditMode] = useState(false);
  const [updatedMember, setUpdatedMember] = useState({ name: '', phone: '', profileImage: '' });
  const [updating, setUpdating] = useState(false);

  // Get current logged in user from localStorage
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  
  // Determine if viewing own profile
  const profileId = id || (currentUser ? currentUser.id : null);
  const isSelf = currentUser && currentUser.id === profileId;
  const isLibrarianOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian');

  const fetchProfileData = async () => {
    if (!profileId) {
      setError('Profile ID missing. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch member details using memberService
      const profileData = await getMemberById(profileId);
      if (profileData.success) {
        setMember(profileData.data);
        setUpdatedMember({
          name: profileData.data.name,
          phone: profileData.data.phone || '',
          profileImage: profileData.data.profileImage || ''
        });
      }

      // 2. Fetch member's complete borrowing history using memberService
      try {
        const historyData = await getMemberHistory(profileId);
        if (historyData.success) {
          setBorrowHistory(historyData.data);
        }
      } catch (err) {
        // history API request failed (maybe database collection is empty)
        setBorrowHistory([]);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [profileId]);

  const handleEditChange = (e) => {
    setUpdatedMember({
      ...updatedMember,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setUpdating(true);
    try {
      const data = await updateMember(profileId, updatedMember);
      if (data.success) {
        setMember(data.data);
        setEditMode(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!member) return;
    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      const data = await updateMemberStatus(member._id, newStatus);
      if (data.success) {
        setMember({ ...member, status: newStatus });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !member) {
    return (
      <Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Filter out active borrows from the full history
  const activeBorrows = borrowHistory.filter(item => item.status === 'active' || !item.returnDate);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
          UserProfile Card View
        </Typography>
      </Box>

      {/* Profile Info Header */}
      <Paper sx={{ p: 4, background: '#1e293b', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} sm={3} align="center">
            <Avatar
              src={member.profileImage}
              sx={{ width: 140, height: 140, border: '4px solid #6366f1', fontSize: '3rem', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}
            >
              {member.name.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                {editMode ? (
                  <TextField
                    name="name"
                    value={updatedMember.name}
                    onChange={handleEditChange}
                    size="small"
                    sx={{ mb: 1, input: { fontWeight: 'bold', fontSize: '1.5rem', color: '#f8fafc' } }}
                  />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.light' }}>
                    {member.name}
                  </Typography>
                )}
                
                <Typography variant="body1" color="text.secondary">
                  Membership ID: <strong>{member.membershipId}</strong>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={member.status.toUpperCase()} 
                  color={member.status === 'active' ? 'success' : member.status === 'suspended' ? 'error' : 'warning'} 
                  sx={{ fontWeight: 'bold', height: 32 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary" variant="body2">Email Address</Typography>
                <Typography sx={{ fontWeight: 500 }}>{member.email}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary" variant="body2">Phone Number</Typography>
                {editMode ? (
                  <TextField
                    name="phone"
                    value={updatedMember.phone}
                    onChange={handleEditChange}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography sx={{ fontWeight: 500 }}>{member.phone || 'Not provided'}</Typography>
                )}
              </Grid>

              {editMode && (
                <Grid item xs={12}>
                  <Typography color="text.secondary" variant="body2">Profile Image URL</Typography>
                  <TextField
                    name="profileImage"
                    value={updatedMember.profileImage}
                    onChange={handleEditChange}
                    size="small"
                    fullWidth
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              )}
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3 }}>
              {editMode ? (
                <>
                  <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSaveProfile} disabled={updating}>
                    Save
                  </Button>
                  <Button variant="outlined" color="inherit" startIcon={<CancelIcon />} onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                (isSelf || isLibrarianOrAdmin) && (
                  <Button variant="outlined" color="primary" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                )
              )}

              {isLibrarianOrAdmin && !isSelf && (
                <Button 
                  variant="outlined" 
                  color={member.status === 'active' ? 'error' : 'success'} 
                  startIcon={member.status === 'active' ? <BlockIcon /> : <ActiveIcon />}
                  onClick={handleToggleStatus}
                >
                  {member.status === 'active' ? 'Suspend Member' : 'Activate Member'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Subsections: Active Borrows & Full Borrowing History */}
      <Grid container spacing={4}>
        {/* Active Borrows */}
        <Grid item xs={12} md={5}>
          <Card sx={{ background: '#1e293b', height: '100%', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 'bold' }}>
                📖 Active Borrows ({activeBorrows.length})
              </Typography>
              {activeBorrows.length === 0 ? (
                <Typography color="text.secondary">No books currently borrowed.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary' }}>Book</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Due Date</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeBorrows.map((borrow) => (
                        <TableRow key={borrow._id}>
                          <TableCell>{borrow.bookId?.title || 'Unknown Title'}</TableCell>
                          <TableCell>{new Date(borrow.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={borrow.status.toUpperCase()} 
                              color={borrow.status === 'overdue' ? 'error' : 'info'} 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Complete Borrowing History */}
        <Grid item xs={12} md={7}>
          <Card sx={{ background: '#1e293b', height: '100%', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
            <CardContent>
              <Typography variant="h6" color="secondary.main" sx={{ mb: 2, fontWeight: 'bold' }}>
                📜 Complete Borrowing History ({borrowHistory.length})
              </Typography>
              {borrowHistory.length === 0 ? (
                <Typography color="text.secondary">No historical borrowing records.</Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', background: '#1e293b' }}>Book Title</TableCell>
                        <TableCell sx={{ color: 'text.secondary', background: '#1e293b' }}>Issue Date</TableCell>
                        <TableCell sx={{ color: 'text.secondary', background: '#1e293b' }}>Return Date</TableCell>
                        <TableCell sx={{ color: 'text.secondary', background: '#1e293b' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {borrowHistory.map((historyItem) => (
                        <TableRow key={historyItem._id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{historyItem.bookId?.title || 'Deleted Book'}</TableCell>
                          <TableCell>{new Date(historyItem.issueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {historyItem.returnDate 
                              ? new Date(historyItem.returnDate).toLocaleDateString() 
                              : <span style={{ opacity: 0.5 }}>-</span>
                            }
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={historyItem.status.toUpperCase()} 
                              color={historyItem.status === 'returned' ? 'success' : historyItem.status === 'overdue' ? 'error' : 'warning'} 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberProfile;
