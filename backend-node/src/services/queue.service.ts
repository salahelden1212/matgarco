import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

export enum JobType {
  SEND_EMAIL = 'send-email',
  PROCESS_PAYOUT = 'process-payout',
  DEDUCT_AI_CREDITS = 'deduct-ai-credits',
  SEND_NOTIFICATION = 'send-notification',
  PROCESS_SUBSCRIPTION_RENEWAL = 'process-subscription-renewal',
  EXPORT_DATA = 'export-data',
}

interface JobDataMap {
  [JobType.SEND_EMAIL]: { to: string; subject: string; body: string; merchantId?: string };
  [JobType.PROCESS_PAYOUT]: { payoutId: string; merchantId: string };
  [JobType.DEDUCT_AI_CREDITS]: { merchantId: string; amount: number; service: string };
  [JobType.SEND_NOTIFICATION]: { merchantId: string; type: string; title: string; message: string };
  [JobType.PROCESS_SUBSCRIPTION_RENEWAL]: { merchantId: string; planId: string };
  [JobType.EXPORT_DATA]: { merchantId: string; format: 'json' | 'csv'; collections: string[] };
}

class QueueService {
  private queues = new Map<JobType, Queue>();
  private workers = new Map<JobType, Worker>();
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    for (const jobType of Object.values(JobType)) {
      const queue = new Queue(jobType, { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } } });
      this.queues.set(jobType, queue);
    }
  }

  async add<T extends JobType>(type: T, data: JobDataMap[T], opts?: { delay?: number; priority?: number }): Promise<Job | null> {
    if (!this.initialized) this.init();
    const queue = this.queues.get(type);
    if (!queue) return null;
    return queue.add(type, data, opts);
  }

  registerWorker<T extends JobType>(
    type: T,
    handler: (job: Job<JobDataMap[T]>) => Promise<void>,
    concurrency: number = 5,
  ) {
    if (!this.initialized) this.init();
    const worker = new Worker<JobDataMap[T]>(
      type,
      async (job) => {
        try {
          await handler(job);
        } catch (err) {
          throw err;
        }
      },
      { connection, concurrency },
    );
    this.workers.set(type, worker as any);

    worker.on('failed', (job, err) => {
      console.error(`[Queue] Job ${job?.id} failed (${type}):`, err.message);
    });

    worker.on('completed', (job) => {
      console.log(`[Queue] Job ${job.id} completed (${type})`);
    });
  }

  async close() {
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    await connection.quit();
  }

  async getQueueCounts(type: JobType) {
    const queue = this.queues.get(type);
    if (!queue) return { waiting: 0, active: 0, completed: 0, failed: 0 };
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed');
    return counts;
  }
}

export const queueService = new QueueService();
