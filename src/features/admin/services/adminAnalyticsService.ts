import { db } from '@/firebase';
import { 
  collection, query, where, getDocs, Timestamp, getCountFromServer 
} from 'firebase/firestore';

export type DateRangeType = 
  | 'today' 
  | 'yesterday' 
  | '7days' 
  | '30days' 
  | '90days' 
  | 'thisMonth' 
  | 'lastMonth' 
  | 'thisYear' 
  | 'custom';

export interface DateRangeFilter {
  type: DateRangeType;
  customStart?: Date;
  customEnd?: Date;
}

export interface KpiMetric {
  value: number | string;
  percentChange: number | null; // e.g. 12.4
  status: 'up' | 'down' | 'neutral' | 'no_data';
}

export interface DashboardStats {
  totalUsers: number;
  kpis: {
    visitors: KpiMetric;
    users: KpiMetric;
    newUsers: KpiMetric;
    activeUsers: KpiMetric;
    pageViews: KpiMetric;
    clicks: KpiMetric;
    orders: KpiMetric;
    revenue: KpiMetric;
    aov: KpiMetric;
    conversionRate: KpiMetric;
  };
  charts: {
    dates: string[];
    visitors: number[];
    pageViews: number[];
    revenue: number[];
    orders: number[];
  };
  audience: {
    devices: { label: string; value: number }[];
    browsers: { label: string; value: number }[];
    systems: { label: string; value: number }[];
    countries: { label: string; value: number }[];
  };
  funnel: {
    visitors: number;
    productViews: number;
    buyNowClicks: number;
    checkoutStarts: number;
    purchases: number;
  };
  searchTerms: { term: string; count: number; hasResults: number; noResults: number }[];
  productPerformance: {
    id: string;
    title: string;
    category: string;
    price: string;
    views: number;
    clicks: number;
    orders: number;
    revenue: number;
    conversion: number;
    downloads: number;
  }[];
  recentOrders: {
    id: string;
    customerName: string;
    customerEmail: string;
    productTitle: string;
    amount: number;
    date: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    message: string;
    timeLabel: string;
    timestamp: Date;
  }[];
}

/**
 * Returns date limits (start, end) for both the current selected period 
 * and the previous equivalent period for comparison.
 */
