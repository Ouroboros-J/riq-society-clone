import { useRoute } from 'wouter';
import { trpc } from '../lib/trpc';
import Header from '../components/Header';
import Footer from "@/components/Footer";
import SEO from '../components/SEO';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function BlogPost() {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug || '';

  const { data: blog, isLoading } = trpc.blog.getBySlug.useQuery({ slug }, {
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <>
        <SEO title="로딩 중..." />
        <Header />
        <div className="min-h-screen bg-background pt-16">
          <div className="container py-16">
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-muted-foreground">로딩 중...</p>
            </div>
          </div>
        </div>
        <Footer />
    </>
    );
  }

  if (!blog) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16">
          <div className="container py-16">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">블로그 글을 찾을 수 없습니다.</p>
                <Link href="/blog">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    목록으로 돌아가기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
    </>
    );
  }

  return (
    <>
      <SEO 
        title={blog?.title || '블로그 글'}
        description={blog?.content?.substring(0, 160) || 'RIQ Society 블로그 글'}
        keywords={`RIQ Society, 블로그, ${blog?.category || ''}`}
        image={blog?.thumbnailUrl || undefined}
        type="article"
        author="RIQ Society"
        publishedTime={blog?.createdAt?.toISOString()}
        modifiedTime={blog?.updatedAt?.toISOString()}
      />
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로
              </Button>
            </Link>

            <article>
              {blog.thumbnailUrl && (
                <div className="aspect-video overflow-hidden rounded-lg mb-8">
                  <img
                    src={blog.thumbnailUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="mb-8">
                {blog.category && (
                  <Badge variant="secondary" className="mb-4">
                    {blog.category}
                  </Badge>
                )}
                <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : new Date(blog.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {blog.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}

