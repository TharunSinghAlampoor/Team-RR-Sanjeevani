import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FRONTEND_QUESTIONS, BACKEND_QUESTIONS } from '../data/interviewQuestionsData';
import {
  Search, Code, Server, BookOpen, ChevronDown, ChevronUp,
  Copy, Check, ArrowLeft, Sparkles, Filter, CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export const InterviewPrepPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'frontend' | 'backend'
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  // Combine questions
  const allQuestions = useMemo(() => {
    const fe = FRONTEND_QUESTIONS.map((q, i) => ({ ...q, type: 'Frontend', index: i + 1 }));
    const be = BACKEND_QUESTIONS.map((q, i) => ({ ...q, type: 'Backend', index: i + 1 }));
    return [...fe, ...be];
  }, []);

  // Subcategories
  const subCategories = useMemo(() => {
    let list = [];
    if (activeTab === 'frontend') {
      list = FRONTEND_QUESTIONS.map(q => q.category);
    } else if (activeTab === 'backend') {
      list = BACKEND_QUESTIONS.map(q => q.category);
    } else {
      list = allQuestions.map(q => q.category);
    }
    return ['All', ...Array.from(new Set(list))];
  }, [activeTab, allQuestions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      // Tab filter
      if (activeTab === 'frontend' && q.type !== 'Frontend') return false;
      if (activeTab === 'backend' && q.type !== 'Backend') return false;

      // Subcategory filter
      if (selectedSubCategory !== 'All' && q.category !== selectedSubCategory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchQ = q.question.toLowerCase().includes(query);
        const matchA = q.answer.toLowerCase().includes(query);
        const matchCat = q.category.toLowerCase().includes(query);
        return matchQ || matchA || matchCat;
      }

      return true;
    });
  }, [allQuestions, activeTab, selectedSubCategory, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set(filteredQuestions.map(q => q.id));
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
      <Navbar user={user} onLogout={logout} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        {/* Top Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.4rem 1rem', borderRadius: '99px', color: '#047857', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>
            <Sparkles style={{ width: 16, height: 16 }} />
            Full-Stack Technical Interview Guide (100 Questions)
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Top 50 Frontend + Top 50 Backend Questions
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            Master core theoretical concepts across React, JavaScript, Java Core, Spring Boot, Microservices, Security, Databases, and Web Performance.
          </p>
        </div>

        {/* Tab Selection (All, Frontend 50, Backend 50) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setActiveTab('all'); setSelectedSubCategory('All'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', borderRadius: '0.75rem',
              fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: activeTab === 'all' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : '#ffffff',
              color: activeTab === 'all' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'all' ? '0 4px 14px rgba(5, 150, 105, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <BookOpen style={{ width: 18, height: 18 }} />
            All Questions (100)
          </button>

          <button
            onClick={() => { setActiveTab('frontend'); setSelectedSubCategory('All'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', borderRadius: '0.75rem',
              fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: activeTab === 'frontend' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#ffffff',
              color: activeTab === 'frontend' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'frontend' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <Code style={{ width: 18, height: 18 }} />
            Frontend 50 Questions
          </button>

          <button
            onClick={() => { setActiveTab('backend'); setSelectedSubCategory('All'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', borderRadius: '0.75rem',
              fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: activeTab === 'backend' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#ffffff',
              color: activeTab === 'backend' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'backend' ? '0 4px 14px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <Server style={{ width: 18, height: 18 }} />
            Backend 50 Questions
          </button>
        </div>

        {/* Search & Utility Bar */}
        <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '1rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search questions by topic (e.g. React, Spring Boot, JWT, Garbage Collection)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 1rem 0.65rem 2.6rem', borderRadius: '0.6rem', border: '1.5px solid #cbd5e1',
                  outline: 'none', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', background: '#f8fafc',
                }}
              />
            </div>

            {/* Expand / Collapse Controls */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={expandAll}
                style={{ padding: '0.55rem 0.9rem', borderRadius: '0.55rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                style={{ padding: '0.55rem 0.9rem', borderRadius: '0.55rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Subcategories Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            <Filter style={{ width: 14, height: 14, color: '#64748b', flexShrink: 0, marginRight: '0.2rem' }} />
            {subCategories.map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedSubCategory(sc)}
                style={{
                  padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700,
                  whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                  background: selectedSubCategory === sc ? '#0f172a' : '#f1f5f9',
                  color: selectedSubCategory === sc ? '#ffffff' : '#475569',
                }}
              >
                {sc}
              </button>
            ))}
          </div>
        </div>

        {/* Counter Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#475569' }}>
            Showing {filteredQuestions.length} Questions
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Questions Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredQuestions.length === 0 ? (
            <div style={{ background: '#ffffff', padding: '3rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#64748b', margin: 0 }}>
                No interview questions match your search filters.
              </p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isExpanded = expandedIds.has(q.id);
              const isFE = q.type === 'Frontend';

              return (
                <div
                  key={q.id}
                  style={{
                    background: '#ffffff', borderRadius: '0.9rem', border: '1.5px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden', transition: 'all 0.2s',
                  }}
                >
                  {/* Question Header Card */}
                  <div
                    onClick={() => toggleExpand(q.id)}
                    style={{
                      padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'flex-start',
                      justify: 'space-between', gap: '1rem', background: isExpanded ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
                      <span style={{
                        background: isFE ? '#dbeafe' : '#f3e8ff', color: isFE ? '#1e40af' : '#6b21a8',
                        fontWeight: 900, fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '0.4rem',
                        flexShrink: 0, marginTop: '2px',
                      }}>
                        {q.type} #{q.index}
                      </span>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '0.1rem 0.5rem', borderRadius: 4 }}>
                            {q.category}
                          </span>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 4,
                            background: q.difficulty === 'Basic' ? '#d1fae5' : q.difficulty === 'Intermediate' ? '#fef3c7' : '#fee2e2',
                            color: q.difficulty === 'Basic' ? '#065f46' : q.difficulty === 'Intermediate' ? '#92400e' : '#991b1b',
                          }}>
                            {q.difficulty}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                          {q.question}
                        </h3>
                      </div>
                    </div>

                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginTop: 4 }}>
                      {isExpanded ? <ChevronUp style={{ width: 20, height: 20 }} /> : <ChevronDown style={{ width: 20, height: 20 }} />}
                    </button>
                  </div>

                  {/* Answer Section */}
                  {isExpanded && (
                    <div style={{ padding: '1rem 1.25rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Answer & Explanation
                        </span>
                        <button
                          onClick={() => handleCopy(q.id, q.answer)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f8fafc',
                            border: '1px solid #cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '0.4rem',
                            fontSize: '0.75rem', fontWeight: 700, color: '#475569', cursor: 'pointer',
                          }}
                        >
                          {copiedId === q.id ? <Check style={{ width: 14, height: 14, color: '#059669' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                          <span>{copiedId === q.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#334155', margin: 0, fontWeight: 500 }}>
                        {q.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewPrepPage;
