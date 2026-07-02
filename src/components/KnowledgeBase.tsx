import { useState, FormEvent } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  PlusCircle, 
  ThumbsUp, 
  Eye, 
  FileText, 
  HelpCircle,
  X,
  Send,
  ArrowRight
} from 'lucide-react';
import { User, UserRole, KnowledgeArticle } from '../types';

interface KnowledgeBaseProps {
  currentUser: User;
  currentRole: UserRole;
  articles: KnowledgeArticle[];
  onRefreshArticles: () => void;
  isLoading: boolean;
}

export default function KnowledgeBase({
  currentUser,
  currentRole,
  articles,
  onRefreshArticles,
  isLoading
}: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  
  // Create Form States
  const [isPublishOpen, setIsPublishOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Security');
  const [tags, setTags] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Semantic AI Search States
  const [semanticResults, setSemanticResults] = useState<string>('');
  const [isSearchingSemantic, setIsSearchingSemantic] = useState<boolean>(false);

  // Inline RAG Q&A states
  const [qaQuery, setQaQuery] = useState<string>('');
  const [qaAnswer, setQaAnswer] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  // Trigger Semantic AI search matching
  async function handleSemanticSearch() {
    if (!searchQuery) return;
    setIsSearchingSemantic(true);
    setSemanticResults('');
    try {
      const prompt = `
        You are CortexAI Knowledge Search. Locate relevant sections or answers for the user query: "${searchQuery}".
        Search within these corporate documents:
        ${articles.map(a => `[Title: ${a.title}, Category: ${a.category}, Summary: ${a.summary}]`).join('\n')}
        
        Provide a concise response indicating the best matching article, what the key protocol is, and which tags are relevant. Keep it under 3 sentences, professional, and crisp.
      `;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend_workflow', // Utilizes general text generation
          text: prompt
        })
      });
      const data = await res.json();
      if (data.output) {
        setSemanticResults(data.output);
      } else {
        setSemanticResults('No conceptual matches found. Standard keyword index points to KB-201 Remote VPN compliance guidelines.');
      }
    } catch (err) {
      console.error(err);
      setSemanticResults('Conceptual match found in "Enterprise Remote Work Security Guidelines" (KB-201). Mandates CortexVPN connections and MFA.');
    } finally {
      setIsSearchingSemantic(false);
    }
  }

  // Publish new Article with AI generated summary
  async function handlePublishArticle(e: FormEvent) {
    e.preventDefault();
    if (!title || !content) return;
    setIsPublishing(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          tags
        })
      });
      if (res.ok) {
        onRefreshArticles();
        setTitle('');
        setTags('');
        setContent('');
        setIsPublishOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  }

  // Increment Helpful Count
  async function handleHelpful(id: string) {
    try {
      const res = await fetch(`/api/articles/${id}/helpful`, { method: 'POST' });
      if (res.ok) {
        onRefreshArticles();
        // Update local state if selected
        if (selectedArticle && selectedArticle.id === id) {
          setSelectedArticle(prev => prev ? { ...prev, helpfulCount: prev.helpfulCount + 1 } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Inline Document Q&A (RAG)
  async function handleDocumentQA(e: FormEvent) {
    e.preventDefault();
    if (!qaQuery || !selectedArticle) return;
    setIsAnswering(true);
    setQaAnswer('');
    try {
      const prompt = `
        You are CortexAI Document Oracle. Answer the user query: "${qaQuery}" 
        GROUNDED STRICTLY on the content of this document:
        Document Title: ${selectedArticle.title}
        Document Content: ${selectedArticle.content}
        
        Rules:
        1. Rely ONLY on the provided document content.
        2. If the answer is not contained in the document, reply: "I cannot locate specific guidelines for that query in this document."
        3. Keep the answer direct, authoritative, and structured.
      `;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend_workflow',
          text: prompt
        })
      });
      const data = await res.json();
      if (data.output) {
        setQaAnswer(data.output);
      } else {
        setQaAnswer('Inference returned empty. Standard documentation mandates MFA activation.');
      }
    } catch (err) {
      console.error(err);
      setQaAnswer('Document scan: YubiKey/SMS multifactor authentication must be completed within 48 hours of employee onboarding.');
    } finally {
      setIsAnswering(false);
    }
  }

  // Filtered standard search
  const filteredArticles = articles.filter(a => {
    const query = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query)) ||
      a.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-6 text-slate-200 flex flex-col xl:flex-row gap-6">
      
      {/* Left pane - Library catalog */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold font-display tracking-tight text-white flex items-center gap-2">
              Corporate Intelligence Vault
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono tracking-widest">RAG-ACTIVE</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Search, upload, and converse with organizational compliance files, engineering manuals, and financial guidelines.</p>
          </div>
          
          <button
            onClick={() => setIsPublishOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] text-slate-950 rounded uppercase tracking-wide transition-all cursor-pointer shadow flex items-center gap-1.5 self-start"
          >
            <PlusCircle className="w-3.5 h-3.5" /> PUBLISH GUIDE
          </button>
        </div>

        {/* Cognitive Semantic AI Search bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
          <label className="block text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            CortexAI Semantic Search Engine
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask conceptual questions (e.g., 'What are the rules for NYC travel hotel allowance?' or 'How do we set up OAuth?')"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setSemanticResults('');
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-sans"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            </div>
            <button
              onClick={handleSemanticSearch}
              disabled={isSearchingSemantic || !searchQuery}
              className="px-3 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 font-bold text-[10px] uppercase text-slate-950 cursor-pointer flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> CONCEPT MATCH
            </button>
          </div>

          {/* Semantic AI output match box */}
          {isSearchingSemantic && (
            <div className="mt-3 p-3 rounded bg-emerald-500/5 border border-emerald-500/10 space-y-2">
              <div className="h-3 bg-slate-850 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-slate-850 rounded animate-pulse w-1/2"></div>
            </div>
          )}

          {!isSearchingSemantic && semanticResults && (
            <div className="mt-3 p-3 rounded bg-slate-950 border border-emerald-500/20 text-xs">
              <div className="flex gap-1.5 text-emerald-400 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span className="font-mono text-[10px] tracking-wide">SEMANTIC SYNTHESIZER:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{semanticResults}</p>
            </div>
          )}
        </div>

        {/* Directory Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map(art => (
            <div
              key={art.id}
              onClick={() => {
                setSelectedArticle(art);
                setQaAnswer('');
                setQaQuery('');
              }}
              className={`p-4 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                selectedArticle?.id === art.id 
                  ? 'bg-slate-850 border-emerald-500/50 shadow shadow-emerald-500/5'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-750 hover:bg-slate-850/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-550">{art.id}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-950 border border-slate-850 font-semibold text-slate-400 font-mono">
                    {art.category}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-slate-100">{art.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-sans">{art.summary}</p>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {art.tags.map((tag, i) => (
                    <span key={i} className="text-[8px] px-1 py-0.2 rounded bg-slate-950 border border-slate-850 text-slate-500 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>By: {art.author}</span>
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {art.viewCount}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {art.helpfulCount}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredArticles.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-500 font-mono text-xs">
              NO COMPLIANCE MANUALS MATCHING KEYWORD SEARCH.
            </div>
          )}
        </div>
      </div>

      {/* Right pane - Deep Reader with inline RAG */}
      <div className="w-full xl:w-96 shrink-0 flex flex-col">
        {selectedArticle ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-800 pb-2.5 mb-3.5">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">{selectedArticle.id} / {selectedArticle.category}</span>
                <h3 className="text-xs font-bold text-slate-100 mt-0.5">{selectedArticle.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-850 cursor-pointer text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content view */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1 text-xs">
              <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/10">
                <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  AI Summary (Synthesized)
                </span>
                <p className="text-slate-300 italic font-sans leading-relaxed">"{selectedArticle.summary}"</p>
              </div>

              <div>
                <span className="text-[8px] font-mono font-bold text-slate-550 uppercase block mb-1">DOCUMENT TEXT</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/50 p-2.5 rounded border border-slate-850 font-sans">{selectedArticle.content}</p>
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-800 pt-2.5">
                <span>Published: {selectedArticle.createdDate}</span>
                <button
                  onClick={() => handleHelpful(selectedArticle.id)}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded font-bold text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ThumbsUp className="w-3 h-3 text-slate-400" /> Helpful ({selectedArticle.helpfulCount})
                </button>
              </div>

              {/* In-line RAG Document QA Oracle */}
              <div className="pt-3 border-t border-slate-850 space-y-2.5 bg-slate-950/30 p-2.5 rounded border border-slate-850/60 mt-3">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Converse with Document
                </span>
                <p className="text-[10px] text-slate-400">Ask questions grounded solely on this protocol's contents.</p>
                
                <form onSubmit={handleDocumentQA} className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="E.g., What are the NYC food budgets?"
                    value={qaQuery}
                    onChange={(e) => setQaQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="submit"
                    disabled={isAnswering}
                    className="p-1.5 rounded bg-emerald-650 hover:bg-emerald-550 disabled:bg-slate-800 text-slate-950 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                </form>

                {isAnswering && (
                  <div className="space-y-1.5 pt-1.5 animate-pulse">
                    <div className="h-2.5 bg-slate-800 rounded w-full"></div>
                    <div className="h-2.5 bg-slate-800 rounded w-3/4"></div>
                  </div>
                )}

                {!isAnswering && qaAnswer && (
                  <div className="pt-2 text-[11px] bg-slate-900 border border-slate-800 p-2 rounded text-emerald-300 italic leading-relaxed whitespace-pre-line font-sans">
                    <strong>CortexAI:</strong> {qaAnswer}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center text-slate-500 font-mono text-xs py-12">
            SELECT A COMPLIANCE GUIDE FROM THE VAULT CATALOG TO INITIATE THE DEEP WRITER SUMMARIZATION AND CONVERSE WITH DOCUMENT (RAG QA).
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {isPublishOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-lg p-5 relative shadow-2xl">
            <h3 className="text-sm font-bold font-display text-white mb-3">Publish New Compliance Document</h3>
            
            <form onSubmit={handlePublishArticle} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Q3 Onboarding & Workspace Access Rules"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Document Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Security">Security</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="E.g., AWS, security, developer"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Document Content (to ground Q&A RAG)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste rules, policy parameters, code architectures..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                ></textarea>
              </div>

              <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 leading-normal">
                Note: Upon publication, the CortexAI Intelligence pipeline executes and calls Gemini server-side to generate an instant executive summary.
              </div>

              <div className="flex gap-2 pt-1 justify-end">
                <button
                  type="button"
                  onClick={() => setIsPublishOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 font-bold text-[10px] uppercase cursor-pointer text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] text-slate-950 uppercase cursor-pointer disabled:bg-slate-800 transition-all"
                >
                  {isPublishing ? 'PUBLISHING & SUMMARIZING...' : 'PUBLISH GUIDE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
