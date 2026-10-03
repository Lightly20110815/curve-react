import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { RouteFallback } from "@/components/RouteFallback";

// The front page ships in the entry chunk so the first paint is immediate.
// Every other route is split out: opening /photos should not also download
// the archives, the tag index, the countdown and the rest of the paper.
import HomePage from "@/pages/HomePage";

const PostPage = lazy(() => import("@/pages/PostPage"));
const ArchivesPage = lazy(() => import("@/pages/ArchivesPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const TagsPage = lazy(() => import("@/pages/TagsPage"));
const CategoryDetailPage = lazy(() => import("@/pages/CategoryDetailPage"));
const TagDetailPage = lazy(() => import("@/pages/TagDetailPage"));
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const PhotosPage = lazy(() => import("@/pages/PhotosPage"));
const CountdownPage = lazy(() => import("@/pages/CountdownPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const LinksPage = lazy(() => import("@/pages/LinksPage"));
const EpheiaPage = lazy(() => import("@/pages/EpheiaPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

/** One Suspense boundary per route so a pending chunk never blanks the shell. */
const withFallback = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="epheia" element={withFallback(<EpheiaPage />)} />
        <Route path="posts/:slug" element={withFallback(<PostPage />)} />
        <Route path="archives" element={withFallback(<ArchivesPage />)} />
        <Route path="categories" element={withFallback(<CategoriesPage />)} />
        <Route path="categories/:name" element={withFallback(<CategoryDetailPage />)} />
        <Route path="tags" element={withFallback(<TagsPage />)} />
        <Route path="tags/:name" element={withFallback(<TagDetailPage />)} />
        <Route path="notes" element={withFallback(<NotesPage />)} />
        <Route path="photos" element={withFallback(<PhotosPage />)} />
        <Route path="countdown" element={withFallback(<CountdownPage />)} />
        <Route path="links" element={withFallback(<LinksPage />)} />
        <Route path="about" element={withFallback(<AboutPage />)} />
        <Route path="*" element={withFallback(<NotFoundPage />)} />
      </Route>
    </Routes>
  );
}
