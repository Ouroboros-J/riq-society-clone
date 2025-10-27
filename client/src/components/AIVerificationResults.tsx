import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";

interface AIVerificationResultsProps {
  applicationId?: number;
}

export function AIVerificationResults({ applicationId }: AIVerificationResultsProps) {
  const { data: verifications, isLoading } = trpc.aiVerification.getByApplicationId.useQuery(
    { applicationId: applicationId! },
    { enabled: !!applicationId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!verifications || verifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        AI 검증 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verifications.map((verification: any, index: number) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {verification.platform.toUpperCase()} - {verification.model}
              </CardTitle>
              <Badge variant={
                verification.result === 'approved' ? 'default' :
                verification.result === 'rejected' ? 'destructive' :
                'secondary'
              }>
                {verification.result === 'approved' ? '승인' :
                 verification.result === 'rejected' ? '거부' :
                 '불확실'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">신뢰도:</span> {verification.confidence}%
            </div>
            <div>
              <span className="font-semibold">사유:</span>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {verification.reasoning}
              </p>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                원본 응답 보기
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-x-auto">
                {verification.rawResponse}
              </pre>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

