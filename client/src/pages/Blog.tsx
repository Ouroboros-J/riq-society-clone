import { trpc } from '../lib/trpc';
import Header from '../components/Header';
import Footer from "@/components/Footer";
import SEO from '../components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'wouter';
import { Calendar, User } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Blog() {
  const { data: blogs, isLoading } = trpc.blog.list.useQuery();

  // 카테고리별로 블로그 그룹화
  const blogsByCategory = blogs?.reduce((acc, blog) => {
    const category = blog.category || '일반';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(blog);
    return acc;
  }, {} as Record<string, typeof blogs>);

  return (
    <>
      <SEO 
        title="블로그"
        description="RIQ Society의 최신 소식, 행사, 연구 결과, 회원 이야기를 확인하세요."
        keywords="RIQ Society 블로그, 고지능 연구, 멘사 소식, 회원 활동"
      />
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">블로그</h1>
              <p className="text-xl text-muted-foreground">
                RIQ Society의 최신 소식과 정보를 확인하세요
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">로딩 중...</p>
              </div>
            ) : blogsByCategory && Object.keys(blogsByCategory).length > 0 ? (
              <div className="space-y-12">
                {Object.entries(blogsByCategory).map(([category, categoryBlogs]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold mb-6">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryBlogs?.map((blog) => (
                        <Link key={blog.id} href={`/blog/${blog.slug}`}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                            {blog.thumbnailUrl && (
                              <div className="aspect-video overflow-hidden rounded-t-lg">
                                <img
                                  src={blog.thumbnailUrl}
                                  alt={blog.title}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                              </div>
                            )}
                            <CardHeader>
                              <div className="flex items-center gap-2 mb-2">
                                {blog.category && (
                                  <Badge variant="secondary">{blog.category}</Badge>
                                )}
                              </div>
                              <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                              {blog.excerpt && (
                                <CardDescription className="line-clamp-3">
                                  {blog.excerpt}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {blog.publishedAt
                                    ? new Date(blog.publishedAt).toLocaleDateString('ko-KR')
                                    : new Date(blog.createdAt).toLocaleDateString('ko-KR')}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">등록된 블로그 글이 없습니다.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

