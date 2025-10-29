import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { trpc } from '../lib/trpc';
import Header from '../components/Header';
import Footer from "@/components/Footer";
import SEO from '../components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function FAQ() {
  const { data: faqs, isLoading } = trpc.faq.list.useQuery();
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  // 카테고리별로 FAQ 그룹화
  const faqsByCategory = faqs?.reduce((acc, faq) => {
    const category = faq.category || '일반';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  return (
    <>
      <SEO 
        title="자주 묻는 질문 (FAQ)"
        description="RIQ Society에 대해 자주 묻는 질문과 답변. 입회 자격, 신청 절차, 회비, 혜택 등에 대한 정보를 확인하세요."
        keywords="RIQ Society FAQ, 자주 묻는 질문, 입회 자격, 신청 방법, 회비"
      />
      {faqs && faqs.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map((faq: any) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        </Helmet>
      )}
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">자주 묻는 질문</h1>
              <p className="text-xl text-muted-foreground">
                RIQ Society에 대해 궁금하신 점을 확인해보세요
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">로딩 중...</p>
              </div>
            ) : faqsByCategory && Object.keys(faqsByCategory).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold mb-4">{category}</h2>
                    <div className="space-y-4">
                      {categoryFaqs?.map((faq) => (
                        <Card key={faq.id} className="overflow-hidden">
                          <button
                            className="w-full text-left"
                            onClick={() => toggleFaq(faq.id)}
                          >
                            <CardHeader className="hover:bg-accent/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{faq.question}</CardTitle>
                                {openId === faq.id ? (
                                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                                )}
                              </div>
                            </CardHeader>
                          </button>
                          {openId === faq.id && (
                            <CardContent className="pt-0">
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap text-muted-foreground">
                                  {faq.answer}
                                </p>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">등록된 FAQ가 없습니다.</p>
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
