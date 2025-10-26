import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function CommunityNew() {
  const { isAuthenticated, loading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isNotice, setIsNotice] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // 10MB limit
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB 이하여야 합니다.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    let attachmentData: string | undefined;
    let attachmentName: string | undefined;
    let attachmentType: string | undefined;

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const base64 = (e.target.result as string).split(",")[1];
          attachmentData = base64;
          attachmentName = file.name;
          attachmentType = file.type;

          createMutation.mutate({
            title,
            content,
            isNotice,
            attachmentData,
            attachmentName,
            attachmentType,
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      createMutation.mutate({ title, content, isNotice });
    }
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
            {user?.role === 'admin' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notice"
                  checked={isNotice}
                  onCheckedChange={(checked) => setIsNotice(checked as boolean)}
                />
                <Label htmlFor="notice" className="cursor-pointer">
                  공지사항으로 등록
                </Label>
              </div>
            )}
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
            <div>
              <Label htmlFor="file">파일 첨부 (선택사항, 최대 10MB)</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-2">
                  선택된 파일: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
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

