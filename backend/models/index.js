const mongoose = require('mongoose');

// ─── User ─────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  passwordHash:  { type: String, required: true },
  age:           { type: Number, default: 25 },
  income:        { type: Number, default: 0 },
  riskAppetite:  { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  primaryGoal:   { type: String, default: '' },
  currentSavings:{ type: Number, default: 0 },
  wealthArchetype: { type: String, default: 'Conservative Builder' },
  deviceId:      { type: String, default: () => 'DEV-' + Math.random().toString(36).substr(2,6).toUpperCase() },
  onboardingDone:{ type: Boolean, default: false },
}, { timestamps: true });

// ─── Transaction ──────────────────────────────────────────────────────────────
const transactionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount:      { type: Number, required: true },
  category:    { type: String, enum: ['Investment','Income','Food','Housing','Entertainment','Transport','Utilities','Other'], default: 'Other' },
  date:        { type: Date, default: Date.now },
  isExpense:   { type: Boolean, default: true },
}, { timestamps: true });

// ─── Goal ─────────────────────────────────────────────────────────────────────
const goalSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:          { type: String, required: true },
  targetAmount:  { type: Number, required: true },
  currentSaved:  { type: Number, default: 0 },
  deadline:      { type: Date },
  monthlyTarget: { type: Number, default: 0 },
  color:         { type: String, default: '#00D4FF' },
}, { timestamps: true });

// ─── Investment ───────────────────────────────────────────────────────────────
const investmentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['SIP','FD','Stock','MF','Other'], default: 'SIP' },
  name:      { type: String, required: true },
  amount:    { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  status:    { type: String, enum: ['Active','Paused','Matured'], default: 'Active' },
  returns:   { type: Number, default: 12.0 },
}, { timestamps: true });

// ─── Risk Log ─────────────────────────────────────────────────────────────────
const riskLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionType: { type: String, required: true },
  amount:     { type: Number, default: 0 },
  riskScore:  { type: Number, required: true },
  level:      { type: String, enum: ['LOW','MEDIUM','HIGH'], required: true },
  decision:   { type: String, enum: ['ALLOW','WARN','BLOCK'], required: true },
  reason:     { type: String },
  signals:    [String],
}, { timestamps: true });

// ─── Chat History ─────────────────────────────────────────────────────────────
const chatHistorySchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role:      { type: String, enum: ['user','assistant','system'] },
    content:   String,
    reason:    String,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = {
  User:        mongoose.model('User', userSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Goal:        mongoose.model('Goal', goalSchema),
  Investment:  mongoose.model('Investment', investmentSchema),
  RiskLog:     mongoose.model('RiskLog', riskLogSchema),
  ChatHistory: mongoose.model('ChatHistory', chatHistorySchema),
};
