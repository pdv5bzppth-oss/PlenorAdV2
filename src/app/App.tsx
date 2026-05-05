import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { GlobalSettingsProvider } from "./contexts/GlobalSettingsContext";
import { AuthPage } from "./components/AuthPage";
import { EnhancedDashboard } from "./components/EnhancedDashboard";
import { EnhancedArticleEditor } from "./components/EnhancedArticleEditor";
import { AdminPanel } from "./components/AdminPanel";

type View = "dashboard" | "editor";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [editingArticleId, setEditingArticleId] = useState<
    string | undefined
  >();
  const [showAdmin, setShowAdmin] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleCreateNew = () => {
    setEditingArticleId(undefined);
    setView("editor");
  };

  const handleEditArticle = (id: string) => {
    setEditingArticleId(id);
    setView("editor");
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setEditingArticleId(undefined);
  };

  return (
    <>
      {view === "dashboard" ? (
        <EnhancedDashboard
          onCreateNew={handleCreateNew}
          onEditArticle={handleEditArticle}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      ) : (
        <EnhancedArticleEditor
          articleId={editingArticleId}
          onBack={handleBackToDashboard}
        />
      )}

      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalSettingsProvider>
        <ArticleProvider>
          <AppContent />
        </ArticleProvider>
      </GlobalSettingsProvider>
    </AuthProvider>
  );
}