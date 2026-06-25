import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMemberById, updateMember, updateMemberStatus, getMemberHistory } from '../../services/memberService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronRight, ArrowLeft, Save, X, Edit, Ban, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [member, setMember] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('active');
  const [editMode, setEditMode] = useState(false);
  const [updatedMember, setUpdatedMember] = useState({ name: '', phone: '' });
  const [updating, setUpdating] = useState(false);

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
      const profileData = await getMemberById(profileId);
      if (profileData.success) {
        setMember(profileData.data);
        setUpdatedMember({
          name: profileData.data.name,
          phone: profileData.data.phone || ''
        });
      }
      try {
        const historyData = await getMemberHistory(profileId);
        if (historyData.success) setBorrowHistory(historyData.data);
      } catch {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const handleEditChange = (e) => {
    setUpdatedMember({ ...updatedMember, [e.target.name]: e.target.value });
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
      const data = await updateMemberStatus(member.id, newStatus);
      if (data.success) setMember({ ...member, status: newStatus });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-40 w-full mb-8" />
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const activeBorrows = borrowHistory.filter(item => item.status === 'active' || item.status === 'overdue' || !item.returnDate);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/members" className="hover:text-foreground transition-colors">Members</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{member.name}</span>
      </nav>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            {error}
            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-current" onClick={() => setError('')}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Header Card */}
      <Card className="mb-8">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-primary/10 text-primary font-bold text-4xl ring-4 ring-primary/5">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-background rounded-full ${member.status === 'active' ? 'bg-green-500' : member.status === 'suspended' ? 'bg-destructive' : 'bg-secondary'}`}></div>
              </div>

              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-3 max-w-md">
                    <Input name="name" value={updatedMember.name} onChange={handleEditChange} className="font-semibold text-xl" />
                    <Input name="phone" placeholder="Phone" value={updatedMember.phone} onChange={handleEditChange} />
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-foreground mb-1 tracking-tight">{member.name}</h2>
                    <p className="text-muted-foreground">{member.email}</p>
                    {member.phone && <p className="text-muted-foreground mt-1">{member.phone}</p>}
                  </>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Badge variant="outline" className="font-mono bg-muted/50">
                    {member.membershipId || member.id}
                  </Badge>
                  <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">
                    Member
                  </Badge>
                  <Badge variant={member.status === 'active' ? 'default' : member.status === 'suspended' ? 'destructive' : 'secondary'} className="uppercase tracking-widest text-[10px]">
                    {member.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-0">
              {editMode ? (
                <>
                  <Button onClick={handleSaveProfile} disabled={updating} className="flex-1 md:flex-none">
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1 md:flex-none">
                    Cancel
                  </Button>
                </>
              ) : (
                (isSelf || isLibrarianOrAdmin) && (
                  <Button onClick={() => setEditMode(true)} className="flex-1 md:flex-none">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                )
              )}

              {isLibrarianOrAdmin && !isSelf && (
                <Button 
                  variant={member.status === 'active' ? 'destructive' : 'outline'}
                  onClick={handleToggleStatus}
                  className="flex-1 md:flex-none"
                >
                  {member.status === 'active' ? (
                    <><Ban className="mr-2 h-4 w-4" /> Suspend</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-4 w-4" /> Activate</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active Borrows
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{activeBorrows.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="history">Borrowing History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBorrows.length === 0 ? (
              <Card className="col-span-full border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No active borrows.
                </CardContent>
              </Card>
            ) : (
              activeBorrows.map(borrow => (
                <Card key={borrow.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex gap-4 h-full">
                    <div className="w-20 h-28 bg-secondary/50 rounded flex items-center justify-center text-primary/40 shrink-0">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-2" title={borrow.book?.title}>
                          {borrow.book?.title || 'Unknown Book'}
                        </h3>
                        <p className="text-sm text-muted-foreground">Due: {new Date(borrow.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-2">
                        <Badge variant={borrow.status === 'overdue' ? 'destructive' : 'outline'} className={borrow.status !== 'overdue' ? 'bg-muted/50' : ''}>
                          {borrow.status === 'overdue' ? 'OVERDUE' : 'Borrowed'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Book Title</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Issue Date</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Return Date</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No historical borrowing records.
                    </TableCell>
                  </TableRow>
                ) : (
                  borrowHistory.map(historyItem => (
                    <TableRow key={historyItem.id}>
                      <TableCell className="font-medium">{historyItem.book?.title || 'Unknown Title'}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(historyItem.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-muted-foreground">{historyItem.returnDate ? new Date(historyItem.returnDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          historyItem.status === 'returned' ? 'secondary' :
                          historyItem.status === 'overdue' ? 'destructive' :
                          'default'
                        }>
                          {historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberProfile;