export function getPeriods(filter: DateRangeFilter): {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
} {
  const now = new Date();
  let currentStart = new Date();
  let currentEnd = new Date(now);
  let previousStart = new Date();
  let previousEnd = new Date();

  // Set currentEnd to end of today
  currentEnd.setHours(23, 59, 59, 999);

  switch (filter.type) {
    case 'today':
      currentStart.setHours(0, 0, 0, 0);
      
      previousStart.setDate(currentStart.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setDate(currentEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      break;

    case 'yesterday':
      currentStart.setDate(now.getDate() - 1);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd.setDate(now.getDate() - 1);
      currentEnd.setHours(23, 59, 59, 999);

      previousStart.setDate(currentStart.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setDate(currentEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      break;

    case '7days':
      currentStart.setDate(now.getDate() - 6);
      currentStart.setHours(0, 0, 0, 0);

      previousStart.setDate(currentStart.getDate() - 7);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setDate(currentStart.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      break;

    case '30days':
      currentStart.setDate(now.getDate() - 29);
      currentStart.setHours(0, 0, 0, 0);

      previousStart.setDate(currentStart.getDate() - 30);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setDate(currentStart.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      break;

    case '90days':
      currentStart.setDate(now.getDate() - 89);
      currentStart.setHours(0, 0, 0, 0);

      previousStart.setDate(currentStart.getDate() - 90);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setDate(currentStart.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      break;

    case 'thisMonth':
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const daysInCurrent = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth() - 1, daysInCurrent);
      previousEnd.setHours(23, 59, 59, 999);
      break;

    case 'lastMonth':
      currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      currentEnd.setHours(23, 59, 59, 999);

      previousStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      previousEnd.setHours(23, 59, 59, 999);
      break;

    case 'thisYear':
      currentStart = new Date(now.getFullYear(), 0, 1);

      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      // matching up to the same date last year
      previousEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      previousEnd.setHours(23, 59, 59, 999);
      break;

    case 'custom':
      currentStart = filter.customStart ? new Date(filter.customStart) : new Date(now.setDate(now.getDate() - 30));
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = filter.customEnd ? new Date(filter.customEnd) : new Date();
      currentEnd.setHours(23, 59, 59, 999);

      const duration = currentEnd.getTime() - currentStart.getTime();
      previousStart = new Date(currentStart.getTime() - duration - 1);
      previousEnd = new Date(currentStart.getTime() - 1);
      break;
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
}

// Compute percentage change helper
function calculatePercentageChange(currValue: number, prevValue: number): { percent: number | null, status: 'up' | 'down' | 'neutral' | 'no_data' } {
  if (prevValue === 0) {
    if (currValue === 0) return { percent: 0, status: 'neutral' };
    return { percent: null, status: 'no_data' }; // Indeterminate increase
  }
  const diff = ((currValue - prevValue) / prevValue) * 100;
  return {
    percent: Math.abs(parseFloat(diff.toFixed(1))),
    status: diff > 0 ? 'up' : (diff < 0 ? 'down' : 'neutral')
  };
}

/**
 * Main analytics service aggregator.
 * Fetches all necessary documents and compiles stats without manual client-side listing overhead where possible.
 */
export async function fetchDashboardAnalytics(filter: DateRangeFilter): Promise<DashboardStats> {
  const { currentStart, currentEnd, previousStart, previousEnd } = getPeriods(filter);

  // 1. Fetch Total registered users count directly from server (cheap metadata count)
  const totalUsersSnap = await getCountFromServer(collection(db, 'users'));
  const totalUsers = totalUsersSnap.data().count;

  // 2. Fetch users in ranges to compute New Users
  const usersCollection = collection(db, 'users');
  
  // Current period users
  const currUsersQuery = query(
    usersCollection, 
    where('createdAt', '>=', Timestamp.fromDate(currentStart)),
    where('createdAt', '<=', Timestamp.fromDate(currentEnd))
  );
  const currUsersSnap = await getDocs(currUsersQuery);
  const currentNewUsers = currUsersSnap.size;

  // Previous period users
  const prevUsersQuery = query(
    usersCollection,
    where('createdAt', '>=', Timestamp.fromDate(previousStart)),
    where('createdAt', '<=', Timestamp.fromDate(previousEnd))
  );
  const prevUsersSnap = await getDocs(prevUsersQuery);
  const previousNewUsers = prevUsersSnap.size;

  // 3. Fetch Transactions (ISO date strings) for revenue analytics
  // Since we want to compare, we query all transactions from previousStart to currentEnd
  const txCollection = collection(db, 'transactions');
  const txQuery = query(
    txCollection,
    where('date', '>=', previousStart.toISOString()),
    where('date', '<=', currentEnd.toISOString())
  );
  const txSnap = await getDocs(txQuery);
  
  const allTxs = txSnap.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as any[];

  // Separate current vs previous period transactions
  const currentTxs = allTxs.filter(tx => new Date(tx.date) >= currentStart && new Date(tx.date) <= currentEnd);
  const previousTxs = allTxs.filter(tx => new Date(tx.date) >= previousStart && new Date(tx.date) <= previousEnd);

  // Calculate Revenue, Orders, and AOV
  const currentRevenue = currentTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const previousRevenue = previousTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const currentOrders = currentTxs.length;
  const previousOrders = previousTxs.length;

  const currentAov = currentOrders > 0 ? parseFloat((currentRevenue / currentOrders).toFixed(2)) : 0;
  const previousAov = previousOrders > 0 ? parseFloat((previousRevenue / previousOrders).toFixed(2)) : 0;

  // 4. Fetch Analytics events (Firestore Timestamps)
  const eventsCollection = collection(db, 'analytics_events');
  const eventsQuery = query(
    eventsCollection,
    where('timestamp', '>=', Timestamp.fromDate(previousStart)),
    where('timestamp', '<=', Timestamp.fromDate(currentEnd))
  );
  const eventsSnap = await getDocs(eventsQuery);
  const allEvents = eventsSnap.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as any[];

  const currentEvents = allEvents.filter(ev => ev.timestamp && ev.timestamp.toDate() >= currentStart && ev.timestamp.toDate() <= currentEnd);
  const previousEvents = allEvents.filter(ev => ev.timestamp && ev.timestamp.toDate() >= previousStart && ev.timestamp.toDate() <= previousEnd);

  // Helper to extract session count (visitors)
  const countVisitors = (evs: any[]) => new Set(evs.map(ev => ev.sessionId)).size;
  const countPageViews = (evs: any[]) => evs.filter(ev => ev.eventName === 'page_view').length;
  const countClicks = (evs: any[]) => evs.filter(ev => ev.eventName !== 'page_view' && ev.eventName !== 'product_viewed').length;
  const countActiveUsers = (evs: any[]) => new Set(evs.filter(ev => ev.userId !== 'anonymous').map(ev => ev.userId)).size;

  const currentVisitors = countVisitors(currentEvents);
  const previousVisitors = countVisitors(previousEvents);

  const currentPageViews = countPageViews(currentEvents);
  const previousPageViews = countPageViews(previousEvents);

  const currentClicks = countClicks(currentEvents);
  const previousClicks = countClicks(previousEvents);

  const currentActiveUsers = countActiveUsers(currentEvents);
  const previousActiveUsers = countActiveUsers(previousEvents);

  // Conversion calculations: purchases / unique sessions (visitors)
  const currentConv = currentVisitors > 0 ? parseFloat(((currentOrders / currentVisitors) * 100).toFixed(2)) : 0;
  const previousConv = previousVisitors > 0 ? parseFloat(((previousOrders / previousVisitors) * 100).toFixed(2)) : 0;

  // Compile KPI card metrics
  const compileKpi = (curr: number, prev: number): KpiMetric => {
    const { percent, status } = calculatePercentageChange(curr, prev);
    return { value: curr, percentChange: percent, status };
  };

  const compileKpiPrice = (curr: number, prev: number): KpiMetric => {
    const { percent, status } = calculatePercentageChange(curr, prev);
    return { value: `₹${curr}`, percentChange: percent, status };
  };

  const kpis = {
    visitors: compileKpi(currentVisitors, previousVisitors),
    users: { value: totalUsers, percentChange: null, status: 'neutral' as const },
    newUsers: compileKpi(currentNewUsers, previousNewUsers),
    activeUsers: compileKpi(currentActiveUsers, previousActiveUsers),
    pageViews: compileKpi(currentPageViews, previousPageViews),
    clicks: compileKpi(currentClicks, previousClicks),
    orders: compileKpi(currentOrders, previousOrders),
    revenue: compileKpiPrice(currentRevenue, previousRevenue),
    aov: compileKpiPrice(currentAov, previousAov),
    conversionRate: {
      value: `${currentConv}%`,
      percentChange: calculatePercentageChange(currentConv, previousConv).percent,
      status: calculatePercentageChange(currentConv, previousConv).status
    }
  };

  // 5. Aggregate timeseries chart data
  // Generate daily intervals list for the current period
  const dateStrList: string[] = [];
  const chartVisitors: number[] = [];
  const chartPageViews: number[] = [];
  const chartRevenue: number[] = [];
  const chartOrders: number[] = [];

  const tempDate = new Date(currentStart);
  while (tempDate <= currentEnd) {
    const label = tempDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dateStrList.push(label);
    
    // Filter items falling on this specific calendar day
    const dayStart = new Date(tempDate);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(tempDate);
    dayEnd.setHours(23,59,59,999);

    const dayEvents = currentEvents.filter(ev => {
      const d = ev.timestamp?.toDate();
      return d && d >= dayStart && d <= dayEnd;
    });

    const dayTxs = currentTxs.filter(tx => {
      const d = new Date(tx.date);
      return d >= dayStart && d <= dayEnd;
    });

    chartVisitors.push(countVisitors(dayEvents));
    chartPageViews.push(countPageViews(dayEvents));
    chartOrders.push(dayTxs.length);
    chartRevenue.push(dayTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0));

    tempDate.setDate(tempDate.getDate() + 1);
  }

  // 6. Aggregate Audience breakdown (devices, browsers, OS, countries)
  const aggregateProperty = (evs: any[], prop: string): { label: string; value: number }[] => {
    const counts: Record<string, number> = {};
    evs.forEach(ev => {
      const val = ev[prop] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    });
    
    const total = Object.values(counts).reduce((s, c) => s + c, 0);
    if (total === 0) return [];

    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        value: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // limit to top 5
  };

  const audience = {
    devices: aggregateProperty(currentEvents, 'device'),
    browsers: aggregateProperty(currentEvents, 'browser'),
    systems: aggregateProperty(currentEvents, 'os'),
    countries: aggregateProperty(currentEvents, 'country')
  };

  // 7. Funnel conversion tracking based on behavioral events
  const funnel = {
    visitors: currentVisitors,
    productViews: new Set(currentEvents.filter(ev => ev.eventName === 'product_viewed').map(ev => ev.sessionId)).size,
    buyNowClicks: new Set(currentEvents.filter(ev => ev.eventName === 'buy_now_clicked').map(ev => ev.sessionId)).size,
    checkoutStarts: new Set(currentEvents.filter(ev => ev.eventName === 'checkout_started').map(ev => ev.sessionId)).size,
    purchases: currentOrders // successful orders
  };

  // 8. Search query performance
  const searchCounts: Record<string, { term: string; count: number; hasResults: number; noResults: number }> = {};
  currentEvents.filter(ev => ev.eventName === 'search_submitted').forEach(ev => {
    const term = ev.metadata?.searchTerm?.trim();
    if (!term) return;
    const key = term.toLowerCase();
    const resultsCount = ev.metadata?.resultsCount || 0;

    if (!searchCounts[key]) {
      searchCounts[key] = { term, count: 0, hasResults: 0, noResults: 0 };
    }
    searchCounts[key].count++;
    if (resultsCount > 0) {
      searchCounts[key].hasResults++;
    } else {
      searchCounts[key].noResults++;
    }
  });

  const searchTerms = Object.values(searchCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 9. Listings Catalog & Product Performance Table
  // Fetch active products list
  const productsSnap = await getDocs(collection(db, 'products'));
  const productsList = productsSnap.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as any[];

  const productPerformance = productsList.map(prod => {
    // Filter events and transactions for this product
    const prodEvents = currentEvents.filter(ev => ev.metadata?.productId === prod.id);
    const views = prodEvents.filter(ev => ev.eventName === 'product_viewed').length;
    const clicks = prodEvents.filter(ev => ev.eventName === 'product_clicked').length;
    const downloads = prodEvents.filter(ev => ev.eventName === 'download_clicked').length;
    
    // Revenue and order count matching this product name
    const prodTxs = currentTxs.filter(tx => tx.projectTitle === prod.title);
    const orders = prodTxs.length;
    const revenue = prodTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const conversion = views > 0 ? parseFloat(((orders / views) * 100).toFixed(1)) : 0;

    return {
      id: prod.id,
      title: prod.title,
      category: prod.category || 'Website',
      price: prod.price || '₹0',
      views,
      clicks,
      orders,
      revenue,
      conversion,
      downloads
    };
  });

  // 10. Compile recent orders list
  const recentOrders = currentTxs.map(tx => ({
    id: tx.id,
    customerName: tx.userName || 'Anonymous User',
    customerEmail: tx.userEmail || 'no-email@codebazaar.com',
    productTitle: tx.projectTitle || 'Project Template',
    amount: tx.amount || 0,
    date: tx.date
  })).slice(0, 10);

  // 11. Compile recent activity stream
  // Compile registration, purchases, views, downloads
  const activityList: { id: string; type: string; message: string; timestamp: Date }[] = [];

  // Purchases
  currentTxs.forEach(tx => {
    activityList.push({
      id: tx.id,
      type: 'purchase',
      message: `Order completed: "${tx.userName}" purchased "${tx.projectTitle}" for ₹${tx.amount}`,
      timestamp: new Date(tx.date)
    });
  });

  // Registrations (recent user profiles)
  currUsersSnap.forEach(docSnap => {
    const u = docSnap.data();
    const ts = u.createdAt?.toDate() || new Date();
    activityList.push({
      id: docSnap.id,
      type: 'register',
      message: `New user registered: "${u.name || u.email}"`,
      timestamp: ts
    });
  });

  // Product Downloads
  currentEvents.filter(ev => ev.eventName === 'download_clicked').forEach(ev => {
    const ts = ev.timestamp?.toDate() || new Date();
    activityList.push({
      id: ev.id || Math.random().toString(),
      type: 'download',
      message: `Secure product download: "${ev.userEmail || 'Anonymous'}" downloaded "${ev.metadata?.productTitle || 'ZIP template'}"`,
      timestamp: ts
    });
  });

  // Product CRUD
  currentEvents.filter(ev => ['admin_product_created', 'admin_product_updated', 'admin_product_deleted'].includes(ev.eventName)).forEach(ev => {
    const ts = ev.timestamp?.toDate() || new Date();
    let action = 'modified';
    if (ev.eventName === 'admin_product_created') action = 'uploaded';
    if (ev.eventName === 'admin_product_deleted') action = 'deleted';

    activityList.push({
      id: ev.id || Math.random().toString(),
      type: 'admin',
      message: `Admin ${action} product: "${ev.metadata?.productTitle || ev.metadata?.productId}"`,
      timestamp: ts
    });
  });

  // Sort and format relative label
  const recentActivity = activityList
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 15)
    .map(act => {
      const minutesAgo = Math.round((now.getTime() - act.timestamp.getTime()) / (1000 * 60));
      let timeLabel = '';
      if (minutesAgo < 1) timeLabel = 'Just now';
      else if (minutesAgo < 60) timeLabel = `${minutesAgo} minutes ago`;
      else if (minutesAgo < 1440) timeLabel = `${Math.round(minutesAgo / 60)} hours ago`;
      else timeLabel = act.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      return {
        ...act,
        timeLabel
      };
    });

  return {
    totalUsers,
    kpis,
    charts: {
      dates: dateStrList,
      visitors: chartVisitors,
      pageViews: chartPageViews,
      revenue: chartRevenue,
      orders: chartOrders
    },
    audience,
    funnel,
    searchTerms,
    productPerformance,
    recentOrders,
    recentActivity
  };
}
