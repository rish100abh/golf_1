// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../utils/api';

// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';

// import { toast } from 'sonner';
// import { LogOut, Plus, Trophy, Heart } from 'lucide-react';

// const Dashboard = () => {
//   const { user, logout, loading: authLoading, checkAuth } = useAuth();
//   const navigate = useNavigate();

//   const [scores, setScores] = useState([]);
//   const [winnings, setWinnings] = useState([]);
//   const [newScore, setNewScore] = useState({
//     value: '',
//     date_played: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [scoresLoading, setScoresLoading] = useState(false);
//   const [winningsLoading, setWinningsLoading] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       await checkAuth();
//     };
//     init();
//   }, []);

//   useEffect(() => {
//     if (!authLoading && !user) {
//       toast.error('Please login first');
//       navigate('/login', { replace: true });
//       return;
//     }

//     if (user) {
//       fetchScores();
//       fetchWinnings();
//     }
//   }, [user, authLoading]);

//   const fetchScores = async () => {
//     try {
//       setScoresLoading(true);
//       const { data } = await api.get('/users/scores');
//       setScores(Array.isArray(data) ? data : data?.scores || []);
//     } catch (error) {
//       console.error('Failed to fetch scores:', error);
//       setScores([]);
//     } finally {
//       setScoresLoading(false);
//     }
//   };

//   const fetchWinnings = async () => {
//     try {
//       setWinningsLoading(true);
//       const { data } = await api.get('/users/winnings');
//       setWinnings(Array.isArray(data) ? data : data?.winnings || []);
//     } catch (error) {
//       console.error('Failed to fetch winnings:', error);
//       setWinnings([]);
//     } finally {
//       setWinningsLoading(false);
//     }
//   };

//   const handleAddScore = async (e) => {
//     e.preventDefault();

//     if (loading) return;

//     if (!newScore.value || !newScore.date_played) {
//       toast.error('Score and date are required');
//       return;
//     }

//     setLoading(true);

//     try {
//       const payload = {
//         value: Number(newScore.value),
//         date_played: newScore.date_played
//       };

//       const { data } = await api.post('/users/scores', payload);

//       if (Array.isArray(data)) {
//         setScores(data);
//       } else if (data?.score) {
//         setScores((prev) => [data.score, ...prev]);
//       } else {
//         await fetchScores();
//       }

//       setNewScore({ value: '', date_played: '' });
//       toast.success('Score added successfully!');
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         error.message ||
//         'Failed to add score'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/', { replace: true });
//   };

//   const totalWinnings = winnings
//     .reduce((sum, w) => sum + Number(w?.prize_amount || 0), 0)
//     .toFixed(2);

//   if (authLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading dashboard...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="border-b border-border">
//         <div className="container mx-auto px-6 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-light">Dashboard</h1>

//           <div className="flex items-center gap-4">
//             <span className="text-sm text-muted-foreground">
//               {user?.name || 'User'}
//             </span>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleLogout}
//               className="rounded-full"
//             >
//               <LogOut className="w-4 h-4 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-6 py-12">
//         <div className="grid md:grid-cols-3 gap-6 mb-12">
//           <Card>
//             <CardHeader>
//               <CardTitle>Subscription</CardTitle>
//               <CardDescription>
//                 Status:{' '}
//                 <span className="capitalize">
//                   {user?.subscription_status || 'inactive'}
//                 </span>
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Heart className="w-5 h-5" />
//                 Your Charity
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p>
//                 {user?.charity_id
//                   ? `Contributing ${user?.charity_percentage || 10}%`
//                   : 'Not selected'}
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Trophy className="w-5 h-5" />
//                 Total Winnings
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-2xl">${totalWinnings}</p>
//             </CardContent>
//           </Card>
//         </div>

//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle>Add New Score</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleAddScore} className="space-y-4">
//               <Input
//                 type="number"
//                 min={1}
//                 max={45}
//                 required
//                 placeholder="Enter score"
//                 value={newScore.value}
//                 onChange={(e) =>
//                   setNewScore({ ...newScore, value: e.target.value })
//                 }
//               />

