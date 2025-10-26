import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function CommunityNew() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createMutation = trpc.post.create.useMutation({
    onSuccess: () => {
      toast.success("게시글이 작성되었습니다.");
      setLocation("/community");
    },
    onError: (error) => {
      toast.error("게시글 작성에 실패했습니다: " + error.message);
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    createMutation.mutate({ title, content });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">게시글 작성</h1>
          <p className="text-muted-foreground">새로운 게시글을 작성하세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>글쓰기</CardTitle>
            <CardDescription>제목과 내용을 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? "작성 중..." : "작성하기"}
              </Button>
              <Button variant="outline" onClick={() => setLocation("/community")}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

