import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { useAuth } from '../_core/hooks/useAuth';
import { useLocation } from 'wouter';
import Header from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, FileText, File, Image, Video, Music } from 'lucide-react';
import { toast } from 'sonner';

export default function Resources() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const isMember = user?.approvalStatus === 'approved' && user?.paymentStatus === 'confirmed';
  
  const { data: resources, isLoading } = trpc.resource.list.useQuery(undefined, {
    enabled: isAuthenticated && isMember,
  });
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('로그인이 필요한 페이지입니다.');
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, setLocation]);
  
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (!isMember) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <svg className="mx-auto h-24 w-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4">정회원 전용 컨텐츠</h1>
              <p className="text-lg text-muted-foreground mb-8">
                리소스는 정회원만 이용할 수 있습니다.<br />
                입회 신청 승인 및 연회비 결제가 필요합니다.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  현재 상태: <strong>{user?.approvalStatus === 'approved' ? '승인 완료' : '승인 대기'}</strong> / <strong>{user?.paymentStatus === 'confirmed' ? '결제 완료' : '결제 대기'}</strong>
                </p>
                <Button onClick={() => setLocation('/application')}>
                  입회 신청하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  const incrementDownloadMutation = trpc.resource.incrementDownload.useMutation();

  const handleDownload = (resource: any) => {
    incrementDownloadMutation.mutate({ id: resource.id });
    window.open(resource.fileUrl, '_blank');
    toast.success('다운로드가 시작되었습니다.');
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-6 w-6" />;
    
    if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText className="h-6 w-6" />;
    } else if (fileType.includes('image')) {
      return <Image className="h-6 w-6" />;
    } else if (fileType.includes('video')) {
      return <Video className="h-6 w-6" />;
    } else if (fileType.includes('audio')) {
      return <Music className="h-6 w-6" />;
    }
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 카테고리별 그룹화
  const categories = resources
    ? Array.from(new Set(resources.map((r: any) => r.category).filter(Boolean)))
    : [];

  const filteredResources = resources
    ? selectedCategory
      ? resources.filter((r: any) => r.category === selectedCategory)
      : resources
    : [];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">리소스 라이브러리</h1>
              <p className="text-muted-foreground text-lg">
                회원을 위한 다양한 자료를 다운로드하실 수 있습니다
              </p>
            </div>

            {/* 카테고리 필터 */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                >
                  전체
                </Button>
                {categories.map((category: string) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">로딩 중...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">등록된 리소스가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource: any) => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                          {resource.category && (
                            <Badge variant="secondary" className="mb-2">
                              {resource.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground">
                          {getFileIcon(resource.fileType)}
                        </div>
                      </div>
                      {resource.description && (
                        <CardDescription className="line-clamp-2">
                          {resource.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{formatFileSize(resource.fileSize)}</span>
                        <span>{resource.downloadCount || 0}회 다운로드</span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleDownload(resource)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        다운로드
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

