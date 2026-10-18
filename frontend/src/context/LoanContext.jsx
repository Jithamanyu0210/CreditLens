import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_PROFILE, DEFAULT_LOAN_PARAMS, DEFAULT_SAVED_SCENARIOS } from '../data/defaultData';
import { 
  calculateEMI, 
  calculateAffordability, 
  generateAmortizationSchedule,
  calculateMaxAffordableLoan,
  calculateEmergencyFundPlan,
  assessLoanSolvency,
  generateFinancialRecommendations
} from '../utils/loanCalculations';
import { profileAPI, scenarioAPI } from '../services/api';
import { useAuth } from './AuthContext';

const LoanContext = createContext();

export const LoanProvider = ({ children }) => {
  const { user } = useAuth();

  // Financial Profile state
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('creditlens_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          otherExpenses: parsed.otherExpenses ?? 0,
          monthlySavingsTarget: parsed.monthlySavingsTarget ?? 0,
          currentSavings: parsed.currentSavings ?? 0
        };
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Active Loan Parameters (used across Calculator, Schedule, Affordability, Prepayment)
  const [loanParams, setLoanParams] = useState(() => {
    try {
      const saved = localStorage.getItem('creditlens_active_loan');
      return saved ? JSON.parse(saved) : DEFAULT_LOAN_PARAMS;
    } catch {
      return DEFAULT_LOAN_PARAMS;
    }
  });

  // Saved scenarios state with history tracking
  const [savedScenarios, setSavedScenarios] = useState(() => {
    try {
      const token = localStorage.getItem('creditlens_token');
      const saved = localStorage.getItem('creditlens_scenarios');
      if (saved) return JSON.parse(saved);
      // Authenticated users start with empty real scenarios, not dummy data
      if (token) return [];
      return DEFAULT_SAVED_SCENARIOS;
    } catch {
      return [];
    }
  });

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync profile to localStorage
  useEffect(() => {
    localStorage.setItem('creditlens_profile', JSON.stringify(profile));
  }, [profile]);

  // Sync active loan to localStorage
  useEffect(() => {
    localStorage.setItem('creditlens_active_loan', JSON.stringify(loanParams));
  }, [loanParams]);

  // Sync saved scenarios to localStorage
  useEffect(() => {
    localStorage.setItem('creditlens_scenarios', JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  // React to user authentication state
  useEffect(() => {
    const token = localStorage.getItem('creditlens_token');

    if (user && token) {
      // Authenticated real user: fetch real data from MongoDB
      profileAPI.getProfile()
        .then((res) => {
          if (res && res.profile) {
            setProfile((prev) => ({
              ...prev,
              ...res.profile,
              otherExpenses: res.profile.otherExpenses ?? 0
            }));
          }
        })
        .catch((err) => {
          console.warn('[CreditLens] Could not load profile from MongoDB:', err.message);
        });

      scenarioAPI.getScenarios()
        .then((res) => {
          if (res && Array.isArray(res.scenarios)) {
            setSavedScenarios(res.scenarios.map((s) => ({ ...s, id: s._id || s.id })));
          }
        })
        .catch((err) => {
          console.warn('[CreditLens] Could not load scenarios from MongoDB:', err.message);
        });
    } else {
      setProfile(DEFAULT_PROFILE);
      setSavedScenarios([]);
    }
  }, [user]);

  // Update profile handler with database feedback
  const updateProfile = (newProfile) => {
    const merged = { ...profile, ...newProfile };
    setProfile(merged);

    const token = localStorage.getItem('creditlens_token');
    if (token) {
      profileAPI.saveProfile(merged)
        .then(() => {
          showToast('Financial profile saved to MongoDB successfully!');
        })
        .catch((err) => {
          showToast(err.message || 'Database unavailable. Profile not persisted.', 'error');
        });
    } else {
      showToast('Profile updated locally.');
    }
  };

  const resetProfileToDefault = () => {
    setProfile(DEFAULT_PROFILE);
    const token = localStorage.getItem('creditlens_token');
    if (token) {
      profileAPI.deleteProfile().catch(() => {});
    }
    showToast('Financial profile cleared.');
  };

  // Individual Existing Loans CRUD
  const addExistingLoan = (loanItem) => {
    const newItem = {
      id: `emi_${Date.now()}`,
      name: loanItem.name.trim() || 'Personal Loan',
      amount: Math.max(0, Number(loanItem.amount) || 0),
      balance: Math.max(0, Number(loanItem.balance) || 0),
      annualRate: Math.max(0, Number(loanItem.annualRate) || 10.0),
      remainingMonths: Math.max(1, Math.round(Number(loanItem.remainingMonths) || 12))
    };
    setProfile((prev) => {
      const updated = {
        ...prev,
        existingEmis: [...prev.existingEmis, newItem]
      };
      const token = localStorage.getItem('creditlens_token');
      if (token) {
        profileAPI.saveProfile(updated).catch(() => {});
      }
      return updated;
    });
    showToast(`Added "${newItem.name}" to existing loans.`);
  };

  const updateExistingLoan = (id, updatedFields) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        existingEmis: prev.existingEmis.map((item) =>
          item.id === id ? { ...item, ...updatedFields } : item
        )
      };
      const token = localStorage.getItem('creditlens_token');
      if (token) {
        profileAPI.saveProfile(updated).catch(() => {});
      }
      return updated;
    });
    showToast('Loan details updated.');
  };

  const deleteExistingLoan = (id) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        existingEmis: prev.existingEmis.filter((item) => item.id !== id)
      };
      const token = localStorage.getItem('creditlens_token');
      if (token) {
        profileAPI.saveProfile(updated).catch(() => {});
      }
      return updated;
    });
    showToast('Existing loan deleted.', 'info');
  };

  // Update active loan parameters
  const updateLoanParams = (newParams) => {
    setLoanParams((prev) => ({ ...prev, ...newParams }));
  };

  // Save current or custom scenario
  const saveScenario = (name, customLoan = null, notes = '', tags = ['General']) => {
    const loanToSave = customLoan || loanParams;
    const calc = calculateEMI(loanToSave.principal, loanToSave.annualRate, loanToSave.tenureMonths);

    const tempId = `scen_${Date.now()}`;
    const newScenario = {
      id: tempId,
      name: name.trim() || `Loan Scenario ${savedScenarios.length + 1}`,
      principal: loanToSave.principal,
      annualRate: loanToSave.annualRate,
      tenureMonths: loanToSave.tenureMonths,
      emi: calc.emi,
      totalInterest: calc.totalInterest,
      totalPayment: calc.totalPayment,
      createdAt: new Date().toISOString(),
      notes: notes || 'Saved from CreditLens calculator',
      tags: Array.isArray(tags) ? tags : ['General']
    };

    setSavedScenarios((prev) => [newScenario, ...prev]);
    const token = localStorage.getItem('creditlens_token');
    if (token) {
      scenarioAPI.createScenario({
        name: newScenario.name,
        principal: newScenario.principal,
        annualRate: newScenario.annualRate,
        tenureMonths: newScenario.tenureMonths,
        notes: newScenario.notes,
        tags: newScenario.tags
      }).then((res) => {
        if (res && res.scenario) {
          const backendId = res.scenario._id || res.scenario.id;
          setSavedScenarios((prev) =>
            prev.map((s) => (s.id === tempId ? { ...s, id: backendId, _id: backendId } : s))
          );
          showToast(`"${newScenario.name}" saved to MongoDB!`, 'success');
        }
      }).catch((err) => {
        showToast(err.message || 'Database unavailable. Scenario not saved to MongoDB.', 'error');
      });
    } else {
      showToast(`"${newScenario.name}" saved to session.`);
    }

    return newScenario;
  };

  const updateScenario = (id, updatedData) => {
    setSavedScenarios((prev) =>
      prev.map((scen) => (scen.id === id ? { ...scen, ...updatedData, updatedAt: new Date().toISOString() } : scen))
    );
    const token = localStorage.getItem('creditlens_token');
    if (token) {
      scenarioAPI.updateScenario(id, updatedData)
        .then(() => showToast('Scenario updated in MongoDB.'))
        .catch((err) => showToast(err.message || 'Database update failed', 'error'));
    } else {
      showToast('Scenario updated locally.');
    }
  };

  // Delete saved scenario
  const deleteScenario = (id) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
    const token = localStorage.getItem('creditlens_token');
    if (token) {
      scenarioAPI.deleteScenario(id)
        .then(() => showToast('Scenario removed from MongoDB.', 'info'))
        .catch((err) => showToast(err.message || 'Database delete failed', 'error'));
    } else {
      showToast('Scenario removed from session.', 'info');
    }
  };

  // Load saved scenario into active loan params
  const loadScenarioIntoActive = (scenario) => {
    setLoanParams({
      principal: scenario.principal,
      annualRate: scenario.annualRate,
      tenureMonths: scenario.tenureMonths,
      tenureUnit: scenario.tenureMonths % 12 === 0 ? 'years' : 'months'
    });
    showToast(`Loaded "${scenario.name}" into active planner!`);
  };

  // Derived current calculations
  const activeEmiData = calculateEMI(loanParams.principal, loanParams.annualRate, loanParams.tenureMonths);
  const activeAffordability = calculateAffordability(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    activeEmiData.emi,
    profile.otherExpenses || 0
  );

  // Solvency: Can monthly EMI and total interest/principal be paid?
  const activeSolvency = assessLoanSolvency(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    loanParams.principal,
    loanParams.annualRate,
    loanParams.tenureMonths,
    profile.monthlySavingsTarget || 0,
    profile.otherExpenses || 0
  );

  // Maximum Affordable Loan capacity
  const activeMaxLoan = calculateMaxAffordableLoan(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    profile.monthlySavingsTarget || 0,
    loanParams.annualRate,
    loanParams.tenureMonths,
    profile.otherExpenses || 0
  );

  // Emergency Fund plan
  const activeEmergencyFund = calculateEmergencyFundPlan(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    activeEmiData.emi,
    profile.currentSavings || 0,
    profile.monthlySavingsTarget || 0,
    profile.otherExpenses || 0
  );

  // Tailored recommendations
  const activeRecommendations = generateFinancialRecommendations(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    loanParams.principal,
    loanParams.annualRate,
    loanParams.tenureMonths,
    profile.monthlySavingsTarget || 0,
    profile.otherExpenses || 0
  );

  return (
    <LoanContext.Provider
      value={{
        profile,
        updateProfile,
        resetProfileToDefault,
        addExistingLoan,
        updateExistingLoan,
        deleteExistingLoan,
        loanParams,
        updateLoanParams,
        activeEmiData,
        activeAffordability,
        activeSolvency,
        activeMaxLoan,
        activeEmergencyFund,
        activeRecommendations,
        savedScenarios,
        saveScenario,
        updateScenario,
        deleteScenario,
        loadScenarioIntoActive,
        toast,
        showToast
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
};