//               <Input
//                 type="date"
//                 required
//                 value={newScore.date_played}
//                 onChange={(e) =>
//                   setNewScore({
//                     ...newScore,
//                     date_played: e.target.value
//                   })
//                 }
//               />

//               <Button disabled={loading}>
//                 <Plus className="w-4 h-4 mr-2" />
//                 {loading ? 'Adding...' : 'Add Score'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         <div className="grid md:grid-cols-2 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Your Scores</CardTitle>
//               <CardDescription>
//                 {scoresLoading ? 'Loading scores...' : `${scores.length} score(s) found`}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {scores.length === 0 ? (
//                 <p className="text-muted-foreground">No scores found.</p>
//               ) : (
//                 <div className="space-y-3">
//                   {scores.map((score) => (
//                     <div
//                       key={score.id}
//                       className="flex justify-between items-center border-b pb-2"
//                     >
//                       <span>Score: {score.value}</span>
//                       <span className="text-sm text-muted-foreground">
//                         {score.date_played
//                           ? new Date(score.date_played).toLocaleDateString()
//                           : '-'}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Your Winnings</CardTitle>
//               <CardDescription>
//                 {winningsLoading ? 'Loading winnings...' : `${winnings.length} winning record(s) found`}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {winnings.length === 0 ? (
//                 <p className="text-muted-foreground">No winnings found.</p>
//               ) : (
//                 <div className="space-y-3">
//                   {winnings.map((win) => (
//                     <div
//                       key={win.id}
//                       className="flex justify-between items-center border-b pb-2"
//                     >
//                       <span>{win.tournament_name || 'Tournament'}</span>
//                       <span>${Number(win.prize_amount || 0).toFixed(2)}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';
import {
  LogOut,
  Plus,
  Trophy,
  Heart,
  Crown,
  Target,
  Calendar,
  Users,
  ArrowLeft
} from 'lucide-react';
const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [scores, setScores] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [newScore, setNewScore] = useState({
    value: '',
    date_played: ''
  });

  const [loading, setLoading] = useState(false);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [winningsLoading, setWinningsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login first');
      navigate('/login', { replace: true });
      return;
    }

    if (user) {
      fetchScores();
      fetchWinnings();
    }
  }, [user, authLoading, navigate]);

  const fetchScores = async () => {
    try {
      setScoresLoading(true);
      const { data } = await api.get('/users/scores');
      setScores(Array.isArray(data) ? data : data?.scores || []);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
      setScores([]);
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to fetch scores'
      );
    } finally {
      setScoresLoading(false);
    }
  };

  const fetchWinnings = async () => {
    try {
      setWinningsLoading(true);
      const { data } = await api.get('/users/winnings');
      setWinnings(Array.isArray(data) ? data : data?.winnings || []);
    } catch (error) {
      console.error('Failed to fetch winnings:', error);
      setWinnings([]);
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to fetch winnings'
      );
    } finally {
      setWinningsLoading(false);
    }
  };

  const handleAddScore = async (e) => {
    e.preventDefault();

    if (loading) return;

    const scoreValue = Number(newScore.value);

    if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45) {
      toast.error('Score must be a whole number between 1 and 45');
      return;
    }

    if (!newScore.date_played) {
      toast.error('Score date is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        value: scoreValue,
        date_played: newScore.date_played
      };

      const { data } = await api.post('/users/scores', payload);

      if (Array.isArray(data)) {
        setScores(data);
      } else if (data?.score) {
        setScores((prev) => [data.score, ...prev]);
      } else {
        await fetchScores();
      }

      setNewScore({ value: '', date_played: '' });
      toast.success('Score added successfully!');
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error.message ||
        'Failed to add score'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const totalWinnings = useMemo(() => {
    return winnings
      .reduce((sum, w) => sum + Number(w?.prize_amount || 0), 0)
      .toFixed(2);
  }, [winnings]);

  const averageScore = useMemo(() => {
    if (scores.length === 0) return 0;
    return (scores.reduce((sum, s) => sum + Number(s.value), 0) / scores.length).toFixed(1);
  }, [scores]);

  const bestScore = useMemo(() => {
    return Math.max(...scores.map(s => Number(s.value)), 0);
  }, [scores]);

  const subscriptionStatus = user?.subscription_status || 'inactive';
  const isPremium = subscriptionStatus === 'active';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Enhanced Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">Welcome back, {user?.name || 'Player'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={isPremium ? "default" : "secondary"} className="gap-1">
              {isPremium ? <Crown className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              {isPremium ? 'Premium' : 'Free'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full border-border/50 hover:border-border"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* KPI Cards - Glassmorphism */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6 mb-12">
          <Card className="backdrop-blur-sm bg-background/80 border-border/50 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <Trophy className="w-4 h-4" />
                Total Winnings
              </div>
              <CardTitle className="text-3xl font-black text-primary group-hover:scale-[1.02] transition-transform">
                ${totalWinnings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {winnings.length} tournaments won
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-border/50 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <Target className="w-4 h-4" />
                Average Score
              </div>
              <CardTitle className="text-3xl font-black group-hover:scale-[1.02] transition-transform">
                {averageScore}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Best: <span className="font-bold text-foreground">{bestScore}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-border/50 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                Total Scores
              </div>
              <CardTitle className="text-3xl font-black group-hover:scale-[1.02] transition-transform">
                {scores.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Scores logged this month
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-border/50 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <Heart className="w-4 h-4 text-destructive" />
                Charity %
              </div>
              <CardTitle className="text-3xl font-black group-hover:scale-[1.02] transition-transform">
                {user?.charity_percentage || 10}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Donated to your charity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <Card className="flex-1 backdrop-blur-sm bg-background/80 border-border/50 lg:max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddScore} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Score (1-45)</label>
                  <Input
                    type="number"
                    min={1}
                    max={45}
                    step={1}
                    required
                    placeholder="Enter your score"
                    value={newScore.value}
                    onChange={(e) =>
                      setNewScore({ ...newScore, value: e.target.value })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date Played</label>
                  <Input
                    type="date"
                    required
                    value={newScore.date_played}
                    onChange={(e) =>
                      setNewScore({
                        ...newScore,
                        date_played: e.target.value
                      })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {loading ? 'Adding...' : 'Add Score'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:w-80 backdrop-blur-sm bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={isPremium ? "default" : "outline"} className="px-3 py-1">
                    {isPremium ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {isPremium && (
                  <Progress value={85} className="h-2" />
                )}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Premium users get priority tournament access</p>
                <p>Next billing: {isPremium ? '15th Apr' : 'Upgrade now'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scores & Winnings Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="backdrop-blur-sm bg-background/80 border-border/50 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6" />
                Your Scores
              </CardTitle>
              <CardDescription>
                {scoresLoading ? 'Loading...' : `${scores.length} score(s) recorded`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scoresLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted/80 w-3/4 rounded animate-pulse"></div>
                </div>
              ) : scores.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No scores yet. Add your first score!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scores.map((score) => (
                    <div
                      key={score.id}
                      className="group flex justify-between items-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 border hover:border-border"
                    >
                      <div>
                        <span className="text-2xl font-black text-primary">{score.value}</span>
                        <span className="ml-2 text-sm text-muted-foreground">points</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {score.date_played
                          ? new Date(score.date_played).toLocaleDateString()
                          : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-border/50 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Winnings
              </CardTitle>
              <CardDescription>
                {winningsLoading ? 'Loading...' : `${winnings.length} winning(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {winningsLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted/80 w-3/4 rounded animate-pulse"></div>
                </div>
              ) : winnings.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No winnings yet. Keep playing!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {winnings.slice(0, 5).map((win) => (
                    <div
                      key={win.id}
                      className="group flex justify-between items-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 border hover:border-border"
                    >
                      <span className="font-medium truncate max-w-[200px]">{win.tournament_name || 'Tournament'}</span>
                      <span className="font-bold text-lg text-primary">${Number(win.prize_amount || 0).toFixed(0)}</span>
                    </div>
                  ))}
                  {winnings.length > 5 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      +{winnings.length - 5} more...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 px-4 py-2 rounded-lg transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;