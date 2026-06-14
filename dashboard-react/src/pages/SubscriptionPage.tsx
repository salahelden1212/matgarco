import { useState, useEffect } from 'react';
import {
  CreditCard, CheckCircle2, XCircle, AlertCircle, Loader2,
  Zap, Star, Crown, Receipt, X, ChevronRight,
  CalendarDays, RefreshCw, TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import axios from '../lib/axios';

const PLAN_ICONS: Record<string, any> = {
  free_trial: Zap,
  starter: TrendingUp,
  professional: Star,
  business: Crown,
};

const PLAN_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  free_trial:   { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700',   badge: 'bg-slate-100 text-slate-700' },
  starter:      { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-800' },
  professional: { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-800' },
  business:     { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-800' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  trialing:  { label: 'تجربة مجانية', color: 'text-blue-700',    bg: 'bg-blue-50'    },
  active:    { label: 'نشط',          color: 'text-emerald-700', bg: 'bg-emerald-50' },
  past_due:  { label: 'متأخر الدفع',  color: 'text-amber-700',   bg: 'bg-amber-50'   },
  expired:   { label: 'منتهي',        color: 'text-slate-700', bg: 'bg-slate-50' },
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [merchantLimits, setMerchantLimits] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<any>(null);
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [paymentStep, setPaymentStep] = useState(0); // 0: Form, 1: Connecting, 2: Balance, 3: Transferring, 4: Success

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes, invRes] = await Promise.allSettled([
        axios.get('/subscriptions/plans'),
        axios.get('/subscriptions/my'),
        axios.get('/subscriptions/invoices'),
      ]);
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data.data || []);
      if (subRes.status === 'fulfilled') {
        setSubscription(subRes.value.data.data?.subscription);
        setMerchantLimits(subRes.value.data.data?.merchantLimits);
      }
      if (invRes.status === 'fulfilled') setInvoices(invRes.value.data.data || []);
    } catch (err: any) {
      setError('فشل تحميل بيانات الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await axios.post('/subscriptions/subscribe', { planId, billingCycle });
      await fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل الاشتراك');
    }
  };

  const handleDowngrade = async (planId: string) => {
    setActionLoading(planId);
    try {
      await axios.post('/subscriptions/downgrade', { planId });
      await fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل التخفيض');
    } finally { setActionLoading(''); }
  };

  const handleCancel = async () => {
    setActionLoading('cancel');
    try {
      await axios.post('/subscriptions/cancel', { reason: cancelReason });
      setShowCancel(false);
      await fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل الإلغاء');
    } finally { setActionLoading(''); }
  };

  const initiateSubscribe = (plan: any) => {
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
    if (price === 0) {
      handleSubscribe(plan.id);
      return;
    }
    setPaymentTarget({
      type: 'subscribe',
      planId: plan.id,
      price,
      name: plan.nameEn
    });
    setCardForm({ number: '', name: '', expiry: '', cvv: '' });
    setPaymentStep(0);
    setShowPaymentModal(true);
  };

  const initiateUpgrade = (plan: any) => {
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
    setPaymentTarget({
      type: 'upgrade',
      planId: plan.id,
      price,
      name: plan.nameEn
    });
    setCardForm({ number: '', name: '', expiry: '', cvv: '' });
    setPaymentStep(0);
    setShowPaymentModal(true);
  };

  const initiateBuyCredits = (credits: number, price: number) => {
    setPaymentTarget({
      type: 'buy_credits',
      credits,
      price,
      name: `حزمة ${credits} نقطة ذكاء اصطناعي`
    });
    setCardForm({ number: '', name: '', expiry: '', cvv: '' });
    setPaymentStep(0);
    setShowPaymentModal(true);
  };

  const processSimulatedPayment = () => {
    setPaymentStep(1); // Connecting to bank
    
    setTimeout(() => {
      setPaymentStep(2); // Verifying balance
      
      setTimeout(() => {
        setPaymentStep(3); // Transferring funds
        
        setTimeout(async () => {
          setPaymentStep(4); // Success!
          
          setTimeout(async () => {
            // Trigger actual API call
            try {
              if (paymentTarget.type === 'subscribe') {
                await axios.post('/subscriptions/subscribe', { planId: paymentTarget.planId, billingCycle });
              } else if (paymentTarget.type === 'upgrade') {
                await axios.post('/subscriptions/upgrade', { planId: paymentTarget.planId, billingCycle });
              } else if (paymentTarget.type === 'buy_credits') {
                await axios.post('/subscriptions/buy-ai-credits', { credits: paymentTarget.credits });
              }
              await fetchAll();
              setShowPaymentModal(false);
            } catch (err: any) {
              alert(err.response?.data?.message || 'فشل إتمام العملية البرمجية');
            } finally {
              setPaymentStep(0);
            }
          }, 1200); // Wait on success screen
        }, 800);
      }, 800);
    }, 800);
  };

  const getPlanAction = (plan: any) => {
    if (!subscription) return { label: 'اشترك الآن', action: () => initiateSubscribe(plan), type: 'subscribe' };
    const planOrder = ['free_trial', 'starter', 'professional', 'business'];
    const currentIdx = planOrder.indexOf(subscription.plan);
    const planIdx = planOrder.indexOf(plan.id);
    if (plan.id === subscription.plan) return { label: 'باقتك الحالية', disabled: true, type: 'current' };
    if (planIdx > currentIdx) return { label: 'ترقية', action: () => initiateUpgrade(plan), type: 'upgrade' };
    if (plan.id !== 'free_trial') return { label: 'تخفيض', action: () => handleDowngrade(plan.id), type: 'downgrade' };
    return { label: 'غير متاح', disabled: true, type: 'disabled' };
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-matgarco-500" size={40} /></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2"><AlertCircle size={18} /> {error}</div>;

  const currentPlanColors = subscription ? PLAN_COLORS[subscription.plan] : PLAN_COLORS.free_trial;
  const currentStatus = subscription ? STATUS_LABELS[subscription.status] : null;

  return (
    <div className="space-y-8 font-cairo">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-matgarco-50 text-matgarco-600 flex items-center justify-center"><CreditCard size={20} /></div>
          الاشتراك والفواتير
        </h1>
        <p className="text-slate-500 mt-1 font-medium">إدارة باقتك، ترقية خطتك، شحن رصيد الذكاء الاصطناعي ومراجعة الفواتير.</p>
      </div>

      {/* Current Subscription Card */}
      {subscription ? (
        <div className={clsx('rounded-2xl border p-6 shadow-xs', currentPlanColors.bg, currentPlanColors.border)}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {(() => { const Icon = PLAN_ICONS[subscription.plan] || Zap; return (
                <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center', currentPlanColors.text, 'bg-white shadow-sm')}>
                  <Icon size={28} />
                </div>
              ); })()}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className={clsx('text-xl font-black', currentPlanColors.text)}>{subscription.plan?.replace('_', ' ')?.toUpperCase()}</h2>
                  {currentStatus && (
                    <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs', currentStatus.bg, currentStatus.color)}>
                      {currentStatus.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1 font-bold"><CalendarDays size={14} /> تجديد: {new Date(subscription.currentPeriodEnd).toLocaleDateString('ar')}</span>
                  <span className="flex items-center gap-1 font-bold"><RefreshCw size={14} /> {subscription.autoRenew ? 'تجديد تلقائي' : 'بدون تجديد'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={clsx('text-2xl font-black', currentPlanColors.text)}>{subscription.amount} <span className="text-sm font-bold">ج.م</span></div>
                <div className="text-xs text-slate-400 font-bold">{subscription.billingCycle === 'yearly' ? 'سنوياً' : 'شهرياً'}</div>
              </div>
              {subscription.status !== 'cancelled' && (
                <button onClick={() => setShowCancel(true)} className="px-4 py-2 rounded-xl border border-red-200 text-red-650 text-xs font-bold hover:bg-red-50 transition-colors">
                  إلغاء الاشتراك
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3">
          <AlertCircle className="text-amber-650 shrink-0" />
          <div>
            <div className="font-bold text-amber-900">لا يوجد اشتراك نشط</div>
            <div className="text-xs text-amber-700 font-bold">اختر باقة من القائمة أدناه للبدء.</div>
          </div>
        </div>
      )}

      {/* AI Credits Section */}
      {merchantLimits && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          
          {/* AI Credits Balance Card */}
          <div className="lg:border-l lg:border-slate-100 lg:pl-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">🤖</div>
                رصيد الذكاء الاصطناعي
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">يُستخدم لتوليد أوصاف المنتجات وكتابة المحتوى بالذكاء الاصطناعي لمتجرك.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500">الاستهلاك هذا الشهر</span>
                <span className="text-2xl font-black text-slate-900">
                  {merchantLimits.aiCreditsUsed} 
                  <span className="text-xs font-bold text-slate-400 mr-1">/ {merchantLimits.aiCreditsPerMonth === -1 ? '∞' : merchantLimits.aiCreditsPerMonth}</span>
                </span>
              </div>

              {merchantLimits.aiCreditsPerMonth !== -1 && (
                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={clsx(
                        "h-full rounded-full transition-all duration-500",
                        (merchantLimits.aiCreditsUsed / merchantLimits.aiCreditsPerMonth) > 0.85 ? "bg-red-500" : (merchantLimits.aiCreditsUsed / merchantLimits.aiCreditsPerMonth) > 0.6 ? "bg-amber-500" : "bg-indigo-650"
                      )}
                      style={{ width: `${Math.min(100, (merchantLimits.aiCreditsUsed / merchantLimits.aiCreditsPerMonth) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>المتبقي: {Math.max(0, merchantLimits.aiCreditsPerMonth - merchantLimits.aiCreditsUsed)} نقطة</span>
                    <span>{Math.round((merchantLimits.aiCreditsUsed / merchantLimits.aiCreditsPerMonth) * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Credits Packages */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">شحن رصيد إضافي</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">شراء نقاط إضافية صالحة للاستخدام الفوري عند نفاد رصيد خطتك الأساسية.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'pkg1', credits: 100, price: 50, pricePerCredit: 0.5, desc: 'بدء سريع ومناسب للتجربة' },
                { id: 'pkg2', credits: 500, price: 200, pricePerCredit: 0.4, desc: 'باقة التوفير (وفر 20%)', popular: true },
                { id: 'pkg3', credits: 1000, price: 350, pricePerCredit: 0.35, desc: 'للشركات الكبيرة (وفر 30%)' },
              ].map(pkg => (
                <div 
                  key={pkg.id} 
                  className={clsx(
                    "rounded-2xl border-2 p-4 flex flex-col justify-between gap-3 bg-white relative transition-all hover:border-indigo-400",
                    pkg.popular ? "border-indigo-500 shadow-sm" : "border-slate-200"
                  )}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-indigo-650 text-white text-[9px] font-extrabold rounded-full">
                      الأكثر شعبية
                    </span>
                  )}
                  <div>
                    <div className="text-lg font-black text-slate-950">+{pkg.credits} نقطة</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5 leading-relaxed">{pkg.desc}</div>
                  </div>
                  
                  <div className="border-t border-slate-50 pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-indigo-600">{pkg.price}</span>
                      <span className="text-[10px] font-bold text-slate-400 mr-0.5">ج.م</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">({pkg.pricePerCredit} ج/نقطة)</span>
                  </div>

                  <button
                    onClick={() => initiateBuyCredits(pkg.credits, pkg.price)}
                    className={clsx(
                      "w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95",
                      pkg.popular ? "bg-indigo-650 text-white hover:bg-indigo-750 shadow-md shadow-indigo-600/10" : "bg-slate-100 text-slate-705 hover:bg-slate-200"
                    )}
                  >
                    شراء الآن
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">اختر باقتك</h3>
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
          <button onClick={() => setBillingCycle('monthly')} className={clsx('px-4 py-1.5 rounded-lg text-xs font-bold transition-colors', billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}>شهري</button>
          <button onClick={() => setBillingCycle('yearly')} className={clsx('px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5', billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}>
            سنوي <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">وفر 17%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => {
          const colors = PLAN_COLORS[plan.id] || PLAN_COLORS.starter;
          const Icon = PLAN_ICONS[plan.id] || Zap;
          const { label, action, disabled, type } = getPlanAction(plan) as any;
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
          const isCurrent = type === 'current';

          return (
            <div key={plan.id} className={clsx('rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all', isCurrent ? `${colors.border} ${colors.bg}` : 'border-slate-200 bg-white hover:border-matgarco-300')}>
              <div>
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colors.bg, colors.text)}><Icon size={20} /></div>
                <h4 className="text-lg font-extrabold text-slate-900">{plan.nameEn}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-slate-900">{price}</span>
                  <span className="text-sm text-slate-500">ج.م/{billingCycle === 'yearly' ? 'سنة' : 'شهر'}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.commission > 0 && (
                  <li className="flex items-center gap-2 text-sm text-amber-700">
                    <AlertCircle size={14} className="shrink-0" />
                    عمولة منصة {plan.commission}%
                  </li>
                )}
              </ul>

              <button
                onClick={action}
                disabled={disabled || !!actionLoading}
                className={clsx(
                  'w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 active:scale-98',
                  isCurrent
                    ? `${colors.bg} ${colors.text} border ${colors.border} cursor-default`
                    : type === 'upgrade'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-350'
                    : type === 'subscribe'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-350'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-205 disabled:bg-slate-50 disabled:text-slate-400'
                )}
              >
                {actionLoading === plan.id ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                {label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Invoices Table */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Receipt size={18} className="text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">سجل الفواتير والعمليات المالية</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">رقم الفاتورة</th>
                  <th className="px-6 py-3.5 font-bold">الوصف</th>
                  <th className="px-6 py-3.5 font-bold">المبلغ</th>
                  <th className="px-6 py-3.5 font-bold">الحالة</th>
                  <th className="px-6 py-3.5 font-bold">طريقة الدفع</th>
                  <th className="px-6 py-3.5 font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv: any) => (
                  <tr key={inv._id || inv.invoiceNumber} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 font-bold">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-slate-700 font-bold">{inv.description}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{inv.amount?.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-2.5 py-1 rounded-full text-xs font-bold shadow-xs', inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : inv.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700')}>
                        {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'failed' ? 'فشل' : inv.status === 'refunded' ? 'مسترجعة' : 'معلقة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-555 font-bold text-xs">{inv.paymentMethod === 'credit_card' ? '💳 بطاقة ائتمانية' : '🏢 تحويل يدوي'}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs font-bold">{new Date(inv.createdAt).toLocaleDateString('ar')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowCancel(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-black text-red-700 flex items-center gap-2"><XCircle size={20} /> تأكيد الإلغاء</h3>
              <button onClick={() => setShowCancel(false)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
            </div>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed font-medium">سيستمر وصولك لمتجرك حتى نهاية فترة الاشتراك الحالية. هل أنت متأكد من رغبتك في الإلغاء؟</p>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">سبب الإلغاء (اختياري)</label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-red-500 resize-none text-sm font-medium" placeholder="أخبرنا لماذا تلغي اشتراكك..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm">تراجع</button>
              <button onClick={handleCancel} disabled={!!actionLoading} className="flex-1 py-2.5 rounded-xl bg-red-650 text-white font-bold hover:bg-red-750 text-sm disabled:bg-slate-400 flex items-center justify-center gap-2">
                {actionLoading === 'cancel' ? <Loader2 size={16} className="animate-spin" /> : null} تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => {
          if (paymentStep === 0) setShowPaymentModal(false);
        }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            {/* Left Card Preview Column */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white flex flex-col justify-between items-center gap-6 w-full md:w-56 shrink-0 relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-300 via-slate-50 to-slate-950 pointer-events-none" />
              
              <div className="w-full text-right border-b border-white/10 pb-2 z-10">
                <span className="text-[10px] text-slate-400 font-bold">ملخص الفاتورة</span>
                <div className="text-base font-black truncate leading-tight mt-0.5">{paymentTarget.name}</div>
                <div className="text-lg font-black text-indigo-400 mt-1 font-mono">{paymentTarget.price} ج.م</div>
              </div>

              {/* Styled Credit Card */}
              <div className="w-44 aspect-[1.586/1] bg-gradient-to-tr from-slate-800 to-slate-700 rounded-xl p-3 shadow-lg flex flex-col justify-between border border-white/10 relative overflow-hidden select-none scale-105 z-10">
                <div className="flex justify-between items-start">
                  <div className="w-6 h-5 rounded bg-amber-400/80 flex items-center justify-center overflow-hidden">
                    <span className="w-4 h-3 rounded bg-amber-500/20 border border-amber-600/40" />
                  </div>
                  {/* Card Brand */}
                  <span className="text-[9px] font-black italic tracking-widest text-slate-300">
                    {cardForm.number.startsWith('4') ? 'VISA' : cardForm.number.startsWith('5') ? 'MC' : 'CARD'}
                  </span>
                </div>
                
                <div className="text-[10px] font-mono tracking-wider text-center my-2 text-white font-bold">
                  {cardForm.number || '•••• •••• •••• ••••'}
                </div>

                <div className="flex justify-between items-end">
                  <div className="max-w-[70%] truncate">
                    <div className="text-[5px] text-slate-400 font-bold uppercase">صاحب البطاقة</div>
                    <div className="text-[8px] font-bold truncate tracking-wide">{cardForm.name?.toUpperCase() || 'NAME ON CARD'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[5px] text-slate-400 font-bold uppercase">انتهاء</div>
                    <div className="text-[8px] font-bold font-mono">{cardForm.expiry || 'MM/YY'}</div>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 text-center leading-relaxed z-10">
                💳 عملية دفع تجريبية آمنة. سيتم قبول أي بيانات مدخلة وتنشيط الحزمة فوراً.
              </div>
            </div>

            {/* Right Payment Form Column */}
            <div className="p-6 flex-1 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-650" /> تفاصيل الدفع
                </h3>
                {paymentStep === 0 && (
                  <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                )}
              </div>

              {paymentStep === 0 ? (
                /* Card Input Form */
                <form onSubmit={e => {
                  e.preventDefault();
                  processSimulatedPayment();
                }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم صاحب البطاقة</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ahmed Mohamed" 
                      value={cardForm.name}
                      onChange={e => setCardForm(p => ({ ...p, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم البطاقة</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="4000 1234 5678 9010" 
                      value={cardForm.number}
                      onChange={e => {
                        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        let match = val.slice(0, 16);
                        let parts = [];
                        for (let i = 0, len = match.length; i < len; i += 4) {
                          parts.push(match.substring(i, i + 4));
                        }
                        setCardForm(p => ({ ...p, number: parts.length > 0 ? parts.join(' ') : val }));
                      }}
                      maxLength={19}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all font-mono font-bold text-slate-800 tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="MM/YY" 
                        value={cardForm.expiry}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (val.length >= 2) {
                            setCardForm(p => ({ ...p, expiry: `${val.slice(0, 2)}/${val.slice(2, 4)}` }));
                          } else {
                            setCardForm(p => ({ ...p, expiry: val }));
                          }
                        }}
                        maxLength={5}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all font-mono font-bold text-slate-800 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رمز الأمان (CVV)</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="123" 
                        value={cardForm.cvv}
                        onChange={e => setCardForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                        maxLength={3}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all font-mono font-bold text-slate-800 text-center"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    إتمام الدفع الآمن
                  </button>
                </form>
              ) : (
                /* Processing Steps or Success Screen */
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                  {paymentStep < 4 ? (
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-650 animate-spin mx-auto" />
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-800 text-sm">
                          {paymentStep === 1 && 'جاري الاتصال بمصرف البطاقة...'}
                          {paymentStep === 2 && 'جاري التحقق من صلاحية ورصيد الحساب...'}
                          {paymentStep === 3 && 'جاري تفويض الدفع وإصدار الفاتورة...'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-bold">يرجى الانتظار، لا تغلق المتصفح</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in scale-in duration-300">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 size={32} />
                      </div>
                      <div className="space-y-1">
                        <div className="font-black text-emerald-700 text-base">تم الدفع بنجاح!</div>
                        <div className="text-xs text-slate-500 font-bold">تم تنشيط العملية فوراً وسجل الفواتير مُحدّث.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
