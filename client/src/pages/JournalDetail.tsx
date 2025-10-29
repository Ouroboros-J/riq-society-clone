import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRole } from "@/_core/hooks/useRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Eye, Calendar, Share2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

export default function JournalDetail() {
  const [, params] = useRoute("/journals/:slug");
  const slug = params?.slug;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { canAccessResources } = useRole();

  const journalQuery = trpc.journal.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug && isAuthenticated && canAccessResources }
  );

  const incrementViewMutation = trpc.journal.incrementViewCount.useMutation();

  // Increment view count on mount
  useEffect(() => {
    if (journalQuery.data?.id && !incrementViewMutation.isSuccess) {
      incrementViewMutation.mutate({ id: journalQuery.data.id });
    }
  }, [journalQuery.data?.id]);

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
        <SEO title="접근 제한 - RIQ Society" />
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                이 콘텐츠는 정회원만 열람할 수 있습니다.
              </p>
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

  if (journalQuery.isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (!journalQuery.data) {
    return (
      <>
        <SEO title="저널을 찾을 수 없습니다 - RIQ Society" />
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">저널을 찾을 수 없습니다.</p>
              <Button asChild variant="outline">
                <Link href="/journals">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  목록으로 돌아가기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const journal = journalQuery.data;

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("링크가 클립보드에 복사되었습니다", {
      icon: <Check className="h-4 w-4" />,
    });
  };

  const handleDownloadPdf = () => {
    if (journal.pdfUrl) {
      window.open(journal.pdfUrl, "_blank");
      toast.success("PDF 다운로드를 시작합니다");
    }
  };

  return (
    <>
      <SEO
        title={`${journal.title} - RIQ Society 저널`}
        description={journal.excerpt || journal.title}
        keywords={`RIQ Society, 저널, ${journal.category || ""}`}
        ogImage={journal.thumbnailUrl}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Back Button */}
        <section className="py-6 px-4 md:px-10 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="ghost" size="sm">
              <Link href="/journals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로
              </Link>
            </Button>
          </div>
        </section>

        {/* Article Header */}
        <article className="py-12 px-4 md:px-10">
          <div className="max-w-4xl mx-auto">
            {/* Thumbnail */}
            {journal.thumbnailUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
                <img
                  src={journal.thumbnailUrl}
                  alt={journal.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {journal.category && <Badge variant="secondary">{journal.category}</Badge>}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(journal.publishedAt || journal.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {journal.viewCount || 0} 조회
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{journal.title}</h1>

            {/* Excerpt */}
            {journal.excerpt && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {journal.excerpt}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {journal.pdfUrl && (
                <Button onClick={handleDownloadPdf}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF 다운로드
                </Button>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                공유
              </Button>
            </div>

            <Separator className="mb-8" />

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {journal.content}
              </ReactMarkdown>
            </div>

            <Separator className="my-12" />

            {/* Related Journals */}
            <RelatedJournals currentJournalId={journal.id} category={journal.category} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function RelatedJournals({ currentJournalId, category }: { currentJournalId: number; category?: string | null }) {
  const journalsQuery = trpc.journal.list.useQuery();

  const relatedJournals = (journalsQuery.data || [])
    .filter((j) => j.id !== currentJournalId && (!category || j.category === category))
    .slice(0, 3);

  if (relatedJournals.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">관련 저널</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedJournals.map((journal) => (
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
              <CardContent className="pt-4">
                {journal.category && (
                  <Badge variant="secondary" className="mb-2">
                    {journal.category}
                  </Badge>
                )}
                <h3 className="font-semibold line-clamp-2 mb-2">{journal.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(journal.publishedAt || journal.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

