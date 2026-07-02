import { useState } from 'react';
import { Users, Mail, Shield, ChevronDown, ChevronRight, CheckSquare, Cpu } from 'lucide-react';

interface OrgMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar: string;
  level: number; // 1: Exec, 2: Director, 3: Manager, 4: Associate
  reports?: OrgMember[];
}

export default function OrgChart() {
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);

  // Hardcoded real corporate hierarchy mapped beautifully
  const rootCEO: OrgMember = {
    id: 'CEO-001',
    name: 'Victoria Vance',
    role: 'Chief Executive Officer',
    department: 'Executive Office',
    email: 'v.vance@cortexai.enterprise',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    level: 1,
    reports: [
      {
        id: 'EMP-001',
        name: 'Marcus Vance',
        role: 'Operations Administrator',
        department: 'Operations',
        email: 'm.vance@cortexai.enterprise',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        level: 2,
        reports: [
          {
            id: 'EMP-004',
            name: 'Elena Rostova',
            role: 'Finance Specialist',
            department: 'Finance',
            email: 'e.rostova@cortexai.enterprise',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
            level: 3
          }
        ]
      },
      {
        id: 'MGR-102',
        name: 'Tariq Al-Fayed',
        role: 'Director of Engineering',
        department: 'Engineering',
        email: 't.fayed@cortexai.enterprise',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        level: 2,
        reports: [
          {
            id: 'EMP-003',
            name: 'David Kim',
            role: 'Engineering Lead',
            department: 'Engineering',
            email: 'd.kim@cortexai.enterprise',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            level: 3
          }
        ]
      },
      {
        id: 'EMP-002',
        name: 'Sarah Jenkins',
        role: 'Human Resources Lead',
        department: 'Human Resources',
        email: 's.jenkins@cortexai.enterprise',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        level: 2
      }
    ]
  };

  // Tree component to render nodes recursively with elegant connector lines
  function OrgNode({ member }: { member: OrgMember }) {
    const hasReports = member.reports && member.reports.length > 0;

    return (
      <div className="flex flex-col items-center">
        {/* Node Box */}
        <div 
          onClick={() => setSelectedMember(member)}
          className={`p-3 bg-slate-900 border rounded w-52 flex gap-2.5 items-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-md text-xs ${
            selectedMember?.id === member.id 
              ? 'border-emerald-500 shadow-emerald-500/5 bg-slate-850' 
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <img 
            src={member.avatar} 
            alt={member.name} 
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-700"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-100 truncate">{member.name}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{member.role}</p>
            <span className="text-[8px] font-mono px-1 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-500 block w-max mt-1 uppercase">
              {member.department}
            </span>
          </div>
        </div>

        {/* Connector Lines and Reports */}
        {hasReports && (
          <div className="flex flex-col items-center w-full mt-3">
            {/* Vertical connector line */}
            <div className="w-0.5 h-4 bg-slate-800"></div>
            
            {/* Horizontal line across children nodes */}
            {member.reports!.length > 1 && (
              <div className="w-5/6 border-t border-slate-800 mb-4"></div>
            )}

            {/* Render children side-by-side */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {member.reports!.map(rep => (
                <div key={rep.id} className="relative">
                  {/* Small vertical connector line on top of each child */}
                  {member.reports!.length > 1 && (
                    <div className="absolute -top-4 left-1/2 -ml-0.5 w-0.5 h-4 bg-slate-800"></div>
                  )}
                  <OrgNode member={rep} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-5 text-slate-200 flex flex-col gap-5 text-xs">
      {/* Title */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
            Enterprise Hierarchy Mapping
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono uppercase">Org-Chart</span>
          </h2>
          <p className="text-slate-400 text-[11px] mt-0.5">Interactive corporate structural map outlining operations, engineering, and HR report channels.</p>
        </div>
      </div>

      {/* Main Chart Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded p-6 flex items-center justify-center overflow-x-auto min-h-[450px]">
        <OrgNode member={rootCEO} />
      </div>

      {/* Selected Member Detail Modal Popup */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-sm p-5 relative shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <img 
                src={selectedMember.avatar} 
                alt={selectedMember.name} 
                className="w-16 h-16 rounded-full border-2 border-slate-800 object-cover shadow-xl mb-3"
              />
              <h3 className="text-sm font-bold font-display text-white">{selectedMember.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{selectedMember.role}</p>
              
              <div className="flex gap-1.5 mt-2">
                <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 rounded uppercase tracking-wide font-bold text-slate-400">
                  {selectedMember.department}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded uppercase tracking-wide font-bold">
                  LEVEL {selectedMember.level}
                </span>
              </div>

              <div className="mt-5 w-full space-y-2.5 text-xs text-left border-t border-slate-800 pt-3.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-[11px]">{selectedMember.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <span>Authority Tier: {selectedMember.level === 1 ? 'Executive Ultimate' : selectedMember.level === 2 ? 'Director High-Oversight' : 'Standard Departmental'}</span>
                </div>

                <div className="flex gap-2 text-slate-350 p-2.5 bg-slate-950/40 rounded border border-slate-800/80 leading-normal text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Synced directly from core LDAP database. All modifications require Active Directory Admin approval.</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="w-full mt-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[10px] uppercase rounded cursor-pointer transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
