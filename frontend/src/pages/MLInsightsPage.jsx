import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Cpu,
  Sliders,
  Layers,
  Info
} from 'lucide-react';
import { fetchMLMetrics, retrainMLModel } from '../services/api';

export default function MLInsightsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await fetchMLMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setRetrainSuccess(false);
      const updated = await retrainMLModel();
      setMetrics(updated);
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 5000);
    } catch (err) {
      console.error('Retrain failed:', err);
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Statistical Modeling</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Machine Learning Pipeline & Evaluation
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Inspect our scikit-learn binary classification pipeline, feature coefficients, evaluation metrics, and institutional calibration safeguards.
          </p>
        </div>
        <div>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-colors disabled:bg-purple-400"
          >
            <RotateCcw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining Pipeline...' : 'Retrain Pipeline On Benchmark'}</span>
          </button>
        </div>
      </div>

      {retrainSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pipeline retrained successfully! Held-out test metrics and confusion matrix updated.</span>
        </div>
      )}

      {/* Prominent Academic & Ethical Notice */}
      <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Ethical AI Disclosure: Non-Fabrication & Synthetic Benchmark Notice</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          In strict compliance with academic integrity guidelines, we do <b>not</b> claim to possess proprietary historical placement records. The pipeline shown below is trained on a <b>synthetic statistical benchmark dataset (N=600)</b> with a strict <b>80/20 train/test split</b> to demonstrate proper scikit-learn preprocessing, feature scaling, model persistence, and evaluation rigor. Predictions should be interpreted as benchmark estimates, not guaranteed placement outcomes.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Retrieving model metrics & coefficients...</p>
        </div>
      ) : metrics ? (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Accuracy</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Evaluated on held-out 20% split</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precision</span>
              <div className="text-3xl font-extrabold text-blue-600 mt-2">
                {(metrics.precision * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Positive predictive value</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recall</span>
              <div className="text-3xl font-extrabold text-indigo-600 mt-2">
                {(metrics.recall * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">True positive rate</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">F1-Score</span>
              <div className="text-3xl font-extrabold text-purple-600 mt-2">
                {(metrics.f1_score * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Harmonic mean of precision & recall</p>
            </div>
          </div>

          {/* Architecture & Confusion Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pipeline Architecture */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Pipeline Architecture</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800">1. Feature Scaling: StandardScaler</span>
                  <p>Normalizes input features (CGPA, projects, internships, skill count) to zero mean and unit variance.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800">2. Estimator: LogisticRegression (L2 Regularized)</span>
                  <p>Applies balanced class weighting and sigmoid activation to generate well-calibrated odds ratios.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800">3. Stratification & Validation</span>
                  <p>{metrics.train_test_split} — eliminates data leakage between training and testing splits.</p>
                </div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Confusion Matrix (Held-out Test Split)</h3>
              <p className="text-xs text-slate-500">Distribution of actual vs predicted binary classifications</p>

              {metrics.confusion_matrix && (
                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-center">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-xl font-extrabold text-emerald-800">
                        {metrics.confusion_matrix[0][0]}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">True Negative</div>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="text-xl font-extrabold text-rose-800">
                        {metrics.confusion_matrix[0][1]}
                      </div>
                      <div className="text-[11px] text-rose-700 font-semibold mt-0.5">False Positive</div>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="text-xl font-extrabold text-rose-800">
                        {metrics.confusion_matrix[1][0]}
                      </div>
                      <div className="text-[11px] text-rose-700 font-semibold mt-0.5">False Negative</div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-xl font-extrabold text-emerald-800">
                        {metrics.confusion_matrix[1][1]}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">True Positive</div>
                    </div>
                  </div>
                  <div className="flex justify-between max-w-xs mx-auto text-[10px] text-slate-400 mt-3 px-1">
                    <span>Predicted Not Placed / Placed</span>
                    <span>N = {metrics.confusion_matrix[0][0] + metrics.confusion_matrix[0][1] + metrics.confusion_matrix[1][0] + metrics.confusion_matrix[1][1]} Test Samples</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Coefficients / Learned Weights */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Learned Feature Weights (Log-Odds Coefficients)</h3>
              <p className="text-xs text-slate-500">Relative impact of each standardized feature on the predicted probability</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(metrics.feature_coefficients || {}).map(([feature, coef]) => (
                <div
                  key={feature}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 capitalize">
                    {feature.replace(/_/g, ' ')}
                  </span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    coef >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {coef >= 0 ? `+${coef}` : coef}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
