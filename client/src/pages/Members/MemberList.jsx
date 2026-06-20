import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Block as BlockIcon,
  CheckCircleOutline as ActiveIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { getMembers, createMember, updateMemberStatus } from '../../services/memberService';

const MemberList = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Add Member Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch Members using memberService
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMembers(page + 1, rowsPerPage, search);
      if (data.success) {
        setMembers(data.data);
        setTotalCount(data.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch members list. Please ensure you are logged in as Librarian or Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, rowsPerPage, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle member status (Suspend / Activate) using memberService
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      setError('');
      const data = await updateMemberStatus(id, newStatus);
      if (data.success) {
        setMembers(members.map(m => m.id === id ? { ...m, status: newStatus } : m));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member status.');
    }
  };

  // Handle Input Changes for Add Member
  const handleInputChange = (e) => {
    setNewMember({
      ...newMember,
      [e.target.name]: e.target.value
    });
  };

  // Submit Add Member using memberService
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddError('');
    try {
      const data = await createMember(newMember);
      if (data.success) {
        setOpenAddDialog(false);
        setNewMember({ name: '', email: '', password: '', phone: '' });
        fetchMembers();
      }
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create member.');
    } finally {
      setAdding(false);
    }
  };

  // Check Current User Role for Access Rights
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isAuthorized = currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian');

  if (!isAuthorized) {
    return (
      <Alert severity="warning" sx={{ mt: 4 }}>
        You are not authorized to view this page. Please log in as an Admin or Librarian.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
          👥 Member Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)' }}
        >
          Add New Member
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 2, p: 2, background: '#1e293b', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <SearchIcon sx={{ color: 'text.secondary' }} />
          <TextField
            placeholder="Search by name, email, or membership ID..."
            variant="standard"
            fullWidth
            value={search}
            onChange={handleSearchChange}
            InputProps={{ disableUnderline: true }}
            sx={{
              background: '#0f172a',
              borderRadius: 2,
              p: '10px 15px',
              input: { color: '#f8fafc' }
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Membership ID</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                      No members found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id} hover sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.light' }}>{member.membershipId}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={member.status.toUpperCase()}
                          size="small"
                          color={
                            member.status === 'active' ? 'success' : 
                            member.status === 'suspended' ? 'error' : 'warning'
                          }
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Profile">
                          <IconButton onClick={() => navigate(`/members/${member.id}`)} color="primary">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Borrowing History">
                          <IconButton onClick={() => navigate(`/members/${member.id}/history`)} color="info">
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                        {currentUser.role === 'admin' && (
                          <Tooltip title={member.status === 'active' ? 'Suspend Member' : 'Activate Member'}>
                            <IconButton 
                              onClick={() => handleToggleStatus(member.id, member.status)} 
                              color={member.status === 'active' ? 'error' : 'success'}
                            >
                              {member.status === 'active' ? <BlockIcon /> : <ActiveIcon />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ color: 'text.secondary', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
        />
      </Paper>

      {/* Add Member Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} PaperProps={{ sx: { background: '#1e293b', width: 450 } }}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>Register New Member</DialogTitle>
        <form onSubmit={handleAddMemberSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {addError && <Alert severity="error">{addError}</Alert>}
            <TextField
              label="Full Name"
              name="name"
              required
              fullWidth
              value={newMember.name}
              onChange={handleInputChange}
            />
            <TextField
              label="Email Address"
              name="email"
              type="email"
              required
              fullWidth
              value={newMember.email}
              onChange={handleInputChange}
            />
            <TextField
              label="Default Password"
              name="password"
              type="password"
              required
              fullWidth
              value={newMember.password}
              onChange={handleInputChange}
            />
            <TextField
              label="Phone Number"
              name="phone"
              fullWidth
              value={newMember.phone}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenAddDialog(false)} color="inherit" disabled={adding}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={adding} sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)' }}>
              {adding ? 'Registering...' : 'Register'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MemberList;
