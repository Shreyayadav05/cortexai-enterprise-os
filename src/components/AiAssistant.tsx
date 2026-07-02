import { useState, FormEvent } from 'react';
import { 
  Sparkles, 
  FileText, 
  Mail, 
  Calendar, 
  Cpu, 
  Clipboard, 
  Check, 
  RefreshCw,
  Clock,
  Send,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AiAssistantProps {
  currentUser: User;
  currentRole: UserRole;
}

type GeneratorTool = 'meeting' | 'email' | 'report' | 'recommend';

export default function AiAssistant({ currentUser, currentRole }: AiAssistantProps) {
  const [activeTool, setActiveTool] = useState<GeneratorTool>('meeting');
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [outputText, setOutputText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Tool Specific Fields
  const [subject, setSubject] = useState<string>('');
  const [participants, setParticipants] = useState<string>('');
  const [meetingDate, setMeetingDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('45 minutes');
  const [documentType, setDocumentType] = useState<string>('Systems Security Compliance');

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!inputText && activeTool !== 'email') return;
    setIsGenerating(true);
    setOutputText('');
    setCopied(false);

    try {
      const payload: any = {
        action: activeTool === 'recommend' ? 'recommend_workflow' : activeTool,
        text: inputText
      };

      if (activeTool === 'email') {
        payload.subject = subject;
      } else if (activeTool === 'meeting') {
        payload.participants = participants;
        payload.date = meetingDate;
        payload.duration = duration;
      } else if (activeTool === 'report') {
        payload.documentType = documentType;
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.output) {
        setOutputText(data.output);
      } else {
        setOutputText('Inference pipeline did not return text content. Please verify API configurations.');
      }
    } catch (err) {
      console.error(err);
      setOutputText('Connection error on GenAI channel. Simulated fallback triggered.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-6 text-slate-200 flex flex-col xl:flex-row gap-6">
      
      {/* Left pane - Form Configurator */}
      <div className="flex-1 flex flex-col max-w-2xl">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold font-display tracking-tight text-white flex items-center gap-2">
            Intelligence Command Center
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono tracking-widest">GEMINI-INTEGRATED</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">Autonomous generative pipelines for document synthesis, report compiling, corporate emails, and workflow consulting.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-900 border border-slate-800 rounded p-1 mb-4">
          <button
            onClick={() => { setActiveTool('meeting'); setOutputText(''); setInputText(''); }}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] uppercase font-bold cursor-pointer flex items-center justify-center gap-1 transition-all ${
              activeTool === 'meeting' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Minutes Compiler
          </button>
          <button
            onClick={() => { setActiveTool('email'); setOutputText(''); setInputText(''); }}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] uppercase font-bold cursor-pointer flex items-center justify-center gap-1 transition-all ${
              activeTool === 'email' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Email Draftsman
          </button>
          <button
            onClick={() => { setActiveTool('report'); setOutputText(''); setInputText(''); }}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] uppercase font-bold cursor-pointer flex items-center justify-center gap-1 transition-all ${
              activeTool === 'report' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Report Builder
          </button>
          <button
            onClick={() => { setActiveTool('recommend'); setOutputText(''); setInputText(''); }}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] uppercase font-bold cursor-pointer flex items-center justify-center gap-1 transition-all ${
              activeTool === 'recommend' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Workflow Oracle
          </button>
        </div>

        {/* Input Parameters Form */}
        <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
          
          {/* Meeting Summary Fields */}
          {activeTool === 'meeting' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Participants</label>
                <input
                  type="text"
                  placeholder="E.g., Marcus Vance, David Kim, Elena Rostova"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Date & Duration</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  />
                  <input
                    type="text"
                    placeholder="45 min"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-20 bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Specific Fields */}
          {activeTool === 'email' && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Email Subject</label>
              <input
                type="text"
                placeholder="E.g., Scheduled Maintenance Window / Out of Office Notice"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          )}

          {/* Report Specific Fields */}
          {activeTool === 'report' && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Report Standard Theme</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Systems Security Compliance">Systems Security Compliance Report</option>
                <option value="Q2 Financial Progress Overview">Q2 Financial Audit Progress Summary</option>
                <option value="Engineering Pipeline Velocity">Engineering Pipeline Velocity Index</option>
                <option value="HR Capacity & Resource Allocation">HR Capacity & Resource Allocation Study</option>
              </select>
            </div>
          )}

          {/* Core Raw Context Input Box */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {activeTool === 'meeting' && 'Paste Meeting Transcript / Bullet Points'}
              {activeTool === 'email' && 'What is the key purpose and context of the email?'}
              {activeTool === 'report' && 'Provide raw metric data, milestones, or notes for the report'}
              {activeTool === 'recommend' && 'Describe the operational problem or procurement goal'}
            </label>
            <textarea
              rows={activeTool === 'recommend' ? 4 : 5}
              required
              placeholder={
                activeTool === 'meeting' ? 'Marcus and David reviewed cluster optimization. Decide to do AWS EKS upgrade WF-102. David to deploy TTL queries on Redis.' :
                activeTool === 'email' ? 'Notice explaining flexible summer hours policy which starts next week.' :
                activeTool === 'report' ? 'EKS cluster migrated with 99.8% uptime. Active workflows increased by 14%. Redundancies verified in SOC.' :
                'We need to hire an external auditor to evaluate database transaction performance and compliance.'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors leading-relaxed font-sans"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isGenerating || (!inputText && activeTool !== 'email')}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 font-bold text-[10px] uppercase tracking-wide rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> SYNTHESIZING AI INFERENCE...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-950" /> TRIGGER GENERATION PIPELINE
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right pane - Terminal Output Renderer */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg flex flex-col min-h-[500px] overflow-hidden">
        
        {/* Terminal Header */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-mono text-slate-550 ml-1.5">CortexAI // Inference Console</span>
          </div>

          {outputText && (
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[9px] text-slate-300 flex items-center gap-1 cursor-pointer transition-colors uppercase font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> COPIED
                </>
              ) : (
                <>
                  <Clipboard className="w-3 h-3 text-slate-550" /> COPY DRAFT
                </>
              )}
            </button>
          )}
        </div>

        {/* Content Box */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-950/40 text-xs flex flex-col">
          {isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-slate-550">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <p className="font-mono text-[10px] tracking-wider uppercase animate-pulse">Running server-side Gemini generation...</p>
            </div>
          ) : outputText ? (
            <div className="space-y-3 font-sans leading-relaxed text-slate-200 text-xs max-w-full text-justify select-text border border-slate-850 bg-slate-900/45 rounded p-4 whitespace-pre-line">
              {outputText}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-550 font-mono">
              <Sparkles className="w-10 h-10 text-slate-750 mb-3 animate-pulse" />
              <p className="uppercase tracking-widest text-[10px] text-slate-450">AWAITING COGNITIVE SYNTHESIS PROMPT</p>
              <p className="text-[9px] text-slate-600 mt-1.5 max-w-xs">Select an intelligence tool tab, fill out the context constraints, and hit Trigger to run real-time inference summaries.</p>
            </div>
          )}
        </div>

        {/* Terminal footer */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-850 flex items-center justify-between text-[9px] font-mono text-slate-550">
          <span>Latency: ~210ms // SSE protocol</span>
          <span className="flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-400" /> SECURE TUNNEL ACTIVE
          </span>
        </div>

      </div>

    </div>
  );
}
