import { useState } from 'react';
import Header from '../components/Header';
import Footer from "@/components/Footer";
import SEO from '../components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../_core/hooks/useAuth';
import { useRole } from '../_core/hooks/useRole';
import { trpc } from '../lib/trpc';
import { useLocation } from 'wouter';
import { Download, BookOpen, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function Journal() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { canAccessResources } = useRole();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: resources, isLoading: resourcesLoading } = trpc.resource.list.useQuery(undefined, {
    enabled: isAuthenticated && canAccessResources(),
  });

  // 로딩 중
  if (authLoading) {
    return (
      <>
        <SEO title="저널 & 잡지 - 로딩 중" />
        <Header />
        <div className="min-h-screen bg-background pt-16">
          <div className="container py-16">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
    </>
    );
  }

  // 정회원이 아닌 경우
  if (!isAuthenticated || !canAccessResources()) {
    return (
      <>
        <SEO 
          title="저널 & 잡지 - 정회원 전용"
          description="RIQ Society 정회원 전용 저널 및 잡지 아카이브. 최신 연구 자료와 발행물을 다운로드하세요."
          keywords="RIQ Society 저널, 잡지, 정회원 혜택, 연구 자료"
        />
        <Header />
        <div className="min-h-screen bg-background pt-16">
          <div className="container py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <BookOpen className="h-24 w-24 mx-auto text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-4">정회원 전용 컨텐츠</h1>
              <p className="text-lg text-muted-foreground mb-8">
                저널 및 잡지는 정회원만 이용할 수 있습니다.<br />
                입회 신청 승인 및 연회비 결제가 필요합니다.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => setLocation('/application')}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  입회 신청하기
                </Button>
                <p className="text-sm text-muted-foreground">
                  이미 회원이신가요?{' '}
                  <button
                    onClick={() => setLocation('/mypage')}
                    className="text-primary hover:underline"
                  >
                    마이페이지에서 확인하기
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
    </>
    );
  }

  // 저널/잡지만 필터링
  const journalResources = resources
    ? resources.filter((r: any) => 
        r.category === '저널' || r.category === '잡지' || r.category === 'Journal' || r.category === 'Magazine'
      )
    : [];

  // 유형별 분류 (저널 vs 잡지)
  const types = journalResources.length > 0
    ? Array.from(new Set(journalResources.map((r: any) => r.category)))
    : [];

  const filteredJournals = journalResources
    ? selectedType
      ? journalResources.filter((r: any) => r.category === selectedType)
      : journalResources
    : [];

  const handleDownload = (resource: any) => {
    window.open(resource.fileUrl, '_blank');
    toast.success(`${resource.title} 다운로드를 시작합니다.`);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return <FileText className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <>
      <SEO 
        title="저널 & 잡지"
        description="RIQ Society 정회원 전용 저널 및 잡지 아카이브. 최신 연구 자료와 발행물을 다운로드하세요."
        keywords="RIQ Society 저널, 잡지, 정회원 혜택, 연구 자료, 고지능 연구"
      />
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-16">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="h-12 w-12 text-primary mr-4" />
                <h1 className="text-4xl font-bold">저널 & 잡지</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                RIQ Society의 최신 연구 자료와 발행물을 확인하세요
              </p>
            </div>

            {/* 필터 */}
            {types.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                <Button
                  variant={selectedType === null ? 'default' : 'outline'}
                  onClick={() => setSelectedType(null)}
                  size="sm"
                >
                  전체
                </Button>
                {types.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type)}
                    size="sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            )}

            {/* 콘텐츠 */}
            {resourcesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">로딩 중...</p>
              </div>
            ) : filteredJournals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">등록된 저널/잡지가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJournals.map((resource: any) => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {resource.category}
                        </Badge>
                        {resource.fileType && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getFileIcon(resource.fileType)}
                            <span>{resource.fileType.split('/')[1]?.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      {resource.createdAt && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(resource.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {resource.description && (
                        <CardDescription className="mb-4 line-clamp-3 flex-1">
                          {resource.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        {resource.fileSize && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(resource.fileSize)}
                          </span>
                        )}
                        <Button
                          onClick={() => handleDownload(resource)}
                          size="sm"
                          className="ml-auto"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          다운로드
                        </Button>
                      </div>
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

