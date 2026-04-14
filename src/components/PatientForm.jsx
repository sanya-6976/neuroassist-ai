import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Phone, 
  Activity, 
  AlertCircle, 
  Stethoscope, 
  ClipboardList, 
  Target,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

const PatientForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    contactNumber: '',
    cpType: '',
    severityLevel: '',
    affectedBodyParts: [],
    mobilityStatus: '',
    currentTherapyType: '',
    previousTherapyHistory: '',
    doctorNotes: '',
    emergencyContact: '',
    goalsOfTherapy: ''
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const parts = [...formData.affectedBodyParts];
      if (checked) {
        parts.push(value);
      } else {
        const index = parts.indexOf(value);
        if (index > -1) parts.splice(index, 1);
      }
      setFormData(prev => ({ ...prev, affectedBodyParts: parts }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store in localStorage
    localStorage.setItem('patient_info', JSON.stringify(formData));
    // Also mark user as having completed the form
    const user = JSON.parse(localStorage.getItem('neuroassist_user') || '{}');
    user.hasCompletedForm = true;
    localStorage.setItem('neuroassist_user', JSON.stringify(user));
    
    navigate('/dashboard');
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const bodyParts = ['Left Arm', 'Right Arm', 'Left Leg', 'Right Leg', 'Trunk', 'Neck'];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ClipboardList size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight">Patient Information</h2>
            <p className="mt-2 text-slate-400 font-medium">Please fill in the details to personalize your therapy plan.</p>
            
            {/* Progress Bar */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 transition-all duration-500 ease-out" 
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-slate-400 whitespace-nowrap">Step {step} of {totalSteps}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Basic Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <input
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Age</label>
                  <input
                    required
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                    placeholder="Years"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Gender</label>
                  <select
                    required
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      required
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Medical Information */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Activity size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Medical Information</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Type of Cerebral Palsy</label>
                    <select
                      required
                      name="cpType"
                      value={formData.cpType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 outline-none transition-all appearance-none"
                    >
                      <option value="">Select Type</option>
                      <option value="spastic">Spastic CP</option>
                      <option value="dyskinetic">Dyskinetic CP</option>
                      <option value="ataxic">Ataxic CP</option>
                      <option value="mixed">Mixed CP</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Severity Level</label>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                      {['Mild', 'Moderate', 'Severe'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, severityLevel: level }))}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                            formData.severityLevel === level 
                            ? 'bg-white text-emerald-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Affected Body Parts (Select all that apply)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {bodyParts.map(part => (
                      <label 
                        key={part} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.affectedBodyParts.includes(part)
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={part}
                          checked={formData.affectedBodyParts.includes(part)}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium">{part}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Mobility Status</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Can walk', 'Needs support', 'Wheelchair'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mobilityStatus: status }))}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                          formData.mobilityStatus === status
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Therapy Details */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Stethoscope size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Therapy Details</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Current Therapy Type</label>
                  <input
                    name="currentTherapyType"
                    value={formData.currentTherapyType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none transition-all"
                    placeholder="e.g. Physiotherapy, Occupational Therapy"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Previous Therapy History</label>
                  <textarea
                    name="previousTherapyHistory"
                    value={formData.previousTherapyHistory}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none transition-all resize-none"
                    placeholder="Describe any past treatments or therapies..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Doctor/Physiotherapist Notes</label>
                  <textarea
                    name="doctorNotes"
                    value={formData.doctorNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none transition-all resize-none"
                    placeholder="Any specific instructions or clinical notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <AlertCircle size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Additional Details</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Emergency Contact (Name & Phone)</label>
                  <div className="relative">
                    <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      required
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-50 focus:border-amber-400 outline-none transition-all"
                      placeholder="Name, Relationship, Phone number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                    <Target size={16} className="text-amber-500" />
                    Goals of Therapy
                  </label>
                  <textarea
                    required
                    name="goalsOfTherapy"
                    value={formData.goalsOfTherapy}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-50 focus:border-amber-400 outline-none transition-all resize-none"
                    placeholder="What do you hope to achieve with NeuroAssist AI? (e.g. improved walking, better hand control)"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0 w-5 h-5 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Privacy Note:</strong> Your data is stored locally and securely. It is used only to customize your AI therapy sessions and track your progress.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-slate-100 pt-8">
            <button
              type="button"
              onClick={prevStep}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                step === 1 ? 'invisible' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Back
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 group shadow-xl shadow-slate-200"
              >
                Continue
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="submit"
                className="bg-sky-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-sky-700 transition-all flex items-center gap-2 shadow-xl shadow-sky-100"
              >
                Complete Submission
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
