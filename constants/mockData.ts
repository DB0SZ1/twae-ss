/**
 * twae — Mock Data
 * All static data used across the app for demo purposes.
 */

export interface User {
  id: string;
  fullName: string;
  firstName: string;
  initials: string;
  email: string;
  phone: string;
  tier: number;
  tierLabel: string;
  avatar?: string;
}

export interface WalletBalance {
  currency: 'NGN' | 'USD';
  amount: number;
  accountNumber: string;
  bankName: string;
  flag: string;
  label: string;
}

export interface Transaction {
  id: string;
  name: string;
  type: 'debit' | 'credit';
  category: 'transfer' | 'savings' | 'investment' | 'salary' | 'fx' | 'deposit' | 'withdrawal';
  amount: number;
  currency: 'NGN' | 'USD';
  description: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

export interface SavingsPocket {
  id: string;
  name: string;
  emoji: string;
  currentAmount: number;
  targetAmount: number;
  currency: 'NGN' | 'USD';
  interestRate: number;
  maturityDate: string;
  autoSave?: {
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    nextDate: string;
  };
}

export interface InvestmentHolding {
  id: string;
  symbol: string;
  name: string;
  units: number;
  exchange: string;
  currentPrice: number;
  totalValue: number;
  changePercent: number;
  currency: 'NGN' | 'USD';
  logoColor: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  initials: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'security' | 'promo' | 'system';
  read: boolean;
  date: string;
  time: string;
}

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: 'NGN' | 'USD';
  type: 'stock' | 'etf' | 'tbill';
  exchange: string;
  marketCap?: string;
  volume?: string;
  week52High?: number;
  week52Low?: number;
}

// ── User ──
export const currentUser: User = {
  id: 'usr_001',
  fullName: 'Adaugo Okonkwo',
  firstName: 'Adaugo',
  initials: 'AO',
  email: 'ada.okonkwo@gmail.com',
  phone: '+234 803 456 7890',
  tier: 3,
  tierLabel: 'Tier 3 · Verified',
};

// ── Wallet Balances ──
export const walletBalances: WalletBalance[] = [
  {
    currency: 'NGN',
    amount: 8340200.00,
    accountNumber: '0123456789',
    bankName: 'GTBank',
    flag: '🇳🇬',
    label: 'Naira Wallet',
  },
  {
    currency: 'USD',
    amount: 3972.88,
    accountNumber: '9876543210',
    bankName: 'twae USD',
    flag: '🇺🇸',
    label: 'Dollar Wallet',
  },
];

export const portfolioTotal = 14823500;
export const portfolioChange = 3.24;
export const exchangeRate = { ngnToUsd: 0.00064, usdToNgn: 1560.50 };

// ── Transactions ──
export const transactions: Transaction[] = [
  {
    id: 'txn_001',
    name: 'Transfer to Emeka',
    type: 'debit',
    category: 'transfer',
    amount: 85000,
    currency: 'NGN',
    description: 'GTBank · 10:24 AM',
    date: 'Today',
    time: '10:24 AM',
    status: 'completed',
    reference: 'TWE-A8F3K2L9',
  },
  {
    id: 'txn_002',
    name: 'Auto-Save · House Fund',
    type: 'debit',
    category: 'savings',
    amount: 50000,
    currency: 'NGN',
    description: 'Savings · 08:00 AM',
    date: 'Today',
    time: '08:00 AM',
    status: 'completed',
    reference: 'TWE-B2C4D6E8',
  },
  {
    id: 'txn_003',
    name: 'AAPL Dividend',
    type: 'credit',
    category: 'investment',
    amount: 24.50,
    currency: 'USD',
    description: 'Investment · 3:15 PM',
    date: 'Yesterday',
    time: '3:15 PM',
    status: 'completed',
    reference: 'TWE-C3D5F7G9',
  },
  {
    id: 'txn_004',
    name: 'FX Conversion',
    type: 'credit',
    category: 'fx',
    amount: 310.00,
    currency: 'USD',
    description: 'NGN → USD · 11:02 AM',
    date: 'Yesterday',
    time: '11:02 AM',
    status: 'completed',
    reference: 'TWE-D4E6F8H0',
  },
  {
    id: 'txn_005',
    name: 'Salary Deposit',
    type: 'credit',
    category: 'salary',
    amount: 1200000,
    currency: 'NGN',
    description: 'Paystack · 9:00 AM',
    date: 'Apr 1, 2025',
    time: '9:00 AM',
    status: 'completed',
    reference: 'TWE-E5F7G9I1',
  },
  {
    id: 'txn_006',
    name: 'GT Holdings Purchase',
    type: 'debit',
    category: 'investment',
    amount: 725000,
    currency: 'NGN',
    description: 'Investment · 2:00 PM',
    date: 'Apr 1, 2025',
    time: '2:00 PM',
    status: 'completed',
    reference: 'TWE-F6G8H0J2',
  },
  {
    id: 'txn_007',
    name: 'Netflix Subscription',
    type: 'debit',
    category: 'transfer',
    amount: 6500,
    currency: 'NGN',
    description: 'Recurring · 12:00 AM',
    date: 'Mar 30, 2025',
    time: '12:00 AM',
    status: 'completed',
    reference: 'TWE-G7H9I1K3',
  },
  {
    id: 'txn_008',
    name: 'Freelance Payment',
    type: 'credit',
    category: 'deposit',
    amount: 450000,
    currency: 'NGN',
    description: 'Bank Transfer · 4:30 PM',
    date: 'Mar 28, 2025',
    time: '4:30 PM',
    status: 'completed',
    reference: 'TWE-H8I0J2L4',
  },
];

