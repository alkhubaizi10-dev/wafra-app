import React, { useState, useMemo, useEffect, useRef, useCallback, Component } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Book, Wallet, TrendingUp, Plus, Flame, ChevronRight, ChevronLeft, Globe, Target, X, Sparkles, DollarSign, Coffee, Car, Home, ShoppingBag, Utensils, Smartphone, Heart, Plane, GraduationCap, Moon, Fuel, ShoppingCart, Wrench, Cookie, UtensilsCrossed, Trash2, ChevronDown, ChevronUp, Settings, Eye, EyeOff, Repeat, Palmtree, Building2, Edit3, Download, FileText, Sun, Calculator, AlertTriangle, Shield, Search, BarChart3, Tag, Briefcase, Gift, CreditCard, Banknote, Zap, Tv, ArrowDownCircle, ArrowUpCircle, CheckCircle, RotateCcw, FileSpreadsheet, MessageSquare } from 'lucide-react';

// Error Boundary for crash protection
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Wafra Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">We're sorry! A critical error occurred.</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold">
            Reset App Data
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom useLocalStorage hook for data persistence
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const categoryColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

const availableIcons = [
  { id: 'wallet', icon: Wallet }, { id: 'briefcase', icon: Briefcase }, { id: 'gift', icon: Gift },
  { id: 'creditcard', icon: CreditCard }, { id: 'banknote', icon: Banknote }, { id: 'shoppingbag', icon: ShoppingBag },
  { id: 'coffee', icon: Coffee }, { id: 'utensils', icon: Utensils }, { id: 'car', icon: Car },
  { id: 'fuel', icon: Fuel }, { id: 'home', icon: Home }, { id: 'zap', icon: Zap },
  { id: 'heart', icon: Heart }, { id: 'plane', icon: Plane }, { id: 'graduationcap', icon: GraduationCap },
  { id: 'tv', icon: Tv }, { id: 'tag', icon: Tag },
];

