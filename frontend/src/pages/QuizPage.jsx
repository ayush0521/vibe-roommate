
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI, matchesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, ChevronLeft, Award, Sparkles, Loader2 } from 'lucide-react';

const FALLBACK_QUESTIONS = [
  {
    _id: '666879e60000000000000001',
    question: 'How clean do you keep your room normally?',
    category: 'cleanliness',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Super Messy', max: 'Immaculately clean' }
  },
  {
    _id: '666879e60000000000000002',
    question: 'How do you handle guests and hosting friends in the room?',
    category: 'social',
    type: 'mcq',
    options: [
      { text: 'No guests allowed in the room', value: 2 },
      { text: 'Occasional day guests only', value: 5 },
      { text: 'Frequent guests are okay', value: 8 },
      { text: 'Late-night parties are welcome', value: 10 }
    ]
  },
  {
    _id: '666879e60000000000000003',
    question: 'What is your typical sleep schedule?',
    category: 'sleep',
    type: 'mcq',
    options: [
      { text: 'Early Bird (Sleep by 9 PM - Up by 5 AM)', value: 2 },
      { text: 'Standard (Sleep by 11 PM - Up by 7 AM)', value: 6 },
      { text: 'Night Owl (Sleep after 2 AM - Up after 10 AM)', value: 10 }
    ]
  },
  {
    _id: '666879e60000000000000004',
    question: 'How do you study or work in your room?',
    category: 'study',
    type: 'mcq',
    options: [
      { text: 'Complete pin-drop silence is required', value: 2 },
      { text: 'Mild noise or soft music is fine', value: 6 },
      { text: 'I study with friends or play games', value: 9 }
    ]
  },
  {
    _id: '666879e60000000000000005',
    question: 'How do you handle conflict or chores sharing?',
    category: 'conflict',
    type: 'mcq',
    options: [
      { text: 'Prefer to handle all my cleaning myself', value: 3 },
      { text: 'Informal sharing, cleaning when needed', value: 7 },
      { text: 'Love structured rotas/charts for tasks', value: 10 }
    ]
  },
  {
    _id: '666879e60000000000000006',
    question: 'What is your budget sensitivity?',
    category: 'financial',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Extremely strict/budget saver', max: 'Flexible/willing to pay extra for comfort' }
  },
  {
    _id: '666879e60000000000000007',
    question: 'What is your food sharing preference?',
    category: 'food',
    type: 'mcq',
    options: [
      { text: 'Keep all food and utensils separate', value: 3 },
      { text: 'Okay with sharing sometimes', value: 7 },
      { text: 'Love group cooking and shared mess', value: 10 }
    ]
  },
  {
    _id: '666879e60000000000000008',
    question: 'How active is your lifestyle?',
    category: 'lifestyle',
    type: 'mcq',
    options: [
      { text: 'Chill / Homebody / Indoor focus', value: 2 },
      { text: 'Moderate / Balanced activity', value: 6 },
      { text: 'Very active / Gym / Outdoors focus', value: 10 }
    ]
  },
  {
    _id: '666879e60000000000000009',
    question: 'How do you deal with sharing space like washrooms?',
    category: 'cleanliness',
    type: 'mcq',
    options: [
      { text: 'Clean up only when it is dirty', value: 3 },
      { text: 'Wipe down and clean after usage', value: 7 },
      { text: 'Daily sanitization and deep scrubbing', value: 10 }
    ]
  },
  {
    _id: '666879e6000000000000000a',
    question: 'How talkative or social are you with roommates?',
    category: 'social',
    type: 'mcq',
    options: [
      { text: 'Keep to myself / Quiet personal time', value: 3 },
      { text: 'Friendly / Chatty occasionally', value: 7 },
      { text: 'Extremely outgoing / Love talking often', value: 10 }
    ]
  }
];

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState({}); // questionId -> value
  const [submitting, setSubmitting] = useState(false);
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await quizAPI.getQuestions();
        if (data.data && data.data.length > 0) {
          setQuestions(data.data);
        } else {
          setQuestions(FALLBACK_QUESTIONS);
        }
      } catch (err) {
        console.warn('API error loading questions. Loading fallback questions.', err);
        setQuestions(FALLBACK_QUESTIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const activeQuestion = questions[currentIndex];

  // Initialize selection for active question if empty
  useEffect(() => {
    if (activeQuestion && selections[activeQuestion._id] === undefined) {
      if (activeQuestion.type === 'slider') {
        setSelections((prev) => ({ ...prev, [activeQuestion._id]: 5 }));
      } else if (activeQuestion.options && activeQuestion.options.length > 0) {
        setSelections((prev) => ({ ...prev, [activeQuestion._id]: activeQuestion.options[0].value }));
      }
    }
  }, [activeQuestion, selections]);

  const handleSliderChange = (e) => {
    setSelections({ ...selections, [activeQuestion._id]: parseInt(e.target.value, 10) });
  };

  const handleOptionSelect = (val) => {
    setSelections({ ...selections, [activeQuestion._id]: val });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Map answers to backend format: [{ questionId, category, value }]
      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        category: q.category,
        value: selections[q._id] !== undefined ? selections[q._id] : 5,
      }));

      await quizAPI.submit({ answers: formattedAnswers });
      await matchesAPI.computeMatches().catch((e) => console.log('Matches auto-compute issue', e));
      await refreshProfile();
      toast.success('Quiz Submitted!');
      navigate('/quiz/result');
    } catch (err) {
      toast.error('Failed to submit quiz results');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex-center flex-col gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <p className="text-sm text-text-muted font-semibold">Loading compatibility quiz...</p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-xl glass overflow-hidden">
        {/* Progress header */}
        <div className="bg-surface-2 px-6 py-4 flex-between border-b border-border">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-emerald-500" />
            <span className="font-extrabold text-sm text-text">Compatibility Quiz</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full h-1 bg-border">
          <div className="h-full gradient-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Content with Animation */}
        <div className="p-8 min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeQuestion && (
              <motion.div
                key={activeQuestion._id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase self-start">
                  Category: {activeQuestion.category}
                </div>

                <h3 className="text-xl font-extrabold text-text leading-snug">
                  {activeQuestion.question}
                </h3>

                {activeQuestion.type === 'slider' ? (
                  <div className="flex flex-col gap-4 py-4">
                    <input
                      type="range"
                      min={activeQuestion.sliderMin || 1}
                      max={activeQuestion.sliderMax || 10}
                      className="vr-range-slider"
                      value={selections[activeQuestion._id] || 5}
                      onChange={handleSliderChange}
                    />
                    <div className="flex-between text-xs font-bold text-text-muted">
                      <span>{activeQuestion.sliderLabels?.min || 'Low'}</span>
                      <span className="text-emerald-600 bg-emerald-500/10 py-1 px-2.5 rounded-lg text-sm font-extrabold">
                        {selections[activeQuestion._id] || 5}
                      </span>
                      <span>{activeQuestion.sliderLabels?.max || 'High'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 py-2">
                    {activeQuestion.options?.map((opt, idx) => {
                      const isSelected = selections[activeQuestion._id] === opt.value;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOptionSelect(opt.value)}
                          className={`w-full text-left p-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                              : 'bg-surface hover:bg-surface-2 border-border text-text'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {isSelected && <Sparkles size={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex-between mt-10 pt-6 border-t border-border">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary flex items-center gap-1.5"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            {currentIndex < questions.length - 1 ? (
              <button onClick={handleNext} className="btn btn-primary flex items-center gap-1.5">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 shadow-lg text-white"
              >
                {submitting ? 'Submitting...' : 'Finish Quiz'} <Award size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
