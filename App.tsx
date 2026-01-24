
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import CandidateCard from './components/CandidateCard';
import { PROVINCES, DISTRICTS, PARTIES, DISTRICT_CONSTITUENCIES } from './constants';
import { Candidate } from './types';
import { getCandidates, saveCandidate, deleteCandidate, isGlobalEnabled } from './services/dataService';
import { Search, Filter, Plus, Save, X, AlertCircle, Info, UserCircle, Globe, Database, Loader2, Upload, FileText } from 'lucide-react';

enum Page {
  Home = 'HOME',
  Results = 'RESULTS',
  AdminLogin = 'ADMIN_LOGIN',
  AdminDashboard = 'ADMIN_DASHBOARD'
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editCandidateId, setEditCandidateId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formParty, setFormParty] = useState('');
  const [formProvince, setFormProvince] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formConstituency, setFormConstituency] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formSymbol, setFormSymbol] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getCandidates();
    setAllCandidates(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/admin-anil' || path.endsWith('/admin-anil')) {
        setCurrentPage(isAdminAuthenticated ? Page.AdminDashboard : Page.AdminLogin);
      } else if (path === '/' || path === '') {
        setCurrentPage(Page.Home);
      }
    };
    refreshData();
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [isAdminAuthenticated]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const filteredDistricts = useMemo(() => 
    !selectedProvince ? [] : DISTRICTS.filter(d => String(d.provinceId) === String(selectedProvince))
  , [selectedProvince]);

  const formFilteredDistricts = useMemo(() => 
    !formProvince ? [] : DISTRICTS.filter(d => String(d.provinceId) === String(formProvince))
  , [formProvince]);

  const getConstituencyList = (districtName: string) => {
    const count = DISTRICT_CONSTITUENCIES[districtName] || 1;
    return Array.from({ length: count }, (_, i) => (i + 1).toString());
  };

  const availableConstituencies = useMemo(() => 
    !selectedDistrict ? [] : getConstituencyList(selectedDistrict)
  , [selectedDistrict]);

  const formAvailableConstituencies = useMemo(() => 
    !formDistrict ? [] : getConstituencyList(formDistrict)
  , [formDistrict]);

  const handleSearch = () => {
    if (selectedProvince && selectedDistrict && selectedConstituency) {
      setCurrentPage(Page.Results);
    }
  };

  const resetSearch = () => {
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedConstituency('');
    navigateTo('/');
  };

  const currentCandidates = useMemo(() => 
    allCandidates.filter(c => {
      const matchesProvince = String(c.provinceId).trim() === String(selectedProvince).trim();
      const matchesDistrict = String(c.districtId).trim() === String(selectedDistrict).trim();
      const matchesConstituency = String(c.constituency).trim() === String(selectedConstituency).trim();
      return matchesProvince && matchesDistrict && matchesConstituency;
    })
  , [allCandidates, selectedProvince, selectedDistrict, selectedConstituency]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@nepalelection.gov.np' && password === 'admin123') {
      setIsAdminAuthenticated(true);
      setCurrentPage(Page.AdminDashboard);
      setLoginError('');
    } else {
      setLoginError('गलत इमेल वा पासवर्ड।');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    navigateTo('/');
  };

  const openAddForm = () => {
    setEditCandidateId(null);
    setFormName(''); setFormParty(''); setFormProvince(''); setFormDistrict(''); setFormConstituency(''); setFormPhoto(''); setFormSymbol('');
    setShowForm(true);
  };

  const openEditForm = (id: string) => {
    const c = allCandidates.find(cand => cand.id === id);
    if (c) {
      setEditCandidateId(id);
      setFormName(c.name); setFormParty(c.party); setFormProvince(c.provinceId);
      setFormDistrict(c.districtId); setFormConstituency(c.constituency); setFormPhoto(c.photoUrl); setFormSymbol(c.symbolUrl);
      setShowForm(true);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('के तपाईं निश्चित हुनुहुन्छ?')) {
      await deleteCandidate(id);
      await refreshData();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const candidate: Candidate = {
      id: editCandidateId || Date.now().toString(),
      name: formName, party: formParty, provinceId: formProvince, districtId: formDistrict,
      constituency: formConstituency, photoUrl: formPhoto, symbolUrl: formSymbol
    };
    await saveCandidate(candidate);
    await refreshData();
    setShowForm(false);
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      let importCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',').map(v => v.trim());
        if (currentLine.length < 5) continue;

        const candidateData: any = {};
        headers.forEach((h, idx) => {
          candidateData[h] = currentLine[idx];
        });

        // Map CSV fields to Candidate object
        const newCandidate: Candidate = {
          id: Date.now().toString() + i,
          name: candidateData.name || '',
          party: candidateData.party || '',
          provinceId: candidateData.province_id || '',
          districtId: candidateData.district_id || '',
          constituency: candidateData.constituency || '',
          photoUrl: candidateData.photo_url || '',
          symbolUrl: candidateData.symbol_url || ''
        };

        if (newCandidate.name && newCandidate.provinceId) {
          await saveCandidate(newCandidate);
          importCount++;
        }
      }
      alert(`${importCount} उम्मेदवारहरू सफलतापूर्वक थपिए।`);
      await refreshData();
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Layout isAdmin={isAdminAuthenticated} onLogout={handleLogout} onGoHome={() => navigateTo('/')}>
      {isLoading && <div className="fixed inset-0 bg-white/50 z-[100] flex items-center justify-center backdrop-blur-sm"><Loader2 className="text-blue-700 animate-spin" size={48} /></div>}

      {currentPage === Page.Home && (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-4">उम्मेदवार खोज्नुहोस्</h2>
            <p className="text-lg text-gray-600 font-medium">तपाईंको क्षेत्रको सही जानकारी प्राप्त गर्नुहोस्।</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-blue-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">प्रदेश</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition" value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedDistrict(''); setSelectedConstituency(''); }}>
                  <option value="">-- छान्नुहोस् --</option>
                  {PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">जिल्ला</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" disabled={!selectedProvince} value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedConstituency(''); }}>
                  <option value="">-- छान्नुहोस् --</option>
                  {filteredDistricts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">क्षेत्र</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" disabled={!selectedDistrict} value={selectedConstituency} onChange={(e) => setSelectedConstituency(e.target.value)}>
                  <option value="">-- छान्नुहोस् --</option>
                  {availableConstituencies.map(num => <option key={num} value={num}>क्षेत्र {num}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleSearch} disabled={!selectedConstituency} className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95">
              <Search size={24} />
              <span>खोज्नुहोस्</span>
            </button>
          </div>
        </div>
      )}

      {currentPage === Page.Results && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-blue-900">नतिजाहरू ({currentCandidates.length})</h2>
            <button onClick={resetSearch} className="text-blue-700 font-bold hover:underline flex items-center space-x-1"><X size={18} /><span>नयाँ खोज</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {currentCandidates.map(c => <CandidateCard key={c.id} candidate={c} />)}
            {currentCandidates.length === 0 && <div className="col-span-full text-center py-24"><AlertCircle size={64} className="mx-auto text-gray-300 mb-4" /><h3 className="text-2xl font-bold text-gray-500">विवरण फेला परेन।</h3></div>}
          </div>
        </div>
      )}

      {currentPage === Page.AdminLogin && (
        <div className="max-w-md mx-auto py-12 animate-in zoom-in duration-300">
          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">एडमिन लगइन</h2>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input type="email" required className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="इमेल" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" required className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="पासवर्ड" value={password} onChange={(e) => setPassword(e.target.value)} />
              {loginError && <p className="text-red-600 text-sm font-bold">{loginError}</p>}
              <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition shadow-xl">लगइन</button>
            </form>
          </div>
        </div>
      )}

      {currentPage === Page.AdminDashboard && (
        <div className="animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-blue-900">व्यवस्थापन प्यानल</h2>
              <p className="text-gray-500 font-medium">जम्मा उम्मेदवारहरू: {allCandidates.length}</p>
            </div>
            <div className="flex gap-3">
              <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition shadow-sm border border-blue-200">
                <Upload size={20} />
                <span>CSV आयात</span>
              </button>
              <button onClick={openAddForm} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition shadow-xl">
                <Plus size={20} />
                <span>नयाँ थप्नुहोस्</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="px-6 py-5">नाम</th>
                  <th className="px-6 py-5">दल</th>
                  <th className="px-6 py-5">स्थान</th>
                  <th className="px-6 py-5">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allCandidates.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition group">
                    <td className="px-6 py-5 flex items-center space-x-3">
                      {c.photoUrl ? <img src={c.photoUrl} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" alt="" /> : <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><UserCircle size={28} /></div>}
                      <span className="font-bold text-gray-900">{c.name}</span>
                    </td>
                    <td className="px-6 py-5 text-blue-700 font-bold">{c.party}</td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-800">{c.districtId}</p>
                      <p className="text-gray-500 text-xs">क्षेत्र {c.constituency}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEditForm(c.id)} className="text-amber-600 hover:text-amber-800 font-bold text-sm">सम्पादन</button>
                        <button onClick={() => handleDeleteClick(c.id)} className="text-red-600 hover:text-red-800 font-bold text-sm">हटाउनुहोस्</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showForm && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-blue-800 text-white p-6 flex justify-between items-center">
                  <h3 className="text-xl font-bold">{editCandidateId ? 'विवरण सच्याउनुहोस्' : 'नयाँ उम्मेदवार'}</h3>
                  <button onClick={() => setShowForm(false)} className="hover:bg-white/20 p-2 rounded-full transition"><X size={24} /></button>
                </div>
                <form onSubmit={handleFormSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">पूरा नाम</label><input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">राजनीतिक दल</label><select required className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none" value={formParty} onChange={(e) => setFormParty(e.target.value)}><option value="">-- छान्नुहोस् --</option>{PARTIES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">फोटो URL</label><input type="url" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none" placeholder="https://..." value={formPhoto} onChange={(e) => setFormPhoto(e.target.value)} /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">चुनाव चिन्ह URL</label><input type="url" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none" placeholder="चिन्हको फोटो लिङ्क..." value={formSymbol} onChange={(e) => setFormSymbol(e.target.value)} /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">प्रदेश</label><select required className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none" value={formProvince} onChange={(e) => { setFormProvince(e.target.value); setFormDistrict(''); setFormConstituency(''); }}><option value="">-- छान्नुहोस् --</option>{PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">जिल्ला</label><select required disabled={!formProvince} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none disabled:bg-gray-50" value={formDistrict} onChange={(e) => { setFormDistrict(e.target.value); setFormConstituency(''); }}><option value="">-- छान्नुहोस् --</option>{formFilteredDistricts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">निर्वाचन क्षेत्र</label><select required disabled={!formDistrict} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none disabled:bg-gray-50" value={formConstituency} onChange={(e) => setFormConstituency(e.target.value)}><option value="">-- छान्नुहोस् --</option>{formAvailableConstituencies.map(num => <option key={num} value={num}>क्षेत्र {num}</option>)}</select></div>
                  </div>
                  <div className="pt-6 border-t flex space-x-4">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition">रद्द</button>
                    <button type="submit" className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition shadow-xl flex items-center justify-center space-x-2"><Save size={20} /><span>सुरक्षित गर्नुहोस्</span></button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
