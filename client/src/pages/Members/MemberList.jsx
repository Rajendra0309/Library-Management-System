import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMembers, createMember, updateMemberStatus } from '../../services/memberService';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, MoreVertical, Eye, Ban, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MemberList = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [libraryNameFilter, setLibraryNameFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', phone: '' });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // ─── Fetch Members ─────────────────────────────────────────────────────────
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMembers(page + 1, rowsPerPage, search, cityFilter, libraryNameFilter);
      if (res.success) {
        setMembers(res.data || []);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to fetch members list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, cityFilter, libraryNameFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // ─── Toggle Member Status ──────────────────────────────────────────────────
  const handleToggleStatus = async (memberId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await updateMemberStatus(memberId, newStatus);
      if (res.success) {
        setMembers(members.map(m => m.id === memberId ? res.data : m));
        toast.success(`Member status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update member status.');
    }
  };

  // ─── Add Member Submit ─────────────────────────────────────────────────────
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

  // ─── Access Guard ──────────────────────────────────────────────────────────
  const isAuthorized = currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian');

  if (!isAuthorized) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Alert variant="destructive">
          <Ban className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>You are not authorized to view this page. Please log in as an Admin or Librarian.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Members</h1>
          <p className="text-muted-foreground">
            Manage library members and their circulation status.
            <span className="font-semibold text-foreground ml-1">{totalCount} total</span>
          </p>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Register Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Member</DialogTitle>
            </DialogHeader>
            {addError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{addError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleAddMemberSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={adding}>
                  {adding ? 'Registering...' : 'Register Member'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 w-full"
              placeholder="Search by name, email, or Membership ID..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-1 gap-4">
            <Input
              className="w-full"
              placeholder="Filter by City..."
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setPage(0); }}
            />
            <Input
              className="w-full"
              placeholder="Filter by Library Name..."
              value={libraryNameFilter}
              onChange={(e) => { setLibraryNameFilter(e.target.value); setPage(0); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px] font-semibold text-xs uppercase tracking-wider">Member</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Membership ID</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">City</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Joined</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold shadow-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{member.name}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-sm">
                    {member.membershipId || '—'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {member.city || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : member.status === 'suspended' ? 'destructive' : 'secondary'}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden lg:table-cell">
                    {new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/members/${member.id}`); }}>
                          <Eye className="mr-2 h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                        {currentUser.role === 'admin' && (
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(member.id, member.status); }}
                            className={member.status === 'active' ? 'text-destructive focus:text-destructive' : ''}
                          >
                            {member.status === 'active' ? (
                              <><Ban className="mr-2 h-4 w-4" /> Suspend Member</>
                            ) : (
                              <><CheckCircle2 className="mr-2 h-4 w-4" /> Activate Member</>
                            )}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{totalCount === 0 ? 0 : page * rowsPerPage + 1}</span>
            {' '}to <span className="font-medium text-foreground">{Math.min((page + 1) * rowsPerPage, totalCount)}</span>
            {' '}of <span className="font-medium text-foreground">{totalCount}</span> members
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= totalCount}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MemberList;
