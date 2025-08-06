"use client";

import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { extractTextFromPDF } from "../components/utils/pdfReader";
import { Button } from "../components/ui/button";
import {
  FileText,
  MessageCircle,
  Brain,
  ClipboardCheck,
  Sparkles,
  TrendingUp,
  Settings,
  User,
  LogOut,
} from "../icons";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const name = user.displayName || user.email.split("@")[0];
      setUserName(name);
    }

    // Update time
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const summarizeText = async (text) => {
    if (!text) return "No content to summarize.";
    // Replace this mock logic with real API call later
    const sentences = text.split(". ");
    const summary = sentences.slice(0, 3).join(". ") + ".";
    return summary;
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const features = [
    {
      title: "Summarize Content",
      description: "Get quick summaries of your documents and articles",
      icon: FileText,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      action: "Start Summarizing",
      route: "/summarizar",
    },
    {
      title: "Ask Questions",
      description: "Chat with your documents and get instant answers",
      icon: MessageCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      action: "Start Chatting",
      route: "/chatbot",
    },
    {
      title: "Generate Flashcards",
      description: "Create study cards from your content automatically",
      icon: Brain,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      action: "Create Cards",
      route: "/flashcard",
    },
    {
      title: "Take Quizzes",
      description: "Test your knowledge with AI-generated quizzes",
      icon: ClipboardCheck,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      action: "Start Quiz",
      route: "/quiz",
    },
  ];

  const stats = [
    { label: "Documents Processed", value: "0", icon: FileText },
    { label: "Questions Asked", value: "0", icon: MessageCircle },
    { label: "Flashcards Created", value: "0", icon: Brain },
    { label: "Quizzes Completed", value: "0", icon: ClipboardCheck },
  ];

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);



  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      const extractedText = await extractTextFromPDF(file);
      setFileContent(extractedText);
    } else {
      alert("Only .txt or .pdf files are supported.");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StudyAI</h1>
                <p className="text-sm text-gray-500">{currentTime}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {getGreeting()}, {userName}!
            </h2>
            <span className="text-3xl">👋</span>
          </div>
          <p className="text-lg text-gray-600">
            Ready to supercharge your learning today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              What would you like to do?
            </h3>
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon
                        className={`w-6 h-6 ${feature.textColor}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => navigate(feature.route)}
                  >
                    {feature.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2 p-2">
                  Ready to get started?
                </h3>
                <p className="text-blue-100 mb-4">
                  Upload your first document and let AI do the magic!
                </p>
                <Button
                  variant="outline"
                  className="bg-white text-blue-600 border-white hover:bg-blue-50"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  Upload .txt File
                </Button>

                <input
                  id="fileInput"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile && (
                  <div className="mt-4 bg-gray-100 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-800">
                      File: {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {fileContent.substring(0, 500)}
                      {fileContent.length > 500 && "..."}
                    </p>

                    {/* Summarize Button */}
                    <Button
                      onClick={async () => {
                        const s = await summarizeText(fileContent);
                        setSummary(s);
                      }}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Summarize Content
                    </Button>

                    {/* Summary Output */}
                    {summary && (
                      <div className="mt-4 p-4 bg-white border rounded shadow-sm">
                        <p className="text-sm font-semibold text-gray-800 mb-2">
                          Summary:
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {summary}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <Sparkles className="w-24 h-24 text-blue-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Dashboard;

