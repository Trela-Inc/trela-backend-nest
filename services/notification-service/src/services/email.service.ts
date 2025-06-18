import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get('EMAIL_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    };

    this.transporter = nodemailer.createTransporter(emailConfig);

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email transporter verification failed:', error);
      } else {
        this.logger.log('Email server is ready to send messages');
      }
    });
  }

  async sendEmail(notification: Notification): Promise<boolean> {
    try {
      this.logger.log(`Sending email to ${notification.recipientEmail}`);

      const mailOptions = {
        from: this.configService.get('EMAIL_FROM', 'noreply@realestate.com'),
        to: notification.recipientEmail,
        subject: notification.subject,
        html: this.processTemplate(notification.content, notification.templateData),
        text: this.stripHtml(notification.content),
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully to ${notification.recipientEmail}. Message ID: ${result.messageId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${notification.recipientEmail}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = `
      <h1>Welcome to Real Estate Platform!</h1>
      <p>Hello {{name}},</p>
      <p>Thank you for joining our platform. We're excited to help you find your perfect property!</p>
      <p>Best regards,<br>The Real Estate Team</p>
    `;

    const notification = new Notification();
    notification.recipientEmail = userEmail;
    notification.subject = 'Welcome to Real Estate Platform';
    notification.content = template;
    notification.templateData = { name: userName };

    return this.sendEmail(notification);
  }

  async sendPropertyCreatedEmail(userEmail: string, propertyData: any): Promise<boolean> {
    const template = `
      <h2>Property Listed Successfully!</h2>
      <p>Your property has been successfully listed on our platform.</p>
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0;">
        <h3>{{property.title}}</h3>
        <p><strong>Price:</strong> ${{property.price}}</p>
        <p><strong>Location:</strong> {{property.city}}, {{property.state}}</p>
        <p><strong>Type:</strong> {{property.type}}</p>
      </div>
      <p>You can view and manage your listing from your dashboard.</p>
    `;

    const notification = new Notification();
    notification.recipientEmail = userEmail;
    notification.subject = 'Property Listed Successfully';
    notification.content = template;
    notification.templateData = { property: propertyData };

    return this.sendEmail(notification);
  }

  async sendPropertyInquiryEmail(agentEmail: string, inquiryData: any): Promise<boolean> {
    const template = `
      <h2>New Property Inquiry</h2>
      <p>You have received a new inquiry for your property.</p>
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0;">
        <h3>{{property.title}}</h3>
        <p><strong>From:</strong> {{inquiry.name}} ({{inquiry.email}})</p>
        <p><strong>Phone:</strong> {{inquiry.phone}}</p>
        <p><strong>Message:</strong></p>
        <p>{{inquiry.message}}</p>
      </div>
      <p>Please respond to this inquiry as soon as possible.</p>
    `;

    const notification = new Notification();
    notification.recipientEmail = agentEmail;
    notification.subject = 'New Property Inquiry';
    notification.content = template;
    notification.templateData = { 
      property: inquiryData.property,
      inquiry: inquiryData.inquiry 
    };

    return this.sendEmail(notification);
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    
    const template = `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="{{resetUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    const notification = new Notification();
    notification.recipientEmail = userEmail;
    notification.subject = 'Password Reset Request';
    notification.content = template;
    notification.templateData = { resetUrl };

    return this.sendEmail(notification);
  }

  private processTemplate(template: string, data: Record<string, any> = {}): string {
    try {
      const compiledTemplate = handlebars.compile(template);
      return compiledTemplate(data);
    } catch (error) {
      this.logger.error('Template processing error:', error);
      return template; // Return original template if processing fails
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error('Email connection test failed:', error);
      return false;
    }
  }
} 