// ── Savings Pockets ──
export const savingsPockets: SavingsPocket[] = [
  {
    id: 'pkt_001',
    name: 'House Fund',
    emoji: '🏠',
    currentAmount: 4200000,
    targetAmount: 6700000,
    currency: 'NGN',
    interestRate: 14.5,
    maturityDate: 'Dec 2025',
    autoSave: {
      amount: 50000,
      frequency: 'daily',
      nextDate: 'Tomorrow, 8:00 AM',
    },
  },
  {
    id: 'pkt_002',
    name: 'Travel Fund',
    emoji: '✈️',
    currentAmount: 1700000,
    targetAmount: 2000000,
    currency: 'NGN',
    interestRate: 12.0,
    maturityDate: 'Aug 2025',
    autoSave: {
      amount: 25000,
      frequency: 'weekly',
      nextDate: 'Monday, 8:00 AM',
    },
  },
  {
    id: 'pkt_003',
    name: 'Emergency',
    emoji: '🛡️',
    currentAmount: 583100,
    targetAmount: 1000000,
    currency: 'NGN',
    interestRate: 10.0,
    maturityDate: 'Mar 2026',
  },
];

export const totalSavings = 6483100;

// ── Investment Holdings ──
export const investmentHoldings: InvestmentHolding[] = [
  {
    id: 'inv_001',
    symbol: 'DCEM',
    name: 'Dangote Cement',
    units: 120,
    exchange: 'NSE',
    currentPrice: 69500,
    totalValue: 8340000,
    changePercent: 4.20,
    currency: 'NGN',
    logoColor: 'rgba(0,122,62,.06)',
  },
  {
    id: 'inv_002',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    units: 12,
    exchange: 'NASDAQ',
    currentPrice: 178.40,
    totalValue: 2140.80,
    changePercent: -0.84,
    currency: 'USD',
    logoColor: 'rgba(59,130,246,.06)',
  },
  {
    id: 'inv_003',
    symbol: 'GTCO',
    name: 'GT Holdings',
    units: 500,
    exchange: 'NSE',
    currentPrice: 7250,
    totalValue: 3625000,
    changePercent: 1.95,
    currency: 'NGN',
    logoColor: 'rgba(0,122,62,.06)',
  },
  {
    id: 'inv_004',
    symbol: 'NVDA',
    name: 'Nvidia Corp.',
    units: 5,
    exchange: 'NASDAQ',
    currentPrice: 366.42,
    totalValue: 1832.10,
    changePercent: 2.61,
    currency: 'USD',
    logoColor: 'rgba(59,130,246,.06)',
  },
  {
    id: 'inv_005',
    symbol: 'ZNGN',
    name: 'Zenith Bank',
    units: 800,
    exchange: 'NSE',
    currentPrice: 3573.13,
    totalValue: 2858500,
    changePercent: 0.72,
    currency: 'NGN',
    logoColor: 'rgba(0,122,62,.06)',
  },
];

export const portfolioPnLToday = 465000;
export const portfolioPnLAllTime = 23.4;

