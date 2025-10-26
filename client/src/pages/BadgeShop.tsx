import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Coins } from "lucide-react";

export default function BadgeShop() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: badges, isLoading: badgesLoading, refetch: refetchBadges } = trpc.badge.list.useQuery();
  const { data: myBadges, refetch: refetchMyBadges } = trpc.badge.getMyBadges.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: myPoints } = trpc.points.getMyPoints.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const purchaseMutation = trpc.badge.purchase.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchBadges();
        refetchMyBadges();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error("뱃지 구매에 실패했습니다: " + error.message);
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading || badgesLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const ownedBadgeIds = myBadges?.map((b) => b.badgeId) || [];

  const handlePurchase = (badgeId: number, price: number) => {
    if ((myPoints || 0) < price) {
      toast.error("포인트가 부족합니다.");
      return;
    }

    if (confirm("이 뱃지를 구매하시겠습니까?")) {
      purchaseMutation.mutate({ badgeId });
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">뱃지 상점</h1>
            <p className="text-muted-foreground">포인트로 뱃지를 구매하세요</p>
            <div className="flex items-center gap-2 mt-4 text-lg font-semibold">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span>보유 포인트: {myPoints || 0}P</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges && badges.length > 0 ? (
              badges.map((badge) => {
                const isOwned = ownedBadgeIds.includes(badge.id);
                return (
                  <Card key={badge.id} className={isOwned ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="text-6xl mb-4 text-center">{badge.icon}</div>
                      <CardTitle className="text-center">{badge.name}</CardTitle>
                      <CardDescription className="text-center">{badge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="text-center text-xl font-bold text-primary">
                          {badge.price}P
                        </div>
                        {isOwned ? (
                          <Button disabled className="w-full">
                            보유 중
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handlePurchase(badge.id, badge.price)}
                            disabled={purchaseMutation.isPending || (myPoints || 0) < badge.price}
                            className="w-full"
                          >
                            {(myPoints || 0) < badge.price ? "포인트 부족" : "구매하기"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                판매 중인 뱃지가 없습니다.
              </div>
            )}
          </div>

          <div className="mt-8">
            <Button variant="outline" onClick={() => setLocation("/mypage")}>
              마이페이지로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

