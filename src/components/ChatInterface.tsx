import React, { useState } from 'react';
import { Card, AppButton } from './UI';

export const FeedbackInterface = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (feedback.trim()) {
      setSubmitted(true);
      setFeedback('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] p-4">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Lesson Feedback</h3>
        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
            <p className="text-white font-bold">Thank you! Your feedback has been submitted.</p>
            <AppButton onClick={() => setSubmitted(false)} variant="ghost" className="text-sm">Write another feedback</AppButton>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-brand-text-light">
              Did you enjoy today's lesson? Please leave your thoughts and suggestions about the learning process below.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              className="w-full h-40 p-4 border border-brand-blue/30 rounded-xl text-sm focus:outline-none focus:border-brand-blue resize-none shadow-inner"
            ></textarea>
            <AppButton fullWidth onClick={handleSubmit} disabled={!feedback.trim()}>
              Submit Feedback
            </AppButton>
          </div>
        )}
      </Card>
    </div>
  );
};

