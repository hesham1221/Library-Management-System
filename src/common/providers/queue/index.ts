import Queue from 'bull';
import { get } from 'env-var';
class QueueService {
  private queues: { [queueName: string]: any } = {};
  createQueue(
    queueName: string,
    bullQueueOptions?: Queue.QueueOptions,
    worker?: Function,
  ): void {
    let queue;
    if (this.queues[queueName]) return;
    queue = new Queue(queueName, {
      redis: {
        host: get('REDIS_HOST').asString() || 'localhost',
        port: get('REDIS_PORT').asInt() || 6379,
      },
      ...bullQueueOptions,
    });
    if (worker) {
      queue.process((job, done) => {
        worker(job.data);
        done();
      });
    }
    this.queues[queueName] = queue;
  }

  async addToQueue(queueName: string, data: any, options?: any): Promise<void> {
    if (!this.queues[queueName]) throw new Error('Queue does not exists');
    const queue = this.queues[queueName] as Queue.Queue;
    queue.add(data, options);
  }

  async delayAProcess(
    queueName: string,
    jobId: string,
    delay: number,
  ): Promise<void> {
    if (!this.queues[queueName]) throw new Error('Queue does not exist');

    const queue = this.queues[queueName] as Queue.Queue;
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      await queue.add(job.data, { delay });
    }
  }

  async delayOrCreateWithDelay(
    queueName: string,
    jobId: string,
    data: any,
    delay: number,
    options?: Queue.JobOptions,
    overrideData?: boolean,
  ): Promise<void> {
    if (!this.queues[queueName]) throw new Error('Queue does not exist');

    const queue = this.queues[queueName] as Queue.Queue;
    const existingJob = await queue.getJob(jobId);

    if (existingJob) {
      // Remove the current job
      await existingJob.remove();

      // Re-add the job with the specified delay
      await queue.add(overrideData ? data : existingJob.data, {
        ...options,
        delay,
        jobId,
      });
    } else {
      // Create a new job with delay if the job doesn't exist
      await queue.add(data, { ...options, delay, jobId });
    }
  }

  addWorkerToQueue(queueName: string, worker: Function): void {
    if (!this.queues[queueName]) throw new Error('Queue does not exist');
    const queue = this.queues[queueName] as Queue.Queue;
    queue.process((job, done) => {
      try {
        const result = worker(job.data);
        done(null, result);
      } catch (error: any) {
        done(error);
      }
    });
  }

  removeFromQueue(queueName: string, jobId: string): void {
    if (!this.queues[queueName]) throw new Error('Queue does not exist');
    const queue = this.queues[queueName] as Queue.Queue;
    queue.getJob(jobId).then(job => {
      if (job) job.remove();
    });
  }
}
export default new QueueService();
