import nodemailer from 'nodemailer';
import nodemailerMjmlPlugin from 'nodemailer-mjml';
import { join } from 'path';
import queueService from '../queue';
import { get } from 'env-var';

class MailService {
  emailQueueName = 'email';
  transporter;
  constructor() {
    queueService.createQueue(
      this.emailQueueName,
      undefined,
      this.processMailJop.bind(this),
    );
    this.transporter = nodemailer.createTransport({
      host: get('SMTP_HOST').asString() || 'gmail',
      port: get('SMTP_PORT').asInt() || 587,
      secure: get('SMTP_SECURE').asBool() ?? false,
      auth: {
        user: get('SMTP_USER').required().asString(),
        pass: get('SMTP_PASS').required().asString(),
      },
    });
  }

  private async processMailJop(job: any) {
    const input = job.data ? job.data.input : job.input;
    const { subject, to, templateData, from, templateName } = input;
    this.transporter.use(
      'compile',
      nodemailerMjmlPlugin({
        templateFolder: join('mjml', 'templates'),
      }),
    );
    await this.transporter.sendMail({
      to,
      subject,
      from: from || 'test@test.com',
      templateName,
      templateData,
    });
  }
  async sendMail({
    subject,
    to,
    templateData,
    from,
    templateName,
  }: ISendMailOptions) {
    await queueService.addToQueue(this.emailQueueName, {
      input: {
        subject,
        to,
        templateData,
        from,
        templateName,
      },
    });
  }
}

export default new MailService();

interface ISendMailOptions {
  to: string;
  subject: string;
  from?: string;
  templateData?: any;
  templateName: 'sign-up' | 'sign-in' | 'otp';
}
