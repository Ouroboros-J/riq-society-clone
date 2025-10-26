import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";

export default function Community() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts, isLoading } = trpc.post.list.useQuery({
    limit: 50,
    search: searchQuery || undefined,
  });

  const handleSearch = () => {
    setSearchQuery(search);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">커뮤니티 게시판</h1>
          <p className="text-muted-foreground">회원들과 자유롭게 소통하세요</p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="제목 또는 내용으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setLocation("/community/new")}>
              글쓰기
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>게시글 목록</CardTitle>
            <CardDescription>
              총 {posts?.length || 0}개의 게시글
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">로딩 중...</p>
              </div>
            ) : posts && posts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">번호</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead className="w-[120px]">작성자</TableHead>
                    <TableHead className="w-[100px]">조회수</TableHead>
                    <TableHead className="w-[150px]">작성일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} className={`cursor-pointer hover:bg-muted/50 ${post.isNotice === 'true' ? 'bg-primary/5' : ''}`}>
                      <TableCell>{post.isNotice === 'true' ? '공지' : post.id}</TableCell>
                      <TableCell>
                        <Link href={`/community/${post.id}`}>
                          <span className="hover:underline flex items-center gap-2">
                            {post.isNotice === 'true' && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">공지</span>
                            )}
                            {post.title}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>회원 {post.userId}</TableCell>
                      <TableCell>{post.viewCount}</TableCell>
                      <TableCell>
                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                게시글이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" onClick={() => setLocation("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}

