export function validateHousehold(data) {
  const errors = {};

  if (!data.houseNo || data.houseNo.trim().length === 0)
    errors.houseNo = 'ఇంటి నంబర్ తప్పనిసరి';
  else if (data.houseNo.trim().length > 50)
    errors.houseNo = 'ఇంటి నంబర్ 50 అక్షరాలు మించకూడదు';

  if (!data.street || data.street.trim().length === 0)
    errors.street = 'వీధి/కాలనీ తప్పనిసరి';
  else if (data.street.trim().length > 100)
    errors.street = 'వీధి/కాలనీ 100 అక్షరాలు మించకూడదు';

  if (!data.village || data.village.trim().length < 2)
    errors.village = 'గ్రామం/నగరం తప్పనిసరి (కనీసం 2 అక్షరాలు)';

  if (!data.divisionWardNo || data.divisionWardNo.trim().length === 0)
    errors.divisionWardNo = 'డివిజన్ లేదా వార్డ్ నంబర్ తప్పనిసరి';

  if (!data.constituency || data.constituency.trim().length < 2)
    errors.constituency = 'నియోజకవర్గం తప్పనిసరి';

  if (!data.mandal || data.mandal.trim().length < 2)
    errors.mandal = 'మండలం తప్పనిసరి';

  if (!data.district)
    errors.district = 'జిల్లా తప్పనిసరి';

  if (data.rationCardNo && data.rationCardNo.trim().length > 0) {
    if (!/^[A-Za-z0-9/-]{4,20}$/.test(data.rationCardNo.trim()))
      errors.rationCardNo = 'రేషన్ కార్డు నంబర్ సరైన ఆకృతిలో నమోదు చేయండి';
  }

  if (data.nativePlace && data.nativePlace.trim().length > 0) {
    if (data.nativePlace.trim().length < 2)
      errors.nativePlace = 'స్వగ్రామం కనీసం 2 అక్షరాలు ఉండాలి';
    else if (data.nativePlace.trim().length > 100)
      errors.nativePlace = 'స్వగ్రామం 100 అక్షరాలు మించకూడదు';
  }

  return errors;
}

export function validateMember(member, index) {
  const errors = {};
  const prefix = `member_${index}`;

  if (index === 0 && (!member.surname || member.surname.trim().length === 0))
    errors[`${prefix}_surname`] = 'కుటుంబయజమాని ఇంటి పేరు తప్పనిసరి';

  if (!member.name || member.name.trim().length < 2)
    errors[`${prefix}_name`] = 'పేరు తప్పనిసరి (కనీసం 2 అక్షరాలు)';
  else if (member.name.trim().length > 100)
    errors[`${prefix}_name`] = 'పేరు 100 అక్షరాలు మించకూడదు';

  if (member.age === '' || member.age === null || member.age === undefined)
    errors[`${prefix}_age`] = 'వయస్సు తప్పనిసరి';
  else if (isNaN(Number(member.age)) || Number(member.age) < 0 || Number(member.age) > 120)
    errors[`${prefix}_age`] = 'వయస్సు 0-120 మధ్య ఉండాలి';

  if (!member.gender)
    errors[`${prefix}_gender`] = 'లింగం తప్పనిసరి';

  if (!member.relationshipWithHead || member.relationshipWithHead.trim().length < 2)
    errors[`${prefix}_relationshipWithHead`] = 'కుటుంబయజమానితో సంబంధం తప్పనిసరి';

  if (!member.aadhaarNo || member.aadhaarNo.trim() === '')
    errors[`${prefix}_aadhaarNo`] = 'ఆధార్ నంబర్ తప్పనిసరి';
  else if (!/^\d{12}$/.test(member.aadhaarNo.trim()))
    errors[`${prefix}_aadhaarNo`] = 'ఆధార్ నంబర్ 12 అంకెలు ఉండాలి';

  if (index === 0 && !member.ownHouse)
    errors[`${prefix}_ownHouse`] = 'సొంత ఇల్లు ఎంచుకోండి';

  if (!member.maritalStatus)
    errors[`${prefix}_maritalStatus`] = 'వివాహ స్థితి ఎంచుకోండి';

  if (index === 0 && !member.freeUnits200)
    errors[`${prefix}_freeUnits200`] = 'ఉచిత కరెంటు స్థితి ఎంచుకోండి';

  if (!member.welfareSchemes)
    errors[`${prefix}_welfareSchemes`] = 'సంక్షేమ పథకాల స్థితి ఎంచుకోండి';

  if (member.mobileNo && member.mobileNo.trim() !== '') {
    if (!/^[6-9]\d{9}$/.test(member.mobileNo.trim()))
      errors[`${prefix}_mobileNo`] = 'చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి';
  }

  return errors;
}

export function validateAllMembers(members) {
  let allErrors = {};
  members.forEach((member, i) => {
    const memberErrors = validateMember(member, i);
    allErrors = { ...allErrors, ...memberErrors };
  });

  // Check for duplicate aadhaar numbers within same submission
  const aadhaarSeen = new Set();
  members.forEach((member, i) => {
    if (member.aadhaarNo && member.aadhaarNo.trim()) {
      if (aadhaarSeen.has(member.aadhaarNo.trim())) {
        allErrors[`member_${i}_aadhaarNo`] = 'ఈ ఆధార్ నంబర్ పైన మరొక సభ్యుడికి వాడారు';
      }
      aadhaarSeen.add(member.aadhaarNo.trim());
    }
  });

  // Check for duplicate mobile numbers within same submission
  const mobileSeen = new Set();
  members.forEach((member, i) => {
    if (member.mobileNo && member.mobileNo.trim()) {
      if (mobileSeen.has(member.mobileNo.trim())) {
        allErrors[`member_${i}_mobileNo`] = 'ఈ మొబైల్ నంబర్ పైన మరొక సభ్యుడికి వాడారు';
      }
      mobileSeen.add(member.mobileNo.trim());
    }
  });

  // Warn if member 1 has no mobile (not an error, just info)
  return allErrors;
}
