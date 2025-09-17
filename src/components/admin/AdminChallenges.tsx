import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface Challenge {
  id: string;
  status: string;
  current_balance: number;
  total_profit: number;
  trading_days: number;
  created_at: string;
  user_id: string;
  profiles?: {
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  trading_plans?: {
    name: string;
    account_size: number;
  } | null;
}

interface AdminChallengesProps {
  onStatsUpdate: () => void;
}

export const AdminChallenges = ({ onStatsUpdate }: AdminChallengesProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          profiles(email, first_name, last_name),
          trading_plans(name, account_size)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges((data as any) || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Error",
        description: "Failed to fetch challenges.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = 
      challenge.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.trading_plans?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || challenge.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
      case 'passed':
        return <Badge className="bg-green-500 hover:bg-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Challenge Management</h2>
        <p className="text-muted-foreground">Monitor trading challenges and performance</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Challenges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Challenges ({filteredChallenges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Profit/Loss</TableHead>
                <TableHead>Trading Days</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChallenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {challenge.profiles?.first_name} {challenge.profiles?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {challenge.profiles?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{challenge.trading_plans?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${challenge.trading_plans?.account_size?.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(challenge.status)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${challenge.current_balance?.toLocaleString() || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${
                      (challenge.total_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${challenge.total_profit?.toLocaleString() || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {challenge.trading_days || 0} days
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(challenge.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};