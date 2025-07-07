import React from "react";

const ResumeUpload = ({ selectedFile, onFileChange }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">上传简历</h2>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">选择文件</span>
            <span className="label-text-alt">支持 PDF、Word、TXT 格式</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered file-input-primary w-full"
            accept=".pdf,.doc,.docx,.txt"
            onChange={onFileChange}
          />
          {selectedFile && (
            <div className="alert alert-success mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>已选择: {selectedFile.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
