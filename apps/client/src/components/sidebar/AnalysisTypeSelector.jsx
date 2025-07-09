import React from "react";
import { ANALYSIS_TYPES } from "../../hooks/useResumeAnalysis";

const AnalysisTypeSelector = ({ analysisType, onAnalysisTypeChange }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <span className="text-secondary">🎯</span>
          分析类型
        </h2>
        <div className="form-control flex flex-col gap-1 xl:text-lg text-md">
          {ANALYSIS_TYPES.map((type) => (
            <label key={type.id} className="label cursor-pointer">
              <span className="label-text flex items-center gap-2">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <div className="font-semibold">{type.title}</div>
                  <div className="text-sm opacity-70">{type.description}</div>
                </div>
              </span>
              <input
                type="radio"
                name="analysisType"
                className="radio radio-primary"
                checked={analysisType === type.id}
                onChange={() => onAnalysisTypeChange(type.id)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisTypeSelector;
