import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRole } from "@/_core/hooks/useRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Download, Eye } from "lucide-react";

export default function Journals() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isMember, canAccessResources } = useRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");

  const journalsQuery = trpc.journal.list.useQuery(undefined, {
    enabled: isAuthenticated && canAccessResources,
  });

  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  // 비회원 또는 정회원이 아닌 경우
  if (!isAuthenticated || !canAccessResources) {
    return (
      <>
        <SEO
          title="저널 - RIQ Society"
          description="RIQ Society 정회원 전용 학술 저널 및 연구 자료"
        />
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>정회원 전용 콘텐츠</CardTitle>
              <CardDescription>
                저널은 RIQ Society 정회원만 이용할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                RIQ Society의 학술 저널과 연구 자료를 열람하려면 정회원 자격이 필요합니다.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">정회원 가입 절차:</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>입회 신청서 작성</li>
                  <li>IQ 증명서 제출</li>
                  <li>관리자 심사</li>
                  <li>입회비 납부</li>
                  <li>정회원 승인</li>
                </ol>
              </div>
              <Button asChild className="w-full">
                <Link href="/application">입회 신청하기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const journals = journalsQuery.data || [];

  // 필터링 및 정렬
  const filteredJournals = journals
    .filter((journal) => {
      const matchesSearch =
        journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (journal.excerpt && journal.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || journal.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
      } else {
        return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime();
      }
    });

  // 카테고리 목록 추출
  const categories = Array.from(new Set(journals.map((j) => j.category).filter(Boolean)));

  return (
    <>
      <SEO
        title="저널 - RIQ Society"
        description="RIQ Society 정회원 전용 학술 저널 및 연구 자료"
        keywords="RIQ Society, 저널, 학술지, 연구, 논문"
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-10 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">저널</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              RIQ Society의 학술 저널과 연구 자료를 열람하실 수 있습니다.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 px-4 md:px-10 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="저널 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: "latest" | "oldest") => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Journals Grid */}
        <section className="py-12 px-4 md:px-10">
          <div className="max-w-6xl mx-auto">
            {journalsQuery.isLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : filteredJournals.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  {searchQuery || categoryFilter !== "all"
                    ? "검색 결과가 없습니다."
                    : "등록된 저널이 없습니다."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJournals.map((journal) => (
                  <Link key={journal.id} href={`/journals/${journal.slug}`}>
                    <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                      {journal.thumbnailUrl && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img
                            src={journal.thumbnailUrl}
                            alt={journal.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          {journal.category && (
                            <Badge variant="secondary">{journal.category}</Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {journal.viewCount || 0}
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">{journal.title}</CardTitle>
                        {journal.excerpt && (
                          <CardDescription className="line-clamp-3">
                            {journal.excerpt}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {new Date(journal.publishedAt || journal.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                          {journal.pdfUrl && (
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              <span className="text-xs">PDF</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

