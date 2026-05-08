import nodemailer from 'nodemailer';
import Merchant from '../models/Merchant';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Creates a transporter based on merchant's custom SMTP or the platform's default.
 */
const getTransporter = async (merchantId?: string) => {
  // Default platform SMTP (from .env)
  let config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: `"${process.env.SMTP_FROM_NAME || 'متجركو'}" <${process.env.SMTP_FROM_EMAIL}>`,
  };

  // If a merchant ID is provided, check if they have custom SMTP enabled
  if (merchantId) {
    const merchant = await Merchant.findById(merchantId).select('+emailSettings.smtpPass');
    if (merchant && merchant.emailSettings?.enabled && merchant.emailSettings?.provider === 'smtp' && merchant.emailSettings.smtpHost) {
      config = {
        host: merchant.emailSettings.smtpHost,
        port: merchant.emailSettings.smtpPort || 587,
        secure: merchant.emailSettings.smtpPort === 465,
        auth: {
          user: merchant.emailSettings.smtpUser,
          pass: merchant.emailSettings.smtpPass,
        },
        from: `"${merchant.emailSettings.fromName || merchant.storeName}" <${merchant.emailSettings.fromEmail || merchant.emailSettings.smtpUser}>`,
      };
    } else if (merchant) {
      // Fallback to platform default but customize 'from' name if possible
      config.from = `"${merchant.storeName}" <${process.env.SMTP_FROM_EMAIL}>`;
    }
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
  });

  return { transporter, from: config.from };
};

/**
 * Sends an email
 */
export const sendEmail = async (merchantId: string | undefined, options: EmailOptions): Promise<void> => {
  try {
    const { transporter, from } = await getTransporter(merchantId);

    // Make sure we have credentials before attempting
    if (!transporter.options.auth?.user) {
      console.log('⚠️ Email skipped: No SMTP credentials configured.');
      return;
    }

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    // We don't throw here to avoid breaking the main flows (like order creation)
  }
};

/**
 * Base HTML Template Wrapper
 */
const wrapHTML = (content: string, storeName: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 20px;
      direction: rtl;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .header {
      background: #2563eb;
      color: #ffffff;
      padding: 24px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 32px 24px;
      color: #374151;
      line-height: 1.6;
    }
    .footer {
      background: #f3f4f6;
      padding: 16px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${storeName}
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      هذه رسالة تلقائية من ${storeName} عبر منصة متجركو.<br>
      جميع الحقوق محفوظة &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
`;

/**
 * Send Order Confirmation
 */
export const sendOrderConfirmationEmail = async (
  merchantId: string, 
  storeName: string, 
  customerEmail: string, 
  customerName: string, 
  orderNumber: string, 
  total: number,
  customTemplate?: string
) => {
  let content = customTemplate || `
    <h2>مرحباً ${customerName}،</h2>
    <p>شكراً لتسوقك من <strong>${storeName}</strong>!</p>
    <p>لقد استلمنا طلبك رقم <strong>#${orderNumber}</strong> بنجاح، وسنقوم بتجهيزه في أقرب وقت ممكن.</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #0f172a;">تفاصيل الطلب:</h3>
      <p style="margin-bottom: 0;"><strong>الإجمالي:</strong> ${total.toFixed(2)} ج.م</p>
    </div>
    <p>سنقوم بإرسال رسالة أخرى لك عندما يتم تحديث حالة طلبك.</p>
  `;

  // Basic variable substitution if using custom template
  content = content.replace(/{{customerName}}/g, customerName)
                   .replace(/{{orderNumber}}/g, orderNumber)
                   .replace(/{{total}}/g, total.toFixed(2))
                   .replace(/{{storeName}}/g, storeName);

  await sendEmail(merchantId, {
    to: customerEmail,
    subject: `تأكيد طلبك رقم #${orderNumber} من ${storeName}`,
    html: wrapHTML(content, storeName),
  });
};

/**
 * Send Order Status Update
 */
export const sendOrderStatusEmail = async (
  merchantId: string, 
  storeName: string, 
  customerEmail: string, 
  customerName: string, 
  orderNumber: string, 
  statusLabel: string,
  customTemplate?: string
) => {
  let content = customTemplate || `
    <h2>مرحباً ${customerName}،</h2>
    <p>نود إعلامك بأنه قد تم تحديث حالة طلبك رقم <strong>#${orderNumber}</strong> لدى <strong>${storeName}</strong>.</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3 style="margin: 0; color: #2563eb;">الحالة الجديدة: ${statusLabel}</h3>
    </div>
    <p>شكراً لثقتكم بنا!</p>
  `;

  content = content.replace(/{{customerName}}/g, customerName)
                   .replace(/{{orderNumber}}/g, orderNumber)
                   .replace(/{{status}}/g, statusLabel)
                   .replace(/{{storeName}}/g, storeName);

  await sendEmail(merchantId, {
    to: customerEmail,
    subject: `تحديث بخصوص طلبك #${orderNumber}`,
    html: wrapHTML(content, storeName),
  });
};

/**
 * Test SMTP Connection
 */
export const testSmtpConnection = async (config: any, toEmail: string): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.verify();
    
    await transporter.sendMail({
      from: `"${config.fromName || 'Test'}" <${config.fromEmail || config.user}>`,
      to: toEmail,
      subject: "اختبار إعدادات البريد - متجركو",
      html: "<h3 dir='rtl'>تم إعداد بريدك الإلكتروني بنجاح!</h3><p dir='rtl'>إذا وصلتك هذه الرسالة، فهذا يعني أن إعدادات الـ SMTP الخاصة بك صحيحة تماماً.</p>",
    });

    return true;
  } catch (error) {
    console.error('SMTP Test Failed:', error);
    throw error;
  }
};
