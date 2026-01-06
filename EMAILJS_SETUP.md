# EmailJS Setup Guide

This guide will help you set up EmailJS to receive contact form submissions at **risr759@gmail.com**.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account (free tier includes 200 emails/month)

## Step 2: Add Email Service

1. After logging in, go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended if you use Gmail)
   - **Outlook** (if you use Outlook)
   - Or any other supported provider
4. Follow the setup instructions for your email provider
5. Note down your **Service ID** (e.g., `service_xxxxxxx`)

## Step 3: Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template structure:

**Subject:** New Contact Form Submission from {{name}}

**Content:**
```
Hello,

You have received a new message from your portfolio contact form.

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Message:
{{message}}

---
This email was sent from your portfolio website.
```

4. Click **Save**
5. Note down your **Template ID** (e.g., `template_xxxxxxx`)

## Step 4: Get Your Public Key

1. Go to **Account** → **General** in the dashboard
2. Find your **Public Key** (e.g., `xxxxxxxxxxxxx`)
3. Copy it

## Step 5: Configure the Application

1. Open `emailService.ts` in your project
2. Replace the placeholder values:
   - `YOUR_PUBLIC_KEY` → Your EmailJS Public Key
   - `YOUR_SERVICE_ID` → Your EmailJS Service ID
   - `YOUR_TEMPLATE_ID` → Your EmailJS Template ID
3. The recipient email is already set to: `risr759@gmail.com`

## Step 6: Test the Contact Form

1. Start your development server: `npm run dev`
2. Navigate to the contact page
3. Fill out and submit the contact form
4. Check your email inbox at **risr759@gmail.com** for the test message

## Troubleshooting

- **Emails not sending?** Check the browser console for errors
- **Service not configured error?** Make sure you've replaced all placeholder values in `emailService.ts`
- **Rate limit exceeded?** Free tier allows 200 emails/month. Upgrade if needed.

## Security Note

The EmailJS Public Key is safe to expose in client-side code. However, for production, consider:
- Using environment variables
- Setting up rate limiting
- Adding CAPTCHA to prevent spam

## Support

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: Check their website for support options


