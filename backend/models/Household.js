const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    slNo: { type: Number, required: true, min: 1, max: 8 },
    name: {
      type: String,
      required: [true, 'సభ్యుని పేరు తప్పనిసరి'],
      trim: true,
      minlength: [2, 'పేరు కనీసం 2 అక్షరాలు ఉండాలి'],
      maxlength: [100, 'పేరు 100 అక్షరాలు మించకూడదు'],
    },
    surname: {
      type: String,
      trim: true,
      maxlength: [100, 'ఇంటి పేరు 100 అక్షరాలు మించకూడదు'],
    },
    aadhaarNo: {
      type: String,
      required: [true, 'ఆధార్ నంబర్ తప్పనిసరి'],
      trim: true,
      match: [/^\d{12}$/, 'ఆధార్ నంబర్ 12 అంకెలు ఉండాలి'],
    },
    age: {
      type: Number,
      required: [true, 'వయస్సు తప్పనిసరి'],
      min: [0, 'వయస్సు 0 కంటే తక్కువ కాదు'],
      max: [120, 'వయస్సు 120 కంటే ఎక్కువ కాదు'],
    },
    gender: {
      type: String,
      required: [true, 'లింగం తప్పనిసరి'],
      enum: { values: ['పురుషుడు', 'స్త్రీ'], message: 'లింగం సరైనది కాదు' },
    },
    relationshipWithHead: {
      type: String,
      required: [true, 'కుటుంబ యజమానితో సంబంధం తప్పనిసరి'],
      trim: true,
      maxlength: [50, 'సంబంధం 50 అక్షరాలు మించకూడదు'],
    },
    occupationOrEducation: {
      type: String,
      trim: true,
      maxlength: [200, 'వృత్తి/చదువు 200 అక్షరాలు మించకూడదు'],
    },
    ownHouse: {
      type: String,
      enum: { values: ['ఉన్నది', 'లేదు', ''], message: 'సొంత ఇల్లు సరైనది కాదు' },
    },
    welfareSchemes: {
      type: String,
      required: [true, 'సంక్షేమ పథకాల స్థితి తప్పనిసరి'],
      enum: { values: ['వస్తుంది', 'లేదు'], message: 'సంక్షేమ పథకాలు సరైనది కాదు' },
    },
    maritalStatus: {
      type: String,
      required: [true, 'వివాహ స్థితి తప్పనిసరి'],
      enum: { values: ['వివాహిత', 'అవివాహిత', 'వితంతువు', 'విడాకులు'], message: 'వివాహ స్థితి సరైనది కాదు' },
    },
    governmentPension: {
      type: String,
      enum: { values: ['వస్తుంది', 'లేదు', ''], message: 'ప్రభుత్వ పెన్షన్ సరైనది కాదు' },
    },
    rationCard: {
      type: String,
      enum: { values: ['ఉంది', 'లేదు', ''], message: 'రేషన్ కార్డు సరైనది కాదు' },
    },
    freeUnits200: {
      type: String,
      enum: { values: ['వస్తుంది', 'లేదు', ''], message: 'ఉచిత కరెంటు సరైనది కాదు' },
    },
    mobileNo: {
      type: String,
      trim: true,
      match: [/^$|^[6-9]\d{9}$/, 'చెల్లుబాటు అయ్యే మొబైల్ నంబర్ నమోదు చేయండి'],
    },
    tailoringDependent: {
      type: String,
      enum: { values: ['అవును', 'కాదు', ''], message: 'సరైన విలువ కాదు' },
    },
  },
  { _id: false }
);

const householdSchema = new mongoose.Schema(
  {
    // Household Header
    rationCardNo: {
      type: String,
      trim: true,
    },
    isMigrant: {
      type: Boolean,
      default: false,
    },
    nativePlace: {
      type: String,
      trim: true,
      maxlength: [100, 'స్వగ్రామం 100 అక్షరాలు మించకూడదు'],
    },

    // Address
    houseNo: {
      type: String,
      required: [true, 'ఇంటి నంబర్ తప్పనిసరి'],
      trim: true,
      maxlength: [50, 'ఇంటి నంబర్ 50 అక్షరాలు మించకూడదు'],
    },
    street: {
      type: String,
      required: [true, 'వీధి/కాలనీ తప్పనిసరి'],
      trim: true,
      maxlength: [100, 'వీధి/కాలనీ 100 అక్షరాలు మించకూడదు'],
    },
    village: {
      type: String,
      required: [true, 'గ్రామం/నగరం తప్పనిసరి'],
      trim: true,
      maxlength: [100, 'గ్రామం/నగరం 100 అక్షరాలు మించకూడదు'],
    },
    divisionWardNo: {
      type: String,
      required: [true, 'డివిజన్/వార్డ్ నంబర్ తప్పనిసరి'],
      trim: true,
      maxlength: [50, 'డివిజన్/వార్డ్ నంబర్ 50 అక్షరాలు మించకూడదు'],
    },
    constituency: {
      type: String,
      required: [true, 'నియోజకవర్గం తప్పనిసరి'],
      trim: true,
      maxlength: [100, 'నియోజకవర్గం 100 అక్షరాలు మించకూడదు'],
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
    },

    // Family members (1–8)
    members: {
      type: [memberSchema],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 8,
        message: 'కనీసం 1 సభ్యుడు మరియు గరిష్టంగా 8 సభ్యులు నమోదు చేయవచ్చు',
      },
    },

    // Metadata
    ipAddress: { type: String },
    submittedByMobile: { type: String }, // head's mobile for reference
  },
  { timestamps: true }
);

// Indexes
householdSchema.index({ createdAt: -1 });
householdSchema.index({ district: 1 });
householdSchema.index({ 'members.mobileNo': 1 });
householdSchema.index({ rationCardNo: 1 });
householdSchema.index({ 'members.aadhaarNo': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Household', householdSchema);
