import emailjs from '@emailjs/browser';

// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with these variables: {{name}}, {{email}}, {{phone}}, {{message}}
// 4. Get your Public Key, Service ID, and Template ID from the dashboard
// 5. Replace the values below with your actual credentials

const EMAILJS_PUBLIC_KEY = 'CS8uDgHbDrWD5PJAp'; // Replace with your EmailJS Public Key
const EMAILJS_SERVICE_ID = 'service_oz0km2o'; // Replace with your EmailJS Service ID
const EMAILJS_TEMPLATE_ID = 'template_fhq2k2r'; // Replace with your EmailJS Template ID
const RECIPIENT_EMAIL = 'risr759@gmail.com'; // Your email address

// Initialize EmailJS
export const initEmailJS = () => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
};

// Send email function
export const sendContactEmail = async (formData: {
    name: string;
    email: string;
    phone: string;
    message: string;
}): Promise<{ success: boolean; message: string }> => {

    try {
        // Prepare template parameters
        const templateParams = {
            to_email: RECIPIENT_EMAIL,
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone || 'Not provided',
            message: formData.message,
            name: formData.name,
            email: formData.email,
        };

        // Send email
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        if (response.status === 200) {
            return {
                success: true,
                message: "Thanks for your message! I'll be in touch soon."
            };
        } else {
            return {
                success: false,
                message: 'Failed to send message. Please try again later.'
            };
        }
    } catch (error) {
        console.error('EmailJS error:', error);
        return {
            success: false,
            message: 'Failed to send message. Please try again later.'
        };
    }
};

