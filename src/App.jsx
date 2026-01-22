import React, { useState, useMemo, useEffect, useRef, useCallback, Component } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, Plus, Flame, ChevronRight, ChevronLeft, Globe, Target, X, Sparkles, DollarSign, Coffee, Car, Home, ShoppingBag, Utensils, Heart, Plane, GraduationCap, Moon, Fuel, ShoppingCart, Wrench, Cookie, UtensilsCrossed, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Repeat, Palmtree, Building2, Edit3, Download, FileText, Sun, Calculator, AlertTriangle, Shield, Search, BarChart3, Tag, Briefcase, Gift, CreditCard, Banknote, Zap, Tv, ArrowDownCircle, ArrowUpCircle, CheckCircle, RotateCcw, FileSpreadsheet, MessageSquare, Calendar, Sliders, User, Info, Delete, TrendingDown, PiggyBank, Star, Trophy, Coins, Lightbulb } from 'lucide-react';

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

  // Use ref to always have access to the latest value
  const storedValueRef = useRef(storedValue);
  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  const setValue = useCallback((value) => {
    try {
      // Use ref to get latest value when called with a function
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      setStoredValue(valueToStore);
      storedValueRef.current = valueToStore;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key]);

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
    budget: 'Budget', profile: 'Profile', dashboard: 'Home', addTransaction: 'Add Transaction', income: 'Income', expense: 'Expense', amount: 'Amount', category: 'Category', save: 'Save', delete: 'Delete', totalBalance: 'Total Balance', streak: 'Day Streak', quickAdd: 'Quick Add', addNote: 'Add note', seeMore: 'See more', settings: 'Settings', deleteConfirm: 'Delete?', yes: 'Yes', no: 'No', noTransactionsYet: 'No transactions yet', allTransactions: 'All Transactions', recurring: 'Repeat Monthly',
    export: 'Export', exportCSV: 'CSV', exportPDF: 'Report', homeCurrency: 'Currency',
    zakatCalculator: 'Zakat Calculator', calculateZakat: 'Calculate', cashSavings: 'Cash', goldSilver: 'Gold', goldWeight: 'Gold (grams)', goldPricePerGram: 'Price/gram', livePrice: 'Live', fetchingPrice: 'Fetching...', approximatePrice: 'Estimated', investments: 'Investments', businessInventory: 'Inventory', debts: 'Debts', zakatDue: 'Zakat Due', nisabThreshold: 'Nisab', eligible: 'Eligible', notEligible: 'Below Nisab', zakatRate: '2.5%',
    badges: 'Achievements', search: 'Search...', all: 'All',
    backup: 'Backup', restore: 'Restore', resetApp: 'Reset App', resetConfirm: 'This will delete ALL data. Are you sure?',
    feedback: 'Send Feedback', feedbackPlaceholder: 'Found a bug? Have an idea?', send: 'Send', cancel: 'Cancel',
    analytics: 'Analytics', spendingByCategory: 'By Category', incomeVsExpense: 'Income vs Expense',
    customCategories: 'Custom Categories', addCategory: 'Add', categoryName: 'Name (EN)', categoryNameAr: 'Name (AR)', categoryColor: 'Color', categoryIcon: 'Icon', categoryType: 'Type', noCustomCategories: 'No custom categories', forExpense: 'Expense', forIncome: 'Income', forBoth: 'Both', manageCategories: 'Your Categories',
    aiInsights: 'AI Insights', recentTransactions: 'Recent', welcomeBack: 'Welcome back',
    goals: 'Goals', yourGoals: 'Your Goals', viewAll: 'View all', addGoal: 'Add Goal', goalName: 'Name', targetAmount: 'Target', currentAmount: 'Current', deadline: 'Deadline', daysToGo: 'days', yearsToGo: 'years', monthsToGo: 'months', noGoalsYet: 'No goals yet', currentBalance: 'Balance', topUp: 'Add', withdraw: 'Withdraw',
    goalTypes: { vacation: 'Vacation', realEstate: 'Property', education: 'Education', hajj: 'Hajj', wedding: 'Wedding', car: 'Car', emergency: 'Emergency', other: 'Other' },
    onboarding: { welcome: 'Welcome to Wafra', welcomeDesc: 'Your financial journey starts here', yourName: 'Your name', getStarted: "Let's Start", chooseCurrency: 'Choose Currency', currencyDesc: 'Select your currency', chooseLanguage: 'Language', salaryDay: 'Salary Day', salaryDayDesc: 'When does your budget month start?', dayOfMonth: 'Day' },
    edit: 'Edit', next: 'Next', back: 'Back', allSet: "You're all set!", date: 'Date', customizeQuickAdd: 'Customize Quick Add', selectQuickCats: 'Select your 4 quick categories', renameCategory: 'Rename', restoreDefaults: 'Restore Defaults',
    monthlyLimits: 'Monthly Limits', setLimit: 'Set Limit', updateLimit: 'Update Limit', spent: 'spent', remaining: 'left', overBudget: 'over budget', manageBudgets: 'Manage Budgets', noBudgetsYet: 'No budget limits set', removeBudget: 'Remove',
    appearance: 'Appearance', darkMode: 'Dark Mode', language: 'Language', dataManagement: 'Data Management', tools: 'Tools', about: 'About', version: 'Version', privacyMode: 'Privacy Mode', notifications: 'Notifications', help: 'Help & Support', editProfile: 'Edit Profile', memberSince: 'Member since',
    subscriptions: 'Subscriptions', fixedBills: 'Fixed Monthly Bills', noSubscriptions: 'No recurring bills', monthlyTotal: 'Monthly Total', manageSubscriptions: 'Review your recurring expenses',
    payday: 'Payday!', paydayTitle: '🎉 It\'s Payday!', paydaySubtitle: 'New month, fresh start', lastMonthSummary: 'Last month summary', youSaved: 'You saved', youSpent: 'You spent', budgetsReset: 'Budget limits have been reset', startFresh: 'Start Fresh',
    billReminder: 'Bill Reminder', billDueTomorrow: 'is likely due tomorrow', dismiss: 'Dismiss', goalReached: 'Goal Reached!', congratulations: 'Congratulations!',
    enterAmount: 'Enter Amount', confirmTransaction: 'Confirm Transaction',
    debtManagement: 'Debt Tracker', addDebt: 'Add Debt', debtName: 'Loan Name', totalLoan: 'Total Loan', paidAmount: 'Paid So Far', monthlyPayment: 'Monthly Payment', startDate: 'Start Date', estimatedEnd: 'Est. Payoff', noDebts: 'No debts tracked', netWorth: 'Net Worth', totalDebts: 'Total Debts', remainingDebt: 'Remaining', makePayment: 'Make Payment', debtFree: 'Debt Free!',
    debtTypes: { car: 'Car Loan', home: 'Mortgage', personal: 'Personal Loan', credit: 'Credit Card', student: 'Student Loan', other: 'Other' },
    // Gamification & Retention Features
    level: 'Level', xp: 'XP', coins: 'Coins', dailyBonus: 'Daily Bonus', claimBonus: 'Claim Bonus', bonusClaimed: 'Come back tomorrow!',
    firstWeekChallenge: 'First Week Challenge', challengeProgress: 'Progress', challengeComplete: 'Challenge Complete!', daysLeft: 'days left',
    tutorial: 'Tutorial', skipTutorial: 'Skip', nextStep: 'Next', gotIt: 'Got it!',
    tutorialWelcome: 'Welcome to Wafra!', tutorialQuickAdd: 'Quick Add', tutorialGoals: 'Set Goals', tutorialBudget: 'Budget Limits',
    monthlyReport: 'Monthly Report', reportCard: 'Report Card', grade: 'Grade', savingsRate: 'Savings Rate', topCategories: 'Top Categories',
    goalTemplates: 'Goal Templates', chooseTemplate: 'Choose a template', createCustom: 'Create Custom', timeToGoal: 'Time to goal', suggestedMonthly: 'Suggested monthly',
    voiceInput: 'Voice Input', listening: 'Listening...', budgetImpact: 'Budget Impact', smartSuggestion: 'Suggested'
  },
  ar: {
    budget: 'الميزانية', profile: 'الملف', dashboard: 'الرئيسية', addTransaction: 'إضافة معاملة', income: 'دخل', expense: 'مصروف', amount: 'المبلغ', category: 'الفئة', save: 'حفظ', delete: 'حذف', totalBalance: 'الرصيد', streak: 'يوم', quickAdd: 'إضافة سريعة', addNote: 'ملاحظة', seeMore: 'المزيد', settings: 'الإعدادات', deleteConfirm: 'حذف؟', yes: 'نعم', no: 'لا', noTransactionsYet: 'لا معاملات', allTransactions: 'المعاملات', recurring: 'تكرار شهري',
    export: 'تصدير', exportCSV: 'CSV', exportPDF: 'PDF', homeCurrency: 'العملة',
    zakatCalculator: 'حاسبة الزكاة', calculateZakat: 'احسب', cashSavings: 'النقد', goldSilver: 'الذهب', goldWeight: 'الذهب (جرام)', goldPricePerGram: 'سعر/جرام', livePrice: 'مباشر', fetchingPrice: 'جاري...', approximatePrice: 'تقديري', investments: 'استثمارات', businessInventory: 'المخزون', debts: 'ديون', zakatDue: 'الزكاة', nisabThreshold: 'النصاب', eligible: 'يجب الزكاة', notEligible: 'أقل من النصاب', zakatRate: '٢.٥٪',
    badges: 'الإنجازات', search: 'بحث...', all: 'الكل',
    backup: 'نسخ', restore: 'استعادة', resetApp: 'إعادة تعيين', resetConfirm: 'سيتم حذف جميع البيانات. متأكد؟',
    feedback: 'إرسال ملاحظات', feedbackPlaceholder: 'وجدت خطأ؟ لديك فكرة؟', send: 'إرسال', cancel: 'إلغاء',
    analytics: 'تحليلات', spendingByCategory: 'حسب الفئة', incomeVsExpense: 'دخل/مصروف',
    customCategories: 'فئات مخصصة', addCategory: 'إضافة', categoryName: 'الاسم (EN)', categoryNameAr: 'الاسم (AR)', categoryColor: 'اللون', categoryIcon: 'أيقونة', categoryType: 'النوع', noCustomCategories: 'لا فئات', forExpense: 'مصروف', forIncome: 'دخل', forBoth: 'كلاهما', manageCategories: 'فئاتك',
    aiInsights: 'تحليلات', recentTransactions: 'الأخيرة', welcomeBack: 'أهلاً',
    goals: 'الأهداف', yourGoals: 'أهدافك', viewAll: 'الكل', addGoal: 'إضافة', goalName: 'الاسم', targetAmount: 'الهدف', currentAmount: 'الحالي', deadline: 'التاريخ', daysToGo: 'يوم', yearsToGo: 'سنة', monthsToGo: 'شهر', noGoalsYet: 'لا أهداف', currentBalance: 'الرصيد', topUp: 'إيداع', withdraw: 'سحب',
    goalTypes: { vacation: 'إجازة', realEstate: 'عقار', education: 'تعليم', hajj: 'حج', wedding: 'زواج', car: 'سيارة', emergency: 'طوارئ', other: 'أخرى' },
    onboarding: { welcome: 'أهلاً بك في وفرة', welcomeDesc: 'رحلتك المالية تبدأ هنا', yourName: 'اسمك', getStarted: 'ابدأ', chooseCurrency: 'اختر العملة', currencyDesc: 'العملة الرئيسية', chooseLanguage: 'اللغة', salaryDay: 'يوم الراتب', salaryDayDesc: 'متى يبدأ شهرك المالي؟', dayOfMonth: 'اليوم' },
    edit: 'تعديل', next: 'التالي', back: 'رجوع', allSet: 'جاهز!', date: 'التاريخ', customizeQuickAdd: 'تخصيص الإضافة السريعة', selectQuickCats: 'اختر 4 فئات سريعة', renameCategory: 'إعادة تسمية', restoreDefaults: 'استعادة الافتراضي',
    monthlyLimits: 'حدود شهرية', setLimit: 'تحديد', updateLimit: 'تعديل الحد', spent: 'صرفت', remaining: 'متبقي', overBudget: 'تجاوز الميزانية', manageBudgets: 'إدارة الميزانيات', noBudgetsYet: 'لا حدود ميزانية', removeBudget: 'إزالة',
    appearance: 'المظهر', darkMode: 'الوضع الداكن', language: 'اللغة', dataManagement: 'إدارة البيانات', tools: 'الأدوات', about: 'حول', version: 'الإصدار', privacyMode: 'وضع الخصوصية', notifications: 'الإشعارات', help: 'المساعدة', editProfile: 'تعديل الملف', memberSince: 'عضو منذ',
    subscriptions: 'الاشتراكات', fixedBills: 'الفواتير الشهرية الثابتة', noSubscriptions: 'لا فواتير متكررة', monthlyTotal: 'الإجمالي الشهري', manageSubscriptions: 'راجع مصاريفك المتكررة',
    payday: 'يوم الراتب!', paydayTitle: '🎉 يوم الراتب!', paydaySubtitle: 'شهر جديد، بداية جديدة', lastMonthSummary: 'ملخص الشهر الماضي', youSaved: 'وفرت', youSpent: 'صرفت', budgetsReset: 'تم إعادة تعيين حدود الميزانية', startFresh: 'ابدأ من جديد',
    billReminder: 'تذكير فاتورة', billDueTomorrow: 'مستحق غداً على الأرجح', dismiss: 'إغلاق', goalReached: 'تم تحقيق الهدف!', congratulations: 'مبروك!',
    enterAmount: 'أدخل المبلغ', confirmTransaction: 'تأكيد المعاملة',
    debtManagement: 'متتبع الديون', addDebt: 'إضافة دين', debtName: 'اسم القرض', totalLoan: 'إجمالي القرض', paidAmount: 'المدفوع', monthlyPayment: 'القسط الشهري', startDate: 'تاريخ البدء', estimatedEnd: 'تاريخ السداد المتوقع', noDebts: 'لا ديون مسجلة', netWorth: 'صافي الثروة', totalDebts: 'إجمالي الديون', remainingDebt: 'المتبقي', makePayment: 'سداد دفعة', debtFree: 'خالي من الديون!',
    debtTypes: { car: 'قرض سيارة', home: 'قرض عقاري', personal: 'قرض شخصي', credit: 'بطاقة ائتمان', student: 'قرض دراسي', other: 'أخرى' },
    // Gamification & Retention Features
    level: 'المستوى', xp: 'نقاط الخبرة', coins: 'عملات', dailyBonus: 'مكافأة يومية', claimBonus: 'احصل على المكافأة', bonusClaimed: 'عد غداً!',
    firstWeekChallenge: 'تحدي الأسبوع الأول', challengeProgress: 'التقدم', challengeComplete: 'اكتمل التحدي!', daysLeft: 'يوم متبقي',
    tutorial: 'الدليل', skipTutorial: 'تخطي', nextStep: 'التالي', gotIt: 'فهمت!',
    tutorialWelcome: 'مرحباً بك في وفرة!', tutorialQuickAdd: 'إضافة سريعة', tutorialGoals: 'حدد أهدافك', tutorialBudget: 'حدود الميزانية',
    monthlyReport: 'التقرير الشهري', reportCard: 'بطاقة التقرير', grade: 'الدرجة', savingsRate: 'معدل الادخار', topCategories: 'أعلى الفئات',
    goalTemplates: 'قوالب الأهداف', chooseTemplate: 'اختر قالباً', createCustom: 'إنشاء مخصص', timeToGoal: 'الوقت للهدف', suggestedMonthly: 'المقترح شهرياً',
    voiceInput: 'إدخال صوتي', listening: 'جاري الاستماع...', budgetImpact: 'تأثير الميزانية', smartSuggestion: 'مقترح'
  }
};

