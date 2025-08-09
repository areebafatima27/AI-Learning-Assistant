"use client";
import { useState, useRef, useEffect } from "react";
import {
  Upload,
  File,
  FileText,
  X,
  Sparkles,
  CheckCircle,
  Type,
  FileUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useStatsStore } from "../store";

export default function Summarize() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState("file"); // "file" or "text"
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summaryResult, setSummaryResult] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const fileInputRef = useRef(null);

  const acceptedTypes = [".txt", ".pdf", "text/plain", "application/pdf"];
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxTextLength = 50000; // 50k characters
  const incrementDocuments = useStatsStore((state) => state.incrementDocuments);

  // Floating particles animation
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 25,
      delay: Math.random() * 8,
    }));
    setParticles(newParticles);
  }, []);

  // Show notification when summary is displayed
  useEffect(() => {
    if (showSummary && summaryResult) {
      setShowNotification(true);
      // Auto hide notification after 4 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSummary, summaryResult]);

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

  const validateText = (text) => {
    if (!text || text.trim().length === 0) {
      setError("Please enter some text to summarize");
      return false;
    }

    if (text.length > maxTextLength) {
      setError(
        `Text is too long. Maximum ${maxTextLength.toLocaleString()} characters allowed`
      );
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
      setPastedText(""); // Clear text when file is uploaded
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setPastedText(text);
    setUploadedFile(null); // Clear file when text is entered
    setShowSummary(false);

    if (text.length > maxTextLength) {
      setError(
        `Text is too long. Maximum ${maxTextLength.toLocaleString()} characters allowed`
      );
    } else {
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setInputMode("file");
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
    setShowNotification(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearText = () => {
    setPastedText("");
    setShowSummary(false);
    setError("");
    setShowNotification(false);
  };

  const handleSummarize = async () => {
    let isValid = false;

    if (inputMode === "file" && uploadedFile) {
      isValid = validateFile(uploadedFile);
    } else if (inputMode === "text" && pastedText) {
      isValid = validateText(pastedText);
    } else {
      setSummaryResult("Please upload a file or enter text to summarize.");
      return;
    }

    if (!isValid) return;

    setShowSummary(true);
    setSummaryResult(""); // Clear previous summary

    try {
      let response;

      if (inputMode === "file" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);

        response = await fetch("http://localhost:5000/api/summarize", {
          method: "POST",
          body: formData,
        });
      } else if (inputMode === "text" && pastedText) {
        response = await fetch("http://localhost:5000/api/summarize-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: pastedText }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        if (!data.summary?.trim()) {
          setSummaryResult(
            "The content appears to have no extractable text to summarize."
          );
        } else {
          setSummaryResult(data.summary);

          // ✅ Increment global counter when summary is successful
          incrementDocuments();
        }
      } else {
        setSummaryResult("Error: " + data.error);
      }
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

  // Animation styles as JSX objects
  const floatingOrbStyle = {
    animation: "floatGentle 16s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const floatingOrbDelayedStyle = {
    animation:
      "floatGentleDelayed 20s cubic-bezier(0.4, 0, 0.6, 1) infinite 4s",
  };

  const pulseSubtleStyle = {
    animation: "pulseSubtle 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const particleStyle = (particle) => ({
    animation: `floatParticle ${particle.duration}s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite ${particle.delay}s`,
  });

  const fadeUpStyle = {
    animation: "fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const fadeUpDelayedStyle = {
    animation: "fadeUpDelayed 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
  };

  const slideInStyle = {
    animation: "slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const bounceGentleStyle = {
    animation: "bounceGentle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const spinElegantStyle = {
    animation: "spinElegant 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const progressStyle = {
    animation: "progressWave 2.5s cubic-bezier(0.65, 0, 0.35, 1)",
  };

  const shakeStyle = {
    animation: "shakeGentle 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
  };

  const scaleInStyle = {
    animation: "scaleIn 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const revealUpStyle = {
    animation: "revealUp 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const sparkleStyle = {
    animation: "sparkle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const spinnerStyle = {
    animation: "spinner 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* CSS Keyframes */}
      <style>{`
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33% { transform: translateY(-8px) rotate(0.3deg) scale(1.01); }
          66% { transform: translateY(-4px) rotate(-0.2deg) scale(0.99); }
        }
        
        @keyframes floatGentleDelayed {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-6px) rotate(-0.3deg) scale(1.005); }
          50% { transform: translateY(-12px) rotate(0.2deg) scale(0.995); }
          75% { transform: translateY(-3px) rotate(0.1deg) scale(1.01); }
        }
        
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.2; }
          25% { transform: translateY(-8px) translateX(4px) scale(1.1); opacity: 0.4; }
          50% { transform: translateY(-5px) translateX(-2px) scale(0.9); opacity: 0.3; }
          75% { transform: translateY(-12px) translateX(3px) scale(1.05); opacity: 0.35; }
        }
        
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes fadeUpDelayed {
          0% { opacity: 0; transform: translateY(40px) scale(0.95) rotateX(10deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); }
        }
        
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(120%) translateY(-20px) scale(0.9); }
          70% { opacity: 0.8; transform: translateX(-5px) translateY(0px) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) translateY(0) scale(1); }
        }
        
        @keyframes bounceGentle {
          0%, 100% { transform: translateY(0px) rotateY(0deg); }
          25% { transform: translateY(-2px) rotateY(5deg); }
          75% { transform: translateY(-1px) rotateY(-3deg); }
        }
        
        @keyframes spinElegant {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.05); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes progressWave {
          0% { width: 0%; transform: translateX(-100%) skewX(-20deg); }
          50% { transform: translateX(0%) skewX(5deg); }
          100% { width: 100%; transform: translateX(0%) skewX(0deg); }
        }
        
        @keyframes shakeGentle {
          0%, 100% { transform: translateX(0) rotateZ(0deg); }
          10% { transform: translateX(-4px) rotateZ(-0.3deg); }
          20% { transform: translateX(4px) rotateZ(0.3deg); }
          30% { transform: translateX(-3px) rotateZ(-0.2deg); }
          40% { transform: translateX(3px) rotateZ(0.2deg); }
          50% { transform: translateX(-2px) rotateZ(-0.1deg); }
          60% { transform: translateX(2px) rotateZ(0.1deg); }
        }
        
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes revealUp {
          0% { opacity: 0; transform: translateY(60px) scale(0.9) rotateX(15deg); filter: blur(10px); }
          60% { opacity: 0.8; transform: translateY(10px) scale(1.02) rotateX(2deg); filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); filter: blur(0px); }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.2); }
          50% { transform: rotate(180deg) scale(0.8); }
          75% { transform: rotate(270deg) scale(1.1); }
        }
        
        @keyframes spinner {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes pulseSubtle {
          0%, 100% { opacity: 0.1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.25; transform: scale(1.05) rotate(1deg); }
        }
      `}</style>

      {/* Professional Modern Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50"></div>

        {/* Geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Subtle gradient orbs */}
        <div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-full blur-3xl"
          style={floatingOrbStyle}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-100/15 to-pink-100/15 rounded-full blur-3xl"
          style={floatingOrbDelayedStyle}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-100/10 to-blue-100/10 rounded-full blur-3xl"
          style={pulseSubtleStyle}
        ></div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-blue-200/30 to-indigo-200/30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              ...particleStyle(particle),
            }}
          />
        ))}
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50" style={slideInStyle}>
          <div className="bg-white/95 backdrop-blur-lg border border-emerald-200 rounded-xl shadow-xl shadow-emerald-100/50 p-4 flex items-center space-x-3 max-w-sm">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Summary Ready!
              </p>
              <p className="text-xs text-gray-600">
                Your content has been successfully summarized.
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4" style={fadeUpStyle}>
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50 shadow-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              AI-Powered Document Analysis
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Document Summarizer
          </h1>
          <p className="text-gray-600 text-lg font-medium max-w-md mx-auto">
            Transform lengthy documents into concise, intelligent summaries in
            seconds
          </p>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex justify-center" style={fadeUpDelayedStyle}>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 shadow-sm">
            <div className="flex space-x-1">
              <button
                onClick={() => setInputMode("file")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  inputMode === "file"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
                }`}
              >
                <FileUp className="h-4 w-4" />
                <span>Upload File</span>
              </button>
              <button
                onClick={() => setInputMode("text")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  inputMode === "text"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
                }`}
              >
                <Type className="h-4 w-4" />
                <span>Paste Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        {inputMode === "file" && !uploadedFile && !isUploading && (
          <Card
            className={`border-2 border-dashed transition-all duration-700 ease-out backdrop-blur-sm ${
              isDragOver
                ? "border-blue-400 bg-blue-500 shadow-xl shadow-blue-200/25 bg-white-800"
                : "border-gray-300 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-200/50 bg-white/70 hover:bg-white/80"
            }`}
            style={fadeUpDelayedStyle}
          >
            <CardContent className="p-12">
              <div
                className="text-center space-y-6"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex justify-center">
                  <div
                    className={`p-6 rounded-2xl transition-all duration-500 ${
                      isDragOver
                        ? "bg-blue-100 shadow-lg"
                        : "bg-gray-100 hover:bg-gray-200 shadow-md"
                    }`}
                    style={isDragOver ? bounceGentleStyle : {}}
                  >
                    <Upload
                      className={`h-12 w-12 transition-all duration-500 ${
                        isDragOver ? "text-blue-600" : "text-gray-500"
                      }`}
                      style={isDragOver ? sparkleStyle : {}}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Drop your files here, or{" "}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4 transition-all duration-300 hover:decoration-blue-700 font-semibold"
                    >
                      browse
                    </button>
                  </h3>
                  <p className="text-gray-500 font-medium">
                    Supports .txt and .pdf files up to 10MB
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

        {/* Text Paste Area */}
        {inputMode === "text" && (
          <Card
            className="border border-gray-300 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-200/50 bg-white/70 hover:bg-white/80 transition-all duration-500 backdrop-blur-sm"
            style={fadeUpDelayedStyle}
          >
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <Type className="h-5 w-5 text-gray-600" />
                    <span>Paste Your Text</span>
                  </h3>
                  {pastedText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearText}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-300 rounded-full p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <textarea
                  value={pastedText}
                  onChange={handleTextChange}
                  placeholder="Paste your text here to summarize... (up to 50,000 characters)"
                  className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400"
                  maxLength={maxTextLength}
                />
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {pastedText.length.toLocaleString()} /{" "}
                    {maxTextLength.toLocaleString()} characters
                  </span>
                  {pastedText.length > maxTextLength * 0.9 && (
                    <span className="text-orange-600 font-medium">
                      Approaching character limit
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <Card
            className="border border-blue-200 bg-blue-50/80 backdrop-blur-sm shadow-lg"
            style={fadeUpStyle}
          >
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="p-6 bg-blue-100 rounded-2xl shadow-lg">
                    <Upload
                      className="h-12 w-12 text-blue-600"
                      style={spinElegantStyle}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-900">
                    Processing your document...
                  </h3>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm"
                      style={progressStyle}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div style={shakeStyle}>
            <Alert
              variant="destructive"
              className="bg-red-50/80 backdrop-blur-sm border-red-200 shadow-lg"
              style={fadeUpStyle}
            >
              <AlertDescription className="font-medium">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Uploaded File Display */}
        {uploadedFile && (
          <Card
            className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-sm"
            style={scaleInStyle}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div style={bounceGentleStyle}>
                    {getFileIcon(uploadedFile.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {uploadedFile.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {formatFileSize(uploadedFile.size)} •{" "}
                      {uploadedFile.type || "Unknown type"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-300 rounded-full p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Summarize Button */}
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleSummarize}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-400 group hover:shadow-lg hover:shadow-blue-200/50 hover:scale-105"
                >
                  <Sparkles className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-180" />
                  Generate Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Text Content Display & Summarize */}
        {inputMode === "text" && pastedText && (
          <Card
            className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-sm"
            style={scaleInStyle}
          >
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Type className="h-6 w-6 text-gray-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Text Content
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {pastedText.length.toLocaleString()} characters • Ready
                        to summarize
                      </p>
                    </div>
                  </div>
                </div>

                {/* Text Preview */}
                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {pastedText.length > 200
                      ? `${pastedText.substring(0, 200)}...`
                      : pastedText}
                  </p>
                </div>

                {/* Summarize Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleSummarize}
                    disabled={!pastedText.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-400 group hover:shadow-lg hover:shadow-blue-200/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Sparkles className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-180" />
                    Generate Summary
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Result */}
        {showSummary && (
          <Card
            className="border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-sm shadow-lg"
            style={revealUpStyle}
          >
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg">
                    <Sparkles
                      className="h-6 w-6 text-white"
                      style={sparkleStyle}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-800">
                    Summary
                  </h3>
                </div>
                <div className="bg-white/80 rounded-xl p-6 border border-emerald-100 shadow-sm">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {summaryResult || (
                      <span className="flex items-center space-x-2">
                        <div
                          className="rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"
                          style={spinnerStyle}
                        ></div>
                        <span>Generating intelligent summary...</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
