const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const Household = require('../models/Household');
const Admin = require('../models/Admin');
const NewsItem = require('../models/NewsItem');
const auth = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });
    res.json({ token, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/stats — overview
router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalHouseholds, todayHouseholds, weekHouseholds, monthHouseholds] = await Promise.all([
      Household.countDocuments(),
      Household.countDocuments({ createdAt: { $gte: todayStart } }),
      Household.countDocuments({ createdAt: { $gte: weekStart } }),
      Household.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    // Total individuals
    const totalResult = await Household.aggregate([
      { $project: { memberCount: { $size: '$members' } } },
      { $group: { _id: null, total: { $sum: '$memberCount' } } },
    ]);
    const totalIndividuals = totalResult.length > 0 ? totalResult[0].total : 0;

    // District-wise
    const districtStats = await Household.aggregate([
      { $group: { _id: '$district', households: { $sum: 1 }, members: { $sum: { $size: '$members' } } } },
      { $sort: { members: -1 } },
    ]);

    // Constituency-wise
    const constituencyStats = await Household.aggregate([
      { $group: {
        _id: '$constituency',
        district: { $first: '$district' },
        households: { $sum: 1 },
        members: { $sum: { $size: '$members' } },
      }},
      { $sort: { members: -1 } },
    ]);

    // Gender breakdown
    const genderStats = await Household.aggregate([
      { $unwind: '$members' },
      { $group: { _id: '$members.gender', count: { $sum: 1 } } },
    ]);

    // Welfare scheme stats
    const welfareStats = await Household.aggregate([
      { $unwind: '$members' },
      { $group: {
        _id: null,
        ownHouseYes: { $sum: { $cond: [{ $eq: ['$members.ownHouse', 'ఉన్నది'] }, 1, 0] } },
        rationCardYes: { $sum: { $cond: [{ $eq: ['$members.rationCard', 'ఉంది'] }, 1, 0] } },
        pensionYes: { $sum: { $cond: [{ $eq: ['$members.governmentPension', 'వస్తుంది'] }, 1, 0] } },
        freeUnitsYes: { $sum: { $cond: [{ $eq: ['$members.freeUnits200', 'వస్తుంది'] }, 1, 0] } },
        tailoringDependentYes: { $sum: { $cond: [{ $eq: ['$members.tailoringDependent', 'అవును'] }, 1, 0] } },
      }},
    ]);

    res.json({
      totalHouseholds, totalIndividuals,
      todayHouseholds, weekHouseholds, monthHouseholds,
      districtStats, constituencyStats, genderStats,
      welfareStats: welfareStats[0] || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/stats/daily?days=30
router.get('/stats/daily', auth, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 90);
    const since = new Date(); since.setDate(since.getDate() - days);

    const daily = await Household.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } },
          households: { $sum: 1 },
          members: { $sum: { $size: '$members' } },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);

    const result = daily.map((d) => ({
      date: `${d._id.y}-${String(d._id.m).padStart(2, '0')}-${String(d._id.d).padStart(2, '0')}`,
      households: d.households,
      members: d.members,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/households?page=1&limit=20&search=&district=
router.get('/households', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const search = req.query.search || '';
    const district = req.query.district || '';
    const constituency = req.query.constituency || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { village: { $regex: search, $options: 'i' } },
        { rationCardNo: { $regex: search, $options: 'i' } },
        { 'members.name': { $regex: search, $options: 'i' } },
        { 'members.mobileNo': { $regex: search, $options: 'i' } },
      ];
    }
    if (district) query.district = district;
    if (constituency) query.constituency = constituency;

    const [households, total] = await Promise.all([
      Household.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-ipAddress'),
      Household.countDocuments(query),
    ]);

    res.json({ households, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/export
router.get('/export', auth, async (req, res) => {
  try {
    const district = req.query.district || '';
    const query = district ? { district } : {};
    const households = await Household.find(query).sort({ createdAt: -1 }).select('-ipAddress -__v');

    // Light pastel fills — cycle across families, never repeat adjacent
    const FAMILY_COLORS = [
      'FFFFC7CE', // light red
      'FFC6EFCE', // light green
      'FFFFEB9C', // light yellow
      'FFDCE6F1', // light blue
    ];

    const headers = [
      'రేషన్ కార్డు నెం.', 'వలస కుటుంబం', 'స్వగ్రామం', 'గ్రామం/నగరం', 'మండలం', 'జిల్లా', 'రాష్ట్రం',
      'క్రమ సంఖ్య', 'ఇంటి పేరు', 'పూర్తి పేరు', 'ఆధార్ నంబర్', 'వయస్సు', 'లింగం',
      'కుటుంబయజమానితో సంబంధం', 'వృత్తి/ఉద్యోగం/చదువు', 'సొంత ఇల్లు',
      'సంక్షేమ పథకాలు', 'వివాహ స్థితి', 'ప్రభుత్వ పెన్షన్', 'రేషన్ కార్డు',
      'ఉచిత కరెంటు 200 యూనిట్లు', 'మొబైల్ నంబర్', 'కుట్టు మీద ఆధారపడతారా', 'నమోదు తేదీ',
    ];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Meru Darji Census');

    sheet.columns = headers.map(() => ({ width: 22 }));

    // Header row — dark blue background, white bold text
    const headerRow = sheet.addRow(headers);
    headerRow.height = 30;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Data rows — each household gets the next color; members of same household share it
    let colorIdx = 0;
    households.forEach((hh) => {
      const argb = FAMILY_COLORS[colorIdx % FAMILY_COLORS.length];
      colorIdx++;

      hh.members.forEach((m) => {
        const row = sheet.addRow([
          hh.rationCardNo || '',
          hh.isMigrant ? 'అవును' : 'కాదు',
          hh.nativePlace || '',
          hh.village,
          hh.mandal,
          hh.district,
          hh.state,
          m.slNo,
          m.surname || '',
          m.name,
          m.aadhaarNo || '',
          m.age,
          m.gender,
          m.relationshipWithHead,
          m.occupationOrEducation || '',
          m.ownHouse || '',
          m.welfareSchemes || '',
          m.maritalStatus || '',
          m.governmentPension || '',
          m.rationCard || '',
          m.freeUnits200 || '',
          m.mobileNo || '',
          m.tailoringDependent || '',
          new Date(hh.createdAt).toLocaleString('en-IN'),
        ]);
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb } };
        row.alignment = { vertical: 'middle' };
      });
    });

    // Freeze the header row so it stays visible while scrolling
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    const filename = `meru_darji_census_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Export failed' });
  }
});

// DELETE /api/admin/households/:id
router.delete('/households/:id', auth, async (req, res) => {
  try {
    const household = await Household.findByIdAndDelete(req.params.id);
    if (!household) return res.status(404).json({ message: 'Household not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete household' });
  }
});

// ── News management ─────────────────────────────────────────────

// GET /api/admin/news — list all (admin)
router.get('/news', auth, async (req, res) => {
  try {
    const items = await NewsItem.find().sort({ order: 1, createdAt: -1 }).select('-__v').lean();
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch news items' });
  }
});

// POST /api/admin/news — add new item
router.post('/news', auth, async (req, res) => {
  try {
    const { title, description, imageData, order } = req.body;
    if (!imageData) return res.status(400).json({ message: 'imageData is required' });
    if (!imageData.startsWith('data:image/')) return res.status(400).json({ message: 'Invalid image format' });
    // Rough size check: base64 ~1.37× original; reject > ~4 MB images
    if (imageData.length > 5_500_000) return res.status(400).json({ message: 'Image too large (max ~4 MB)' });

    const item = await NewsItem.create({ title, description, imageData, order: order || 0 });
    res.status(201).json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save news item' });
  }
});

// PATCH /api/admin/news/:id — toggle active / update order
router.patch('/news/:id', auth, async (req, res) => {
  try {
    const { isActive, order, title, description } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (order !== undefined) update.order = order;
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;

    const item = await NewsItem.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update news item' });
  }
});

// DELETE /api/admin/news/:id
router.delete('/news/:id', auth, async (req, res) => {
  try {
    const item = await NewsItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete news item' });
  }
});

module.exports = router;
