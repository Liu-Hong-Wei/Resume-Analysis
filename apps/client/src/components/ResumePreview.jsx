import React from "react";

const ResumePreview = ({ resumeText }) => {
  if (!resumeText) return null;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">简历预览</h2>
        <div className="bg-base-200 p-4 rounded-lg max-h-40 overflow-y-auto">
          <p className="text-sm whitespace-pre-wrap">{resumeText}</p>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
