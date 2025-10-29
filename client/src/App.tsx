import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const MyPage = lazy(() => import("./pages/MyPage"));
const Application = lazy(() => import("./pages/Application"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Resources = lazy(() => import("./pages/Resources"));
const Journals = lazy(() => import("./pages/Journals"));
const JournalDetail = lazy(() => import("./pages/JournalDetail"));
const Shop = lazy(() => import("./pages/Shop"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/auth"} component={Auth} />
      <Route path={"/mypage"} component={MyPage} />
      <Route path={"/application"} component={Application} />
        <Route path="/faq" component={FAQ} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/resources" component={Resources} />
      <Route path="/journals" component={Journals} />
      <Route path="/journals/:slug" component={JournalDetail} />
      <Route path="/shop" component={Shop} />
      <Route path="/privacy" component={Privacy} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