const goalTypeIcons = { vacation: Palmtree, realEstate: Building2, education: GraduationCap, hajj: Moon, wedding: Heart, car: Car, emergency: Shield, other: Target };
const goalTypeColors = { vacation: { light: 'bg-cyan-100', text: 'text-cyan-600', bar: 'bg-cyan-500' }, realEstate: { light: 'bg-violet-100', text: 'text-violet-600', bar: 'bg-violet-500' }, education: { light: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' }, hajj: { light: 'bg-emerald-100', text: 'text-emerald-600', bar: 'bg-emerald-500' }, wedding: { light: 'bg-pink-100', text: 'text-pink-600', bar: 'bg-pink-500' }, car: { light: 'bg-amber-100', text: 'text-amber-600', bar: 'bg-amber-500' }, emergency: { light: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' }, other: { light: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-500' } };

// Debt type icons and colors (inverse of goals - start from red, move towards green)
const debtTypeIcons = { car: Car, home: Home, personal: Banknote, credit: CreditCard, student: GraduationCap, other: Wallet };
const debtTypeColors = { 
  car: { light: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-500' }, 
  home: { light: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500' }, 
  personal: { light: 'bg-rose-100', text: 'text-rose-600', bar: 'bg-rose-500' }, 
  credit: { light: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' }, 
  student: { light: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' }, 
  other: { light: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-500' } 
};

const defaultQuickAddCats = ['coffee', 'fuel', 'groceries', 'restaurant'];

const badgeDefinitions = [
  { id: 'firstTx', icon: '🎯' }, { id: 'firstGoal', icon: '🎪' }, { id: 'streak7', icon: '🔥' },
  { id: 'streak30', icon: '⚡' }, { id: 'saved100', icon: '💰' }, { id: 'saved500', icon: '🏆' }, { id: 'goalComplete', icon: '🌟' }
];

// ============== GAMIFICATION SYSTEM ==============
const LEVELS = [
  { level: 1, name: 'Beginner', nameAr: 'مبتدئ', xpRequired: 0, icon: '🌱' },
  { level: 2, name: 'Saver', nameAr: 'مدخر', xpRequired: 100, icon: '💰' },
  { level: 3, name: 'Budgeter', nameAr: 'مخطط', xpRequired: 300, icon: '📊' },
  { level: 4, name: 'Tracker', nameAr: 'متتبع', xpRequired: 600, icon: '🎯' },
  { level: 5, name: 'Expert', nameAr: 'خبير', xpRequired: 1000, icon: '⭐' },
  { level: 6, name: 'Master', nameAr: 'محترف', xpRequired: 1500, icon: '🏆' },
  { level: 7, name: 'Legend', nameAr: 'أسطورة', xpRequired: 2500, icon: '👑' },
];

const ACHIEVEMENTS = [
  { id: 'firstTx', icon: '🎯', name: 'First Step', nameAr: 'الخطوة الأولى', desc: 'Log your first transaction', xp: 10 },
  { id: 'firstGoal', icon: '🎪', name: 'Goal Setter', nameAr: 'واضع الأهداف', desc: 'Create your first goal', xp: 15 },
  { id: 'streak3', icon: '🔥', name: 'On Fire', nameAr: 'متحمس', desc: '3 day streak', xp: 20 },
  { id: 'streak7', icon: '⚡', name: 'Week Warrior', nameAr: 'محارب الأسبوع', desc: '7 day streak', xp: 50 },
  { id: 'streak30', icon: '💎', name: 'Monthly Master', nameAr: 'ماجستير شهري', desc: '30 day streak', xp: 150 },
  { id: 'tx10', icon: '📝', name: 'Recorder', nameAr: 'مسجل', desc: 'Log 10 transactions', xp: 25 },
  { id: 'tx50', icon: '📚', name: 'Bookkeeper', nameAr: 'محاسب', desc: 'Log 50 transactions', xp: 75 },
  { id: 'goalComplete', icon: '🌟', name: 'Goal Crusher', nameAr: 'محقق الأهداف', desc: 'Complete a goal', xp: 100 },
  { id: 'budgetSet', icon: '📋', name: 'Budget Planner', nameAr: 'مخطط الميزانية', desc: 'Set your first budget', xp: 20 },
  { id: 'weekChallenge', icon: '🏆', name: 'Week Champion', nameAr: 'بطل الأسبوع', desc: 'Complete First Week Challenge', xp: 100 },
];

// Goal Templates for easier goal creation
const GOAL_TEMPLATES = [
  { id: 'wedding', type: 'wedding', icon: Heart, name: 'Wedding Fund', nameAr: 'صندوق الزواج', defaultTarget: 5000 },
  { id: 'hajj', type: 'hajj', icon: Moon, name: 'Hajj Pilgrimage', nameAr: 'صندوق الحج', defaultTarget: 3000 },
  { id: 'emergency', type: 'emergency', icon: Shield, name: 'Emergency Fund', nameAr: 'صندوق الطوارئ', defaultTarget: 2000 },
  { id: 'property', type: 'realEstate', icon: Building2, name: 'Property Down Payment', nameAr: 'دفعة العقار', defaultTarget: 10000 },
  { id: 'car', type: 'car', icon: Car, name: 'New Car', nameAr: 'سيارة جديدة', defaultTarget: 8000 },
  { id: 'vacation', type: 'vacation', icon: Palmtree, name: 'Dream Vacation', nameAr: 'إجازة الأحلام', defaultTarget: 1500 },
];

const fmt = (amt, priv, curr = 'KD') => priv ? '****' : `${currencies[curr]?.symbol || 'KD'} ${parseFloat(amt || 0).toFixed(2)}`;
const fmtShort = (amt, priv, curr = 'KD') => priv ? '****' : `${currencies[curr]?.symbol || 'KD'} ${parseFloat(amt || 0).toFixed(2)}`;

// Haptic Feedback Utility - Makes the app feel native and premium
const haptic = {
  light: () => { try { navigator.vibrate && navigator.vibrate(5); } catch(e) {} },
  medium: () => { try { navigator.vibrate && navigator.vibrate(20); } catch(e) {} },
  heavy: () => { try { navigator.vibrate && navigator.vibrate([30, 50, 30]); } catch(e) {} },
  success: () => { try { navigator.vibrate && navigator.vibrate([50, 100, 50, 100, 100]); } catch(e) {} },
  error: () => { try { navigator.vibrate && navigator.vibrate([100, 50, 100]); } catch(e) {} }
};

// Gold Price Cache - Prevents API rate limits and provides graceful fallback
const GOLD_CACHE_KEY = 'wafra-gold-price';
const GOLD_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getCachedGoldPrice = () => {
  try {
    const cached = localStorage.getItem(GOLD_CACHE_KEY);
    if (cached) {
      const { price, timestamp, isLive } = JSON.parse(cached);
      if (Date.now() - timestamp < GOLD_CACHE_DURATION) {
        return { price, isLive, isCached: true };
      }
    }
  } catch(e) {}
  return null;
};

const setCachedGoldPrice = (price, isLive = true) => {
  try {
    localStorage.setItem(GOLD_CACHE_KEY, JSON.stringify({
      price,
      timestamp: Date.now(),
      isLive
    }));
  } catch(e) {}
};

// Check if today is payday
const isPayday = (salaryDay) => {
  const today = new Date();
  return today.getDate() === salaryDay;
};

// Check for upcoming bill reminders - FIXED: Handles month overflow (e.g., Jan 31 in Feb)
const getUpcomingBills = (transactions, salaryDay) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();
  
  // Get the last day of tomorrow's month
  const lastDayOfMonth = new Date(tomorrow.getFullYear(), tomorrow.getMonth() + 1, 0).getDate();
  const isTomorrowLastDay = tomorrowDay === lastDayOfMonth;
  
  // Find recurring transactions that might be due tomorrow
  return transactions.filter(tx => {
    if (!tx.isRecurring || tx.type !== 'expense') return false;
    const txDate = new Date(tx.date);
    const txDay = txDate.getDate();
    
    // Bill is due if:
    // 1. Transaction day matches tomorrow's day exactly, OR
    // 2. Transaction day is > last day of month AND tomorrow is last day
    //    (e.g., bill on 31st triggers on Feb 28/29)
    return txDay === tomorrowDay || (txDay > lastDayOfMonth && isTomorrowLastDay);
  });
};

// Custom Chart Tooltip for premium feel
const CustomTooltip = ({ active, payload, label, dark, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 shadow-lg`}>
        <p className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {currencies[currency]?.symbol || 'KD'} {entry.value?.toFixed(0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload, dark, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 shadow-lg`}>
        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{payload[0].name}</p>
        <p className="text-emerald-600 font-bold">{currencies[currency]?.symbol || 'KD'} {payload[0].value?.toFixed(0)}</p>
      </div>
    );
  }
  return null;
};

// Helper to calculate budget progress color (Green -> Yellow -> Red)
const getBudgetColor = (spent, limit) => {
  if (limit <= 0) return 'bg-gray-300';
  const pct = spent / limit;
  if (pct >= 1) return 'bg-red-500';
  if (pct >= 0.8) return 'bg-orange-500';
  if (pct >= 0.5) return 'bg-yellow-500';
  return 'bg-emerald-500';
};

// Custom Number Pad Component - Premium finance app feel
const NumberPad = ({ value, onChange, onConfirm, confirmText, currency, dark }) => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'del'];
  
  const handleInput = (key) => {
    haptic.light();
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) {
        onChange(value + '.');
      }
    } else {
      // Prevent more than 2 decimal places
      const parts = value.split('.');
      if (parts[1] && parts[1].length >= 2) return;
      onChange(value + key.toString());
    }
  };
  
  const handleConfirm = () => {
    haptic.medium();
    onConfirm();
  };
  
  return (
    <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-4 pb-8`}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {nums.map(n => (
          <button 
            key={n}
            onClick={() => handleInput(n)}
            className={`h-14 rounded-2xl text-2xl font-bold ${dark ? 'text-white hover:bg-gray-700 active:bg-gray-600' : 'text-gray-800 hover:bg-gray-100 active:bg-gray-200'} transition-colors flex items-center justify-center`}
          >
            {n === 'del' ? <Delete size={24} /> : n}
          </button>
        ))}
      </div>
      
      <button 
        onClick={handleConfirm}
        disabled={!value || value === '0' || value === '.'}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-colors"
      >
        {confirmText}
      </button>
    </div>
  );
};

// ============== CONFETTI COMPONENT ==============
const Confetti = ({ active }) => {
  // FIX: useMemo prevents confetti pieces from recalculating on every re-render
  // This stops the "flickering/jumping" effect during animations
  const pieces = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
    duration: 2 + Math.random() * 2,
  })), []); // Empty array = generate only once when component mounts
  
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            backgroundColor: p.color,
            animation: `confetti ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ============== TUTORIAL OVERLAY ==============
const TutorialOverlay = ({ step, onNext, onSkip, t, dark, lang }) => {
  const steps = [
    { title: t.tutorialWelcome, desc: lang === 'ar' ? 'دعنا نرشدك خلال الميزات الرئيسية' : "Let's guide you through the main features", icon: '👋' },
    { title: t.tutorialQuickAdd, desc: lang === 'ar' ? 'أضف المعاملات بسرعة من هنا' : 'Quickly add transactions from here', icon: '⚡' },
    { title: t.tutorialGoals, desc: lang === 'ar' ? 'حدد أهداف الادخار وتتبع تقدمك' : 'Set savings goals and track your progress', icon: '🎯' },
    { title: t.tutorialBudget, desc: lang === 'ar' ? 'حدد ميزانيات للفئات المختلفة' : 'Set budget limits for different categories', icon: '📊' },
  ];
  
  const currentStep = steps[step] || steps[0];
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-sm w-full text-center`}>
        <div className="text-6xl mb-4">{currentStep.icon}</div>
        <h2 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>{currentStep.title}</h2>
        <p className={`${dark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>{currentStep.desc}</p>
        
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          ))}
        </div>
        
        <div className="flex gap-3">
          <button onClick={onSkip} className={`flex-1 py-3 ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-xl font-medium`}>
            {t.skipTutorial}
          </button>
          <button onClick={onNext} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">
            {step < steps.length - 1 ? t.nextStep : t.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== FIRST WEEK CHALLENGE CARD ==============
const FirstWeekChallenge = ({ data, t, dark, onComplete }) => {
  const txCount = data.transactions.length;
  const goalCount = data.goals.length;
  const budgetCount = Object.values(data.budgets || {}).filter(v => v > 0).length;
  const categoriesUsed = [...new Set(data.transactions.map(tx => tx.category))].length;
  
  const challenges = [
    { id: 'tx3', name: data.lang === 'ar' ? 'سجل 3 معاملات' : 'Log 3 transactions', done: txCount >= 3, progress: Math.min(txCount, 3), max: 3 },
    { id: 'goal1', name: data.lang === 'ar' ? 'أنشئ هدف ادخار' : 'Create a savings goal', done: goalCount >= 1, progress: Math.min(goalCount, 1), max: 1 },
    { id: 'budget1', name: data.lang === 'ar' ? 'حدد ميزانية لفئة' : 'Set a category budget', done: budgetCount >= 1, progress: Math.min(budgetCount, 1), max: 1 },
    { id: 'cat3', name: data.lang === 'ar' ? 'استخدم 3 فئات مختلفة' : 'Use 3 different categories', done: categoriesUsed >= 3, progress: Math.min(categoriesUsed, 3), max: 3 },
  ];
  
  const completed = challenges.filter(c => c.done).length;
  const allDone = completed === challenges.length;
  
  useEffect(() => {
    if (allDone && !data.firstWeekChallengeCompleted) {
      onComplete();
    }
  }, [allDone, data.firstWeekChallengeCompleted, onComplete]);
  
  const startDate = new Date(data.firstOpenDate || Date.now());
  const daysLeft = Math.max(0, 7 - Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  return (
    <div className={`${dark ? 'bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border-violet-700/50' : 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200'} border rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          <h3 className={`font-bold ${dark ? 'text-white' : 'text-violet-800'}`}>{t.firstWeekChallenge}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${dark ? 'bg-violet-800 text-violet-200' : 'bg-violet-100 text-violet-700'}`}>
          {daysLeft} {t.daysLeft}
        </span>
      </div>
      
      <div className="space-y-2">
        {challenges.map(c => (
          <div key={c.id} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${c.done ? 'bg-emerald-500' : dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {c.done ? <CheckCircle size={14} className="text-white" /> : <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{c.progress}/{c.max}</span>}
            </div>
            <span className={`text-sm ${c.done ? 'line-through opacity-50' : ''} ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{c.name}</span>
          </div>
        ))}
      </div>
      
      <div className={`mt-3 h-2 ${dark ? 'bg-violet-800' : 'bg-violet-200'} rounded-full overflow-hidden`}>
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(completed / challenges.length) * 100}%` }} />
      </div>
      
      {allDone && (
        <div className="mt-3 text-center">
          <span className="text-emerald-500 font-bold">🎉 {t.challengeComplete}</span>
        </div>
      )}
    </div>
  );
};

// ============== MONTHLY REPORT CARD ==============
const MonthlyReportCard = ({ data, t, dark, onClose }) => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const lastMonthTx = data.transactions.filter(tx => {
    const d = new Date(tx.date);
    return d >= lastMonth && d <= lastMonthEnd;
  });
  
  const income = lastMonthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const expense = lastMonthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const saved = income - expense;
  const savingsRate = income > 0 ? ((saved / income) * 100).toFixed(0) : 0;
  
  let grade = 'F', gradeColor = 'text-red-500', gradeEmoji = '😢';
  if (savingsRate >= 50) { grade = 'A+'; gradeColor = 'text-emerald-500'; gradeEmoji = '🏆'; }
  else if (savingsRate >= 30) { grade = 'A'; gradeColor = 'text-emerald-500'; gradeEmoji = '🌟'; }
  else if (savingsRate >= 20) { grade = 'B'; gradeColor = 'text-blue-500'; gradeEmoji = '👍'; }
  else if (savingsRate >= 10) { grade = 'C'; gradeColor = 'text-yellow-500'; gradeEmoji = '👌'; }
  else if (savingsRate > 0) { grade = 'D'; gradeColor = 'text-orange-500'; gradeEmoji = '🤔'; }
  
  const catSpend = {};
  lastMonthTx.filter(tx => tx.type === 'expense').forEach(tx => {
    catSpend[tx.category] = (catSpend[tx.category] || 0) + tx.amount;
  });
  const topCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 3);
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-3xl w-full max-w-sm overflow-hidden`}>
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white text-center">
          <p className="text-indigo-200 text-sm mb-1">{lastMonth.toLocaleDateString(data.lang === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' })}</p>
          <h2 className="text-2xl font-bold mb-4">{t.monthlyReport}</h2>
          <div className="text-7xl mb-2">{gradeEmoji}</div>
          <p className={`text-5xl font-black ${gradeColor}`}>{grade}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.savingsRate}</p>
              <p className={`text-2xl font-bold ${parseFloat(savingsRate) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{savingsRate}%</p>
            </div>
            <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.youSaved}</p>
              <p className={`text-2xl font-bold ${saved >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {saved >= 0 ? '+' : ''}{currencies[data.homeCurrency]?.symbol} {Math.abs(saved).toFixed(0)}
              </p>
            </div>
          </div>
          
          <div>
            <p className={`text-xs font-bold ${dark ? 'text-gray-400' : 'text-gray-500'} uppercase mb-2`}>{t.topCategories}</p>
            {topCats.map(([cat, amt], i) => (
              <div key={cat} className="flex items-center justify-between py-2">
                <span className={`${dark ? 'text-gray-300' : 'text-gray-700'}`}>{i + 1}. {expenseCategories[data.lang][cat] || cat}</span>
                <span className={`font-bold ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{currencies[data.homeCurrency]?.symbol} {amt.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">{t.gotIt}</button>
        </div>
      </div>
    </div>
  );
};

// ============== LEVEL UP MODAL ==============
const LevelUpModal = ({ level, onClose, t, dark }) => {
  const levelData = LEVELS.find(l => l.level === level) || LEVELS[0];
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Confetti active={true} />
      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-sm w-full text-center`}>
        <div className="text-8xl mb-4 animate-bounce">{levelData.icon}</div>
        <h2 className={`text-3xl font-black mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {t.level} {level}!
        </h2>
        <p className="text-emerald-500 font-bold text-xl mb-6">
          {t.lang === 'ar' ? levelData.nameAr : levelData.name}
        </p>
        <button onClick={onClose} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg">
          🎉 {t.lang === 'ar' ? 'رائع!' : 'Awesome!'}
        </button>
      </div>
    </div>
  );
};

function WafraApp() {
  const fileInputRef = useRef(null);
  const [data, setData] = useLocalStorage('wafra-data', { 
    lang: 'en', transactions: [], streak: 1, progress: { budgeting: 0, saving: 0, investing: 0, islamic: 0 }, 
    profile: { name: '' }, onboardingDone: false, onboardingStep: 1, privacyMode: false, darkMode: false,
    goals: [], homeCurrency: 'KD', earnedBadges: [], customCategories: [],
    salaryDay: 1, quickAddCats: ['coffee', 'fuel', 'groceries', 'restaurant'], modifiedCategories: {},
    budgets: {}, // Category budget limits (envelope system)
    debts: [], // Debt tracking array
    // Gamification & Retention Data
    xp: 0, coins: 100, selectedTheme: 'default',
    lastDailyBonus: null, dailyBonusStreak: 0, tutorialComplete: false, tutorialStep: 0,
    firstWeekChallengeCompleted: false, firstOpenDate: null, lastMonthReportShown: null
  });

  const [tab, setTab] = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [quickCat, setQuickCat] = useState(null);
  const [quickAmt, setQuickAmt] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [newTx, setNewTx] = useState({ type: 'expense', amount: '', category: 'food', description: '', isRecurring: false });
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);
  const [deleting, setDeleting] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', type: 'vacation', targetAmount: '', currentAmount: '0', deadline: '' });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [showZakatModal, setShowZakatModal] = useState(false);
  // Debt management state
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [newDebt, setNewDebt] = useState({ name: '', type: 'personal', totalAmount: '', paidAmount: '0', monthlyPayment: '', startDate: new Date().toISOString().split('T')[0] });
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showDebtPayment, setShowDebtPayment] = useState(false);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState('');
  const [zakatInputs, setZakatInputs] = useState({ cash: '', goldGrams: '', goldPrice: '', investments: '', inventory: '', debts: '' });
  const [goldPriceLoading, setGoldPriceLoading] = useState(false);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // FIX: Debounced search for performance
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', nameAr: '', color: '#10b981', icon: 'tag', type: 'expense' });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showQuickAddSettings, setShowQuickAddSettings] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState({ category: '', amount: '' });
  const [showPaydayModal, setShowPaydayModal] = useState(false);
  const [billReminders, setBillReminders] = useState([]);
  const [dismissedReminders, setDismissedReminders] = useState([]);
  const [goldPriceIsLive, setGoldPriceIsLive] = useState(false);
  const [showGoalCelebration, setShowGoalCelebration] = useState(null);
  
  // Gamification & Retention State
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [showAchievementUnlock, setShowAchievementUnlock] = useState(null);
  const [showGoalTemplates, setShowGoalTemplates] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quickBudgetImpact, setQuickBudgetImpact] = useState(null);

  const t = translations[data.lang];
  const rtl = data.lang === 'ar';
  const dark = data.darkMode;
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-800';
  const muted = dark ? 'text-gray-400' : 'text-gray-500';

  const getCats = useCallback((type) => {
    const base = type === 'income' ? incomeCategories[data.lang] : expenseCategories[data.lang];
    const custom = {};
    (data.customCategories || []).forEach(c => {
      if (c.type === 'both' || c.type === type) custom[c.id] = data.lang === 'ar' ? c.nameAr : c.name;
    });
    return { ...base, ...custom };
  }, [data.lang, data.customCategories]);

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

  // ============== FIX: Debounce search for performance ==============
  // Prevents lag when typing with 500+ transactions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // 300ms delay after user stops typing
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    const y = selectedDate.getFullYear(), m = selectedDate.getMonth();
    return data.transactions.filter(tx => { const d = new Date(tx.date); return d.getFullYear() === y && d.getMonth() === m; });
  }, [data.transactions, selectedDate]);

  // FIX: Using debouncedSearch instead of searchQuery for filtering
  const searched = useMemo(() => filtered.filter(tx => {
    const matchSearch = !debouncedSearch || tx.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) || allCats[tx.category]?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchCat = categoryFilter === 'all' || tx.category === categoryFilter;
    return matchSearch && matchCat;
  }), [filtered, debouncedSearch, categoryFilter, allCats]);

  const totalIncome = useMemo(() => filtered.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0), [filtered]);
  const balance = totalIncome - totalExpense;

  const catSpending = useMemo(() => {
    const sp = {};
    filtered.filter(tx => tx.type === 'expense').forEach(tx => { sp[tx.category] = (sp[tx.category] || 0) + tx.amount; });
    return sp;
  }, [filtered]);

  const chartData = useMemo(() => Object.entries(catSpending).map(([cat, amt]) => ({ name: allCats[cat] || cat, value: amt })).sort((a, b) => b.value - a.value).slice(0, 6), [catSpending, allCats]);

  // ============== GAMIFICATION CALCULATIONS ==============
  const currentLevel = useMemo(() => {
    const xp = data.xp || 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) return LEVELS[i];
    }
    return LEVELS[0];
  }, [data.xp]);
  
  const nextLevel = useMemo(() => {
    const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
    return LEVELS[idx + 1] || null;
  }, [currentLevel]);
  
  const xpProgress = nextLevel ? ((data.xp || 0) - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired) * 100 : 100;
  
  // Smart category suggestion based on time of day
  const suggestedCategory = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return 'coffee';
    if (hour >= 11 && hour < 14) return 'restaurant';
    if (hour >= 14 && hour < 17) return 'shopping';
    if (hour >= 17 && hour < 21) return 'groceries';
    return 'food';
  }, []);

  // Add XP function
  const addXP = useCallback((amount, achievementId = null) => {
    setData(prev => {
      const newXP = (prev.xp || 0) + amount;
      const oldLevel = LEVELS.find(l => l.xpRequired <= (prev.xp || 0));
      const newLevel = LEVELS.findLast(l => l.xpRequired <= newXP);
      
      if (newLevel && oldLevel && newLevel.level > oldLevel.level) {
        setTimeout(() => setShowLevelUp(newLevel.level), 500);
      }
      
      if (achievementId && !prev.earnedBadges?.includes(achievementId)) {
        setTimeout(() => setShowAchievementUnlock(ACHIEVEMENTS.find(a => a.id === achievementId)), 300);
        return { ...prev, xp: newXP, earnedBadges: [...(prev.earnedBadges || []), achievementId] };
      }
      
      return { ...prev, xp: newXP };
    });
    haptic.success();
  }, [setData]);

  // Add coins function
  const addCoins = useCallback((amount) => {
    setData(prev => ({ ...prev, coins: (prev.coins || 0) + amount }));
    haptic.light();
  }, [setData]);

  // Check and award achievements
  // FIX: Optimized dependencies to prevent re-running on every data change
  const checkAchievements = useCallback(() => {
    const txCount = data.transactions.length;
    const goalCount = data.goals.length;
    const budgetCount = Object.values(data.budgets || {}).filter(v => v > 0).length;
    const streak = data.streak || data.dailyBonusStreak || 0;
    const earnedBadges = data.earnedBadges || [];
    
    const checks = [
      { id: 'firstTx', condition: txCount >= 1 },
      { id: 'firstGoal', condition: goalCount >= 1 },
      { id: 'streak3', condition: streak >= 3 },
      { id: 'streak7', condition: streak >= 7 },
      { id: 'streak30', condition: streak >= 30 },
      { id: 'tx10', condition: txCount >= 10 },
      { id: 'tx50', condition: txCount >= 50 },
      { id: 'budgetSet', condition: budgetCount >= 1 },
    ];
    
    checks.forEach(({ id, condition }) => {
      if (condition && !earnedBadges.includes(id)) {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) addXP(achievement.xp, id);
      }
    });
  }, [data.transactions.length, data.goals.length, data.budgets, data.streak, data.dailyBonusStreak, data.earnedBadges, addXP]);

  // ============== FIX: Auto-check achievements on data changes ==============
  // This replaces buggy setTimeout(checkAchievements) calls that had stale closure issues
  // Removed checkAchievements from deps since we already track the specific values that matter
  useEffect(() => {
    if (data.onboardingDone) {
      checkAchievements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.transactions.length, data.goals.length, data.streak, data.dailyBonusStreak, Object.keys(data.budgets || {}).length, data.onboardingDone]);

  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const txs = data.transactions.filter(tx => { const x = new Date(tx.date); return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth(); });
      months.push({ name: d.toLocaleDateString(data.lang === 'ar' ? 'ar' : 'en', { month: 'short' }), income: txs.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0), expense: txs.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0) });
    }
    return months;
  }, [data.transactions, data.lang]);

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
    haptic.medium();
    if (editingTx) { 
      setData(p => ({ ...p, transactions: p.transactions.map(tx => tx.id === editingTx.id ? { ...tx, ...newTx, amount: parseFloat(newTx.amount), date: txDate } : tx) })); 
      setEditingTx(null); 
    } else { 
      setData(p => ({ ...p, transactions: [...p.transactions, { id: Date.now(), ...newTx, amount: parseFloat(newTx.amount), date: txDate, currency: data.homeCurrency }] })); 
      addXP(5); // XP for logging transaction
      addCoins(2); // Coins for logging transaction
    }
    setNewTx({ type: 'expense', amount: '', category: 'food', description: '', isRecurring: false }); 
    setTxDate(new Date().toISOString().split('T')[0]); 
    setShowAdd(false);
    // Achievement check now handled by useEffect
  };

  const quickAddFn = () => {
    if (!quickAmt || !quickCat) return;
    haptic.medium();
    setData(p => ({ ...p, transactions: [...p.transactions, { id: Date.now(), type: 'expense', amount: parseFloat(quickAmt), category: quickCat, description: quickNote, date: quickDate, currency: data.homeCurrency }] }));
    addXP(5); // XP for logging transaction
    addCoins(2); // Coins for logging transaction
    setQuickAmt(''); setQuickNote(''); setQuickCat(null); setShowQuick(false); setQuickDate(new Date().toISOString().split('T')[0]);
    setQuickBudgetImpact(null);
    // Achievement check now handled by useEffect
  };
  
  // Calculate budget impact for quick add
  useEffect(() => {
    if (quickCat && quickAmt && data.budgets?.[quickCat]) {
      const limit = data.budgets[quickCat];
      const currentSpent = catSpending[quickCat] || 0;
      const newTotal = currentSpent + parseFloat(quickAmt || 0);
      const remaining = limit - newTotal;
      setQuickBudgetImpact({ limit, spent: currentSpent, newTotal, remaining, isOver: newTotal > limit });
    } else {
      setQuickBudgetImpact(null);
    }
  }, [quickCat, quickAmt, data.budgets, catSpending]);

  const deleteTx = (id) => { haptic.light(); setData(p => ({ ...p, transactions: p.transactions.filter(tx => tx.id !== id) })); setDeleting(null); };
  const startEdit = (tx) => { setEditingTx(tx); setNewTx({ type: tx.type, amount: tx.amount.toString(), category: tx.category, description: tx.description || '', isRecurring: tx.isRecurring }); setTxDate(tx.date); setShowAdd(true); };

  const addGoalFn = () => { 
    if (!newGoal.name || !newGoal.targetAmount) return; 
    haptic.medium(); 
    setData(p => ({ ...p, goals: [...(p.goals || []), { id: Date.now(), ...newGoal, targetAmount: parseFloat(newGoal.targetAmount), currentAmount: parseFloat(newGoal.currentAmount) || 0 }] })); 
    setNewGoal({ name: '', type: 'vacation', targetAmount: '', currentAmount: '0', deadline: '' }); 
    setShowAddGoal(false);
    setShowGoalTemplates(true);
    addXP(10); // XP for creating goal
    // Achievement check now handled by useEffect
  };
  
  // Handle goal template selection
  const handleGoalTemplateSelect = (template) => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 12);
    setNewGoal({
      name: data.lang === 'ar' ? template.nameAr : template.name,
      type: template.type,
      targetAmount: template.defaultTarget.toString(),
      currentAmount: '0',
      deadline: deadline.toISOString().split('T')[0],
    });
    setShowGoalTemplates(false);
  };
  
  const topUpFn = (withdraw = false) => { 
    if (!topUpAmount || !selectedGoal) return; 
    const amt = parseFloat(topUpAmount); 
    const newAmount = withdraw ? Math.max(0, selectedGoal.currentAmount - amt) : selectedGoal.currentAmount + amt;
    
    // Check if goal is reached
    if (!withdraw && newAmount >= selectedGoal.targetAmount && selectedGoal.currentAmount < selectedGoal.targetAmount) {
      haptic.success(); // Celebration haptic!
      setShowGoalCelebration(selectedGoal);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      // Award goal complete achievement
      if (!data.earnedBadges?.includes('goalComplete')) {
        addXP(100, 'goalComplete');
      }
    } else {
      haptic.medium();
    }
    
    setData(p => ({ ...p, goals: p.goals.map(g => g.id === selectedGoal.id ? { ...g, currentAmount: newAmount } : g) })); 
    setSelectedGoal(p => ({ ...p, currentAmount: newAmount })); 
    setTopUpAmount(''); 
    setShowTopUp(false);
    
    if (!withdraw) {
      addXP(5); // XP for contributing to goal
      // Achievement check now handled by useEffect
    }
  };
  
  const timeLeft = (dl) => { if (!dl) return null; const d = Math.ceil((new Date(dl) - new Date()) / 86400000); if (d < 0) return { v: 0, u: 'daysToGo' }; if (d > 365) return { v: Math.round(d / 365), u: 'yearsToGo' }; if (d > 60) return { v: Math.round(d / 30), u: 'monthsToGo' }; return { v: d, u: 'daysToGo' }; };

  const calcZakat = () => { 
    const goldValue = (parseFloat(zakatInputs.goldGrams) || 0) * (parseFloat(zakatInputs.goldPrice) || 0);
    const tot = (parseFloat(zakatInputs.cash) || 0) + goldValue + (parseFloat(zakatInputs.investments) || 0) + (parseFloat(zakatInputs.inventory) || 0) - (parseFloat(zakatInputs.debts) || 0);
    const nisab = 1400; 
    return { tot, nisab, ok: tot >= nisab, due: tot >= nisab ? tot * 0.025 : 0, goldValue }; 
  };
  
  // Fetch live gold price with caching
  // ⚠️ PRODUCTION WARNING: The 'demo' API key has very low rate limits.
  // For production, replace with a real API key stored in environment variables
  // or route through a backend proxy to protect the key.
  const fetchGoldPrice = async () => {
    // First check cache
    const cached = getCachedGoldPrice();
    if (cached) {
      setZakatInputs(p => ({ ...p, goldPrice: cached.price.toString() }));
      setGoldPriceIsLive(cached.isLive);
      haptic.light();
      return;
    }
    
    setGoldPriceLoading(true);
    haptic.light();
    try {
      // Using a free gold price API - prices are approximate
      const response = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=XAU&currencies=USD');
      const apiData = await response.json();
      if (apiData.rates && apiData.rates.USD) {
        // Convert from price per troy ounce to price per gram
        const pricePerGram = (1 / apiData.rates.USD) / 31.1035;
        const roundedPrice = parseFloat(pricePerGram.toFixed(2));
        setZakatInputs(p => ({ ...p, goldPrice: roundedPrice.toString() }));
        setCachedGoldPrice(roundedPrice, true);
        setGoldPriceIsLive(true);
        haptic.success();
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      // Fallback to approximate price if API fails
      const fallbackPrice = 65; // ~$65/gram approximate
      setZakatInputs(p => ({ ...p, goldPrice: fallbackPrice.toString() }));
      setCachedGoldPrice(fallbackPrice, false);
      setGoldPriceIsLive(false);
      haptic.medium();
    }
    setGoldPriceLoading(false);
  };
  
  // Get recurring/subscription transactions
  const subscriptions = useMemo(() => {
    return data.transactions.filter(tx => tx.isRecurring && tx.type === 'expense');
  }, [data.transactions]);
  
  const subscriptionTotal = useMemo(() => {
    return subscriptions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [subscriptions]);
  
  // Debt calculations
  const totalDebts = useMemo(() => {
    return (data.debts || []).reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);
  }, [data.debts]);
  
  const totalGoalsSaved = useMemo(() => {
    return (data.goals || []).reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  }, [data.goals]);
  
  const netWorth = useMemo(() => {
    return balance + totalGoalsSaved - totalDebts;
  }, [balance, totalGoalsSaved, totalDebts]);
  
  // Add a new debt
  const addDebtFn = () => {
    if (!newDebt.name || !newDebt.totalAmount || !newDebt.monthlyPayment) return;
    haptic.medium();
    const debt = {
      id: Date.now(),
      ...newDebt,
      totalAmount: parseFloat(newDebt.totalAmount),
      paidAmount: parseFloat(newDebt.paidAmount) || 0,
      monthlyPayment: parseFloat(newDebt.monthlyPayment)
    };
    setData(p => ({ ...p, debts: [...(p.debts || []), debt] }));
    setNewDebt({ name: '', type: 'personal', totalAmount: '', paidAmount: '0', monthlyPayment: '', startDate: new Date().toISOString().split('T')[0] });
    setShowAddDebt(false);
  };
  
  // Make a debt payment
  const makeDebtPayment = () => {
    if (!debtPaymentAmount || !selectedDebt) return;
    haptic.medium();
    const payment = parseFloat(debtPaymentAmount);
    const newPaidAmount = Math.min(selectedDebt.paidAmount + payment, selectedDebt.totalAmount);
    
    // Check if debt is paid off
    if (newPaidAmount >= selectedDebt.totalAmount) {
      haptic.success();
    }
    
    setData(p => ({
      ...p,
      debts: p.debts.map(d => d.id === selectedDebt.id ? { ...d, paidAmount: newPaidAmount } : d)
    }));
    setSelectedDebt(p => ({ ...p, paidAmount: newPaidAmount }));
    setDebtPaymentAmount('');
    setShowDebtPayment(false);
  };
  
  // Delete a debt
  const deleteDebt = (id) => {
    haptic.light();
    setData(p => ({ ...p, debts: (p.debts || []).filter(d => d.id !== id) }));
    setSelectedDebt(null);
  };
  
  // Calculate estimated payoff date
  const getPayoffDate = (debt) => {
    const remaining = debt.totalAmount - debt.paidAmount;
    const monthsLeft = Math.ceil(remaining / debt.monthlyPayment);
    const payoffDate = new Date(debt.startDate);
    payoffDate.setMonth(payoffDate.getMonth() + monthsLeft);
    return payoffDate;
  };
  
  // Last month's summary for payday modal
  const lastMonthSummary = useMemo(() => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const lastMonthTx = data.transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= lastMonth && txDate <= lastMonthEnd;
    });
    
    const income = lastMonthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expense = lastMonthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    const saved = income - expense;
    
    return { income, expense, saved };
  }, [data.transactions]);
  
  // Check for payday and bill reminders on mount/date change
  useEffect(() => {
    // Check if it's payday
    const todayStr = new Date().toDateString();
    const lastPaydayShown = localStorage.getItem('wafra-last-payday-shown');
    
    if (isPayday(data.salaryDay) && lastPaydayShown !== todayStr && data.onboardingDone) {
      setShowPaydayModal(true);
      localStorage.setItem('wafra-last-payday-shown', todayStr);
      haptic.success();
    }
    
    // Check for upcoming bills
    const upcoming = getUpcomingBills(data.transactions, data.salaryDay);
    const todayDismissedStr = localStorage.getItem('wafra-dismissed-reminders-date');
    
    if (todayDismissedStr !== todayStr) {
      // Reset dismissed reminders for new day
      setDismissedReminders([]);
      localStorage.removeItem('wafra-dismissed-reminders');
    } else {
      // Load today's dismissed reminders
      try {
        const dismissed = JSON.parse(localStorage.getItem('wafra-dismissed-reminders') || '[]');
        setDismissedReminders(dismissed);
      } catch(e) {}
    }
    
    setBillReminders(upcoming);
  }, [data.salaryDay, data.transactions, data.onboardingDone]);
  
  // Handle dismissing a bill reminder
  const dismissReminder = (txId) => {
    const newDismissed = [...dismissedReminders, txId];
    setDismissedReminders(newDismissed);
    localStorage.setItem('wafra-dismissed-reminders', JSON.stringify(newDismissed));
    localStorage.setItem('wafra-dismissed-reminders-date', new Date().toDateString());
    haptic.light();
  };
  
  // Handle payday reset
  const handlePaydayReset = () => {
    haptic.heavy();
    setShowPaydayModal(false);
  };
  
  // ============== DAILY BONUS SYSTEM ==============
  useEffect(() => {
    if (!data.onboardingDone) return;
    const today = new Date().toDateString();
    if (data.lastDailyBonus !== today) {
      setShowDailyBonus(true);
    }
  }, [data.onboardingDone, data.lastDailyBonus]);
  
  const claimDailyBonus = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const isConsecutive = data.lastDailyBonus === yesterday;
    const newStreak = isConsecutive ? (data.dailyBonusStreak || 0) + 1 : 1;
    
    const bonusCoins = 10 + (newStreak * 2);
    const bonusXP = 5 + newStreak;
    
    addCoins(bonusCoins);
    addXP(bonusXP);
    
    setData(p => ({
      ...p,
      lastDailyBonus: today,
      dailyBonusStreak: newStreak,
      streak: newStreak,
    }));
    
    setShowDailyBonus(false);
    haptic.success();
    // Achievement check now handled by useEffect
  };
  
  // ============== TUTORIAL SYSTEM ==============
  useEffect(() => {
    if (data.onboardingDone && !data.tutorialComplete && data.transactions.length === 0) {
      setTimeout(() => setShowTutorial(true), 1000);
    }
  }, [data.onboardingDone, data.tutorialComplete, data.transactions.length]);
  
  const handleTutorialNext = () => {
    if ((data.tutorialStep || 0) < 3) {
      setData(p => ({ ...p, tutorialStep: (p.tutorialStep || 0) + 1 }));
    } else {
      setData(p => ({ ...p, tutorialComplete: true }));
      setShowTutorial(false);
    }
  };
  
  const handleTutorialSkip = () => {
    setData(p => ({ ...p, tutorialComplete: true }));
    setShowTutorial(false);
  };
  
  // ============== MONTHLY REPORT CHECK ==============
  useEffect(() => {
    if (!data.onboardingDone) return;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    if (now.getDate() <= 3 && data.lastMonthReportShown !== monthKey && data.transactions.length >= 5) {
      setShowMonthlyReport(true);
      setData(p => ({ ...p, lastMonthReportShown: monthKey }));
    }
  }, [data.onboardingDone, data.lastMonthReportShown, data.transactions.length, setData]);
  
  // ============== FIRST WEEK CHALLENGE ==============
  useEffect(() => {
    if (data.onboardingDone && !data.firstOpenDate) {
      setData(p => ({ ...p, firstOpenDate: new Date().toISOString() }));
    }
  }, [data.onboardingDone, data.firstOpenDate, setData]);
  
  const handleFirstWeekComplete = () => {
    if (!data.firstWeekChallengeCompleted) {
      setData(p => ({ ...p, firstWeekChallengeCompleted: true }));
      addXP(100, 'weekChallenge');
      addCoins(50);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const addCatFn = () => { if (!newCategory.name || !newCategory.nameAr) return; setData(p => ({ ...p, customCategories: [...(p.customCategories || []), { ...newCategory, id: `c${Date.now()}` }] })); setNewCategory({ name: '', nameAr: '', color: '#10b981', icon: 'tag', type: 'expense' }); haptic.medium(); };
  const delCat = (id) => { setData(p => ({ ...p, customCategories: (p.customCategories || []).filter(c => c.id !== id) })); haptic.light(); };

  useEffect(() => { const cats = getCats(newTx.type); if (!Object.keys(cats).includes(newTx.category)) setNewTx(p => ({ ...p, category: Object.keys(cats)[0] || 'other' })); }, [newTx.type, newTx.category, getCats]);

  // ONBOARDING - Now includes salary day (Step 3)
  if (!data.onboardingDone) {
    const step = data.onboardingStep || 1;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-6" dir={rtl ? 'rtl' : 'ltr'}>
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-xl">
          <div className="flex justify-center gap-2 mb-6">{[1, 2, 3, 4].map(s => <div key={s} className={`w-12 h-1.5 rounded-full ${s <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />)}</div>
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
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><Calendar className="text-white" size={40} /></div>
            <h1 className="text-2xl font-bold mb-2 text-emerald-800">{t.onboarding.salaryDay}</h1>
            <p className="text-gray-500 mb-4">{t.onboarding.salaryDayDesc}</p>
            <div className="grid grid-cols-7 gap-2 mb-4">{[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].map(day => <button key={day} onClick={() => setData(d => ({...d, salaryDay: day}))} className={`w-9 h-9 rounded-lg font-medium text-sm ${(data.salaryDay || 1) === day ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{day}</button>)}</div>
            <p className="text-xs text-gray-400 mb-4">{data.lang === 'ar' ? `شهرك يبدأ يوم ${data.salaryDay || 1}` : `Your month starts on day ${data.salaryDay || 1}`}</p>
            <div className="flex gap-3"><button onClick={() => setData(d => ({...d, onboardingStep: 2}))} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold">{t.back}</button><button onClick={() => setData(d => ({...d, onboardingStep: 4}))} className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold">{t.next}</button></div>
          </>)}
          {step === 4 && (<>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><CheckCircle className="text-white" size={40} /></div>
            <h1 className="text-2xl font-bold mb-2 text-emerald-800">{t.allSet}</h1>
            <p className="text-gray-500 mb-6">{data.lang === 'ar' ? `مرحباً ${data.profile.name}` : `Welcome ${data.profile.name}`}</p>
            <div className="p-4 rounded-xl mb-6 bg-gray-50 text-left space-y-2"><div className="flex items-center gap-3"><Globe size={18} className="text-emerald-600" /><span>{data.lang === 'ar' ? 'العربية' : 'English'}</span></div><div className="flex items-center gap-3"><DollarSign size={18} className="text-emerald-600" /><span>{data.homeCurrency}</span></div><div className="flex items-center gap-3"><Calendar size={18} className="text-emerald-600" /><span>{data.lang === 'ar' ? `يوم ${data.salaryDay || 1}` : `Day ${data.salaryDay || 1}`}</span></div></div>
            <div className="flex gap-3"><button onClick={() => setData(d => ({...d, onboardingStep: 3}))} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold">{t.back}</button><button onClick={() => setData(d => ({...d, onboardingDone: true}))} className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold">{t.onboarding.getStarted}</button></div>
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
      {/* Global styles for UX improvements */}
      <style>{`
        /* Prevent scroll wheel from changing number input values */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        /* iOS safe area support */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>
      <Confetti active={showConfetti} />
      <input type="file" ref={fileInputRef} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { try { const d = JSON.parse(ev.target.result); if (d.transactions) setData(d); } catch {} }; r.readAsText(f); e.target.value = ''; }} accept=".json" className="hidden" />

      {/* Tutorial Overlay */}
      {showTutorial && <TutorialOverlay step={data.tutorialStep || 0} onNext={handleTutorialNext} onSkip={handleTutorialSkip} t={t} dark={dark} lang={data.lang} />}
      
      {/* Daily Bonus Modal */}
      {showDailyBonus && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-sm w-full text-center`}>
            <div className="text-6xl mb-4">🎁</div>
            <h2 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>{t.dailyBonus}</h2>
            <p className={`${muted} mb-4`}>{data.lang === 'ar' ? `يوم ${data.dailyBonusStreak || 1} من التتابع!` : `Day ${data.dailyBonusStreak || 1} streak!`}</p>
            <div className="flex justify-center gap-4 mb-6">
              <div className={`${dark ? 'bg-amber-900/30' : 'bg-amber-50'} rounded-xl px-4 py-3`}>
                <Coins size={24} className="text-amber-500 mx-auto mb-1" />
                <p className="text-amber-500 font-bold">+{10 + ((data.dailyBonusStreak || 0) * 2)}</p>
              </div>
              <div className={`${dark ? 'bg-violet-900/30' : 'bg-violet-50'} rounded-xl px-4 py-3`}>
                <Star size={24} className="text-violet-500 mx-auto mb-1" />
                <p className="text-violet-500 font-bold">+{5 + (data.dailyBonusStreak || 0)} XP</p>
              </div>
            </div>
            <button onClick={claimDailyBonus} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg">{t.claimBonus} 🎉</button>
          </div>
        </div>
      )}
      
      {/* Level Up Modal */}
      {showLevelUp && <LevelUpModal level={showLevelUp} onClose={() => setShowLevelUp(null)} t={{ ...t, lang: data.lang }} dark={dark} />}
      
      {/* Monthly Report */}
      {showMonthlyReport && <MonthlyReportCard data={data} t={t} dark={dark} onClose={() => setShowMonthlyReport(false)} />}
      
      {/* Achievement Unlock Toast */}
      {showAchievementUnlock && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-bounce">
          <div className={`${dark ? 'bg-amber-900' : 'bg-amber-500'} rounded-2xl p-4 flex items-center gap-3 shadow-lg`}>
            <div className="text-3xl">{showAchievementUnlock.icon}</div>
            <div className="flex-1">
              <p className="text-white font-bold">{data.lang === 'ar' ? 'إنجاز جديد!' : 'Achievement Unlocked!'}</p>
              <p className="text-amber-100 text-sm">{data.lang === 'ar' ? showAchievementUnlock.nameAr : showAchievementUnlock.name}</p>
            </div>
            <button onClick={() => setShowAchievementUnlock(null)} className="text-white/80"><X size={20} /></button>
          </div>
        </div>
      )}

      {/* Header with Gamification */}
      <header className="bg-emerald-600 p-6 pb-32 rounded-b-[2rem]">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-emerald-100 text-sm">{t.welcomeBack}, {data.profile.name} 👋</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/70 text-xs">{currentLevel.icon} {t.level} {currentLevel.level}</span>
              <span className="text-white/50 text-xs">• v8.5 BETA</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setData(p => ({...p, privacyMode: !p.privacyMode}))} className="text-white/80 bg-white/10 p-2 rounded-full">{data.privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1"><Flame size={16} className="text-orange-300" /><span className="text-white font-bold">{data.streak || data.dailyBonusStreak || 1}</span></div>
            <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1"><Coins size={16} className="text-amber-300" /><span className="text-white font-bold">{data.coins || 0}</span></div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-emerald-200 mb-1">
            <span>{data.xp || 0} XP</span>
            {nextLevel && <span>{nextLevel.xpRequired} XP</span>}
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4"><button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="text-white/60"><ChevronLeft size={24} /></button><h2 className="text-white font-medium">{selectedDate.toLocaleDateString(data.lang === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' })}</h2><button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="text-white/60"><ChevronRight size={24} /></button></div>
      </header>

      {/* Dynamic Context Card - Changes based on active tab */}
      <div className={`${card} rounded-3xl mx-4 -mt-20 p-6 shadow-xl border relative z-10`}>
        {/* Dashboard: Total Balance */}
        {tab === 'dashboard' && (<>
          <p className={`text-xs font-bold ${muted} uppercase`}>{t.totalBalance}</p>
          <h2 className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(balance, data.privacyMode, data.homeCurrency)}</h2>
          <div className="flex justify-between mt-6 border-t pt-4 border-dashed border-gray-200"><div className="flex items-center gap-2"><div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><ArrowUpCircle size={20} className="text-emerald-600" /></div><div><p className="text-xs text-gray-400">{t.income}</p><p className="font-bold text-emerald-600">{fmtShort(totalIncome, data.privacyMode, data.homeCurrency)}</p></div></div><div className="flex items-center gap-2"><div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><ArrowDownCircle size={20} className="text-red-500" /></div><div><p className="text-xs text-gray-400">{t.expense}</p><p className="font-bold text-red-500">{fmtShort(totalExpense, data.privacyMode, data.homeCurrency)}</p></div></div></div>
        </>)}

        {/* Budget: Monthly Budget Health */}
        {tab === 'budget' && (() => {
          const totalBudget = Object.values(data.budgets || {}).reduce((sum, val) => sum + (val || 0), 0);
          const totalSpent = Object.entries(data.budgets || {}).reduce((sum, [cat, limit]) => limit > 0 ? sum + (catSpending[cat] || 0) : sum, 0);
          const budgetCount = Object.values(data.budgets || {}).filter(v => v > 0).length;
          const budgetHealth = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 100;
          const isHealthy = totalSpent <= totalBudget;
          return (<>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-bold ${muted} uppercase`}>{data.lang === 'ar' ? 'صحة الميزانية' : 'Budget Health'}</p>
                <h2 className={`text-4xl font-bold mt-2 ${isHealthy ? 'text-emerald-600' : 'text-red-500'}`}>
                  {budgetCount > 0 ? `${Math.max(0, budgetHealth)}%` : '—'}
                </h2>
              </div>
              {budgetCount > 0 && (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isHealthy ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {isHealthy ? <CheckCircle size={32} className="text-emerald-600" /> : <AlertTriangle size={32} className="text-red-500" />}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6 border-t pt-4 border-dashed border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                  <Target size={20} className={muted} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{data.lang === 'ar' ? 'إجمالي الميزانيات' : 'Total Budgets'}</p>
                  <p className={`font-bold ${txt}`}>{budgetCount > 0 ? fmtShort(totalBudget, data.privacyMode, data.homeCurrency) : (data.lang === 'ar' ? 'غير محدد' : 'Not set')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 ${totalSpent > totalBudget ? 'bg-red-100' : 'bg-amber-100'} rounded-full flex items-center justify-center`}>
                  <Wallet size={20} className={totalSpent > totalBudget ? 'text-red-500' : 'text-amber-600'} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{data.lang === 'ar' ? 'المصروف' : 'Spent'}</p>
                  <p className={`font-bold ${totalSpent > totalBudget ? 'text-red-500' : 'text-amber-600'}`}>{fmtShort(totalSpent, data.privacyMode, data.homeCurrency)}</p>
                </div>
              </div>
            </div>
          </>);
        })()}

        {/* Goals: Total Saved */}
        {tab === 'goals' && (() => {
          const goals = data.goals || [];
          const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
          const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
          const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
          return (<>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-bold ${muted} uppercase`}>{data.lang === 'ar' ? 'إجمالي المدخرات' : 'Total Saved'}</p>
                <h2 className="text-4xl font-bold mt-2 text-emerald-600">{fmt(totalSaved, data.privacyMode, data.homeCurrency)}</h2>
              </div>
              {goals.length > 0 && (
                <div className="text-right">
                  <p className={`text-xs ${muted}`}>{data.lang === 'ar' ? 'التقدم الكلي' : 'Overall'}</p>
                  <p className="text-2xl font-bold text-emerald-600">{overallProgress}%</p>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6 border-t pt-4 border-dashed border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <Target size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{data.lang === 'ar' ? 'الهدف الكلي' : 'Target'}</p>
                  <p className="font-bold text-violet-600">{totalTarget > 0 ? fmtShort(totalTarget, data.privacyMode, data.homeCurrency) : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{data.lang === 'ar' ? 'عدد الأهداف' : 'Goals'}</p>
                  <p className="font-bold text-blue-600">{goals.length}</p>
                </div>
              </div>
            </div>
          </>);
        })()}

        {/* Profile: User Stats */}
        {tab === 'profile' && (() => {
          const totalTx = data.transactions.length;
          const totalGoals = data.goals.length;
          return (<>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {data.profile.name ? data.profile.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${txt}`}>{data.profile.name || 'User'}</h2>
                <p className={`text-sm ${muted}`}>{t.memberSince} 2025</p>
              </div>
            </div>
            <div className="flex justify-between mt-6 border-t pt-4 border-dashed border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Wallet size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{data.lang === 'ar' ? 'المعاملات' : 'Transactions'}</p>
                  <p className="font-bold text-emerald-600">{totalTx}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <Target size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{data.lang === 'ar' ? 'الأهداف' : 'Goals'}</p>
                  <p className="font-bold text-violet-600">{totalGoals}</p>
                </div>
              </div>
            </div>
          </>);
        })()}

        {/* No floating button - moved to nav bar */}
      </div>

      {/* Content */}
      <main className="px-4 mt-10 space-y-6">
        {tab === 'dashboard' && (<div className="space-y-6">
          {/* First Week Challenge - Only show if not completed and within first week */}
          {!data.firstWeekChallengeCompleted && data.transactions.length < 20 && (
            <FirstWeekChallenge data={data} t={t} dark={dark} onComplete={handleFirstWeekComplete} />
          )}
          
          {/* Bill Reminder Banner */}
          {billReminders.filter(r => !dismissedReminders.includes(r.id)).length > 0 && (
            <div className={`${dark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} border rounded-2xl p-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${dark ? 'bg-amber-800' : 'bg-amber-100'} flex items-center justify-center`}>
                    <AlertTriangle size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${dark ? 'text-amber-400' : 'text-amber-800'}`}>{t.billReminder}</p>
                    {billReminders.filter(r => !dismissedReminders.includes(r.id)).slice(0, 2).map(bill => (
                      <p key={bill.id} className={`text-sm ${dark ? 'text-amber-300' : 'text-amber-700'}`}>
                        {bill.description || allCats[bill.category]} ({fmtShort(bill.amount, data.privacyMode, data.homeCurrency)}) {t.billDueTomorrow}
                      </p>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => billReminders.filter(r => !dismissedReminders.includes(r.id)).forEach(r => dismissReminder(r.id))}
                  className={`text-xs ${dark ? 'text-amber-400' : 'text-amber-600'} font-medium`}
                >
                  {t.dismiss}
                </button>
              </div>
            </div>
          )}
          
          {/* Net Worth Card - Shows true financial picture */}
          {(totalGoalsSaved > 0 || totalDebts > 0) && (
            <div className={`${card} rounded-2xl p-4 border`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-bold ${muted} uppercase`}>{t.netWorth}</p>
                {totalDebts > 0 && <button onClick={() => setShowDebtModal(true)} className="text-xs text-rose-500 font-medium">{t.debtManagement}</button>}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmt(netWorth, data.privacyMode, data.homeCurrency)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${netWorth >= 0 ? 'bg-emerald-100' : 'bg-rose-100'} flex items-center justify-center`}>
                  {netWorth >= 0 ? <TrendingUp size={24} className="text-emerald-600" /> : <TrendingDown size={24} className="text-rose-600" />}
                </div>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-2">
                  <PiggyBank size={16} className="text-emerald-600" />
                  <span className={`text-xs ${muted}`}>{data.lang === 'ar' ? 'مدخرات' : 'Savings'}: <span className="font-bold text-emerald-600">{fmtShort(totalGoalsSaved, data.privacyMode, data.homeCurrency)}</span></span>
                </div>
                {totalDebts > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingDown size={16} className="text-rose-500" />
                    <span className={`text-xs ${muted}`}>{t.debts}: <span className="font-bold text-rose-500">{fmtShort(totalDebts, data.privacyMode, data.homeCurrency)}</span></span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={`${card} rounded-2xl p-4 border`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className={`text-xs font-bold ${muted} uppercase`}>{t.quickAdd}</p>
                {/* Smart suggestion indicator */}
                <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  💡 {allCats[suggestedCategory]}
                </span>
              </div>
              <button onClick={() => setShowQuickAddSettings(true)} className="text-emerald-600"><Sliders size={16} /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(data.quickAddCats || defaultQuickAddCats).map(catId => { 
                const I = getIcon(catId); 
                const colors = ['bg-amber-100 text-amber-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-red-100 text-red-600']; 
                const isSuggested = catId === suggestedCategory;
                return allCats[catId] ? (
                  <button 
                    key={catId} 
                    onClick={() => { haptic.light(); setQuickCat(catId); setShowQuick(true); }} 
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${isSuggested ? 'ring-2 ring-indigo-400' : ''}`}
                  >
                    <div className={`p-2 rounded-full ${colors[(data.quickAddCats || defaultQuickAddCats).indexOf(catId) % 4]}`}><I size={18}/></div>
                    <span className={`text-[10px] font-bold ${muted}`}>{allCats[catId]}</span>
                  </button>
                ) : null; 
              })}
            </div>
          </div>
          
          <div><div className="flex justify-between items-center mb-3"><h3 className={`font-bold ${txt}`}>{t.yourGoals}</h3><button onClick={() => setTab('goals')} className="text-xs text-emerald-600 font-medium">{t.viewAll}</button></div>
            {(data.goals || []).length === 0 ? <button onClick={() => setShowAddGoal(true)} className={`w-full ${card} rounded-2xl p-6 border-2 border-dashed flex flex-col items-center gap-2`}><Plus size={24} className={muted} /><p className={`text-sm ${muted}`}>{t.noGoalsYet}</p></button> : <div className="flex gap-3 overflow-x-auto pb-2">{(data.goals || []).slice(0, 3).map(g => { const gc = goalTypeColors[g.type] || goalTypeColors.other; const GI = goalTypeIcons[g.type] || Target; const prog = (g.currentAmount / g.targetAmount) * 100; return <button key={g.id} onClick={() => setSelectedGoal(g)} className={`${card} rounded-2xl p-4 min-w-[140px] flex-shrink-0 border text-left`}><div className={`w-10 h-10 rounded-xl ${gc.light} flex items-center justify-center mb-3`}><GI size={20} className={gc.text} /></div><p className={`font-bold text-sm ${txt} truncate`}>{g.name}</p><p className={`text-xs ${muted} mt-1`}>{fmtShort(g.currentAmount, data.privacyMode, data.homeCurrency)}</p><div className={`h-1.5 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden mt-2`}><div className={`h-full ${gc.bar} rounded-full`} style={{ width: `${Math.min(prog, 100)}%` }} /></div></button>; })}</div>}
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 text-white"><button onClick={() => setExpandedInsights(!expandedInsights)} className="w-full flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles size={20} className="text-yellow-300" /><h3 className="font-bold">{t.aiInsights}</h3></div>{expandedInsights ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</button><div className={`space-y-2 overflow-hidden transition-all ${expandedInsights ? 'max-h-40 mt-3' : 'max-h-10 mt-2'}`}>{insights.map((ins, i) => <p key={i} className="text-indigo-100 text-sm">{ins}</p>)}</div></div>
          
          <div><div className="flex justify-between mb-4"><h3 className={`font-bold text-xl ${txt}`}>{t.recentTransactions}</h3><button onClick={() => setTab('budget')} className="text-sm text-emerald-600">{t.seeMore}</button></div>
            {!filtered.length ? <div className={`${card} rounded-2xl p-8 text-center border border-dashed`}><Wallet size={32} className={`mx-auto ${muted} mb-3`}/><p className={muted}>{t.noTransactionsYet}</p></div> : <div className="space-y-3">{filtered.slice().reverse().slice(0, 5).map(tx => { const I = getIcon(tx.category); return <div key={tx.id} className={`${card} rounded-2xl p-4 flex items-center gap-4 border`}><div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}><I size={22} /></div><div className="flex-1 min-w-0"><p className={`font-bold ${txt} truncate`}>{tx.description || allCats[tx.category]}</p><p className={`text-xs ${muted}`}>{allCats[tx.category]}</p></div><p className={`font-bold text-lg ${tx.type === 'income' ? 'text-emerald-600' : txt}`}>{tx.type === 'income' ? '+' : '-'}{fmtShort(tx.amount, data.privacyMode, data.homeCurrency)}</p></div>; })}</div>}
          </div>
        </div>)}

        {tab === 'budget' && (<div className="space-y-4">
          <div className="flex justify-between items-center"><h3 className={`font-bold text-xl ${txt}`}>{t.budget}</h3><button onClick={() => setShowAnalytics(true)} className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2"><BarChart3 size={18} />{t.analytics}</button></div>
          
          {/* Subscriptions Quick View */}
          {subscriptions.length > 0 && (
            <button onClick={() => setShowSubscriptionsModal(true)} className={`w-full ${card} rounded-2xl p-4 border flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${dark ? 'bg-violet-900/50' : 'bg-violet-100'} flex items-center justify-center`}>
                  <Repeat size={20} className="text-violet-600" />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${txt}`}>{t.fixedBills}</p>
                  <p className={`text-xs ${muted}`}>{subscriptions.length} {data.lang === 'ar' ? 'اشتراك' : 'subscriptions'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${dark ? 'text-violet-400' : 'text-violet-600'}`}>{fmtShort(subscriptionTotal, data.privacyMode, data.homeCurrency)}</span>
                <ChevronRight size={20} className={muted} />
              </div>
            </button>
          )}
          
          {/* BUDGET LIMITS SECTION (Envelope System) */}
          <div className={`${card} rounded-3xl p-5 border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-bold ${txt} flex items-center gap-2`}><Target size={20} className="text-emerald-600"/>{t.monthlyLimits}</h4>
              <button onClick={() => setShowBudgetModal(true)} className="text-xs text-emerald-600 font-bold">{t.manageBudgets}</button>
            </div>
            {Object.keys(expenseCategories[data.lang]).slice(0, 6).map(catKey => {
              const catName = allCats[catKey];
              const spent = catSpending[catKey] || 0;
              const limit = data.budgets?.[catKey] || 0;
              const hasLimit = limit > 0;
              const progress = hasLimit ? Math.min((spent / limit) * 100, 100) : 0;
              const isOver = spent > limit && hasLimit;
              const remaining = limit - spent;
              const I = getIcon(catKey);
              return (
                <div key={catKey} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2"><I size={16} className={muted} /><span className={`${txt} font-medium`}>{catName}</span></div>
                    {hasLimit ? (
                      <span className={isOver ? 'text-red-500 font-bold' : muted}>
                        {fmtShort(spent, data.privacyMode, data.homeCurrency)} / {fmtShort(limit, false, data.homeCurrency)}
                      </span>
                    ) : (
                      <button onClick={() => { setEditingBudget({ category: catKey, amount: '' }); setShowBudgetModal(true); }} className="text-xs text-emerald-600 font-bold">+ {t.setLimit}</button>
                    )}
                  </div>
                  <div className={`h-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden relative cursor-pointer`} onClick={() => hasLimit && setShowBudgetModal(true)}>
                    {hasLimit && <div className={`h-full ${getBudgetColor(spent, limit)} transition-all duration-500 rounded-full`} style={{ width: `${progress}%` }} />}
                  </div>
                  {hasLimit && <p className={`text-xs mt-1 ${isOver ? 'text-red-500' : 'text-emerald-600'}`}>{isOver ? `${fmtShort(Math.abs(remaining), data.privacyMode, data.homeCurrency)} ${t.overBudget}` : `${fmtShort(remaining, data.privacyMode, data.homeCurrency)} ${t.remaining}`}</p>}
                </div>
              );
            })}
          </div>

          {/* Transactions Section */}
          <h4 className={`font-bold ${txt} mt-6`}>{t.allTransactions}</h4>
          <div className="relative"><Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.search} className={`w-full pl-12 pr-4 py-3 ${dark ? 'bg-gray-800' : 'bg-white'} ${txt} rounded-2xl border outline-none`} /></div>
          <div className="flex gap-2 overflow-x-auto pb-2"><button onClick={() => setCategoryFilter('all')} className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap ${categoryFilter === 'all' ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-800' : 'bg-white'} ${txt} border`}`}>{t.all}</button>{Object.entries(allCats).slice(0, 6).map(([k, v]) => <button key={k} onClick={() => setCategoryFilter(k)} className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap ${categoryFilter === k ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-800' : 'bg-white'} ${txt} border`}`}>{v}</button>)}</div>
          {!searched.length ? <div className={`${card} rounded-2xl p-8 text-center border border-dashed`}><Search size={32} className={`mx-auto ${muted} mb-3`}/><p className={muted}>{t.noTransactionsYet}</p></div> : <div className="space-y-3">{searched.slice().reverse().map(tx => { const I = getIcon(tx.category); return <div key={tx.id} className={`${card} rounded-2xl p-4 border`}><div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}><I size={22} /></div><div className="flex-1"><div className="flex justify-between"><p className={`font-bold ${txt}`}>{tx.description || allCats[tx.category]}</p><p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : txt}`}>{tx.type === 'income' ? '+' : '-'}{fmtShort(tx.amount, data.privacyMode, data.homeCurrency)}</p></div><p className={`text-xs ${muted} mt-1`}>{tx.date} • {allCats[tx.category]}</p></div></div><div className={`flex gap-2 mt-4 pt-3 border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`}><button onClick={() => startEdit(tx)} className="flex-1 py-1.5 rounded-lg text-emerald-600 text-sm font-medium flex items-center justify-center gap-1"><Edit3 size={14}/>{t.edit}</button><button onClick={() => setDeleting(tx.id)} className="flex-1 py-1.5 rounded-lg text-red-500 text-sm font-medium">{t.delete}</button></div></div>; })}</div>}
        </div>)}

        {tab === 'goals' && (<div className="space-y-6">
          <div className="flex justify-between items-center"><h3 className={`font-bold text-2xl ${txt}`}>{t.goals}</h3><button onClick={() => setShowAddGoal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"><Plus size={18} />{t.addGoal}</button></div>
          {(data.goals || []).length === 0 ? <button onClick={() => setShowAddGoal(true)} className={`w-full ${dark ? 'bg-emerald-900/20' : 'bg-emerald-50'} border-2 border-dashed border-emerald-300 rounded-2xl p-8 flex flex-col items-center gap-3`}><Target size={32} className="text-emerald-600" /><p className="text-emerald-700 font-medium">{t.noGoalsYet}</p></button> : <div className="space-y-4">{(data.goals || []).map(g => { const gc = goalTypeColors[g.type] || goalTypeColors.other; const GI = goalTypeIcons[g.type] || Target; const prog = (g.currentAmount / g.targetAmount) * 100; return <button key={g.id} onClick={() => setSelectedGoal(g)} className={`w-full ${card} rounded-2xl p-5 border text-left`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-xl ${gc.light} flex items-center justify-center`}><GI size={24} className={gc.text} /></div><span className={`font-bold text-lg ${txt}`}>{g.name}</span></div><ChevronRight size={20} className={muted} /></div><div className="flex justify-between text-sm mb-2"><span className={`font-bold ${txt}`}>{fmtShort(g.currentAmount, data.privacyMode, data.homeCurrency)}</span><span className={muted}>{fmtShort(g.targetAmount, data.privacyMode, data.homeCurrency)}</span></div><div className={`h-2.5 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden mb-3`}><div className={`h-full ${gc.bar} rounded-full`} style={{ width: `${Math.min(prog, 100)}%` }} /></div></button>; })}</div>}
        </div>)}

        {tab === 'profile' && (<div className="space-y-4">
          {/* Tools Section */}
          <div>
            <h3 className={`text-xs font-bold ${muted} uppercase mb-3`}>{t.tools}</h3>
            <div className={`${card} rounded-2xl border overflow-hidden`}>
              <button onClick={() => setShowZakatModal(true)} className={`w-full flex items-center justify-between p-4 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Calculator size={20} className="text-emerald-600" /></div>
                  <div className="text-left"><p className={`font-medium ${txt}`}>{t.zakatCalculator}</p><p className={`text-xs ${muted}`}>{t.zakatRate}</p></div>
                </div>
                <ChevronRight size={20} className={muted} />
              </button>
              <div className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`} />
              <button onClick={() => setShowDebtModal(true)} className={`w-full flex items-center justify-between p-4 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center"><TrendingDown size={20} className="text-rose-600" /></div>
                  <div className="text-left"><p className={`font-medium ${txt}`}>{t.debtManagement}</p><p className={`text-xs ${muted}`}>{(data.debts || []).length} {data.lang === 'ar' ? 'قروض' : 'loans'}</p></div>
                </div>
                <ChevronRight size={20} className={muted} />
              </button>
              <div className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`} />
              <button onClick={() => setShowBadgesModal(true)} className={`w-full flex items-center justify-between p-4 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><span className="text-lg">🏆</span></div>
                  <div className="text-left"><p className={`font-medium ${txt}`}>{t.badges}</p><p className={`text-xs ${muted}`}>{data.earnedBadges?.length || 0} earned</p></div>
                </div>
                <ChevronRight size={20} className={muted} />
              </button>
              <div className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`} />
              <button onClick={() => setShowCategoryModal(true)} className={`w-full flex items-center justify-between p-4 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center"><Tag size={20} className="text-violet-600" /></div>
                  <div className="text-left"><p className={`font-medium ${txt}`}>{t.customCategories}</p><p className={`text-xs ${muted}`}>{data.customCategories?.length || 0} custom</p></div>
                </div>
                <ChevronRight size={20} className={muted} />
              </button>
            </div>
          </div>

          {/* Appearance Section */}
          <div>
            <h3 className={`text-xs font-bold ${muted} uppercase mb-3`}>{t.appearance}</h3>
            <div className={`${card} rounded-2xl border overflow-hidden`}>
              <div className={`flex items-center justify-between p-4`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>{dark ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}</div>
                  <span className={txt}>{t.darkMode}</span>
                </div>
                <button onClick={() => setData(p => ({...p, darkMode: !p.darkMode}))} className={`w-12 h-7 rounded-full transition-colors ${dark ? 'bg-emerald-600' : 'bg-gray-300'} relative`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${dark ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`} />
              <div className={`flex items-center justify-between p-4`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}><EyeOff size={20} className={muted} /></div>
                  <span className={txt}>{t.privacyMode}</span>
                </div>
                <button onClick={() => setData(p => ({...p, privacyMode: !p.privacyMode}))} className={`w-12 h-7 rounded-full transition-colors ${data.privacyMode ? 'bg-emerald-600' : 'bg-gray-300'} relative`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${data.privacyMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`} />
              <div className={`p-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}><Globe size={20} className="text-blue-500" /></div>
                  <span className={txt}>{t.language}</span>
                </div>
                <div className="flex gap-2 ml-13">
                  <button onClick={() => setData(d => ({...d, lang: 'en'}))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${data.lang === 'en' ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt}`}`}>English</button>
                  <button onClick={() => setData(d => ({...d, lang: 'ar'}))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${data.lang === 'ar' ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt}`}`}>العربية</button>
                </div>
              </div>
              <div className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`} />
              <div className={`p-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}><DollarSign size={20} className="text-emerald-600" /></div>
                  <span className={txt}>{t.homeCurrency}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(currencies).map(c => <button key={c} onClick={() => setData(d => ({...d, homeCurrency: c}))} className={`py-2 rounded-xl text-sm font-medium ${data.homeCurrency === c ? 'bg-emerald-600 text-white' : `${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt}`}`}>{c}</button>)}
                </div>
              </div>
            </div>
          </div>

          {/* Data Management Section */}
          <div>
            <h3 className={`text-xs font-bold ${muted} uppercase mb-3`}>{t.dataManagement}</h3>
            <div className={`${card} rounded-2xl border overflow-hidden`}>
              <div className={`p-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Download size={20} className="text-blue-600" /></div>
                  <span className={txt}>{t.backup} & {t.restore}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { const b = { ...data, backupDate: new Date().toISOString() }; const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'wafra-backup.json'; a.click(); }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium">{t.backup}</button>
                  <button onClick={() => fileInputRef.current?.click()} className={`flex-1 py-2.5 ${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt} rounded-xl text-sm font-medium`}>{t.restore}</button>
                </div>
              </div>
              <div className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`} />
              <div className={`p-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><FileText size={20} className="text-indigo-600" /></div>
                  <span className={txt}>{t.export}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { let report = '=== WAFRA TRANSACTION REPORT ===\n\n'; report += `Generated: ${new Date().toLocaleDateString()}\n`; report += `Balance: ${fmt(balance, false, data.homeCurrency)}\n\n`; report += '--- Transactions ---\n\n'; filtered.forEach(tx => { const cat = allCats[tx.category] || tx.category; report += `${tx.date} | ${tx.type === 'income' ? '+' : '-'}${fmt(tx.amount, false, data.homeCurrency)} | ${cat}\n`; }); const blob = new Blob([report], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'wafra-report.txt'; a.click(); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"><FileText size={16} />{t.exportPDF}</button>
                  <button onClick={() => { const headers = ['Date', 'Type', 'Amount', 'Category', 'Description']; const rows = data.transactions.map(tx => [tx.date, tx.type, tx.amount, allCats[tx.category] || tx.category, tx.description || '']); const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'wafra-transactions.csv'; a.click(); }} className={`flex-1 py-2.5 ${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt} rounded-xl text-sm font-medium flex items-center justify-center gap-2`}><FileSpreadsheet size={16} />{t.exportCSV}</button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <div className={`${card} rounded-2xl border overflow-hidden`}>
              <button onClick={() => setShowResetConfirm(true)} className={`w-full flex items-center justify-between p-4 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><RotateCcw size={20} className="text-red-500" /></div>
                  <div className="text-left"><p className="font-medium text-red-500">{t.resetApp}</p><p className={`text-xs ${muted}`}>{data.lang === 'ar' ? 'حذف جميع البيانات' : 'Delete all data'}</p></div>
                </div>
                <ChevronRight size={20} className="text-red-400" />
              </button>
            </div>
          </div>

          {/* Feedback & About */}
          <div className={`${card} rounded-2xl border overflow-hidden`}>
            <button onClick={() => setShowFeedback(true)} className={`w-full flex items-center justify-between p-4 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center"><MessageSquare size={20} className="text-pink-600" /></div>
                <span className={txt}>{t.feedback}</span>
              </div>
              <ChevronRight size={20} className={muted} />
            </button>
            <div className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`} />
            <div className={`flex items-center justify-between p-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Info size={20} className="text-gray-600" /></div>
                <span className={txt}>{t.about}</span>
              </div>
              <span className={`text-sm ${muted}`}>v5.0 BETA</span>
            </div>
          </div>

          <div className="h-4" />
        </div>)}
      </main>

      {/* Bottom Navigation - New Design with centered + button */}
      <nav className={`fixed bottom-0 left-0 right-0 ${dark ? 'bg-gray-900' : 'bg-white'} border-t ${dark ? 'border-gray-800' : 'border-gray-200'} z-40 pb-safe`}>
        <div className="flex justify-around items-center max-w-md mx-auto relative">
          {/* Home */}
          <button onClick={() => setTab('dashboard')} className={`flex flex-col items-center py-3 px-4 ${tab === 'dashboard' ? 'text-emerald-600' : muted}`}>
            <Home size={24} strokeWidth={tab === 'dashboard' ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium mt-1">{t.dashboard}</span>
          </button>
          
          {/* Goals */}
          <button onClick={() => setTab('goals')} className={`flex flex-col items-center py-3 px-4 ${tab === 'goals' ? 'text-emerald-600' : muted}`}>
            <Target size={24} strokeWidth={tab === 'goals' ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium mt-1">{t.goals}</span>
          </button>
          
          {/* Center Add Button */}
          <button onClick={() => setShowAdd(true)} className="relative -top-5 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Plus size={28} className="text-white" strokeWidth={2.5} />
          </button>
          
          {/* Budget */}
          <button onClick={() => setTab('budget')} className={`flex flex-col items-center py-3 px-4 ${tab === 'budget' ? 'text-emerald-600' : muted}`}>
            <Wallet size={24} strokeWidth={tab === 'budget' ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium mt-1">{t.budget}</span>
          </button>
          
          {/* Profile */}
          <button onClick={() => setTab('profile')} className={`flex flex-col items-center py-3 px-4 ${tab === 'profile' ? 'text-emerald-600' : muted}`}>
            <User size={24} strokeWidth={tab === 'profile' ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium mt-1">{t.profile}</span>
          </button>
        </div>
        {/* Safe area padding for iPhone X+ home indicator */}
        <div className="h-6" />
      </nav>

      {/* Add Transaction Modal */}
      {/* Add Transaction - Custom Keypad */}
      {showAdd && <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
        <div className={`${card} rounded-t-3xl w-full max-w-lg max-h-[95vh] overflow-y-auto`}>
          {/* Header */}
          <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${txt}`}>{editingTx ? t.edit : t.addTransaction}</h3>
              <button onClick={() => { setShowAdd(false); setEditingTx(null); setNewTx({ type: 'expense', amount: '', category: 'food', description: '', isRecurring: false }); setTxDate(new Date().toISOString().split('T')[0]); }} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button>
            </div>
            
            {/* Type Toggle */}
            <div className={`flex ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-1 mb-4`}>
              <button onClick={() => setNewTx(p => ({...p, type: 'expense', category: Object.keys(getCats('expense'))[0]}))} className={`flex-1 py-2.5 rounded-lg font-medium text-sm ${newTx.type === 'expense' ? `${card} shadow` : ''} ${txt}`}>{t.expense}</button>
              <button onClick={() => setNewTx(p => ({...p, type: 'income', category: Object.keys(getCats('income'))[0]}))} className={`flex-1 py-2.5 rounded-lg font-medium text-sm ${newTx.type === 'income' ? 'bg-emerald-600 text-white shadow' : ''} ${txt}`}>{t.income}</button>
            </div>
            
            {/* Amount Display */}
            <div className="text-center mb-4">
              <p className={`text-xs ${muted} mb-1`}>{t.enterAmount}</p>
              <div className={`text-4xl font-bold ${newTx.type === 'income' ? 'text-emerald-600' : txt}`}>
                {currencies[data.homeCurrency]?.symbol} {newTx.amount || '0.00'}
              </div>
            </div>
            
            {/* Category Pills - Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-2 px-2">
              {Object.entries(getCats(newTx.type)).map(([k, v]) => {
                const IC = getIcon(k);
                const isSelected = newTx.category === k;
                return (
                  <button key={k} onClick={() => { haptic.light(); setNewTx(p => ({...p, category: k})); }} className={`flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap ${isSelected ? 'bg-emerald-600 text-white' : (dark ? 'bg-gray-700' : 'bg-gray-100')} ${!isSelected && txt}`}>
                    <IC size={14} />
                    <span className="text-xs font-medium">{v}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Note & Date Row */}
            <div className="flex gap-2 mb-2">
              <input type="text" value={newTx.description} onChange={e => setNewTx(p => ({...p, description: e.target.value}))} placeholder={t.addNote} className={`flex-1 p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none text-sm`} />
              <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className={`w-32 p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none text-sm`} />
            </div>
            
            {/* Recurring Toggle */}
            <button onClick={() => { haptic.light(); setNewTx(p => ({...p, isRecurring: !p.isRecurring})); }} className={`flex items-center justify-between w-full p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl mb-2`}>
              <div className="flex items-center gap-2"><Repeat size={16} className={muted} /><span className={`text-sm ${txt}`}>{t.recurring}</span></div>
              <div className={`w-10 h-6 rounded-full ${newTx.isRecurring ? 'bg-emerald-600' : (dark ? 'bg-gray-600' : 'bg-gray-300')}`}><div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${newTx.isRecurring ? 'translate-x-5' : 'translate-x-1'}`} /></div>
            </button>
          </div>
          
          {/* Number Pad */}
          <NumberPad 
            value={newTx.amount} 
            onChange={(v) => setNewTx(p => ({...p, amount: v}))} 
            onConfirm={addTx}
            confirmText={t.confirmTransaction}
            currency={data.homeCurrency}
            dark={dark}
          />
        </div>
      </div>}

      {/* Quick Add - Custom Keypad */}
      {showQuick && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
        <div className={`${card} rounded-t-3xl w-full max-w-lg`}>
          <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {(() => { const IC = getIcon(quickCat); return <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><IC size={20} className="text-emerald-600" /></div>; })()}
                <h3 className={`text-lg font-bold ${txt}`}>{allCats[quickCat]}</h3>
              </div>
              <button onClick={() => { setShowQuick(false); setQuickAmt(''); setQuickNote(''); setQuickBudgetImpact(null); }} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button>
            </div>
            
            {/* Amount Display */}
            <div className="text-center mb-4">
              <div className={`text-4xl font-bold ${txt}`}>
                {currencies[data.homeCurrency]?.symbol} {quickAmt || '0.00'}
              </div>
            </div>
            
            {/* Budget Impact Preview */}
            {quickBudgetImpact && (
              <div className={`mb-4 p-3 rounded-xl ${quickBudgetImpact.isOver ? (dark ? 'bg-red-900/30' : 'bg-red-50') : (dark ? 'bg-emerald-900/30' : 'bg-emerald-50')}`}>
                <p className={`text-xs font-bold mb-2 ${quickBudgetImpact.isOver ? 'text-red-500' : 'text-emerald-600'}`}>
                  {t.budgetImpact}
                </p>
                <div className="flex justify-between text-sm">
                  <span className={muted}>{data.lang === 'ar' ? 'الميزانية:' : 'Budget:'}</span>
                  <span className={txt}>{currencies[data.homeCurrency]?.symbol} {quickBudgetImpact.limit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={muted}>{data.lang === 'ar' ? 'المتبقي:' : 'Remaining:'}</span>
                  <span className={`font-bold ${quickBudgetImpact.remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {currencies[data.homeCurrency]?.symbol} {quickBudgetImpact.remaining.toFixed(2)}
                  </span>
                </div>
                {quickBudgetImpact.isOver && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> {data.lang === 'ar' ? 'ستتجاوز الميزانية!' : 'Will exceed budget!'}
                  </p>
                )}
              </div>
            )}
            
            {/* Note & Date */}
            <div className="flex gap-2 mb-2">
              <input type="text" value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder={t.addNote} className={`flex-1 p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none text-sm`} />
              <input type="date" value={quickDate} onChange={e => setQuickDate(e.target.value)} className={`w-32 p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none text-sm`} />
            </div>
          </div>
          
          <NumberPad 
            value={quickAmt} 
            onChange={setQuickAmt} 
            onConfirm={quickAddFn}
            confirmText={t.confirmTransaction}
            currency={data.homeCurrency}
            dark={dark}
          />
        </div>
      </div>}

      {/* Quick Add Settings Modal */}
      {showQuickAddSettings && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[70vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.customizeQuickAdd}</h3><button onClick={() => setShowQuickAddSettings(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div><p className={`${muted} text-sm mb-4`}>{t.selectQuickCats}</p><div className="grid grid-cols-3 gap-3">{Object.entries(getCats('expense')).map(([k, v]) => { const IC = getIcon(k); const isSelected = (data.quickAddCats || defaultQuickAddCats).includes(k); return <button key={k} onClick={() => { const curr = data.quickAddCats || defaultQuickAddCats; if (isSelected) { setData(d => ({...d, quickAddCats: curr.filter(c => c !== k)})); } else if (curr.length < 4) { setData(d => ({...d, quickAddCats: [...curr, k]})); } }} className={`p-4 rounded-xl flex flex-col items-center gap-2 ${isSelected ? 'bg-emerald-100 ring-2 ring-emerald-500' : (dark ? 'bg-gray-700' : 'bg-gray-50')}`}><IC size={24} className={isSelected ? 'text-emerald-600' : muted} /><span className={`text-xs text-center ${isSelected ? 'text-emerald-700 font-medium' : muted}`}>{v}</span>{isSelected && <CheckCircle size={16} className="text-emerald-600" />}</button>; })}</div><p className={`text-xs ${muted} mt-4 text-center`}>{(data.quickAddCats || defaultQuickAddCats).length}/4</p></div></div>}

      {/* Delete Confirm */}
      {deleting && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className={`${card} rounded-2xl p-6 w-full max-w-xs text-center`}><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-red-500" /></div><h3 className={`text-xl font-bold mb-2 ${txt}`}>{t.deleteConfirm}</h3><div className="flex gap-3 mt-6"><button onClick={() => setDeleting(null)} className={`flex-1 py-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl font-medium ${txt}`}>{t.no}</button><button onClick={() => deleteTx(deleting)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">{t.yes}</button></div></div></div>}

      {/* Add Goal */}
      {showAddGoal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.addGoal}</h3><button onClick={() => { setShowAddGoal(false); setShowGoalTemplates(true); }} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        
        {/* Goal Templates Section */}
        {showGoalTemplates ? (
          <div className="space-y-4">
            <p className={`text-sm ${muted} mb-4`}>{t.chooseTemplate}</p>
            <div className="grid grid-cols-2 gap-3">
              {GOAL_TEMPLATES.map(template => {
                const TI = template.icon;
                const gc = goalTypeColors[template.type] || goalTypeColors.other;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleGoalTemplateSelect(template)}
                    className={`${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 text-left transition-colors`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${gc.light} flex items-center justify-center mb-2`}>
                      <TI size={20} className={gc.text} />
                    </div>
                    <p className={`font-bold text-sm ${txt}`}>{data.lang === 'ar' ? template.nameAr : template.name}</p>
                    <p className={`text-xs ${muted}`}>{currencies[data.homeCurrency]?.symbol} {template.defaultTarget}</p>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowGoalTemplates(false)}
              className={`w-full py-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt} rounded-xl font-medium mt-4`}
            >
              {t.createCustom}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4"><div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.goalName}</label><input type="text" value={newGoal.name} onChange={e => setNewGoal(p => ({...p, name: e.target.value}))} className={`w-full p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none`} /></div>
              <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.category}</label><div className="grid grid-cols-4 gap-2">{Object.entries(t.goalTypes).map(([k, v]) => { const GI = goalTypeIcons[k] || Target; const gc = goalTypeColors[k] || goalTypeColors.other; return <button key={k} onClick={() => setNewGoal(p => ({...p, type: k}))} className={`flex flex-col items-center gap-1 p-3 rounded-xl ${newGoal.type === k ? gc.light : (dark ? 'bg-gray-700' : 'bg-gray-50')}`}><GI size={20} className={newGoal.type === k ? gc.text : muted} /><span className={`text-[10px] font-medium ${newGoal.type === k ? gc.text : muted}`}>{v}</span></button>; })}</div></div>
              <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.targetAmount}</label><div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}><span className={muted}>{currencies[data.homeCurrency]?.symbol}</span><input type="number" value={newGoal.targetAmount} onChange={e => setNewGoal(p => ({...p, targetAmount: e.target.value}))} placeholder="0" className={`flex-1 p-4 bg-transparent text-xl font-bold ${txt} outline-none`} /></div></div>
              <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.currentAmount}</label><div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}><span className={muted}>{currencies[data.homeCurrency]?.symbol}</span><input type="number" value={newGoal.currentAmount} onChange={e => setNewGoal(p => ({...p, currentAmount: e.target.value}))} placeholder="0" className={`flex-1 p-4 bg-transparent text-xl font-bold ${txt} outline-none`} /></div></div>
              <div><label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.deadline}</label><input type="date" value={newGoal.deadline} onChange={e => setNewGoal(p => ({...p, deadline: e.target.value}))} className={`w-full p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none`} /></div>
              
              {/* Time to goal & suggested savings */}
              {newGoal.targetAmount && newGoal.deadline && (() => {
                const target = parseFloat(newGoal.targetAmount);
                const current = parseFloat(newGoal.currentAmount) || 0;
                const remaining = target - current;
                const daysToDeadline = Math.max(1, Math.ceil((new Date(newGoal.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
                const monthsToDeadline = Math.max(1, Math.ceil(daysToDeadline / 30));
                const suggestedMonthly = remaining / monthsToDeadline;
                
                return (
                  <div className={`${dark ? 'bg-indigo-900/30' : 'bg-indigo-50'} rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={16} className="text-indigo-500" />
                      <span className={`text-xs font-bold ${dark ? 'text-indigo-400' : 'text-indigo-700'}`}>{t.suggestedMonthly}</span>
                    </div>
                    <p className={`text-lg font-bold ${dark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      {currencies[data.homeCurrency]?.symbol} {suggestedMonthly.toFixed(2)} / {data.lang === 'ar' ? 'شهر' : 'month'}
                    </p>
                    <p className={`text-xs ${dark ? 'text-indigo-400' : 'text-indigo-600'} mt-1`}>
                      {monthsToDeadline} {data.lang === 'ar' ? 'شهر متبقي' : 'months remaining'}
                    </p>
                  </div>
                );
              })()}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowGoalTemplates(true)} className={`flex-1 py-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt} rounded-xl font-bold`}>{t.back}</button>
              <button onClick={addGoalFn} disabled={!newGoal.name || !newGoal.targetAmount} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50">{t.save}</button>
            </div>
          </>
        )}
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
        <div className="mb-6"><h4 className={`font-bold ${txt} mb-4`}>{t.spendingByCategory}</h4>{chartData.length > 0 ? <div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">{chartData.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip content={<PieTooltip dark={dark} currency={data.homeCurrency} />} /></PieChart></ResponsiveContainer></div> : <p className={`text-center py-8 ${muted}`}>{t.noTransactionsYet}</p>}<div className="flex flex-wrap gap-2 mt-4">{chartData.map((e, i) => <div key={e.name} className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} /><span className={muted}>{e.name}</span></div>)}</div></div>
        <div><h4 className={`font-bold ${txt} mb-4`}>{t.incomeVsExpense}</h4><div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><XAxis dataKey="name" tick={{ fill: dark ? '#9ca3af' : '#6b7280', fontSize: 10 }} /><YAxis tick={{ fill: dark ? '#9ca3af' : '#6b7280', fontSize: 10 }} /><Tooltip content={<CustomTooltip dark={dark} currency={data.homeCurrency} />} /><Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      </div></div>}

      {/* Zakat - Smart Gold Calculator */}
      {showZakatModal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.zakatCalculator}</h3><button onClick={() => setShowZakatModal(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        <div className="space-y-4">
          {/* Cash */}
          <div>
            <label className={`text-xs font-bold ${muted} uppercase mb-1 block`}>{t.cashSavings}</label>
            <div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}>
              <span className={muted}>{currencies[data.homeCurrency]?.symbol}</span>
              <input type="number" value={zakatInputs.cash} onChange={e => setZakatInputs(p => ({...p, cash: e.target.value}))} placeholder="0" className={`flex-1 p-3 bg-transparent ${txt} outline-none`} />
            </div>
          </div>
          
          {/* Smart Gold - Weight + Live Price */}
          <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-amber-50'} rounded-xl border ${dark ? 'border-gray-600' : 'border-amber-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-xs font-bold ${dark ? 'text-amber-400' : 'text-amber-700'} uppercase flex items-center gap-2`}>
                <span>✨</span> {t.goldWeight}
              </label>
              <button 
                onClick={fetchGoldPrice} 
                disabled={goldPriceLoading}
                className={`text-xs px-3 py-1 rounded-full font-medium ${dark ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white'} disabled:opacity-50 flex items-center gap-1`}
              >
                {goldPriceLoading ? t.fetchingPrice : t.livePrice}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${muted} block mb-1`}>{data.lang === 'ar' ? 'الوزن (جرام)' : 'Weight (g)'}</label>
                <input type="number" value={zakatInputs.goldGrams} onChange={e => { haptic.light(); setZakatInputs(p => ({...p, goldGrams: e.target.value})); }} placeholder="0" className={`w-full p-3 ${dark ? 'bg-gray-600' : 'bg-white'} rounded-xl ${txt} outline-none`} />
              </div>
              <div>
                <label className={`text-[10px] ${muted} flex items-center gap-1 mb-1`}>
                  {t.goldPricePerGram}
                  {zakatInputs.goldPrice && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${goldPriceIsLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {goldPriceIsLive ? '● LIVE' : `≈ ${t.approximatePrice}`}
                    </span>
                  )}
                </label>
                <div className={`flex items-center ${dark ? 'bg-gray-600' : 'bg-white'} rounded-xl px-3`}>
                  <span className={`text-xs ${muted}`}>{currencies[data.homeCurrency]?.symbol}</span>
                  <input type="number" value={zakatInputs.goldPrice} onChange={e => { haptic.light(); setZakatInputs(p => ({...p, goldPrice: e.target.value})); setGoldPriceIsLive(false); }} placeholder="0" className={`flex-1 p-3 bg-transparent ${txt} outline-none`} />
                </div>
              </div>
            </div>
            {zakatInputs.goldGrams && zakatInputs.goldPrice && (
              <p className={`text-sm mt-2 ${dark ? 'text-amber-400' : 'text-amber-700'} font-medium`}>
                = {fmt((parseFloat(zakatInputs.goldGrams) || 0) * (parseFloat(zakatInputs.goldPrice) || 0), false, data.homeCurrency)}
              </p>
            )}
          </div>
          
          {/* Other fields */}
          {[{ k: 'investments', l: t.investments }, { k: 'inventory', l: t.businessInventory }, { k: 'debts', l: t.debts }].map(item => (
            <div key={item.k}>
              <label className={`text-xs font-bold ${muted} uppercase mb-1 block`}>{item.l}</label>
              <div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}>
                <span className={muted}>{currencies[data.homeCurrency]?.symbol}</span>
                <input type="number" value={zakatInputs[item.k]} onChange={e => setZakatInputs(p => ({...p, [item.k]: e.target.value}))} placeholder="0" className={`flex-1 p-3 bg-transparent ${txt} outline-none`} />
              </div>
            </div>
          ))}
        </div>
        {(() => { const z = calcZakat(); return <div className={`mt-6 p-4 rounded-xl ${z.ok ? (dark ? 'bg-emerald-900/30' : 'bg-emerald-50') : (dark ? 'bg-gray-700' : 'bg-gray-50')}`}><div className="flex items-center justify-between mb-2"><span className={muted}>{t.nisabThreshold}</span><span className={`font-bold ${txt}`}>{fmt(z.nisab, false, data.homeCurrency)}</span></div><div className="flex items-center justify-between mb-4"><span className={muted}>Total</span><span className={`font-bold ${txt}`}>{fmt(z.tot, false, data.homeCurrency)}</span></div><div className={`p-4 rounded-xl ${z.ok ? 'bg-emerald-600 text-white' : (dark ? 'bg-gray-600' : 'bg-gray-200')}`}><p className="text-sm mb-1">{z.ok ? t.eligible : t.notEligible}</p><p className="text-2xl font-bold">{z.ok ? fmt(z.due, false, data.homeCurrency) : '-'}</p></div></div>; })()}
      </div></div>}

      {/* Badges */}
      {showBadgesModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className={`${card} rounded-2xl w-full max-w-sm p-6`}><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.badges}</h3><button onClick={() => setShowBadgesModal(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div><div className="grid grid-cols-4 gap-4">{badgeDefinitions.map(b => <div key={b.id} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${dark ? 'bg-gray-700' : 'bg-gray-100'} opacity-40`}>{b.icon}</div>)}</div></div></div>}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className={`${card} rounded-2xl w-full max-w-sm p-6`}><div className="text-center"><AlertTriangle size={48} className="text-red-500 mx-auto mb-4" /><h3 className={`text-xl font-bold ${txt} mb-2`}>{t.resetApp}</h3><p className={`${muted} mb-6`}>{t.resetConfirm}</p><div className="flex gap-3"><button onClick={() => setShowResetConfirm(false)} className={`flex-1 py-3 ${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt} rounded-xl font-medium`}>{t.no}</button><button onClick={() => { localStorage.removeItem('wafra-data'); window.location.reload(); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium">{t.yes}</button></div></div></div></div>}

      {/* Budget Limits Modal */}
      {showBudgetModal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${txt}`}>{t.manageBudgets}</h3><button onClick={() => { setShowBudgetModal(false); setEditingBudget({ category: '', amount: '' }); }} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button></div>
        
        {/* Set/Edit a specific budget */}
        {editingBudget.category && (
          <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl mb-6`}>
            <h4 className={`font-bold ${txt} mb-3`}>{t.setLimit}: {allCats[editingBudget.category]}</h4>
            <div className={`flex items-center gap-2 ${dark ? 'bg-gray-600' : 'bg-white'} rounded-xl px-4 mb-4`}>
              <span className={muted}>{currencies[data.homeCurrency]?.symbol}</span>
              <input type="number" value={editingBudget.amount} onChange={e => setEditingBudget(p => ({...p, amount: e.target.value}))} placeholder="0" className={`flex-1 p-3 bg-transparent text-xl font-bold ${txt} outline-none`} autoFocus />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingBudget({ category: '', amount: '' })} className={`flex-1 py-2 ${dark ? 'bg-gray-600' : 'bg-gray-200'} ${txt} rounded-lg font-medium`}>{t.cancel}</button>
              <button onClick={() => { if (editingBudget.amount) { setData(p => ({...p, budgets: {...(p.budgets || {}), [editingBudget.category]: parseFloat(editingBudget.amount)}})); } setEditingBudget({ category: '', amount: '' }); }} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold">{t.save}</button>
            </div>
          </div>
        )}
        
        {/* List all categories with budgets */}
        <div className="space-y-3">
          {Object.keys(getCats('expense')).map(catKey => {
            const catName = allCats[catKey];
            const limit = data.budgets?.[catKey] || 0;
            const spent = catSpending[catKey] || 0;
            const hasLimit = limit > 0;
            const I = getIcon(catKey);
            return (
              <div key={catKey} className={`flex items-center justify-between p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasLimit ? 'bg-emerald-100' : (dark ? 'bg-gray-600' : 'bg-gray-100')}`}><I size={20} className={hasLimit ? 'text-emerald-600' : muted} /></div>
                  <div>
                    <p className={`font-medium ${txt}`}>{catName}</p>
                    {hasLimit && <p className={`text-xs ${muted}`}>{fmtShort(spent, data.privacyMode, data.homeCurrency)} / {fmtShort(limit, false, data.homeCurrency)}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasLimit ? (
                    <>
                      <button onClick={() => setEditingBudget({ category: catKey, amount: limit.toString() })} className="text-emerald-600 text-sm font-medium">{t.edit}</button>
                      <button onClick={() => setData(p => ({...p, budgets: {...(p.budgets || {}), [catKey]: 0}}))} className="text-red-500 text-sm font-medium">{t.removeBudget}</button>
                    </>
                  ) : (
                    <button onClick={() => setEditingBudget({ category: catKey, amount: '' })} className="text-emerald-600 text-sm font-bold">+ {t.setLimit}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div></div>}

      {/* Subscriptions Manager Modal */}
      {showSubscriptionsModal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"><div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${txt}`}>{t.subscriptions}</h3>
          <button onClick={() => setShowSubscriptionsModal(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button>
        </div>
        
        {/* Monthly Total Card */}
        <div className={`p-4 rounded-xl mb-6 ${dark ? 'bg-violet-900/30' : 'bg-violet-50'} border ${dark ? 'border-violet-800' : 'border-violet-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${dark ? 'bg-violet-800' : 'bg-violet-100'} flex items-center justify-center`}>
                <Repeat size={24} className="text-violet-600" />
              </div>
              <div>
                <p className={`text-xs ${muted}`}>{t.monthlyTotal}</p>
                <p className={`text-2xl font-bold ${dark ? 'text-violet-400' : 'text-violet-600'}`}>{fmt(subscriptionTotal, data.privacyMode, data.homeCurrency)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className={`text-sm ${muted} mb-4`}>{t.manageSubscriptions}</p>
        
        {subscriptions.length === 0 ? (
          <div className={`text-center py-12 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl`}>
            <Repeat size={40} className={`mx-auto ${muted} mb-3`} />
            <p className={muted}>{t.noSubscriptions}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map(tx => {
              const I = getIcon(tx.category);
              return (
                <div key={tx.id} className={`flex items-center justify-between p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${dark ? 'bg-gray-600' : 'bg-white'} flex items-center justify-center`}>
                      <I size={20} className={muted} />
                    </div>
                    <div>
                      <p className={`font-medium ${txt}`}>{tx.description || allCats[tx.category]}</p>
                      <p className={`text-xs ${muted}`}>{allCats[tx.category]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${txt}`}>{fmtShort(tx.amount, data.privacyMode, data.homeCurrency)}</p>
                    <button onClick={() => setDeleting(tx.id)} className="text-xs text-red-500">{t.delete}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div></div>}

      {/* Debt Management Modal */}
      {showDebtModal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
        <div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${txt}`}>{t.debtManagement}</h3>
            <button onClick={() => setShowDebtModal(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button>
          </div>
          
          {/* Total Debts Summary */}
          <div className={`p-4 rounded-xl mb-6 ${dark ? 'bg-rose-900/30 border-rose-800' : 'bg-rose-50 border-rose-200'} border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${dark ? 'bg-rose-800' : 'bg-rose-100'} flex items-center justify-center`}>
                  <TrendingDown size={24} className="text-rose-600" />
                </div>
                <div>
                  <p className={`text-xs ${muted}`}>{t.totalDebts}</p>
                  <p className={`text-2xl font-bold ${dark ? 'text-rose-400' : 'text-rose-600'}`}>{fmt(totalDebts, data.privacyMode, data.homeCurrency)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add Debt Button */}
          <button onClick={() => setShowAddDebt(true)} className="w-full py-3 mb-6 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <Plus size={20} /> {t.addDebt}
          </button>
          
          {/* Debt List */}
          {(!data.debts || data.debts.length === 0) ? (
            <div className={`text-center py-12 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl`}>
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
              <p className={`font-bold ${txt}`}>{t.debtFree}</p>
              <p className={muted}>{t.noDebts}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.debts.map(debt => {
                const DI = debtTypeIcons[debt.type] || Wallet;
                const dc = debtTypeColors[debt.type] || debtTypeColors.other;
                const remaining = debt.totalAmount - debt.paidAmount;
                const progress = (debt.paidAmount / debt.totalAmount) * 100;
                const payoffDate = getPayoffDate(debt);
                
                return (
                  <button key={debt.id} onClick={() => setSelectedDebt(debt)} className={`w-full ${card} rounded-2xl p-4 border text-left`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${dc.light} flex items-center justify-center`}>
                        <DI size={20} className={dc.text} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${txt}`}>{debt.name}</p>
                        <p className={`text-xs ${muted}`}>{t.debtTypes[debt.type]}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${dark ? 'text-rose-400' : 'text-rose-600'}`}>{fmtShort(remaining, data.privacyMode, data.homeCurrency)}</p>
                        <p className={`text-xs ${muted}`}>{t.remaining}</p>
                      </div>
                    </div>
                    {/* Progress Bar - Inverse (starts full, empties as paid) */}
                    <div className={`h-2 ${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                      <div className={`h-full ${progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'} transition-all rounded-full`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className={`text-xs ${muted}`}>{Math.round(progress)}% {data.lang === 'ar' ? 'مدفوع' : 'paid'}</span>
                      <span className={`text-xs ${muted}`}>{t.estimatedEnd}: {payoffDate.toLocaleDateString(data.lang === 'ar' ? 'ar' : 'en', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>}

      {/* Add Debt Modal */}
      {showAddDebt && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
        <div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${txt}`}>{t.addDebt}</h3>
            <button onClick={() => setShowAddDebt(false)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button>
          </div>
          
          <div className="space-y-4">
            {/* Debt Name */}
            <div>
              <label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.debtName}</label>
              <input type="text" value={newDebt.name} onChange={e => setNewDebt(p => ({...p, name: e.target.value}))} placeholder="e.g. Car Loan" className={`w-full p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none`} />
            </div>
            
            {/* Debt Type */}
            <div>
              <label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.category}</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(t.debtTypes).map(([k, v]) => {
                  const DI = debtTypeIcons[k] || Wallet;
                  const dc = debtTypeColors[k] || debtTypeColors.other;
                  return (
                    <button key={k} onClick={() => setNewDebt(p => ({...p, type: k}))} className={`flex flex-col items-center gap-1 p-3 rounded-xl ${newDebt.type === k ? dc.light : (dark ? 'bg-gray-700' : 'bg-gray-50')}`}>
                      <DI size={20} className={newDebt.type === k ? dc.text : muted} />
                      <span className={`text-[10px] font-medium ${newDebt.type === k ? dc.text : muted}`}>{v}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Total Amount */}
            <div>
              <label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.totalLoan}</label>
              <div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}>
                <span className={muted}>{currencies[data.homeCurrency]?.symbol}</span>
                <input type="number" value={newDebt.totalAmount} onChange={e => setNewDebt(p => ({...p, totalAmount: e.target.value}))} placeholder="0" className={`flex-1 p-4 bg-transparent text-xl font-bold ${txt} outline-none`} />
              </div>
            </div>
            
            {/* Already Paid */}
            <div>
              <label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.paidAmount}</label>
              <div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}>
                <span className={muted}>{currencies[data.homeCurrency]?.symbol}</span>
                <input type="number" value={newDebt.paidAmount} onChange={e => setNewDebt(p => ({...p, paidAmount: e.target.value}))} placeholder="0" className={`flex-1 p-4 bg-transparent text-xl font-bold ${txt} outline-none`} />
              </div>
            </div>
            
            {/* Monthly Payment */}
            <div>
              <label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.monthlyPayment}</label>
              <div className={`flex items-center gap-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl px-4`}>
                <span className={muted}>{currencies[data.homeCurrency]?.symbol}</span>
                <input type="number" value={newDebt.monthlyPayment} onChange={e => setNewDebt(p => ({...p, monthlyPayment: e.target.value}))} placeholder="0" className={`flex-1 p-4 bg-transparent text-xl font-bold ${txt} outline-none`} />
              </div>
            </div>
            
            {/* Start Date */}
            <div>
              <label className={`text-xs font-bold ${muted} uppercase mb-2 block`}>{t.startDate}</label>
              <input type="date" value={newDebt.startDate} onChange={e => setNewDebt(p => ({...p, startDate: e.target.value}))} className={`w-full p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl ${txt} outline-none`} />
            </div>
          </div>
          
          <button onClick={addDebtFn} disabled={!newDebt.name || !newDebt.totalAmount || !newDebt.monthlyPayment} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50 mt-6">{t.save}</button>
        </div>
      </div>}

      {/* Selected Debt Detail Modal */}
      {selectedDebt && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
        <div className={`${card} rounded-t-3xl w-full max-w-lg p-6 pb-10`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${txt}`}>{selectedDebt.name}</h3>
            <button onClick={() => setSelectedDebt(null)} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button>
          </div>
          
          {(() => {
            const DI = debtTypeIcons[selectedDebt.type] || Wallet;
            const dc = debtTypeColors[selectedDebt.type] || debtTypeColors.other;
            const remaining = selectedDebt.totalAmount - selectedDebt.paidAmount;
            const progress = (selectedDebt.paidAmount / selectedDebt.totalAmount) * 100;
            const payoffDate = getPayoffDate(selectedDebt);
            
            return (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${dc.light} flex items-center justify-center`}>
                    <DI size={32} className={dc.text} />
                  </div>
                  <div>
                    <p className={`text-xs ${muted}`}>{t.remainingDebt}</p>
                    <p className={`text-3xl font-bold ${dark ? 'text-rose-400' : 'text-rose-600'}`}>{fmt(remaining, data.privacyMode, data.homeCurrency)}</p>
                  </div>
                </div>
                
                {/* Progress */}
                <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl mb-4`}>
                  <div className="flex justify-between mb-2">
                    <span className={muted}>{t.paidAmount}</span>
                    <span className={`font-bold ${txt}`}>{fmt(selectedDebt.paidAmount, data.privacyMode, data.homeCurrency)}</span>
                  </div>
                  <div className={`h-3 ${dark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className={`h-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-emerald-500'} transition-all rounded-full`} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={`text-xs ${muted}`}>{Math.round(progress)}%</span>
                    <span className={`text-xs ${muted}`}>{fmt(selectedDebt.totalAmount, false, data.homeCurrency)}</span>
                  </div>
                </div>
                
                {/* Details */}
                <div className={`grid grid-cols-2 gap-3 mb-6`}>
                  <div className={`p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                    <p className={`text-xs ${muted}`}>{t.monthlyPayment}</p>
                    <p className={`font-bold ${txt}`}>{fmtShort(selectedDebt.monthlyPayment, data.privacyMode, data.homeCurrency)}</p>
                  </div>
                  <div className={`p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                    <p className={`text-xs ${muted}`}>{t.estimatedEnd}</p>
                    <p className={`font-bold ${txt}`}>{payoffDate.toLocaleDateString(data.lang === 'ar' ? 'ar' : 'en', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => deleteDebt(selectedDebt.id)} className={`flex-1 py-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt} rounded-xl font-medium flex items-center justify-center gap-2`}>
                    <Trash2 size={18} /> {t.delete}
                  </button>
                  <button onClick={() => setShowDebtPayment(true)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">
                    {t.makePayment}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>}

      {/* Debt Payment Modal */}
      {showDebtPayment && selectedDebt && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
        <div className={`${card} rounded-t-3xl w-full max-w-lg`}>
          <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${txt}`}>{t.makePayment}</h3>
              <button onClick={() => { setShowDebtPayment(false); setDebtPaymentAmount(''); }} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}><X size={20} className={muted}/></button>
            </div>
            
            <div className="text-center mb-4">
              <p className={`text-xs ${muted} mb-1`}>{selectedDebt.name}</p>
              <div className={`text-4xl font-bold text-emerald-600`}>
                {currencies[data.homeCurrency]?.symbol} {debtPaymentAmount || '0.00'}
              </div>
            </div>
          </div>
          
          <NumberPad 
            value={debtPaymentAmount} 
            onChange={setDebtPaymentAmount} 
            onConfirm={makeDebtPayment}
            confirmText={t.makePayment}
            currency={data.homeCurrency}
            dark={dark}
          />
        </div>
      </div>}

      {/* Feedback Modal */}
      {showFeedback && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"><div className={`${card} rounded-3xl w-full max-w-sm p-6`}><h3 className={`text-xl font-bold ${txt} mb-4`}>{t.feedback}</h3><textarea className={`w-full p-3 rounded-xl border outline-none h-32 mb-4 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} ${txt}`} placeholder={t.feedbackPlaceholder} value={feedbackText} onChange={e => setFeedbackText(e.target.value)} /><div className="flex gap-3"><button onClick={() => { setShowFeedback(false); setFeedbackText(''); }} className={`flex-1 py-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'} ${txt} rounded-xl`}>{t.cancel}</button><button onClick={() => { window.open(`mailto:beta@wafra.app?subject=Wafra Beta Feedback&body=${encodeURIComponent(feedbackText)}`); setShowFeedback(false); setFeedbackText(''); }} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">{t.send}</button></div></div></div>}

      {/* Payday Celebration Modal */}
      {showPaydayModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 z-50 flex items-center justify-center p-6">
          <div className="text-center text-white max-w-sm">
            {/* Animated emoji */}
            <div className="text-8xl mb-6 animate-bounce">💰</div>
            
            <h1 className="text-3xl font-bold mb-2">{t.paydayTitle}</h1>
            <p className="text-emerald-100 mb-8">{t.paydaySubtitle}</p>
            
            {/* Last month summary */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
              <p className="text-sm text-emerald-200 mb-4">{t.lastMonthSummary}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-emerald-200 text-xs">{t.youSpent}</p>
                  <p className="text-2xl font-bold">{fmtShort(lastMonthSummary.expense, data.privacyMode, data.homeCurrency)}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-xs">{t.youSaved}</p>
                  <p className={`text-2xl font-bold ${lastMonthSummary.saved >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {lastMonthSummary.saved >= 0 ? '+' : ''}{fmtShort(lastMonthSummary.saved, data.privacyMode, data.homeCurrency)}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-emerald-200 mb-6">✨ {t.budgetsReset}</p>
            
            <button 
              onClick={handlePaydayReset}
              className="w-full py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg shadow-lg"
            >
              {t.startFresh} 🚀
            </button>
          </div>
        </div>
      )}

      {/* Goal Reached Celebration Modal */}
      {showGoalCelebration && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            {/* Confetti animation placeholder - animated emojis */}
            <div className="text-6xl mb-4 animate-pulse">🎉🎊🎉</div>
            <div className="text-7xl mb-6">🏆</div>
            
            <h1 className="text-3xl font-bold text-white mb-2">{t.goalReached}</h1>
            <p className="text-gray-300 mb-2">{t.congratulations}</p>
            <p className="text-2xl font-bold text-emerald-400 mb-8">{showGoalCelebration.name}</p>
            
            <div className="bg-emerald-600/20 border border-emerald-500/50 rounded-2xl p-6 mb-6">
              <p className="text-emerald-300 text-sm mb-2">{t.targetAmount}</p>
              <p className="text-3xl font-bold text-white">
                {fmt(showGoalCelebration.targetAmount, data.privacyMode, data.homeCurrency)}
              </p>
            </div>
            
            <button 
              onClick={() => { setShowGoalCelebration(null); haptic.light(); }}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg"
            >
              {data.lang === 'ar' ? 'رائع!' : 'Awesome!'} ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export with ErrorBoundary wrapper
export default function WafraAppWrapper() {
  return <ErrorBoundary><WafraApp /></ErrorBoundary>;
}