const currencies = {
  KD: { symbol: 'KD', symbolAr: 'د.ك', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي' },
  USD: { symbol: '$', symbolAr: '$', name: 'US Dollar', nameAr: 'دولار أمريكي' },
  SAR: { symbol: 'SAR', symbolAr: 'ر.س', name: 'Saudi Riyal', nameAr: 'ريال سعودي' },
  AED: { symbol: 'AED', symbolAr: 'د.إ', name: 'UAE Dirham', nameAr: 'درهم إماراتي' },
  EUR: { symbol: '€', symbolAr: '€', name: 'Euro', nameAr: 'يورو' },
  GBP: { symbol: '£', symbolAr: '£', name: 'British Pound', nameAr: 'جنيه إسترليني' }
};

const expenseCategories = {
  en: { food: 'Food', transport: 'Transport', housing: 'Housing', shopping: 'Shopping', entertainment: 'Entertainment', utilities: 'Utilities', health: 'Health', travel: 'Travel', education: 'Education', hajj: 'Hajj/Umrah', fuel: 'Fuel', groceries: 'Groceries', coffee: 'Coffee', restaurant: 'Restaurant', snacks: 'Snacks', carfix: 'Car Fix', other: 'Other' },
  ar: { food: 'الطعام', transport: 'المواصلات', housing: 'السكن', shopping: 'التسوق', entertainment: 'الترفيه', utilities: 'الفواتير', health: 'الصحة', travel: 'السفر', education: 'التعليم', hajj: 'الحج/العمرة', fuel: 'بنزين', groceries: 'الجمعية', coffee: 'قهوة', restaurant: 'مطاعم', snacks: 'سناك', carfix: 'تصليح السيارة', other: 'أخرى' }
};

const incomeCategories = {
  en: { salary: 'Salary', bonus: 'Bonus', freelance: 'Freelance', investment: 'Investment', rental: 'Rental', gift: 'Gift', refund: 'Refund', other_income: 'Other' },
  ar: { salary: 'الراتب', bonus: 'مكافأة', freelance: 'عمل حر', investment: 'استثمار', rental: 'إيجار', gift: 'هدية', refund: 'استرداد', other_income: 'أخرى' }
};

const categoryIcons = {
  salary: Briefcase, bonus: Gift, freelance: Briefcase, investment: TrendingUp, rental: Home, gift: Gift, refund: ArrowDownCircle, other_income: Wallet,
  food: Utensils, transport: Car, housing: Home, shopping: ShoppingBag, entertainment: Tv, utilities: Zap, health: Heart, travel: Plane, education: GraduationCap, hajj: Moon, fuel: Fuel, groceries: ShoppingCart, coffee: Coffee, restaurant: UtensilsCrossed, snacks: Cookie, carfix: Wrench, other: Tag
};

const translations = {
  en: {
    budget: 'Budget', learn: 'Learn', dashboard: 'Home', addTransaction: 'Add Transaction', income: 'Income', expense: 'Expense', amount: 'Amount', category: 'Category', save: 'Save', delete: 'Delete', totalBalance: 'Total Balance', streak: 'Day Streak', quickAdd: 'Quick Add', addNote: 'Add note', seeMore: 'See more', settings: 'Settings', deleteConfirm: 'Delete?', yes: 'Yes', no: 'No', noTransactionsYet: 'No transactions yet', allTransactions: 'All Transactions', recurring: 'Repeat Monthly',
    export: 'Export', exportCSV: 'CSV', exportPDF: 'Report', homeCurrency: 'Currency',
    zakatCalculator: 'Zakat Calculator', calculateZakat: 'Calculate', cashSavings: 'Cash', goldSilver: 'Gold', investments: 'Investments', businessInventory: 'Inventory', debts: 'Debts', zakatDue: 'Zakat Due', nisabThreshold: 'Nisab', eligible: 'Eligible', notEligible: 'Below Nisab', zakatRate: '2.5%',
    badges: 'Achievements', search: 'Search...', all: 'All',
    backup: 'Backup', restore: 'Restore', resetApp: 'Reset App', resetConfirm: 'This will delete ALL data. Are you sure?',
    feedback: 'Send Feedback', feedbackPlaceholder: 'Found a bug? Have an idea?', send: 'Send', cancel: 'Cancel',
    analytics: 'Analytics', spendingByCategory: 'By Category', incomeVsExpense: 'Income vs Expense',
    customCategories: 'Custom Categories', addCategory: 'Add', categoryName: 'Name (EN)', categoryNameAr: 'Name (AR)', categoryColor: 'Color', categoryIcon: 'Icon', categoryType: 'Type', noCustomCategories: 'No custom categories', forExpense: 'Expense', forIncome: 'Income', forBoth: 'Both', manageCategories: 'Your Categories',
    courses: { budgeting: 'Budgeting', saving: 'Saving', investing: 'Investing', islamic: 'Islamic' },
    aiInsights: 'AI Insights', recentTransactions: 'Recent', progress: 'Progress', welcomeBack: 'Welcome back',
    goals: 'Goals', yourGoals: 'Your Goals', viewAll: 'View all', addGoal: 'Add Goal', goalName: 'Name', targetAmount: 'Target', currentAmount: 'Current', deadline: 'Deadline', daysToGo: 'days', yearsToGo: 'years', monthsToGo: 'months', noGoalsYet: 'No goals yet', currentBalance: 'Balance', topUp: 'Add', withdraw: 'Withdraw',
    goalTypes: { vacation: 'Vacation', realEstate: 'Property', education: 'Education', hajj: 'Hajj', wedding: 'Wedding', car: 'Car', emergency: 'Emergency', other: 'Other' },
    onboarding: { welcome: 'Welcome to Wafra', welcomeDesc: 'Your financial journey starts here', yourName: 'Your name', getStarted: "Let's Start", chooseCurrency: 'Choose Currency', currencyDesc: 'Select your currency', chooseLanguage: 'Language' },
    edit: 'Edit', next: 'Next', back: 'Back', allSet: "You're all set!"
  },
  ar: {
    budget: 'الميزانية', learn: 'تعلّم', dashboard: 'الرئيسية', addTransaction: 'إضافة معاملة', income: 'دخل', expense: 'مصروف', amount: 'المبلغ', category: 'الفئة', save: 'حفظ', delete: 'حذف', totalBalance: 'الرصيد', streak: 'يوم', quickAdd: 'إضافة سريعة', addNote: 'ملاحظة', seeMore: 'المزيد', settings: 'الإعدادات', deleteConfirm: 'حذف؟', yes: 'نعم', no: 'لا', noTransactionsYet: 'لا معاملات', allTransactions: 'المعاملات', recurring: 'تكرار شهري',
    export: 'تصدير', exportCSV: 'CSV', exportPDF: 'PDF', homeCurrency: 'العملة',
    zakatCalculator: 'حاسبة الزكاة', calculateZakat: 'احسب', cashSavings: 'النقد', goldSilver: 'الذهب', investments: 'استثمارات', businessInventory: 'المخزون', debts: 'ديون', zakatDue: 'الزكاة', nisabThreshold: 'النصاب', eligible: 'يجب الزكاة', notEligible: 'أقل من النصاب', zakatRate: '٢.٥٪',
    badges: 'الإنجازات', search: 'بحث...', all: 'الكل',
    backup: 'نسخ', restore: 'استعادة', resetApp: 'إعادة تعيين', resetConfirm: 'سيتم حذف جميع البيانات. متأكد؟',
    feedback: 'إرسال ملاحظات', feedbackPlaceholder: 'وجدت خطأ؟ لديك فكرة؟', send: 'إرسال', cancel: 'إلغاء',
    analytics: 'تحليلات', spendingByCategory: 'حسب الفئة', incomeVsExpense: 'دخل/مصروف',
    customCategories: 'فئات مخصصة', addCategory: 'إضافة', categoryName: 'الاسم (EN)', categoryNameAr: 'الاسم (AR)', categoryColor: 'اللون', categoryIcon: 'أيقونة', categoryType: 'النوع', noCustomCategories: 'لا فئات', forExpense: 'مصروف', forIncome: 'دخل', forBoth: 'كلاهما', manageCategories: 'فئاتك',
    courses: { budgeting: 'ميزانية', saving: 'ادخار', investing: 'استثمار', islamic: 'إسلامي' },
    aiInsights: 'تحليلات', recentTransactions: 'الأخيرة', progress: 'تقدمك', welcomeBack: 'أهلاً',
    goals: 'الأهداف', yourGoals: 'أهدافك', viewAll: 'الكل', addGoal: 'إضافة', goalName: 'الاسم', targetAmount: 'الهدف', currentAmount: 'الحالي', deadline: 'التاريخ', daysToGo: 'يوم', yearsToGo: 'سنة', monthsToGo: 'شهر', noGoalsYet: 'لا أهداف', currentBalance: 'الرصيد', topUp: 'إيداع', withdraw: 'سحب',
    goalTypes: { vacation: 'إجازة', realEstate: 'عقار', education: 'تعليم', hajj: 'حج', wedding: 'زواج', car: 'سيارة', emergency: 'طوارئ', other: 'أخرى' },
    onboarding: { welcome: 'أهلاً بك في وفرة', welcomeDesc: 'رحلتك المالية تبدأ هنا', yourName: 'اسمك', getStarted: 'ابدأ', chooseCurrency: 'اختر العملة', currencyDesc: 'العملة الرئيسية', chooseLanguage: 'اللغة' },
    edit: 'تعديل', next: 'التالي', back: 'رجوع', allSet: 'جاهز!'
  }
};

const goalTypeIcons = { vacation: Palmtree, realEstate: Building2, education: GraduationCap, hajj: Moon, wedding: Heart, car: Car, emergency: Shield, other: Target };
const goalTypeColors = { vacation: { light: 'bg-cyan-100', text: 'text-cyan-600', bar: 'bg-cyan-500' }, realEstate: { light: 'bg-violet-100', text: 'text-violet-600', bar: 'bg-violet-500' }, education: { light: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' }, hajj: { light: 'bg-emerald-100', text: 'text-emerald-600', bar: 'bg-emerald-500' }, wedding: { light: 'bg-pink-100', text: 'text-pink-600', bar: 'bg-pink-500' }, car: { light: 'bg-amber-100', text: 'text-amber-600', bar: 'bg-amber-500' }, emergency: { light: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' }, other: { light: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-500' } };

const quickAddCategories = [
  { id: 'coffee', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { id: 'fuel', icon: Fuel, color: 'bg-blue-100 text-blue-600' },
  { id: 'groceries', icon: ShoppingCart, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'restaurant', icon: UtensilsCrossed, color: 'bg-red-100 text-red-600' }
];

const badgeDefinitions = [
  { id: 'firstTx', icon: '🎯' }, { id: 'firstGoal', icon: '🎪' }, { id: 'streak7', icon: '🔥' },
  { id: 'streak30', icon: '⚡' }, { id: 'saved100', icon: '💰' }, { id: 'saved500', icon: '🏆' }, { id: 'goalComplete', icon: '🌟' }
];

const fmt = (amt, priv, curr = 'KD') => priv ? '****' : `${currencies[curr]?.symbol || 'KD'} ${parseFloat(amt || 0).toFixed(2)}`;
const fmtShort = (amt, priv, curr = 'KD') => priv ? '****' : `${currencies[curr]?.symbol || 'KD'} ${parseFloat(amt || 0).toFixed(0)}`;

function WafraApp() {
  const fileInputRef = useRef(null);
  const [data, setData] = useLocalStorage('wafra-data', { 
    lang: 'en', transactions: [], streak: 1, progress: { budgeting: 0, saving: 0, investing: 0, islamic: 0 }, 
    profile: { name: '' }, onboardingDone: false, onboardingStep: 1, privacyMode: false, darkMode: false,
    goals: [], homeCurrency: 'KD', earnedBadges: [], customCategories: []
  });

  const [tab, setTab] = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [quickCat, setQuickCat] = useState(null);
  const [quickAmt, setQuickAmt] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [newTx, setNewTx] = useState({ type: 'expense', amount: '', category: 'food', description: '', isRecurring: false });
  const [deleting, setDeleting] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', type: 'vacation', targetAmount: '', currentAmount: '0', deadline: '' });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [showZakatModal, setShowZakatModal] = useState(false);
  const [zakatInputs, setZakatInputs] = useState({ cash: '', gold: '', investments: '', inventory: '', debts: '' });
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', nameAr: '', color: '#10b981', icon: 'tag', type: 'expense' });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const t = translations[data.lang];
  const rtl = data.lang === 'ar';
  const dark = data.darkMode;
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-800';
  const muted = dark ? 'text-gray-400' : 'text-gray-500';

  const getCats = (type) => {
    const base = type === 'income' ? incomeCategories[data.lang] : expenseCategories[data.lang];
    const custom = {};
    (data.customCategories || []).forEach(c => {
      if (c.type === 'both' || c.type === type) custom[c.id] = data.lang === 'ar' ? c.nameAr : c.name;
    });
    return { ...base, ...custom };
  };

  const allCats = useMemo(() => {
    const all = { ...expenseCategories[data.lang], ...incomeCategories[data.lang] };
    (data.customCategories || []).forEach(c => { all[c.id] = data.lang === 'ar' ? c.nameAr : c.name; });
    return all;
  }, [data.lang, data.customCategories]);

  const getIcon = (id) => {
    if (categoryIcons[id]) return categoryIcons[id];
    const custom = (data.customCategories || []).find(c => c.id === id);
    if (custom) { const i = availableIcons.find(x => x.id === custom.icon); return i ? i.icon : Tag; }
    return Tag;
  };

  const filtered = useMemo(() => {
    const y = selectedDate.getFullYear(), m = selectedDate.getMonth();
    return data.transactions.filter(tx => { const d = new Date(tx.date); return d.getFullYear() === y && d.getMonth() === m; });
  }, [data.transactions, selectedDate]);

  const searched = useMemo(() => filtered.filter(tx => {
    const matchSearch = !searchQuery || tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) || allCats[tx.category]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || tx.category === categoryFilter;
    return matchSearch && matchCat;
  }), [filtered, searchQuery, categoryFilter, allCats]);

  const totalIncome = useMemo(() => filtered.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0), [filtered]);
  const balance = totalIncome - totalExpense;

  const catSpending = useMemo(() => {
    const sp = {};
    filtered.filter(tx => tx.type === 'expense').forEach(tx => { sp[tx.category] = (sp[tx.category] || 0) + tx.amount; });
    return sp;
  }, [filtered]);

  const chartData = useMemo(() => Object.entries(catSpending).map(([cat, amt]) => ({ name: allCats[cat] || cat, value: amt })).sort((a, b) => b.value - a.value).slice(0, 6), [catSpending, allCats]);

  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const txs = data.transactions.filter(tx => { const x = new Date(tx.date); return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth(); });
      months.push({ name: d.toLocaleDateString(data.lang === 'ar' ? 'ar' : 'en', { month: 'short' }), income: txs.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0), expense: txs.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0) });
    }
    return months;
  }, [data.transactions, data.lang]);

  const goalsTotal = useMemo(() => data.goals.reduce((s, g) => s + (g.currentAmount || 0), 0), [data.goals]);

  const insights = useMemo(() => {
    const msgs = [];
    if (totalExpense > totalIncome && totalIncome > 0) msgs.push(data.lang === 'ar' ? '⚠️ مصروفاتك تتجاوز دخلك' : '⚠️ Spending exceeds income');
    const top = Object.entries(catSpending).sort((a, b) => b[1] - a[1])[0];
    if (top) msgs.push(data.lang === 'ar' ? `💰 أعلى: ${allCats[top[0]]}` : `💰 Top: ${allCats[top[0]]}`);
    if (msgs.length === 0) msgs.push(data.lang === 'ar' ? '✨ ابدأ التتبع' : '✨ Start tracking');
    return msgs;
  }, [totalIncome, totalExpense, catSpending, data.lang, allCats]);

  const addTx = () => {
    if (!newTx.amount) return;
    if (editingTx) { setData(p => ({ ...p, transactions: p.transactions.map(tx => tx.id === editingTx.id ? { ...tx, ...newTx, amount: parseFloat(newTx.amount) } : tx) })); setEditingTx(null); }
    else { setData(p => ({ ...p, transactions: [...p.transactions, { id: Date.now(), ...newTx, amount: parseFloat(newTx.amount), date: new Date().toISOString().split('T')[0], currency: data.homeCurrency }] })); }
    setNewTx({ type: 'expense', amount: '', category: 'food', description: '', isRecurring: false }); setShowAdd(false);
  };

  const quickAddFn = () => {
    if (!quickAmt || !quickCat) return;
    setData(p => ({ ...p, transactions: [...p.transactions, { id: Date.now(), type: 'expense', amount: parseFloat(quickAmt), category: quickCat, description: quickNote, date: new Date().toISOString().split('T')[0], currency: data.homeCurrency }] }));
    setQuickAmt(''); setQuickNote(''); setQuickCat(null); setShowQuick(false);
  };

  const deleteTx = (id) => { setData(p => ({ ...p, transactions: p.transactions.filter(tx => tx.id !== id) })); setDeleting(null); };
  const startEdit = (tx) => { setEditingTx(tx); setNewTx({ type: tx.type, amount: tx.amount.toString(), category: tx.category, description: tx.description || '', isRecurring: tx.isRecurring }); setShowAdd(true); };

  const addGoalFn = () => { if (!newGoal.name || !newGoal.targetAmount) return; setData(p => ({ ...p, goals: [...p.goals, { id: Date.now(), ...newGoal, targetAmount: parseFloat(newGoal.targetAmount), currentAmount: parseFloat(newGoal.currentAmount) || 0 }] })); setNewGoal({ name: '', type: 'vacation', targetAmount: '', currentAmount: '0', deadline: '' }); setShowAddGoal(false); };
  const topUpFn = (withdraw = false) => { if (!topUpAmount || !selectedGoal) return; const amt = parseFloat(topUpAmount); setData(p => ({ ...p, goals: p.goals.map(g => g.id === selectedGoal.id ? { ...g, currentAmount: withdraw ? Math.max(0, g.currentAmount - amt) : g.currentAmount + amt } : g) })); setSelectedGoal(p => ({ ...p, currentAmount: withdraw ? Math.max(0, p.currentAmount - amt) : p.currentAmount + amt })); setTopUpAmount(''); setShowTopUp(false); };
  const timeLeft = (dl) => { if (!dl) return null; const d = Math.ceil((new Date(dl) - new Date()) / 86400000); if (d < 0) return { v: 0, u: 'daysToGo' }; if (d > 365) return { v: Math.round(d / 365), u: 'yearsToGo' }; if (d > 60) return { v: Math.round(d / 30), u: 'monthsToGo' }; return { v: d, u: 'daysToGo' }; };

  const calcZakat = () => { const tot = Object.values(zakatInputs).reduce((s, v) => s + (parseFloat(v) || 0), 0); const nisab = 1400; return { tot, nisab, ok: tot >= nisab, due: tot >= nisab ? tot * 0.025 : 0 }; };

  const addCatFn = () => { if (!newCategory.name || !newCategory.nameAr) return; setData(p => ({ ...p, customCategories: [...(p.customCategories || []), { ...newCategory, id: `c${Date.now()}` }] })); setNewCategory({ name: '', nameAr: '', color: '#10b981', icon: 'tag', type: 'expense' }); };
  const delCat = (id) => { setData(p => ({ ...p, customCategories: (p.customCategories || []).filter(c => c.id !== id) })); };

  useEffect(() => { const cats = getCats(newTx.type); if (!Object.keys(cats).includes(newTx.category)) setNewTx(p => ({ ...p, category: Object.keys(cats)[0] || 'other' })); }, [newTx.type]);

  // ONBOARDING
  if (!data.onboardingDone) {
    const step = data.onboardingStep || 1;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-6" dir={rtl ? 'rtl' : 'ltr'}>
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-xl">
          <div className="flex justify-center gap-2 mb-6">{[1, 2, 3].map(s => <div key={s} className={`w-14 h-1.5 rounded-full ${s <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />)}</div>
          {step === 1 && (<>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><Wallet className="text-white" size={40} /></div>
            <h1 className="text-2xl font-bold mb-2 text-emerald-800">{t.onboarding.welcome}</h1>
            <p className="text-gray-500 mb-6">{t.onboarding.welcomeDesc}</p>
            <div className="mb-4"><label className="text-xs font-bold text-gray-500 uppercase mb-2 block text-left">{t.onboarding.chooseLanguage}</label><div className="flex gap-3"><button onClick={() => setData(d => ({...d, lang: 'en'}))} className={`flex-1 py-3 rounded-xl border-2 font-medium ${data.lang === 'en' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200'}`}>English</button><button onClick={() => setData(d => ({...d, lang: 'ar'}))} className={`flex-1 py-3 rounded-xl border-2 font-medium ${data.lang === 'ar' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200'}`}>العربية</button></div></div>
            <input type="text" placeholder={t.onboarding.yourName} value={data.profile.name} className="w-full p-4 bg-gray-50 rounded-xl mb-4 border-2 border-transparent focus:border-emerald-500 outline-none" onChange={e => setData(d => ({...d, profile: {...d.profile, name: e.target.value}}))} />
            <button onClick={() => setData(d => ({...d, onboardingStep: 2}))} disabled={!data.profile.name} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold disabled:opacity-50">{t.next}</button>
          </>)}
          {step === 2 && (<>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><DollarSign className="text-white" size={40} /></div>
            <h1 className="text-2xl font-bold mb-2 text-emerald-800">{t.onboarding.chooseCurrency}</h1>
            <p className="text-gray-500 mb-6">{t.onboarding.currencyDesc}</p>
            <div className="grid grid-cols-2 gap-3 mb-6">{Object.entries(currencies).map(([code, c]) => <button key={code} onClick={() => setData(d => ({...d, homeCurrency: code}))} className={`p-4 rounded-xl border-2 text-left ${data.homeCurrency === code ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}><p className={`font-bold text-lg ${data.homeCurrency === code ? 'text-emerald-700' : 'text-gray-800'}`}>{code}</p><p className="text-xs text-gray-500">{data.lang === 'ar' ? c.nameAr : c.name}</p></button>)}</div>
            <div className="flex gap-3"><button onClick={() => setData(d => ({...d, onboardingStep: 1}))} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold">{t.back}</button><button onClick={() => setData(d => ({...d, onboardingStep: 3}))} className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold">{t.next}</button></div>
          </>)}
          {step === 3 && (<>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><CheckCircle className="text-white" size={40} /></div>
            <h1 className="text-2xl font-bold mb-2 text-emerald-800">{t.allSet}</h1>
            <p className="text-gray-500 mb-6">{data.lang === 'ar' ? `مرحباً ${data.profile.name}` : `Welcome ${data.profile.name}`}</p>
            <div className="p-4 rounded-xl mb-6 bg-gray-50 text-left"><div className="flex items-center gap-3 mb-2"><Globe size={18} className="text-emerald-600" /><span>{data.lang === 'ar' ? 'العربية' : 'English'}</span></div><div className="flex items-center gap-3"><DollarSign size={18} className="text-emerald-600" /><span>{data.homeCurrency}</span></div></div>
            <div className="flex gap-3"><button onClick={() => setData(d => ({...d, onboardingStep: 2}))} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold">{t.back}</button><button onClick={() => setData(d => ({...d, onboardingDone: true}))} className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold">{t.onboarding.getStarted}</button></div>
          </>)}
        </div>
      </div>
    );
  }

  // GOAL DETAIL
  if (selectedGoal) {
    const gc = goalTypeColors[selectedGoal.type] || goalTypeColors.other;
    const GI = goalTypeIcons[selectedGoal.type] || Target;
    const prog = (selectedGoal.currentAmount / selectedGoal.targetAmount) * 100;
    const tl = timeLeft(selectedGoal.deadline);
    return (
      <div className={`min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'} p-6`} dir={rtl ? 'rtl' : 'ltr'}>
        <button onClick={() => setSelectedGoal(null)} className={`flex items-center gap-2 ${muted} mb-6`}><ChevronLeft size={20} />{t.goals}</button>
        <div className={`${card} rounded-3xl p-6 shadow-lg border mb-6`}>
          <div className="flex items-center gap-4 mb-6"><div className={`w-16 h-16 rounded-2xl ${gc.light} flex items-center justify-center`}><GI size={32} className={gc.text} /></div><div><h2 className={`text-2xl font-bold ${txt}`}>{selectedGoal.name}</h2><p className={muted}>{t.goalTypes[selectedGoal.type]}</p></div></div>
          <div className="mb-6"><div className="flex justify-between mb-2"><span className={`text-3xl font-bold ${txt}`}>{fmt(selectedGoal.currentAmount, data.privacyMode, data.homeCurrency)}</span><span className={muted}>{fmtShort(selectedGoal.targetAmount, data.privacyMode, data.homeCurrency)}</span></div><div className={`h-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}><div className={`h-full ${gc.bar} rounded-full`} style={{ width: `${Math.min(prog, 100)}%` }} /></div><div className="flex justify-between mt-2 text-sm"><span className={muted}>{tl ? `${tl.v} ${t[tl.u]}` : ''}</span><span className={`font-bold ${txt}`}>{prog.toFixed(0)}%</span></div></div>
          <div className="flex gap-3"><button onClick={() => setShowTopUp(true)} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Plus size={20} />{t.topUp}</button><button onClick={() => setShowTopUp(true)} className={`flex-1 py-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt} rounded-xl font-bold`}>{t.withdraw}</button></div>
        </div>
        {showTopUp && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.topUp}</h3><button onClick={() => setShowTopUp(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div><div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4 mb-4`}><span className={muted}>{currencies[data.homeCurrency]?.symbol}</span><input type="number" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} placeholder="0" className={`flex-1 p-4 bg-transparent text-2xl font-bold ${txt} outline-none`} autoFocus /></div><div className="flex gap-3"><button onClick={() => topUpFn(true)} className={`flex-1 py-3 ${dark ? 'bg-gray-700' : 'bg-gray-200'} ${txt} rounded-xl font-bold`}>{t.withdraw}</button><button onClick={() => topUpFn(false)} disabled={!topUpAmount} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold disabled:opacity-50">{t.topUp}</button></div></div></div>}
      </div>
    );
  }

  // MAIN APP
  return (
    <div className={`min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'} pb-24`} dir={rtl ? 'rtl' : 'ltr'}>
      <input type="file" ref={fileInputRef} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { try { const d = JSON.parse(ev.target.result); if (d.transactions) setData(d); } catch {} }; r.readAsText(f); e.target.value = ''; }} accept=".json" className="hidden" />

      {/* Header */}
      <header className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 pb-32 rounded-b-[2rem]">
        <div className="flex justify-between items-center">
          <div><p className="text-emerald-100 text-sm">{t.welcomeBack}, {data.profile.name} 👋 <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full align-middle ml-1">BETA v4.0</span></p><div className="flex items-center gap-2 mt-1"><button onClick={() => setSettingsOpen(true)} className="flex items-center gap-1 text-white/80 text-xs bg-white/10 px-2 py-1 rounded-full"><Settings size={12} />{t.settings}</button><button onClick={() => setShowFeedback(true)} className="flex items-center gap-1 text-white/80 text-xs bg-white/10 px-2 py-1 rounded-full"><MessageSquare size={12} /></button><button onClick={() => setData(p => ({...p, privacyMode: !p.privacyMode}))} className="text-white/80 bg-white/10 p-1.5 rounded-full">{data.privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}</button><button onClick={() => setData(p => ({...p, darkMode: !p.darkMode}))} className="text-white/80 bg-white/10 p-1.5 rounded-full">{dark ? <Sun size={14} /> : <Moon size={14} />}</button></div></div>
          <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1"><Flame size={16} className="text-orange-300" /><span className="text-white font-bold">{data.streak}</span></div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6"><button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="text-white/60"><ChevronLeft size={24} /></button><h2 className="text-white font-medium">{selectedDate.toLocaleDateString(data.lang === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' })}</h2><button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="text-white/60"><ChevronRight size={24} /></button></div>
      </header>

      {/* Balance Card */}
      <div className={`${card} rounded-3xl mx-4 -mt-20 p-6 shadow-xl border relative z-10`}>
        <p className={`text-xs font-bold ${muted} uppercase`}>{t.totalBalance}</p>
        <h2 className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(balance, data.privacyMode, data.homeCurrency)}</h2>
        <div className="flex justify-between mt-6 border-t pt-4 border-dashed border-gray-200"><div className="flex items-center gap-2"><div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><ArrowUpCircle size={20} className="text-emerald-600" /></div><div><p className="text-xs text-gray-400">{t.income}</p><p className="font-bold text-emerald-600">{fmtShort(totalIncome, data.privacyMode, data.homeCurrency)}</p></div></div><div className="flex items-center gap-2"><div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><ArrowDownCircle size={20} className="text-red-500" /></div><div><p className="text-xs text-gray-400">{t.expense}</p><p className="font-bold text-red-500">{fmtShort(totalExpense, data.privacyMode, data.homeCurrency)}</p></div></div></div>
        <button onClick={() => setShowAdd(true)} className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg text-white"><Plus size={28} /></button>
      </div>

      {/* Content */}
      <main className="px-4 mt-10 space-y-6">
        {tab === 'dashboard' && (<div className="space-y-6">
          <div className={`${card} rounded-2xl p-4 border`}><p className={`text-xs font-bold ${muted} uppercase mb-3`}>{t.quickAdd}</p><div className="grid grid-cols-4 gap-3">{quickAddCategories.map(c => { const I = c.icon; return <button key={c.id} onClick={() => { setQuickCat(c.id); setShowQuick(true); }} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}><div className={`p-2 rounded-full ${c.color}`}><I size={18}/></div><span className={`text-[10px] font-bold ${muted}`}>{allCats[c.id]}</span></button>; })}</div></div>
          
          <div><div className="flex justify-between items-center mb-3"><h3 className={`font-bold ${txt}`}>{t.yourGoals}</h3><button onClick={() => setTab('goals')} className="text-xs text-emerald-600 font-medium">{t.viewAll}</button></div>
            {data.goals.length === 0 ? <button onClick={() => setShowAddGoal(true)} className={`w-full ${card} rounded-2xl p-6 border-2 border-dashed flex flex-col items-center gap-2`}><Plus size={24} className={muted} /><p className={`text-sm ${muted}`}>{t.noGoalsYet}</p></button> : <div className="flex gap-3 overflow-x-auto pb-2">{data.goals.slice(0, 3).map(g => { const gc = goalTypeColors[g.type] || goalTypeColors.other; const GI = goalTypeIcons[g.type] || Target; const prog = (g.currentAmount / g.targetAmount) * 100; const tl = timeLeft(g.deadline); return <button key={g.id} onClick={() => setSelectedGoal(g)} className={`${card} rounded-2xl p-4 min-w-[140px] flex-shrink-0 border text-left`}><div className={`w-10 h-10 rounded-xl ${gc.light} flex items-center justify-center mb-3`}><GI size={20} className={gc.text} /></div><p className={`font-bold text-sm ${txt} truncate`}>{g.name}</p><p className={`text-xs ${muted} mt-1`}>{fmtShort(g.currentAmount, data.privacyMode, data.homeCurrency)}</p><div className={`h-1.5 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden mt-2`}><div className={`h-full ${gc.bar} rounded-full`} style={{ width: `${Math.min(prog, 100)}%` }} /></div></button>; })}</div>}
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 text-white"><button onClick={() => setExpandedInsights(!expandedInsights)} className="w-full flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles size={20} className="text-yellow-300" /><h3 className="font-bold">{t.aiInsights}</h3></div>{expandedInsights ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</button><div className={`space-y-2 overflow-hidden transition-all ${expandedInsights ? 'max-h-40 mt-3' : 'max-h-10 mt-2'}`}>{insights.map((ins, i) => <p key={i} className="text-indigo-100 text-sm">{ins}</p>)}</div></div>
          
          <div><div className="flex justify-between mb-4"><h3 className={`font-bold text-xl ${txt}`}>{t.recentTransactions}</h3><button onClick={() => setTab('budget')} className="text-sm text-emerald-600">{t.seeMore}</button></div>
            {!filtered.length ? <div className={`${card} rounded-2xl p-8 text-center border border-dashed`}><Wallet size={32} className={`mx-auto ${muted} mb-3`}/><p className={muted}>{t.noTransactionsYet}</p></div> : <div className="space-y-3">{filtered.slice().reverse().slice(0, 5).map(tx => { const I = getIcon(tx.category); return <div key={tx.id} className={`${card} rounded-2xl p-4 flex items-center gap-4 border`}><div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}><I size={22} /></div><div className="flex-1 min-w-0"><p className={`font-bold ${txt} truncate`}>{tx.description || allCats[tx.category]}</p><p className={`text-xs ${muted}`}>{allCats[tx.category]}</p></div><p className={`font-bold text-lg ${tx.type === 'income' ? 'text-emerald-600' : txt}`}>{tx.type === 'income' ? '+' : '-'}{fmtShort(tx.amount, data.privacyMode, data.homeCurrency)}</p></div>; })}</div>}
          </div>
        </div>)}

        {tab === 'budget' && (<div className="space-y-4">
          <div className="flex justify-between items-center"><h3 className={`font-bold text-xl ${txt}`}>{t.allTransactions}</h3><button onClick={() => setShowAnalytics(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"><BarChart3 size={18} />{t.analytics}</button></div>
          <div className="relative"><Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.search} className={`w-full pl-12 pr-4 py-3 ${dark ? 'bg-gray-800' : 'bg-white'} ${txt} rounded-2xl border outline-none`} /></div>
          <div className="flex gap-2 overflow-x-auto pb-2"><button onClick={() => setCategoryFilter('all')} className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap ${categoryFilter === 'all' ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-800' : 'bg-white'} ${txt} border`}`}>{t.all}</button>{Object.entries(allCats).slice(0, 6).map(([k, v]) => <button key={k} onClick={() => setCategoryFilter(k)} className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap ${categoryFilter === k ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-800' : 'bg-white'} ${txt} border`}`}>{v}</button>)}</div>
          {!searched.length ? <div className={`${card} rounded-2xl p-8 text-center border border-dashed`}><Search size={32} className={`mx-auto ${muted} mb-3`}/><p className={muted}>{t.noTransactionsYet}</p></div> : <div className="space-y-3">{searched.slice().reverse().map(tx => { const I = getIcon(tx.category); return <div key={tx.id} className={`${card} rounded-2xl p-4 border`}><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}><I size={22} /></div><div className="flex-1"><div className="flex justify-between"><p className={`font-bold ${txt}`}>{tx.description || allCats[tx.category]}</p><p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : txt}`}>{tx.type === 'income' ? '+' : '-'}{fmtShort(tx.amount, data.privacyMode, data.homeCurrency)}</p></div><p className={`text-xs ${muted} mt-1`}>{tx.date} • {allCats[tx.category]}</p></div></div><div className={`flex gap-2 mt-4 pt-3 border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`}><button onClick={() => startEdit(tx)} className="flex-1 py-1.5 rounded-lg text-emerald-600 text-sm font-medium flex items-center justify-center gap-1"><Edit3 size={14}/>{t.edit}</button><button onClick={() => setDeleting(tx.id)} className="flex-1 py-1.5 rounded-lg text-red-500 text-sm font-medium">{t.delete}</button></div></div>; })}</div>}
        </div>)}

        {tab === 'goals' && (<div className="space-y-6">
          <div className="flex justify-between items-center"><h3 className={`font-bold text-2xl ${txt}`}>{t.goals}</h3><button onClick={() => setShowAddGoal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"><Plus size={18} />{t.addGoal}</button></div>
          <div className={`${card} rounded-3xl p-6 border`}><div className="flex items-center gap-3"><div className={`w-12 h-12 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}><DollarSign size={24} className={muted} /></div><div><p className={`text-3xl font-bold ${txt}`}>{fmt(goalsTotal, data.privacyMode, data.homeCurrency)}</p><p className={`text-sm ${muted}`}>{t.currentBalance}</p></div></div></div>
          {data.goals.length === 0 ? <button onClick={() => setShowAddGoal(true)} className={`w-full ${dark ? 'bg-emerald-900/20' : 'bg-emerald-50'} border-2 border-dashed border-emerald-300 rounded-2xl p-8 flex flex-col items-center gap-3`}><Target size={32} className="text-emerald-600" /><p className="text-emerald-700 font-medium">{t.noGoalsYet}</p></button> : <div className="space-y-4">{data.goals.map(g => { const gc = goalTypeColors[g.type] || goalTypeColors.other; const GI = goalTypeIcons[g.type] || Target; const prog = (g.currentAmount / g.targetAmount) * 100; const tl = timeLeft(g.deadline); return <button key={g.id} onClick={() => setSelectedGoal(g)} className={`w-full ${card} rounded-2xl p-5 border text-left`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-xl ${gc.light} flex items-center justify-center`}><GI size={24} className={gc.text} /></div><span className={`font-bold text-lg ${txt}`}>{g.name}</span></div><ChevronRight size={20} className={muted} /></div><div className="flex justify-between text-sm mb-2"><span className={`font-bold ${txt}`}>{fmtShort(g.currentAmount, data.privacyMode, data.homeCurrency)}</span><span className={muted}>{fmtShort(g.targetAmount, data.privacyMode, data.homeCurrency)}</span></div><div className={`h-2.5 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden mb-3`}><div className={`h-full ${gc.bar} rounded-full`} style={{ width: `${Math.min(prog, 100)}%` }} /></div></button>; })}</div>}
        </div>)}

        {tab === 'learn' && (<div className="space-y-6">
          <h3 className={`font-bold text-xl ${txt}`}>{t.progress}</h3>
          <div className="grid grid-cols-2 gap-4">{Object.entries(t.courses).map(([k, v]) => <div key={k} className={`${card} rounded-2xl p-5 border`}><div className={`w-12 h-12 ${dark ? 'bg-emerald-900/30' : 'bg-emerald-100'} rounded-xl flex items-center justify-center mb-3`}><Book className="text-emerald-600" size={24} /></div><h4 className={`font-bold ${txt} mb-1`}>{v}</h4><div className="flex items-center gap-2"><div className={`flex-1 h-2 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.progress[k] || 0}%` }} /></div><span className={`text-xs ${muted}`}>{data.progress[k] || 0}%</span></div></div>)}</div>
          <div className={`${card} rounded-2xl p-5 border`}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-12 h-12 ${dark ? 'bg-emerald-900/30' : 'bg-emerald-100'} rounded-xl flex items-center justify-center`}><Calculator className="text-emerald-600" size={24} /></div><div><h4 className={`font-bold ${txt}`}>{t.zakatCalculator}</h4><p className={`text-sm ${muted}`}>{t.zakatRate}</p></div></div><button onClick={() => setShowZakatModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium">{t.calculateZakat}</button></div></div>
          <div className={`${card} rounded-2xl p-5 border`}><div className="flex items-center justify-between mb-4"><h4 className={`font-bold ${txt}`}>{t.badges}</h4><button onClick={() => setShowBadgesModal(true)} className="text-sm text-emerald-600">{t.viewAll}</button></div><div className="flex gap-3 overflow-x-auto pb-2">{badgeDefinitions.map(b => <div key={b.id} className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${dark ? 'bg-gray-700' : 'bg-gray-100'} opacity-40`}>{b.icon}</div>)}</div></div>
        </div>)}
      </main>

      {/* Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 ${card} border-t px-6 py-3 pb-6 z-40 rounded-t-3xl`}><div className="flex justify-between items-center max-w-md mx-auto">{[{id:'dashboard',icon:Home,label:t.dashboard},{id:'goals',icon:Target,label:t.goals},{id:'budget',icon:Wallet,label:t.budget},{id:'learn',icon:Book,label:t.learn}].map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`flex flex-col items-center gap-1 p-2 ${tab === item.id ? 'text-emerald-600' : muted}`}><item.icon size={24} strokeWidth={tab === item.id ? 2.5 : 2} /><span className="text-[10px] font-medium">{item.label}</span></button>)}</div></nav>

      {/* Add Transaction Modal */}
      {showAdd && <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{editingTx ? t.edit : t.addTransaction}</h3><button onClick={() => { setShowAdd(false); setEditingTx(null); setNewTx({ type: 'expense', amount: '', category: 'food', description: '', isRecurring: false }); }} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        <div className={`flex ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-1 mb-6`}><button onClick={() => setNewTx(p => ({...p, type: 'expense', category: Object.keys(getCats('expense'))[0]}))} className={`flex-1 py-3 rounded-lg font-medium ${newTx.type === 'expense' ? `${card} shadow` : ''} ${txt}`}>{t.expense}</button><button onClick={() => setNewTx(p => ({...p, type: 'income', category: Object.keys(getCats('income'))[0]}))} className={`flex-1 py-3 rounded-lg font-medium ${newTx.type === 'income' ? 'bg-emerald-600 text-white shadow' : ''} ${txt}`}>{t.income}</button></div>
        <div className="mb-4"><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.amount}</label><div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}><span className={`font-bold ${muted}`}>{currencies[data.homeCurrency]?.symbol}</span><input type="number" value={newTx.amount} onChange={e => setNewTx(p => ({...p, amount: e.target.value}))} placeholder="0.00" className={`flex-1 p-4 bg-transparent text-2xl font-bold ${txt} outline-none`} autoFocus /></div></div>
        <div className="mb-4"><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.addNote}</label><input type="text" value={newTx.description} onChange={e => setNewTx(p => ({...p, description: e.target.value}))} placeholder={t.addNote} className={`w-full p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none`} /></div>
        <div className="mb-4"><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.category}</label><div className={`relative ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}><select value={newTx.category} onChange={e => setNewTx(p => ({...p, category: e.target.value}))} className={`w-full p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none appearance-none`}>{Object.entries(getCats(newTx.type)).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><ChevronDown size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${muted} pointer-events-none`} /></div></div>
        <div className={`flex items-center justify-between p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl mb-6`}><div className="flex items-center gap-3"><Repeat size={20} className={muted} /><span className={txt}>{t.recurring}</span></div><button onClick={() => setNewTx(p => ({...p, isRecurring: !p.isRecurring}))} className={`w-12 h-7 rounded-full ${newTx.isRecurring ? 'bg-emerald-600' : (dark ? 'bg-gray-600' : 'bg-gray-300')}`}><div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${newTx.isRecurring ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
        <button onClick={addTx} disabled={!newTx.amount} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50">{t.save}</button>
      </div></div>}

      {/* Quick Add */}
      {showQuick && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10`}><div className="flex justify-between items-center mb-4"><h3 className={`text-lg font-bold ${txt}`}>{allCats[quickCat]}</h3><button onClick={() => setShowQuick(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div><div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4 mb-4`}><span className={muted}>{currencies[data.homeCurrency]?.symbol}</span><input type="number" value={quickAmt} onChange={e => setQuickAmt(e.target.value)} placeholder="0" className={`flex-1 p-4 bg-transparent text-2xl font-bold ${txt} outline-none`} autoFocus /></div><input type="text" value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder={t.addNote} className={`w-full p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl mb-4 outline-none ${txt}`} /><button onClick={quickAddFn} disabled={!quickAmt} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50">{t.save}</button></div></div>}

      {/* Delete Confirm */}
      {deleting && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className={`${card} rounded-2xl p-6 w-full max-w-xs text-center`}><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-red-500" /></div><h3 className={`text-xl font-bold mb-2 ${txt}`}>{t.deleteConfirm}</h3><div className="flex gap-3 mt-6"><button onClick={() => setDeleting(null)} className={`flex-1 py-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl font-medium ${txt}`}>{t.no}</button><button onClick={() => deleteTx(deleting)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">{t.yes}</button></div></div></div>}

      {/* Add Goal */}
      {showAddGoal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.addGoal}</h3><button onClick={() => setShowAddGoal(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        <div className="space-y-4"><div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.goalName}</label><input type="text" value={newGoal.name} onChange={e => setNewGoal(p => ({...p, name: e.target.value}))} className={`w-full p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none`} /></div>
          <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.category}</label><div className="grid grid-cols-4 gap-2">{Object.entries(t.goalTypes).map(([k, v]) => { const GI = goalTypeIcons[k] || Target; const gc = goalTypeColors[k] || goalTypeColors.other; return <button key={k} onClick={() => setNewGoal(p => ({...p, type: k}))} className={`flex flex-col items-center gap-1 p-3 rounded-xl ${newGoal.type === k ? gc.light : (dark ? 'bg-gray-700' : 'bg-gray-50')}`}><GI size={20} className={newGoal.type === k ? gc.text : muted} /><span className={`text-[10px] font-medium ${newGoal.type === k ? gc.text : muted}`}>{v}</span></button>; })}</div></div>
          <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.targetAmount}</label><div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}><span className={muted}>{currencies[data.homeCurrency]?.symbol}</span><input type="number" value={newGoal.targetAmount} onChange={e => setNewGoal(p => ({...p, targetAmount: e.target.value}))} placeholder="0" className={`flex-1 p-4 bg-transparent text-xl font-bold ${txt} outline-none`} /></div></div>
          <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.currentAmount}</label><div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}><span className={muted}>{currencies[data.homeCurrency]?.symbol}</span><input type="number" value={newGoal.currentAmount} onChange={e => setNewGoal(p => ({...p, currentAmount: e.target.value}))} placeholder="0" className={`flex-1 p-4 bg-transparent text-xl font-bold ${txt} outline-none`} /></div></div>
          <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.deadline}</label><input type="date" value={newGoal.deadline} onChange={e => setNewGoal(p => ({...p, deadline: e.target.value}))} className={`w-full p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none`} /></div></div>
        <button onClick={addGoalFn} disabled={!newGoal.name || !newGoal.targetAmount} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50 mt-6">{t.save}</button>
      </div></div>}

      {/* Settings */}
      {settingsOpen && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.settings}</h3><button onClick={() => setSettingsOpen(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}><div className="flex items-center gap-3"><Globe size={20} className="text-emerald-600" /><span className={txt}>{data.lang === 'ar' ? 'اللغة' : 'Language'}</span></div><div className="flex gap-2"><button onClick={() => setData(d => ({...d, lang: 'en'}))} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${data.lang === 'en' ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt}`}`}>EN</button><button onClick={() => setData(d => ({...d, lang: 'ar'}))} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${data.lang === 'ar' ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt}`}`}>ع</button></div></div>
          <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}><div className="flex items-center gap-3 mb-3"><DollarSign size={20} className="text-emerald-600" /><span className={txt}>{t.homeCurrency}</span></div><div className="grid grid-cols-3 gap-2">{Object.keys(currencies).map(c => <button key={c} onClick={() => setData(d => ({...d, homeCurrency: c}))} className={`py-2 rounded-lg text-sm font-medium ${data.homeCurrency === c ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt}`}`}>{c}</button>)}</div></div>
          <button onClick={() => { setSettingsOpen(false); setShowCategoryModal(true); }} className={`w-full flex items-center justify-between p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}><div className="flex items-center gap-3"><Tag size={20} className="text-emerald-600" /><span className={txt}>{t.customCategories}</span></div><ChevronRight size={20} className={muted} /></button>
          <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}><div className="flex items-center gap-3 mb-3"><Download size={20} className="text-emerald-600" /><span className={txt}>{t.backup}</span></div><div className="flex gap-2"><button onClick={() => { const b = { ...data, backupDate: new Date().toISOString() }; const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'wafra-backup.json'; a.click(); }} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">{t.backup}</button><button onClick={() => fileInputRef.current?.click()} className={`flex-1 py-2 ${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt} rounded-lg text-sm font-medium`}>{t.restore}</button></div></div>
          <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}><div className="flex items-center gap-3 mb-3"><FileText size={20} className="text-emerald-600" /><span className={txt}>{t.export}</span></div><div className="flex gap-2"><button onClick={() => { let report = '=== WAFRA TRANSACTION REPORT ===\n\n'; report += `Generated: ${new Date().toLocaleDateString()}\n`; report += `Balance: ${fmt(balance, false, data.homeCurrency)}\n\n`; report += '--- Transactions ---\n\n'; filtered.forEach(tx => { const cat = allCats[tx.category] || tx.category; report += `${tx.date} | ${tx.type === 'income' ? '+' : '-'}${fmt(tx.amount, false, data.homeCurrency)} | ${cat}\n`; }); const blob = new Blob([report], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'wafra-report.txt'; a.click(); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"><FileText size={16} />{t.exportPDF}</button><button onClick={() => { const headers = ['Date', 'Type', 'Amount', 'Category', 'Description']; const rows = data.transactions.map(tx => [tx.date, tx.type, tx.amount, allCats[tx.category] || tx.category, tx.description || '']); const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'wafra-transactions.csv'; a.click(); }} className={`flex-1 py-2 ${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt} rounded-lg text-sm font-medium flex items-center justify-center gap-2`}><FileSpreadsheet size={16} />{t.exportCSV}</button></div></div>
          <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}><div className="flex items-center gap-3 mb-3"><RotateCcw size={20} className="text-red-500" /><span className={txt}>{t.resetApp}</span></div><button onClick={() => setShowResetConfirm(true)} className="w-full py-2 bg-red-500 text-white rounded-lg text-sm font-medium">{t.resetApp}</button></div>
        </div>
      </div></div>}

      {/* Custom Categories */}
      {showCategoryModal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.customCategories}</h3><button onClick={() => setShowCategoryModal(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl mb-6 space-y-4`}><h4 className={`font-bold ${txt}`}>{t.addCategory}</h4>
          <input type="text" value={newCategory.name} onChange={e => setNewCategory(p => ({...p, name: e.target.value}))} placeholder={t.categoryName} className={`w-full p-3 ${dark ? 'bg-gray-600' : 'bg-white'} rounded-xl ${txt} outline-none border`} />
          <input type="text" value={newCategory.nameAr} onChange={e => setNewCategory(p => ({...p, nameAr: e.target.value}))} placeholder={t.categoryNameAr} className={`w-full p-3 ${dark ? 'bg-gray-600' : 'bg-white'} rounded-xl ${txt} outline-none border`} dir="rtl" />
          <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.categoryType}</label><div className="flex gap-2"><button onClick={() => setNewCategory(p => ({...p, type: 'expense'}))} className={`flex-1 py-2 rounded-lg text-sm font-medium ${newCategory.type === 'expense' ? 'bg-red-500 text-white' : `${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt}`}`}>{t.forExpense}</button><button onClick={() => setNewCategory(p => ({...p, type: 'income'}))} className={`flex-1 py-2 rounded-lg text-sm font-medium ${newCategory.type === 'income' ? 'bg-emerald-500 text-white' : `${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt}`}`}>{t.forIncome}</button><button onClick={() => setNewCategory(p => ({...p, type: 'both'}))} className={`flex-1 py-2 rounded-lg text-sm font-medium ${newCategory.type === 'both' ? 'bg-blue-500 text-white' : `${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt}`}`}>{t.forBoth}</button></div></div>
          <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.categoryIcon}</label><div className="grid grid-cols-6 gap-2">{availableIcons.map(i => { const IC = i.icon; return <button key={i.id} onClick={() => setNewCategory(p => ({...p, icon: i.id}))} className={`p-2 rounded-xl ${newCategory.icon === i.id ? 'ring-2 ring-emerald-500' : ''} ${dark ? 'bg-gray-600' : 'bg-gray-100'}`}><IC size={18} style={{ color: newCategory.color }} /></button>; })}</div></div>
          <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.categoryColor}</label><div className="flex gap-2 flex-wrap">{categoryColors.map(c => <button key={c} onClick={() => setNewCategory(p => ({...p, color: c}))} className={`w-8 h-8 rounded-full ${newCategory.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} style={{ backgroundColor: c }} />)}</div></div>
          <button onClick={addCatFn} disabled={!newCategory.name || !newCategory.nameAr} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50">{t.addCategory}</button>
        </div>
        <div><h4 className={`font-bold ${txt} mb-3`}>{t.manageCategories}</h4>{(!data.customCategories || data.customCategories.length === 0) ? <p className={`text-center py-4 ${muted}`}>{t.noCustomCategories}</p> : <div className="space-y-2">{data.customCategories.map(c => { const IC = availableIcons.find(i => i.id === c.icon)?.icon || Tag; return <div key={c.id} className={`flex items-center justify-between p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.color + '20' }}><IC size={20} style={{ color: c.color }} /></div><div><p className={`font-medium ${txt}`}>{data.lang === 'ar' ? c.nameAr : c.name}</p><p className={`text-xs ${muted}`}>{c.type === 'expense' ? t.forExpense : c.type === 'income' ? t.forIncome : t.forBoth}</p></div></div><button onClick={() => delCat(c.id)} className="p-2 text-red-500"><Trash2 size={18} /></button></div>; })}</div>}</div>
      </div></div>}

      {/* Analytics */}
      {showAnalytics && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.analytics}</h3><button onClick={() => setShowAnalytics(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        <div className="mb-6"><h4 className={`font-bold ${txt} mb-4`}>{t.spendingByCategory}</h4>{chartData.length > 0 ? <div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">{chartData.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div> : <p className={`text-center py-8 ${muted}`}>{t.noTransactionsYet}</p>}<div className="flex flex-wrap gap-2 mt-4">{chartData.map((e, i) => <div key={e.name} className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} /><span className={muted}>{e.name}</span></div>)}</div></div>
        <div><h4 className={`font-bold ${txt} mb-4`}>{t.incomeVsExpense}</h4><div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><XAxis dataKey="name" tick={{ fill: dark ? '#9ca3af' : '#6b7280', fontSize: 10 }} /><YAxis tick={{ fill: dark ? '#9ca3af' : '#6b7280', fontSize: 10 }} /><Tooltip /><Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      </div></div>}

      {/* Zakat */}
      {showZakatModal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.zakatCalculator}</h3><button onClick={() => setShowZakatModal(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        <div className="space-y-4">{[{ k: 'cash', l: t.cashSavings }, { k: 'gold', l: t.goldSilver }, { k: 'investments', l: t.investments }, { k: 'inventory', l: t.businessInventory }, { k: 'debts', l: t.debts }].map(item => <div key={item.k}><label className={`text-xs font-bold ${muted} uppercase mb-1 block`}>{item.l}</label><div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}><span className={muted}>{currencies[data.homeCurrency]?.symbol}</span><input type="number" value={zakatInputs[item.k]} onChange={e => setZakatInputs(p => ({...p, [item.k]: e.target.value}))} placeholder="0" className={`flex-1 p-3 bg-transparent ${txt} outline-none`} /></div></div>)}</div>
        {(() => { const z = calcZakat(); return <div className={`mt-6 p-4 rounded-xl ${z.ok ? 'bg-emerald-50' : (dark ? 'bg-gray-700' : 'bg-gray-50')}`}><div className="flex items-center justify-between mb-2"><span className={muted}>{t.nisabThreshold}</span><span className={`font-bold ${txt}`}>{fmt(z.nisab, false, data.homeCurrency)}</span></div><div className="flex items-center justify-between mb-4"><span className={muted}>Total</span><span className={`font-bold ${txt}`}>{fmt(z.tot, false, data.homeCurrency)}</span></div><div className={`p-4 rounded-xl ${z.ok ? 'bg-emerald-600 text-white' : (dark ? 'bg-gray-600' : 'bg-gray-200')}`}><p className="text-sm mb-1">{z.ok ? t.eligible : t.notEligible}</p><p className="text-2xl font-bold">{z.ok ? fmt(z.due, false, data.homeCurrency) : '-'}</p></div></div>; })()}
      </div></div>}

      {/* Badges */}
      {showBadgesModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className={`${card} rounded-2xl w-full max-w-sm p-6`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.badges}</h3><button onClick={() => setShowBadgesModal(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div><div className="grid grid-cols-4 gap-4">{badgeDefinitions.map(b => <div key={b.id} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${dark ? 'bg-gray-700' : 'bg-gray-100'} opacity-40`}>{b.icon}</div>)}</div></div></div>}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className={`${card} rounded-2xl w-full max-w-sm p-6`}><div className="text-center"><AlertTriangle size={48} className="text-red-500 mx-auto mb-4" /><h3 className={`text-xl font-bold ${txt} mb-2`}>{t.resetApp}</h3><p className={`${muted} mb-6`}>{t.resetConfirm}</p><div className="flex gap-3"><button onClick={() => setShowResetConfirm(false)} className={`flex-1 py-3 ${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt} rounded-xl font-medium`}>{t.no}</button><button onClick={() => { localStorage.removeItem('wafra-data'); window.location.reload(); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium">{t.yes}</button></div></div></div></div>}

      {/* Feedback Modal */}
      {showFeedback && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"><div className={`${card} rounded-3xl w-full max-w-sm p-6`}><h3 className={`text-xl font-bold ${txt} mb-4`}>{t.feedback}</h3><textarea className={`w-full p-3 rounded-xl border outline-none h-32 mb-4 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} ${txt}`} placeholder={t.feedbackPlaceholder} value={feedbackText} onChange={e => setFeedbackText(e.target.value)} /><div className="flex gap-3"><button onClick={() => { setShowFeedback(false); setFeedbackText(''); }} className={`flex-1 py-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt} rounded-xl`}>{t.cancel}</button><button onClick={() => { window.open(`mailto:beta@wafra.app?subject=Wafra Beta Feedback&body=${encodeURIComponent(feedbackText)}`); setShowFeedback(false); setFeedbackText(''); }} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">{t.send}</button></div></div></div>}
    </div>
  );
}

// Export with ErrorBoundary wrapper
export default function WafraAppWrapper() {
  return <ErrorBoundary><WafraApp /></ErrorBoundary>;
}
