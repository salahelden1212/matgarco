import { queueService, JobType } from './queue.service';
import { sendEmailDirect } from './email.service';

export function registerWorkers() {
  // Email worker — delegates to the same sendEmailDirect used by synchronous fallback
  queueService.registerWorker(JobType.SEND_EMAIL, async (job) => {
    const { to, subject, body, merchantId } = job.data;
    await sendEmailDirect(merchantId, { to, subject, html: body });
  });

  // Notification worker
  queueService.registerWorker(JobType.SEND_NOTIFICATION, async (job) => {
    const { merchantId, type, title, message } = job.data;
    const Notification = require('../models/Notification').default;
    await Notification.create({ merchantId, type, title, message });
  });

  // AI credits worker
  queueService.registerWorker(JobType.DEDUCT_AI_CREDITS, async (job) => {
    const { merchantId, amount, service } = job.data;
    const Merchant = require('../models/Merchant').default;
    await Merchant.findByIdAndUpdate(merchantId, { $inc: { 'limits.aiCreditsUsed': amount } });
  });

  // Subscription renewal worker
  queueService.registerWorker(JobType.PROCESS_SUBSCRIPTION_RENEWAL, async (job) => {
    const { merchantId, planId } = job.data;
    const Subscription = require('../models/Subscription').default;
    const sub = await Subscription.findOne({ merchantId });
    if (!sub || sub.status !== 'active') return;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    sub.currentPeriodStart = new Date();
    sub.currentPeriodEnd = periodEnd;
    sub.invoices.push({
      invoiceNumber: `INV-${new Date().getFullYear()}-${Date.now()}`,
      amount: sub.amount,
      currency: 'EGP',
      status: 'paid',
      description: 'تجديد تلقائي للاشتراك',
      billingPeriodStart: new Date(),
      billingPeriodEnd: periodEnd,
      paidAt: new Date(),
      paymentMethod: 'auto_renew',
      createdAt: new Date(),
    });
    await sub.save();
  });

  // Payout worker
  queueService.registerWorker(JobType.PROCESS_PAYOUT, async (job) => {
    const { payoutId } = job.data;
    const Payout = require('../models/Payout').default;
    const payout = await Payout.findById(payoutId);
    if (!payout || payout.status !== 'pending') return;
    payout.status = 'processing';
    await payout.save();
  });
}
