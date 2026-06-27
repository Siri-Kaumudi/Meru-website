const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Household = require('../models/Household');

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: 'ఈ IP నుండి చాలా నమోదు అభ్యర్థనలు. 1 గంట తర్వాత మళ్ళీ ప్రయత్నించండి.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const checkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { message: 'చాలా అభ్యర్థనలు. కొద్ది సేపు వేచి ఉండండి.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/members/register — register a whole household
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { rationCardNo, clusterNo, houseNo, street, village, mandal, divisionWardNo, constituency, district, state, members } = req.body;

    // Validate members array
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'కనీసం ఒక సభ్యుని వివరాలు నమోదు చేయండి' });
    }
    if (members.length > 8) {
      return res.status(400).json({ message: 'గరిష్టంగా 8 సభ్యులు నమోదు చేయవచ్చు' });
    }

    // Check if ration card already registered (if provided)
    if (rationCardNo && rationCardNo.trim()) {
      const existingRation = await Household.findOne({ rationCardNo: rationCardNo.trim() });
      if (existingRation) {
        return res.status(400).json({
          message: 'ఈ రేషన్ కార్డు నంబర్‌తో ఇప్పటికే నమోదు చేసారు.',
          field: 'rationCardNo',
        });
      }
    }

    // Check aadhaar uniqueness across existing records
    const submittedAadhaars = members
      .map((m) => m.aadhaarNo)
      .filter((a) => a && a.trim() !== '');

    if (submittedAadhaars.length > 0) {
      const existingAadhaar = await Household.findOne({
        'members.aadhaarNo': { $in: submittedAadhaars },
      });
      if (existingAadhaar) {
        return res.status(400).json({
          message: 'నమోదు చేసిన ఆధార్ నంబర్‌లలో ఒకటి ఇప్పటికే నమోదైంది.',
          field: 'aadhaarNo',
        });
      }
    }

    // Collect all mobile numbers being submitted
    const submittedMobiles = members
      .map((m) => m.mobileNo)
      .filter((mob) => mob && mob.trim() !== '');

    // Check mobile uniqueness across existing records
    if (submittedMobiles.length > 0) {
      const existingMobile = await Household.findOne({
        'members.mobileNo': { $in: submittedMobiles },
      });
      if (existingMobile) {
        return res.status(400).json({
          message: 'నమోదు చేసిన మొబైల్ నంబర్‌లలో ఒకటి ఇప్పటికే నమోదైంది.',
          field: 'mobile',
        });
      }
    }

    // Normalize members with slNo
    const normalizedMembers = members.map((m, i) => ({
      slNo: i + 1,
      name: m.name,
      surname: m.surname || '',
      aadhaarNo: m.aadhaarNo,
      age: m.age,
      gender: m.gender,
      relationshipWithHead: m.relationshipWithHead,
      occupationOrEducation: m.occupationOrEducation || '',
      ownHouse: i === 0 ? m.ownHouse : '',
      welfareSchemes: m.welfareSchemes,
      maritalStatus: m.maritalStatus,
      governmentPension: m.governmentPension || '',
      rationCard: m.rationCard || '',
      freeUnits200: i === 0 ? m.freeUnits200 : '',
      tailoringDependent: m.tailoringDependent || '',
      mobileNo: m.mobileNo || '',
    }));

    const household = new Household({
      rationCardNo: rationCardNo || undefined,
      clusterNo: clusterNo || undefined,
      houseNo,
      street,
      village,
      mandal,
      divisionWardNo,
      constituency,
      district,
      state: state || 'తెలంగాణ',
      members: normalizedMembers,
      ipAddress: req.ip,
      submittedByMobile: submittedMobiles[0] || '',
    });

    await household.save();

    res.status(201).json({
      message: 'నమోదు విజయవంతంగా పూర్తైంది!',
      householdId: household._id,
      memberCount: normalizedMembers.length,
    });
  } catch (err) {
    if (err.code === 11000) {
      const isAadhaar = err.keyPattern && err.keyPattern['members.aadhaarNo'];
      return res.status(400).json({
        message: isAadhaar
          ? 'నమోదు చేసిన ఆధార్ నంబర్‌లలో ఒకటి ఇప్పటికే నమోదైంది.'
          : 'ఈ రేషన్ కార్డు నంబర్‌తో ఇప్పటికే నమోదు చేసారు.',
      });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error. దయచేసి మళ్ళీ ప్రయత్నించండి.' });
  }
});

// GET /api/members/check-aadhaar?aadhaar=XXXXXXXXXXXX
router.get('/check-aadhaar', checkLimiter, async (req, res) => {
  try {
    const { aadhaar } = req.query;
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ message: 'చెల్లుబాటు అయ్యే ఆధార్ నంబర్ పంపండి' });
    }
    const exists = await Household.findOne(
      { 'members.aadhaarNo': aadhaar },
      { _id: 1 }
    ).lean();
    res.json({ taken: !!exists });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/members/count — public count (households + individuals + gender breakdown)
router.get('/count', async (req, res) => {
  try {
    const households = await Household.countDocuments();
    const result = await Household.aggregate([
      { $unwind: '$members' },
      {
        $group: {
          _id: null,
          total:   { $sum: 1 },
          males:   { $sum: { $cond: [{ $eq: ['$members.gender', 'పురుషుడు'] }, 1, 0] } },
          females: { $sum: { $cond: [{ $eq: ['$members.gender', 'స్త్రీ'] }, 1, 0] } },
        },
      },
    ]);
    const row = result[0] || { total: 0, males: 0, females: 0 };
    res.json({ households, individuals: row.total, males: row.males, females: row.females });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
