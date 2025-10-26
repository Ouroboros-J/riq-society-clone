import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, Award } from "lucide-react";
import { useLocation } from "wouter";

export default function Ranking() {
  const [, setLocation] = useLocation();

  const { data: allTimeRanking, isLoading: allTimeLoading } = trpc.ranking.allTime.useQuery({ limit: 20 });
  const { data: weeklyRanking, isLoading: weeklyLoading } = trpc.ranking.weekly.useQuery({ limit: 20 });
  const { data: monthlyRanking, isLoading: monthlyLoading } = trpc.ranking.monthly.useQuery({ limit: 20 });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-muted-foreground">{rank}</span>;
    }
  };

  const RankingTable = ({ data, loading }: { data: any[] | undefined; loading: boolean }) => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          랭킹 데이터가 없습니다.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 text-center">순위</TableHead>
            <TableHead>이름</TableHead>
            <TableHead className="text-right">포인트</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user, index) => (
            <TableRow key={user.userId} className={index < 3 ? "bg-primary/5" : ""}>
              <TableCell className="text-center font-medium">
                {getRankIcon(index + 1)}
              </TableCell>
              <TableCell className="font-medium">
                {user.name || "익명"}
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {user.points}P
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">포인트 랭킹</h1>
            <p className="text-muted-foreground">커뮤니티 활동으로 포인트를 획득하고 랭킹에 도전하세요!</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🏆 랭킹 보상</CardTitle>
              <CardDescription>상위 랭커에게는 특별한 뱃지가 지급됩니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <span className="text-2xl">🥇</span>
                  <div>
                    <p className="font-semibold">주간 1위</p>
                    <p className="text-sm text-muted-foreground">주간 랭킹 1위 달성 시 지급</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <span className="text-2xl">👑</span>
                  <div>
                    <p className="font-semibold">월간 1위</p>
                    <p className="text-sm text-muted-foreground">월간 랭킹 1위 달성 시 지급</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <span className="text-2xl">🥈</span>
                  <div>
                    <p className="font-semibold">주간 2위</p>
                    <p className="text-sm text-muted-foreground">주간 랭킹 2위 달성 시 지급</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <span className="text-2xl">💎</span>
                  <div>
                    <p className="font-semibold">월간 2위</p>
                    <p className="text-sm text-muted-foreground">월간 랭킹 2위 달성 시 지급</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <span className="text-2xl">🥉</span>
                  <div>
                    <p className="font-semibold">주간 3위</p>
                    <p className="text-sm text-muted-foreground">주간 랭킹 3위 달성 시 지급</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <span className="text-2xl">💍</span>
                  <div>
                    <p className="font-semibold">월간 3위</p>
                    <p className="text-sm text-muted-foreground">월간 랭킹 3위 달성 시 지급</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">전체 랭킹</TabsTrigger>
              <TabsTrigger value="weekly">주간 랭킹</TabsTrigger>
              <TabsTrigger value="monthly">월간 랭킹</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>전체 랭킹</CardTitle>
                  <CardDescription>누적 포인트 기준 상위 20명</CardDescription>
                </CardHeader>
                <CardContent>
                  <RankingTable data={allTimeRanking} loading={allTimeLoading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly">
              <Card>
                <CardHeader>
                  <CardTitle>주간 랭킹</CardTitle>
                  <CardDescription>최근 7일간 획득한 포인트 기준 상위 20명</CardDescription>
                </CardHeader>
                <CardContent>
                  <RankingTable data={weeklyRanking} loading={weeklyLoading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle>월간 랭킹</CardTitle>
                  <CardDescription>최근 30일간 획득한 포인트 기준 상위 20명</CardDescription>
                </CardHeader>
                <CardContent>
                  <RankingTable data={monthlyRanking} loading={monthlyLoading} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <Button variant="outline" onClick={() => setLocation("/")}>
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

