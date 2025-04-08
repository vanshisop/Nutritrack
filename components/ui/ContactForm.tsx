import React, { useState } from 'react';
import { Button } from "@/components/ui/button"

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if email is valid
    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }

    // If all fields are filled and email is valid
    setIsSuccessDialogOpen(true);

    // You can reset form fields here if needed:
    setName('');
    setEmail('');
    setMessage('');
  };

  const validateEmail = (email:string) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Contact Us
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Have questions or feedback? We&apos;d love to hear from you!
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
              <input
                className="max-w-lg flex-1 p-2 border rounded-md"
                placeholder="Your Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="max-w-lg flex-1 p-2 border rounded-md"
                placeholder="Your Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {!isEmailValid && email && (
                <p className="text-red-500 text-sm">Please enter a valid email address.</p>
              )}
              <textarea
                className="max-w-lg flex-1 p-2 border rounded-md"
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                disabled={!name || !email || !message || !isEmailValid}
              >
                Send Message
              </Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </div>
      {isSuccessDialogOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold">Message Sent!</h3>
            <p>Your message has been sent successfully. We&apos;ll get back to you soon.</p>
            <button
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
              onClick={() => setIsSuccessDialogOpen(false)}
            >
            
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactForm;
