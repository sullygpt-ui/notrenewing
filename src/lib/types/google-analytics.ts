export type GAMetrics = {
  pageViews: number
  sessions: number
  users: number
  newUsers: number
  bounceRate: number
  avgSessionDuration: number
  engagementRate: number
  eventCount: number
}

export type GATrafficSource = {
  source: string
  medium: string
  sessions: number
  users: number
}

export type GATopPage = {
  path: string
  title: string
  views: number
  avgDuration: number
  bounceRate: number
}

export type GADailyMetric = {
  date: string
  pageViews: number
  sessions: number
  users: number
}

export type GADashboardData = {
  coreMetrics: GAMetrics
  trafficSources: GATrafficSource[]
  topPages: GATopPage[]
  dailyMetrics: GADailyMetric[]
  dateRange: {
    startDate: string
    endDate: string
  }
}