// ── Market Assets (for Discovery) ──
export const marketAssets: MarketAsset[] = [
  { id: 'ma_001', symbol: 'DCEM', name: 'Dangote Cement', price: 1240.50, changePercent: 4.28, currency: 'NGN', type: 'stock', exchange: 'NSE', marketCap: '₦4.2T', volume: '12.3M' },
  { id: 'ma_002', symbol: 'GTCO', name: 'GT Holdings', price: 72.50, changePercent: 1.95, currency: 'NGN', type: 'stock', exchange: 'NSE', marketCap: '₦2.1T', volume: '8.7M' },
  { id: 'ma_003', symbol: 'ZNGN', name: 'Zenith Bank', price: 35.73, changePercent: 0.72, currency: 'NGN', type: 'stock', exchange: 'NSE', marketCap: '₦1.1T', volume: '5.2M' },
  { id: 'ma_004', symbol: 'AAPL', name: 'Apple Inc.', price: 178.40, changePercent: -0.84, currency: 'USD', type: 'stock', exchange: 'NASDAQ', marketCap: '$2.8T', volume: '54.2M' },
  { id: 'ma_005', symbol: 'NVDA', name: 'Nvidia Corp.', price: 366.42, changePercent: 2.61, currency: 'USD', type: 'stock', exchange: 'NASDAQ', marketCap: '$905B', volume: '41.8M' },
  { id: 'ma_006', symbol: 'MSFT', name: 'Microsoft', price: 425.22, changePercent: 0.43, currency: 'USD', type: 'stock', exchange: 'NASDAQ', marketCap: '$3.1T', volume: '22.1M' },
  { id: 'ma_007', symbol: 'FGN-TB', name: 'FGN T-Bill 91D', price: 100, changePercent: 0, currency: 'NGN', type: 'tbill', exchange: 'DMO', marketCap: '—', volume: '—' },
  { id: 'ma_008', symbol: 'SP500', name: 'S&P 500 ETF', price: 520.18, changePercent: 1.12, currency: 'USD', type: 'etf', exchange: 'NYSE', marketCap: '$420B', volume: '78.5M' },
];

// ── Beneficiaries ──
export const beneficiaries: Beneficiary[] = [
  { id: 'ben_001', name: 'Emeka Obi', bankName: 'GTBank', accountNumber: '0123456789', initials: 'EO' },
  { id: 'ben_002', name: 'Chiamaka Eze', bankName: 'Access Bank', accountNumber: '9876543210', initials: 'CE' },
  { id: 'ben_003', name: 'Tunde Balogun', bankName: 'UBA', accountNumber: '5432167890', initials: 'TB' },
  { id: 'ben_004', name: 'Aisha Mohammed', bankName: 'First Bank', accountNumber: '1122334455', initials: 'AM' },
];

// ── Notifications ──
export const notifications: Notification[] = [
  { id: 'notif_001', title: 'Transfer Successful', message: '₦85,000 sent to Emeka Obi', type: 'transaction', read: false, date: 'Today', time: '10:24 AM' },
  { id: 'notif_002', title: 'Auto-Save Complete', message: '₦50,000 saved to House Fund', type: 'transaction', read: false, date: 'Today', time: '08:00 AM' },
  { id: 'notif_003', title: 'Dividend Received', message: 'AAPL dividend of $24.50 credited', type: 'transaction', read: true, date: 'Yesterday', time: '3:15 PM' },
  { id: 'notif_004', title: 'New Login Detected', message: 'Login from iPhone 15 Pro, Lagos', type: 'security', read: true, date: 'Yesterday', time: '9:00 AM' },
  { id: 'notif_005', title: 'Rate Alert', message: 'USD/NGN rate dropped to ₦1,560', type: 'system', read: true, date: 'Apr 1', time: '2:00 PM' },
  { id: 'notif_006', title: 'Weekend Promo', message: 'Get 15% APY on new savings pockets', type: 'promo', read: true, date: 'Mar 30', time: '10:00 AM' },
];

// ── Bank List (for Send Money) ──
export const bankList = [
  'GTBank', 'Access Bank', 'UBA', 'First Bank', 'Zenith Bank',
  'Wema Bank', 'Stanbic IBTC', 'Fidelity Bank', 'FCMB', 'Sterling Bank',
  'Union Bank', 'Ecobank', 'Polaris Bank', 'Keystone Bank', 'Kuda Bank',
  'OPay', 'PalmPay', 'Moniepoint',
];

// ── Risk Profile Questions ──
export const riskProfileQuestions = [
  {
    question: 'How long do you plan to keep your investments?',
    options: ['Less than 1 year', '1-3 years', '3-5 years', 'More than 5 years'],
  },
  {
    question: 'How would you react if your portfolio dropped 20% in a month?',
    options: ['Sell everything immediately', 'Sell some holdings', 'Hold and wait', 'Buy more'],
  },
  {
    question: 'Which best describes your investment goal?',
    options: ['Preserve capital', 'Steady income', 'Balanced growth', 'Maximum growth'],
  },
  {
    question: 'What percentage of your income can you invest monthly?',
    options: ['Less than 5%', '5-15%', '15-30%', 'More than 30%'],
  },
  {
    question: 'How much investment experience do you have?',
    options: ['None', 'Beginner', 'Intermediate', 'Expert'],
  },
];
