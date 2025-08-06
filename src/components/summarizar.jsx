"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, File, FileText, X, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { extractTextFromPDF } from "../components/utils/pdfReader"; // adjust path if needed

export default function Summarize() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summaryResult, setSummaryResult] = useState("");
  const fileInputRef = useRef(null);

  const acceptedTypes = [".txt", ".pdf", "text/plain", "application/pdf"];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Floating particles animation
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const validateFile = (file) => {
    if (!file) return false;

    // Check file type
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    const isValidType =
      acceptedTypes.includes(file.type) ||
      acceptedTypes.includes(fileExtension);

    if (!isValidType) {
      setError("Please upload only .txt or .pdf files");
      return false;
    }

    // Check file size
    if (file.size > maxFileSize) {
      setError("File size must be less than 10MB");
      return false;
    }

    setError("");
    return true;
  };

  const handleFileSelect = async (file) => {
    if (validateFile(file)) {
      setIsUploading(true);
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUploadedFile(file);
      setIsUploading(false);
      setShowSummary(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setShowSummary(false);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSummarize = async () => {
    setShowSummary(true);
    setSummaryResult(""); // Clear previous summary

    let text = "";

    // Read file content
    if (uploadedFile) {
      if (uploadedFile.type === "text/plain") {
        text = await uploadedFile.text();
      } else if (uploadedFile.type === "application/pdf") {
  text = await extractTextFromPDF(uploadedFile);
}
    }

    if (!text) {
      setSummaryResult("No text found in file.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/summarize",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setSummaryResult(data.summary || "No summary returned.");
    } catch (err) {
      setSummaryResult("Error summarizing: " + err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return extension === "pdf" ? (
      <File className="h-8 w-8 text-red-500" />
    ) : (
      <FileText className="h-8 w-8 text-blue-500" />
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-gradient-x"></div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6 relative z-10">
        <div className="text-center space-y-2 animate-fade-in-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            File Upload & Summarizer
          </h1>
          <p className="text-gray-600 animate-fade-in-up animation-delay-200">
            Upload your .txt or .pdf files to get started
          </p>
        </div>

        {/* Upload Area */}
        {!uploadedFile && !isUploading && (
          <Card
            className={`border-2 border-dashed transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-400 ${
              isDragOver
                ? "border-blue-400 bg-blue-50 shadow-lg shadow-blue-200/50 scale-105"
                : "border-gray-300 hover:border-gray-400 hover:shadow-xl"
            }`}
          >
            <CardContent className="p-8">
              <div
                className="text-center space-y-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex justify-center">
                  <Upload
                    className={`h-12 w-12 transition-all duration-300 ${
                      isDragOver
                        ? "text-blue-500 animate-bounce"
                        : "text-gray-400 hover:text-blue-500"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Drop your files here, or{" "}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200 hover:scale-105 inline-block transform"
                    >
                      browse
                    </button>
                  </h3>
                  <p className="text-sm text-gray-500">
                    Supports: .txt, .pdf files up to 10MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,text/plain,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <Card className="border border-blue-200 bg-blue-50 animate-fade-in-up">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-blue-500 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Uploading your file...
                  </h3>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-progress"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="animate-shake">
            <Alert variant="destructive" className="animate-fade-in-up">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Uploaded File Display */}
        {uploadedFile && (
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up animation-delay-200 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="animate-bounce">
                    {getFileIcon(uploadedFile.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {uploadedFile.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadedFile.size)} •{" "}
                      {uploadedFile.type || "Unknown type"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Summarize Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleSummarize}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-110 hover:shadow-lg animate-pulse-slow"
                >
                  <Sparkles className="h-4 w-4 mr-2 animate-spin-slow" />
                  Summarize
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Result */}
        {showSummary && (
          <Card className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-fade-in-up animation-delay-300 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-3 rounded-full animate-bounce shadow-lg">
                    <Sparkles className="h-6 w-6 text-white animate-spin-slow" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-800 animate-fade-in-up">
                  Summary
                </h3>
                <p className="text-green-700 animate-fade-in-up animation-delay-200">
                  {summaryResult || "Summarizing..."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-progress {
          animation: progress 1.5s ease-in-out;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
