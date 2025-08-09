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
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  HelpCircle,
  ChevronDown,
} from "../icons"
import { useNavigate } from "react-router-dom";
import { useStatsStore } from "../store";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const statsFromStore = useStatsStore((state) => state.stats);
  const incrementDocuments = useStatsStore((state) => state.incrementDocuments);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("English")

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

   useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsMenu && !event.target.closest(".settings-menu")) {
        setShowSettingsMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showSettingsMenu])

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

    const settingsMenuItems = [
    {
      icon: User,
      label: "Profile Settings",
      description: "Manage your account and profile",
      action: () => navigate("/profile"),
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Configure notification preferences",
      toggle: true,
      value: notifications,
      action: () => setNotifications(!notifications),
    },
    {
      icon: darkMode ? Sun : Moon,
      label: "Theme",
      description: darkMode ? "Switch to light mode" : "Switch to dark mode",
      toggle: true,
      value: darkMode,
      action: () => setDarkMode(!darkMode),
    },
    {
      icon: Globe,
      label: "Language",
      description: `Currently: ${language}`,
      action: () => {
        // Toggle between languages for demo
        setLanguage(language === "English" ? "Spanish" : "English")
      },
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      description: "Manage your privacy settings",
      action: () => navigate("/privacy"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help and contact support",
      action: () => navigate("/help"),
    },
  ]

  const stats = [
    {
      label: "Documents Processed",
      value: statsFromStore.documentsProcessed,
      icon: FileText,
    },
    {
      label: "Questions Asked",
      value: statsFromStore.questionsAsked,
      icon: MessageCircle,
    },
    {
      label: "Flashcards Created",
      value: statsFromStore.flashcardsCreated,
      icon: Brain,
    },
    {
      label: "Quizzes Completed",
      value: statsFromStore.quizzesCompleted,
      icon: ClipboardCheck,
    },
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
              {/* Settings Menu */}
              <div className="relative settings-menu">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="relative"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                  <ChevronDown
                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${showSettingsMenu ? "rotate-180" : ""}`}
                  />
                </Button>

                {/* Settings Dropdown Menu */}
                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                      <p className="text-sm text-gray-500">Manage your preferences</p>
                    </div>

                    <div className="py-2">
                      {settingsMenuItems.map((item, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                          onClick={item.action}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <item.icon className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.description}</p>
                              </div>
                            </div>
                            {item.toggle && (
                              <div
                                className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                                  item.value ? "bg-blue-500" : "bg-gray-300"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 mt-1 ${
                                    item.value ? "translate-x-5" : "translate-x-1"
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <div
                        className="px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors duration-200"
                        onClick={handleLogout}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-600">Sign Out</p>
                            <p className="text-xs text-red-400">Sign out of your account</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
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
          <p className="text-lg text-gray-600">Ready to supercharge your learning today?</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
            <h3 className="text-2xl font-bold text-gray-900">What would you like to do?</h3>
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
                      <feature.icon className={`w-6 h-6 ${feature.textColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">{feature.description}</CardDescription>
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
                <h3 className="text-2xl font-bold mb-2 p-2">Ready to get started?</h3>
                <p className="text-blue-100 mb-4">Upload your first document and let AI do the magic!</p>

                <input id="fileInput" type="file" accept=".txt, .pdf" onChange={handleFileChange} className="hidden" />
                {selectedFile && (
                  <div className="mt-4 bg-gray-100 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-800">File: {selectedFile.name}</p>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {fileContent.substring(0, 500)}
                      {fileContent.length > 500 && "..."}
                    </p>
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
  )
}


export default Dashboard;
