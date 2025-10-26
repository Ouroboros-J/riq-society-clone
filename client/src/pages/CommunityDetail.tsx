import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2, Edit } from "lucide-react";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || "0");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [comment, setComment] = useState("");

  const { data: post, isLoading: postLoading } = trpc.post.getById.useQuery({ id: postId });
  const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = trpc.comment.list.useQuery({ postId });

  const createCommentMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      toast.success("댓글이 작성되었습니다.");
      setComment("");
      refetchComments();
    },
    onError: (error) => {
      toast.error("댓글 작성에 실패했습니다: " + error.message);
    },
  });

  const deletePostMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      toast.success("게시글이 삭제되었습니다.");
      setLocation("/community");
    },
    onError: (error) => {
      toast.error("게시글 삭제에 실패했습니다: " + error.message);
    },
  });

  const deleteCommentMutation = trpc.comment.delete.useMutation({
    onSuccess: () => {
      toast.success("댓글이 삭제되었습니다.");
      refetchComments();
    },
    onError: (error) => {
      toast.error("댓글 삭제에 실패했습니다: " + error.message);
    },
  });

  const handleCommentSubmit = () => {
    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!comment.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    createCommentMutation.mutate({ postId, content: comment });
  };

  const handleDeletePost = () => {
    if (confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      deletePostMutation.mutate({ id: postId });
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate({ id: commentId });
    }
  };

  if (postLoading || commentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
          <Button className="mt-4" onClick={() => setLocation("/community")}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const canEditPost = isAuthenticated && user?.id === post.userId;
  const canDeletePost = isAuthenticated && (user?.id === post.userId || user?.role === 'admin');

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                <CardDescription>
                  작성자: 회원 {post.userId} | 조회수: {post.viewCount} | 작성일: {new Date(post.createdAt).toLocaleString("ko-KR")}
                </CardDescription>
              </div>
              {(canEditPost || canDeletePost) && (
                <div className="flex gap-2">
                  {canEditPost && (
                    <Button variant="outline" size="sm" onClick={() => setLocation(`/community/${postId}/edit`)}>
                      <Edit className="w-4 h-4 mr-1" />
                      수정
                    </Button>
                  )}
                  {canDeletePost && (
                    <Button variant="destructive" size="sm" onClick={handleDeletePost}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{post.content}</div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>댓글 ({comments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated && (
              <div className="space-y-2">
                <Textarea
                  placeholder="댓글을 입력하세요"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleCommentSubmit} disabled={createCommentMutation.isPending}>
                  {createCommentMutation.isPending ? "작성 중..." : "댓글 작성"}
                </Button>
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-muted-foreground text-sm">댓글을 작성하려면 로그인이 필요합니다.</p>
            )}

            <div className="space-y-4 mt-6">
              {comments && comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="border-l-2 border-muted pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-muted-foreground">
                        회원 {c.userId} | {new Date(c.createdAt).toLocaleString("ko-KR")}
                      </div>
                      {isAuthenticated && (user?.id === c.userId || user?.role === 'admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{c.content}</div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">댓글이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => setLocation("/community")}>
          목록으로 돌아가기
        </Button>
      </div>
    </div>
  );
}

