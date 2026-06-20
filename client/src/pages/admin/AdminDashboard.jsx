import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { LogOut, Download, Search, RefreshCw, Users, Home, Calendar, TrendingUp, ChevronLeft, ChevronRight, Newspaper, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { getStats, getDailyStats, getHouseholds, exportToExcel, getAdminNews, addNewsItem, deleteNewsItem, updateNewsItem } from '../../utils/api';
import SewingMachineIcon from '../../components/SewingMachineIcon';
import { TELANGANA_DISTRICTS } from '../../utils/districts';

const PIE_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

function StatCard({ icon: Icon, value, label, sublabel, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-600 to-primary-800',
    green: 'from-green-500 to-green-700',
    amber: 'from-amber-500 to-amber-700',
    purple: 'from-purple-500 to-purple-700',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-2xl p-5 shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold">{(value || 0).toLocaleString('en-IN')}</div>
          <div className="font-semibold mt-1">{label}</div>
          {sublabel && <div className="text-xs opacity-75 mt-0.5">{sublabel}</div>}
        </div>
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState(30);

  const fetchStats = useCallback(async () => {
    try {
      const [s, d] = await Promise.all([getStats(), getDailyStats(days)]);
      setStats(s.data);
      setDailyData(d.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [days]);

  const fetchHouseholds = useCallback(async (page = 1) => {
    setTableLoading(true);
    try {
      const res = await getHouseholds({ page, limit: 20, search, district: filterDistrict });
      setHouseholds(res.data.households);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch { /* ignore */ }
    finally { setTableLoading(false); }
  }, [search, filterDistrict]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === 'data') fetchHouseholds(1); }, [activeTab, fetchHouseholds]);
  // News tab is self-managed inside NewsManager component

  function handleLogout() {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchHouseholds(1);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SewingMachineIcon className="w-12 h-12 mx-auto mb-4" white={false} />
          <p className="text-gray-500 animate-pulse">లోడ్ అవుతోంది...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SewingMachineIcon className="w-8 h-8" />
            <div>
              <div className="font-bold text-sm">Admin Dashboard</div>
              <div className="text-xs text-primary-300">మేరు దర్జీ జనగణన</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchStats} className="p-2 hover:bg-primary-700 rounded-xl transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'అవలోకనం (Overview)' },
            { id: 'charts', label: 'చార్ట్‌లు (Charts)' },
            { id: 'data', label: 'డేటా (Data)' },
            { id: 'news', label: '📰 వార్తలు (News)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Home} value={stats?.totalHouseholds} label="మొత్తం కుటుంబాలు" sublabel="Total Households" color="primary" />
              <StatCard icon={Users} value={stats?.totalIndividuals} label="మొత్తం వ్యక్తులు" sublabel="Total Individuals" color="green" />
              <StatCard icon={Calendar} value={stats?.todayHouseholds} label="నేటి నమోదు" sublabel="Today's Registrations" color="amber" />
              <StatCard icon={TrendingUp} value={stats?.weekHouseholds} label="వారపు నమోదు" sublabel="This Week" color="purple" />
            </div>

            {/* Welfare Stats */}
            {stats?.welfareStats && (
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-4">సంక్షేమ పథకాల వివరాలు / Welfare Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'సొంత ఇల్లు ఉన్నది', labelEn: 'Own House', value: stats.welfareStats.ownHouseYes },
                    { label: 'రేషన్ కార్డు ఉంది', labelEn: 'Ration Card', value: stats.welfareStats.rationCardYes },
                    { label: 'ప్రభుత్వ పెన్షన్', labelEn: 'Govt Pension', value: stats.welfareStats.pensionYes },
                    { label: 'ఉచిత 200 యూనిట్లు', labelEn: 'Free 200 Units', value: stats.welfareStats.freeUnitsYes },
                  ].map((item) => (
                    <div key={item.labelEn} className="bg-primary-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary-700">{(item.value || 0).toLocaleString('en-IN')}</div>
                      <div className="text-xs font-semibold text-primary-800 mt-1">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.labelEn}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* District Summary */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">జిల్లా వారీ నమోదు / District-wise</h3>
                <button
                  onClick={() => exportToExcel(filterDistrict)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel డౌన్‌లోడ్
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700">జిల్లా</th>
                      <th className="text-right p-3 font-semibold text-gray-700">కుటుంబాలు</th>
                      <th className="text-right p-3 font-semibold text-gray-700">సభ్యులు</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.districtStats || []).slice(0, 15).map((d, i) => (
                      <tr key={d._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3">{d._id}</td>
                        <td className="p-3 text-right font-medium">{d.households}</td>
                        <td className="p-3 text-right font-medium text-primary-600">{d.members}</td>
                      </tr>
                    ))}
                    {(!stats?.districtStats || stats.districtStats.length === 0) && (
                      <tr><td colSpan={3} className="p-6 text-center text-gray-400">డేటా లేదు</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CHARTS TAB */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Day selector */}
            <div className="flex gap-2">
              {[7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${days === d ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}
                >
                  {d} రోజులు
                </button>
              ))}
            </div>

            {/* Daily trend */}
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">రోజువారీ నమోదు ట్రెండ్ / Daily Registration Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'households' ? 'కుటుంబాలు' : 'సభ్యులు']}
                    labelFormatter={(v) => `తేదీ: ${v}`}
                  />
                  <Legend formatter={(v) => v === 'households' ? 'కుటుంబాలు' : 'సభ్యులు'} />
                  <Line type="monotone" dataKey="households" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="members" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* District bar chart */}
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">జిల్లా వారీ సభ్యులు / Members by District (Top 10)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={(stats?.districtStats || []).slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="_id" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v) => [v, 'సభ్యులు']} />
                  <Bar dataKey="members" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gender pie */}
            {stats?.genderStats?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-4">లింగ వివరాలు / Gender Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={stats.genderStats} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(1)}%`}>
                      {stats.genderStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="పేరు, మొబైల్, గ్రామం వెతకండి..."
                      className="input-field pl-10 py-2.5 text-sm"
                    />
                  </div>
                  <button type="submit" className="btn-primary py-2.5 px-4 text-sm">వెతకు</button>
                </form>
                <select
                  value={filterDistrict}
                  onChange={(e) => { setFilterDistrict(e.target.value); fetchHouseholds(1); }}
                  className="input-field py-2.5 text-sm sm:w-48"
                >
                  <option value="">అన్ని జిల్లాలు</option>
                  {TELANGANA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={() => exportToExcel(filterDistrict)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2.5 rounded-xl whitespace-nowrap">
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">మొత్తం: {pagination.total} కుటుంబాలు</p>
            </div>

            {/* Table */}
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-primary-700 text-white">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">గ్రామం / మండలం</th>
                      <th className="p-3 text-left">జిల్లా</th>
                      <th className="p-3 text-left">రేషన్ నెం.</th>
                      <th className="p-3 text-center">సభ్యులు</th>
                      <th className="p-3 text-left">నమోదు తేదీ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableLoading ? (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-400 animate-pulse">లోడ్ అవుతోంది...</td></tr>
                    ) : households.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-400">డేటా లేదు</td></tr>
                    ) : (
                      households.map((hh, i) => (
                        <tr key={hh._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-3 text-gray-400">{(pagination.page - 1) * 20 + i + 1}</td>
                          <td className="p-3">
                            <div className="font-medium">{hh.village}</div>
                            <div className="text-xs text-gray-400">{hh.mandal}</div>
                          </td>
                          <td className="p-3">{hh.district}</td>
                          <td className="p-3 text-xs text-gray-500">{hh.rationCardNo || '—'}</td>
                          <td className="p-3 text-center">
                            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                              {hh.members?.length || 0}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-gray-500">
                            {new Date(hh.createdAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <span className="text-xs text-gray-500">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchHouseholds(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2 rounded-xl border border-gray-200 hover:border-primary-300 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fetchHouseholds(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="p-2 rounded-xl border border-gray-200 hover:border-primary-300 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* NEWS TAB */}
        {activeTab === 'news' && <NewsManager />}

      </main>
    </div>
  );
}

/* ── News Manager sub-component ── */
function NewsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', description: '', imageData: '' });
  const [preview, setPreview] = useState('');
  const fileRef = useRef();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminNews();
      setItems(data.items || []);
    } catch {
      setError('వార్తలు లోడ్ కాలేదు.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('దయచేసి image file ఎంచుకోండి.'); return; }
    if (file.size > 4 * 1024 * 1024) { setError('Image 4 MB కంటే తక్కువ ఉండాలి.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, imageData: ev.target.result }));
      setPreview(ev.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.imageData) { setError('దయచేసి ఒక ఫోటో ఎంచుకోండి.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await addNewsItem(form);
      setForm({ title: '', description: '', imageData: '' });
      setPreview('');
      if (fileRef.current) fileRef.current.value = '';
      setSuccess('వార్త విజయవంతంగా జోడించబడింది!');
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('ఈ వార్తను తొలగించాలా?')) return;
    try {
      await deleteNewsItem(id);
      setItems((prev) => prev.filter((it) => it._id !== id));
      setSuccess('తొలగించబడింది.');
    } catch {
      setError('తొలగించడం విఫలమైంది.');
    }
  }

  async function handleToggle(item) {
    try {
      const { data } = await updateNewsItem(item._id, { isActive: !item.isActive });
      setItems((prev) => prev.map((it) => it._id === item._id ? data.item : it));
    } catch {
      setError('అప్‌డేట్ విఫలమైంది.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new item form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-primary-900 text-lg mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> కొత్త వార్త జోడించండి / Add News Photo
        </h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">❌ {error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">✅ {success}</div>}

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">శీర్షిక (Title) — ఐచ్ఛికం</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                placeholder="వార్త శీర్షిక"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">వివరణ (Description) — ఐచ్ఛికం</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                placeholder="వార్త వివరణ"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={500}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ఫోటో ఎంచుకోండి <span className="text-red-500">*</span></label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-xl object-contain" />
              ) : (
                <div className="text-gray-400">
                  <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Click to upload (max 4 MB)</p>
                  <p className="text-xs mt-1">JPG, PNG, WEBP</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !form.imageData}
            className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <span className="animate-spin">⏳</span> : <Plus className="w-4 h-4" />}
            {saving ? 'సేవ్ అవుతోంది...' : 'జోడించండి (Add)'}
          </button>
        </form>
      </div>

      {/* Existing items */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-primary-900 text-lg mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5" /> ప్రస్తుత వార్తలు ({items.length})
        </h2>

        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">లోడ్ అవుతోంది...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Admin-added వార్తలు లేవు. Static photos News పేజీలో అందుబాటులో ఉంటాయి.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className={`rounded-2xl border overflow-hidden ${item.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                <div className="relative aspect-video bg-gray-100">
                  <img src={item.imageData} alt={item.title || 'news'} className="w-full h-full object-cover" />
                  <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </div>
                </div>
                <div className="p-3">
                  {item.title && <p className="font-semibold text-sm text-gray-800 truncate">{item.title}</p>}
                  {item.description && <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString('te-IN')}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleToggle(item)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs border border-gray-300 rounded-lg py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      {item.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {item.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg py-1.5 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
