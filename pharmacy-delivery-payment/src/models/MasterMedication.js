const mongoose = require('mongoose');
const { Schema } = mongoose;
const { DOSAGE_FORMS, MEDICATION_CATEGORIES } = require('../config/constants');

const masterMedicationSchema = new Schema({
  nameEnglish: { type: String, required: true, maxlength: 200 },
  nameAmharic: { type: String, required: true },
  genericName: { type: String },
  dosageStrength: { type: String },
  dosageForm: { 
    type: String, 
    enum: DOSAGE_FORMS
  },
  category: { 
    type: String, 
    enum: MEDICATION_CATEGORIES
  },
  requiresPrescription: { type: Boolean, default: false },
  controlledSubstance: { type: Boolean, default: false }
}, { timestamps: true });

// Text index for search
masterMedicationSchema.index({ 
  nameEnglish: 'text', 
  nameAmharic: 'text', 
  genericName: 'text' 
});

// Compound index for duplicate prevention
masterMedicationSchema.index({ 
  nameEnglish: 1, 
  dosageStrength: 1, 
  dosageForm: 1 
});

module.exports = mongoose.model('MasterMedication', masterMedicationSchema);
