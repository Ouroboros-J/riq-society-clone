/**
 * PostHog API 헬퍼 함수
 * PostHog API를 통해 통계 데이터를 조회합니다.
 */

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '12345'; // 기본값

interface PostHogEvent {
  event: string;
  timestamp: string;
  properties: Record<string, any>;
}

interface PostHogInsight {
  result: Array<{
    label: string;
    count: number;
    data: number[];
  }>;
}

/**
 * PostHog API 호출
 */
async function callPostHogAPI(endpoint: string, method: string = 'GET', body?: any) {
  if (!POSTHOG_API_KEY) {
    throw new Error('POSTHOG_API_KEY is not set');
  }

  const url = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`PostHog API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * 이벤트 통계 조회
 */
export async function getEventStats(dateFrom: string, dateTo: string) {
  try {
    const events = ['application_submitted', 'payment_request_submitted', 'review_request_submitted'];
    const stats: Record<string, number> = {};

    for (const event of events) {
      const data = await callPostHogAPI(`/insights/trend/?events=[{"id":"${event}"}]&date_from=${dateFrom}&date_to=${dateTo}`);
      stats[event] = data.result?.[0]?.count || 0;
    }

    return stats;
  } catch (error) {
    console.error('Failed to fetch PostHog event stats:', error);
    return {
      application_submitted: 0,
      payment_request_submitted: 0,
      review_request_submitted: 0,
    };
  }
}

/**
 * 페이지뷰 통계 조회
 */
export async function getPageViewStats(dateFrom: string, dateTo: string) {
  try {
    const data = await callPostHogAPI(`/insights/trend/?events=[{"id":"$pageview"}]&date_from=${dateFrom}&date_to=${dateTo}&breakdown=$current_url`);
    
    const pageViews: Record<string, number> = {};
    if (data.result) {
      for (const item of data.result) {
        pageViews[item.label] = item.count;
      }
    }

    return pageViews;
  } catch (error) {
    console.error('Failed to fetch PostHog pageview stats:', error);
    return {};
  }
}

/**
 * 전환율 통계 조회
 */
export async function getConversionStats(dateFrom: string, dateTo: string) {
  try {
    // 방문자 수
    const visitorsData = await callPostHogAPI(`/insights/trend/?events=[{"id":"$pageview"}]&date_from=${dateFrom}&date_to=${dateTo}`);
    const totalVisitors = visitorsData.result?.[0]?.count || 0;

    // 입회 신청 수
    const applicationsData = await callPostHogAPI(`/insights/trend/?events=[{"id":"application_submitted"}]&date_from=${dateFrom}&date_to=${dateTo}`);
    const totalApplications = applicationsData.result?.[0]?.count || 0;

    // 결제 요청 수
    const paymentsData = await callPostHogAPI(`/insights/trend/?events=[{"id":"payment_request_submitted"}]&date_from=${dateFrom}&date_to=${dateTo}`);
    const totalPayments = paymentsData.result?.[0]?.count || 0;

    return {
      totalVisitors,
      totalApplications,
      totalPayments,
      applicationConversionRate: totalVisitors > 0 ? (totalApplications / totalVisitors) * 100 : 0,
      paymentConversionRate: totalApplications > 0 ? (totalPayments / totalApplications) * 100 : 0,
    };
  } catch (error) {
    console.error('Failed to fetch PostHog conversion stats:', error);
    return {
      totalVisitors: 0,
      totalApplications: 0,
      totalPayments: 0,
      applicationConversionRate: 0,
      paymentConversionRate: 0,
    };
  }
}

