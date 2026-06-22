"use client";

import { useState, useEffect } from "react";
import { 
  HelpCircle, Plus, Search, Filter, Eye, EyeOff, Tag, 
  ThumbsUp, Check, Save, Star, ChevronDown, ChevronUp 
} from "lucide-react";
import { api } from "@/lib/api";

const CATEGORIES = [
  "All", "React", "JavaScript", "Node", "SQL", "FastAPI", "System Design", "HR"
];

export default function QuestionBank() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    question: "",
    category: "React",
    answer: "",
    confidence_level: "Medium"
  });

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedConfidence, setSelectedConfidence] = useState("All");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestions();
      setQuestions(data);
    } catch (err) {
      console.error("Error loading question bank:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      await api.saveQuestion(formData);
      setMessage("Question added to bank!");
      setShowAddForm(false);
      setFormData({
        question: "",
        category: "React",
        answer: "",
        confidence_level: "Medium"
      });
      fetchQuestions();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(`Error: ${err.message || "Failed to save question"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReveal = (id: number) => {
    if (revealedIds.includes(id)) {
      setRevealedIds(prev => prev.filter(x => x !== id));
    } else {
      setRevealedIds(prev => [...prev, id]);
    }
  };

  const handleUpdateConfidence = async (item: any, newConf: string) => {
    try {
      await api.saveQuestion({
        id: item.id,
        question: item.question,
        category: item.category,
        answer: item.answer,
        confidence_level: newConf
      });
      fetchQuestions();
    } catch (err) {
      console.error("Error updating question confidence:", err);
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesConf = selectedConfidence === "All" || item.confidence_level === selectedConfidence;

    return matchesSearch && matchesCat && matchesConf;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Interview Question Bank</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Flashcards & Concepts • Revise Core Developer Interview Questions
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-safe hover:bg-safe-glow text-white shadow-md hover:shadow-[0_0_15px_var(--safe-glow)] font-bold text-xs border border-safe/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {message && (
        <div className="bg-safe/10 border border-safe/30 p-4 rounded-xl text-safe text-center font-bold text-sm shadow-[0_0_10px_var(--safe-glow)] animate-pulse">
          {message}
        </div>
      )}

      {/* Form Dialog to add question */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-container p-6 rounded-2xl border-white/5 space-y-4 animate-slideDown">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <HelpCircle className="w-5 h-5 text-safe shadow-[0_0_15px_var(--safe-glow)]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Log Interview Question</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="React">React</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Node">Node.js</option>
                <option value="SQL">SQL / Database</option>
                <option value="FastAPI">FastAPI</option>
                <option value="System Design">System Design</option>
                <option value="HR">HR / Behavioral</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Confidence Level</label>
              <select
                name="confidence_level"
                value={formData.confidence_level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="Low">Low (Needs Study)</option>
                <option value="Medium">Medium (Developing)</option>
                <option value="High">High (Mastered)</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Question Title</label>
              <input
                type="text"
                name="question"
                placeholder="e.g. What are React server components vs client components?"
                value={formData.question}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Suggested Answer / Bullet points</label>
              <textarea
                name="answer"
                rows={4}
                placeholder="Enter core explanation keywords, code blocks, or trade-offs..."
                value={formData.answer}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-5 rounded-lg bg-safe text-white hover:bg-safe-glow text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add to Bank"}
            </button>
          </div>
        </form>
      )}

      {/* Filter and search parameters */}
      <div className="glass-container p-6 rounded-2xl border-white/5 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-safe" />
              <span className="text-xs text-gray-400">Category:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>

            <select
              value={selectedConfidence}
              onChange={(e) => setSelectedConfidence(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
            >
              <option value="All">All Confidences</option>
              <option value="Low">Low Only</option>
              <option value="Medium">Medium Only</option>
              <option value="High">High Only</option>
            </select>
          </div>
        </div>

        {/* Accordions of questions */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 font-semibold animate-pulse">Loading question bank...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500 font-semibold">No questions found. Add some to test your recall!</div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((item) => {
              const isRevealed = revealedIds.includes(item.id);
              
              let confColor = "text-red-400 bg-red-400/5 border-red-500/20";
              if (item.confidence_level === "High") confColor = "text-safe bg-safe/5 border-safe/25 shadow-[0_0_8px_rgba(16,185,129,0.05)]";
              else if (item.confidence_level === "Medium") confColor = "text-amber-400 bg-amber-500/5 border-amber-500/20";

              return (
                <div 
                  key={item.id} 
                  className="glass-container p-5 rounded-2xl border-white/5 space-y-3 transition-colors hover:bg-white/[0.01]"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md text-purple-400 font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className={`text-[9px] border px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${confColor}`}>
                          {item.confidence_level} Confidence
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white leading-normal">
                        {item.question}
                      </h3>
                    </div>

                    {/* Actions and Reveal toggles */}
                    <div className="flex items-center gap-2 mt-2 md:mt-0 whitespace-nowrap">
                      
                      {/* Self confidence levels setters */}
                      <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Rate Recall:</span>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                        {["Low", "Medium", "High"].map((level) => (
                          <button
                            key={level}
                            onClick={() => handleUpdateConfidence(item, level)}
                            title={`Set confidence to ${level}`}
                            className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                              item.confidence_level === level 
                                ? "bg-safe text-white shadow-sm font-black" 
                                : "text-gray-500 hover:text-white"
                            }`}
                          >
                            {level[0]}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => toggleReveal(item.id)}
                        className="py-1 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Hide Answer
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Show Answer
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Revealed Answer box */}
                  {isRevealed && (
                    <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01] animate-slideDown">
                      <p className="text-xs text-gray-300 font-medium leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
