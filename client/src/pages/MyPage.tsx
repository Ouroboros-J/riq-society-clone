import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function MyPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [testName, setTestName] = useState("");
  const [score, setScore] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: certificates, isLoading: certificatesLoading, refetch: refetchCertificates } = trpc.certificate.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Points and badges moved to community site

  const uploadMutation = trpc.certificate.upload.useMutation({
    onSuccess: () => {
      toast.success("증명서가 성공적으로 제출되었습니다.");
      setSelectedFile(null);
      setTestName("");
      setScore("");
      refetchCertificates();
    },
    onError: (error) => {
      toast.error("증명서 제출에 실패했습니다: " + error.message);
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      
      if (!validTypes.includes(file.type)) {
        toast.error("JPG, PNG, PDF 파일만 업로드 가능합니다.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("파일을 선택해주세요.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64String = base64Data.split(",")[1];

        await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileData: base64String,
          testName: testName || undefined,
          score: score || undefined,
        });
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setUploading(false);
      toast.error("파일 업로드 중 오류가 발생했습니다.");
    }
  };

  if (loading || certificatesLoading) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">승인됨</Badge>;
      case "rejected":
        return <Badge variant="destructive">거부됨</Badge>;
      default:
        return <Badge variant="secondary">대기중</Badge>;
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">승인된 회원</Badge>;
      case "rejected":
        return <Badge variant="destructive">거부됨</Badge>;
      default:
        return <Badge variant="secondary">승인 대기중</Badge>;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">회원 정보 및 증명서 관리</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>회원 정보</CardTitle>

          </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>이름</Label>
                <p className="text-lg font-medium">{user?.name || "-"}</p>
              </div>
              <div>
                <Label>이메일</Label>
                <p className="text-lg">{user?.email || "-"}</p>
              </div>
              <div>
                <Label>회원 상태</Label>
                <div className="mt-2">{getApprovalStatusBadge(user?.approvalStatus || "pending")}</div>
              </div>
              <div>
                <Label>가입일</Label>
                <p>{new Date(user?.createdAt || "").toLocaleDateString("ko-KR")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IQ 증명서 제출</CardTitle>
              <CardDescription>JPG, PNG, PDF 파일 (최대 10MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">증명서 파일</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    선택된 파일: {selectedFile.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="testName">시험 이름 (선택)</Label>
                <Input
                  id="testName"
                  placeholder="예: WAIS-IV"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <div>
                <Label htmlFor="score">점수 (선택)</Label>
                <Input
                  id="score"
                  placeholder="예: IQ 145"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
                {uploading ? "업로드 중..." : "증명서 제출"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>제출한 증명서</CardTitle>
            <CardDescription>총 {certificates?.length || 0}개</CardDescription>
          </CardHeader>
          <CardContent>
            {certificates && certificates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>파일명</TableHead>
                    <TableHead>시험 이름</TableHead>
                    <TableHead>점수</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>제출일</TableHead>
                    <TableHead>파일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>{cert.fileName}</TableCell>
                      <TableCell>{cert.testName || "-"}</TableCell>
                      <TableCell>{cert.score || "-"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(cert.status)}
                          {cert.status === "rejected" && cert.rejectionReason && (
                            <p className="text-xs text-destructive mt-1">
                              거부 사유: {cert.rejectionReason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(cert.createdAt).toLocaleDateString("ko-KR")}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => window.open(cert.fileUrl, "_blank")}
                        >
                          보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                제출한 증명서가 없습니다.
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
    </>
  );
}

