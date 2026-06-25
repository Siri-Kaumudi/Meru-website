const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: [true, 'పేరు తప్పనిసరి'],
      trim: true,
      minlength: [2, 'పేరు కనీసం 2 అక్షరాలు ఉండాలి'],
      maxlength: [100, 'పేరు 100 అక్షరాలు మించకూడదు'],
    },
    fatherOrHusbandName: {
      type: String,
      required: [true, 'తండ్రి/భర్త పేరు తప్పనిసరి'],
      trim: true,
      minlength: [2, 'పేరు కనీసం 2 అక్షరాలు ఉండాలి'],
      maxlength: [100, 'పేరు 100 అక్షరాలు మించకూడదు'],
    },
    motherName: {
      type: String,
      trim: true,
      maxlength: [100, 'పేరు 100 అక్షరాలు మించకూడదు'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'పుట్టిన తేదీ తప్పనిసరి'],
    },
    age: {
      type: Number,
      min: [0, 'వయస్సు సరైనది కాదు'],
      max: [120, 'వయస్సు సరైనది కాదు'],
    },
    gender: {
      type: String,
      required: [true, 'లింగం తప్పనిసరి'],
      enum: {
        values: ['పురుషుడు', 'స్త్రీ', 'ఇతర'],
        message: 'లింగం సరైనది కాదు',
      },
    },
    maritalStatus: {
      type: String,
      required: [true, 'వివాహ స్థితి తప్పనిసరి'],
      enum: {
        values: ['అవివాహితుడు/అవివాహిత', 'వివాహితుడు/వివాహిత', 'వితంతువు/వితంతు', 'విడాకులు'],
        message: 'వివాహ స్థితి సరైనది కాదు',
      },
    },
    gotra: {
      type: String,
      trim: true,
      maxlength: [100, 'గోత్రం 100 అక్షరాలు మించకూడదు'],
    },

    // Contact Information
    mobile: {
      type: String,
      required: [true, 'మొబైల్ నంబర్ తప్పనిసరి'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'చెల్లుబాటు అయ్యే మొబైల్ నంబర్ నమోదు చేయండి'],
    },
    whatsapp: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'చెల్లుబాటు అయ్యే వాట్సాప్ నంబర్ నమోదు చేయండి'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'చెల్లుబాటు అయ్యే ఇమెయిల్ నమోదు చేయండి'],
    },

    // Address
    houseNo: {
      type: String,
      trim: true,
      maxlength: [50, 'ఇంటి నంబర్ 50 అక్షరాలు మించకూడదు'],
    },
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'వీధి 200 అక్షరాలు మించకూడదు'],
    },
    village: {
      type: String,
      required: [true, 'గ్రామం/నగరం తప్పనిసరి'],
      trim: true,
      maxlength: [100, 'గ్రామం/నగరం 100 అక్షరాలు మించకూడదు'],
    },
    mandal: {
      type: String,
      required: [true, 'మండలం తప్పనిసరి'],
      trim: true,
      maxlength: [100, 'మండలం 100 అక్షరాలు మించకూడదు'],
    },
    district: {
      type: String,
      required: [true, 'జిల్లా తప్పనిసరి'],
      trim: true,
    },
    state: {
      type: String,
      default: 'తెలంగాణ',
      trim: true,
    },
    pinCode: {
      type: String,
      match: [/^\d{6}$/, 'పిన్ కోడ్ 6 అంకెలు ఉండాలి'],
    },

    // Education & Occupation
    education: {
      type: String,
      required: [true, 'విద్యార్హత తప్పనిసరి'],
      enum: {
        values: [
          'చదువురాదు',
          '1వ తరగతి - 5వ తరగతి',
          '6వ తరగతి - 9వ తరగతి',
          '10వ తరగతి (SSC)',
          'ఇంటర్మీడియట్ (12వ తరగతి)',
          'డిప్లొమా',
          'డిగ్రీ (B.A/B.Sc/B.Com)',
          'ఇంజినీరింగ్ (B.Tech)',
          'వైద్యం (MBBS/BDS)',
          'పోస్ట్ గ్రాడ్యుయేషన్',
          'ఇతర',
        ],
        message: 'విద్యార్హత సరైనది కాదు',
      },
    },
    occupation: {
      type: String,
      required: [true, 'వృత్తి తప్పనిసరి'],
      trim: true,
      maxlength: [200, 'వృత్తి 200 అక్షరాలు మించకూడదు'],
    },
    annualIncome: {
      type: String,
      enum: {
        values: [
          'చెప్పడం ఇష్టం లేదు',
          '1 లక్ష లోపు',
          '1-3 లక్షలు',
          '3-5 లక్షలు',
          '5-10 లక్షలు',
          '10 లక్షల పైన',
        ],
      },
    },

    // Family Information
    totalFamilyMembers: {
      type: Number,
      required: [true, 'కుటుంబ సభ్యుల సంఖ్య తప్పనిసరి'],
      min: [1, 'కుటుంబ సభ్యుల సంఖ్య కనీసం 1 ఉండాలి'],
      max: [50, 'కుటుంబ సభ్యుల సంఖ్య 50 మించకూడదు'],
    },
    maleMembers: {
      type: Number,
      min: [0, 'పురుష సభ్యుల సంఖ్య 0 కంటే తక్కువ కాదు'],
    },
    femaleMembers: {
      type: Number,
      min: [0, 'మహిళా సభ్యుల సంఖ్య 0 కంటే తక్కువ కాదు'],
    },
    childrenCount: {
      type: Number,
      min: [0, 'పిల్లల సంఖ్య 0 కంటే తక్కువ కాదు'],
    },

    // Metadata
    ipAddress: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-calculate age before saving
memberSchema.pre('save', function (next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const dob = new Date(this.dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});

// Index for fast querying
memberSchema.index({ createdAt: -1 });
memberSchema.index({ district: 1 });
memberSchema.index({ mobile: 1 });

module.exports = mongoose.model('Member', memberSchema);
