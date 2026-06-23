import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../../api/axios';

const MemberHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch borrowing history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch Member details first to display name
        const memberRes = await api.get(`/members/${id}`);
        if (memberRes.data.success) {
          setMemberName(memberRes.data.data.name);
        }

        // Fetch borrowing history
        const historyRes = await api.get(`/members/${id}/history`);
        if (historyRes.data.success) {
          setHistory(historyRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load borrowing history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
          📖 Borrowing History — {memberName || 'Member'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 3, background: '#1e293b', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
        {history.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No borrowing record exists for this member.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Book Title</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Author</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>ISBN</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Issued Date</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Returned Date</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((borrow) => (
                  <TableRow key={borrow.id} hover sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>{borrow.book?.title || 'Deleted Book'}</TableCell>
                    <TableCell>{borrow.book?.author || '-'}</TableCell>
                    <TableCell>{borrow.book?.isbn || '-'}</TableCell>
                    <TableCell>{new Date(borrow.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(borrow.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {borrow.returnDate 
                        ? new Date(borrow.returnDate).toLocaleDateString() 
                        : <span style={{ opacity: 0.5 }}>Not returned yet</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={borrow.status.toUpperCase()}
                        size="small"
                        color={
                          borrow.status === 'returned' ? 'success' : 
                          borrow.status === 'overdue' ? 'error' : 'warning'
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default MemberHistory;
