import { Route, Routes } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import HomePage from "@/pages/HomePage";
import PostPage from "@/pages/PostPage";
import ArchivesPage from "@/pages/ArchivesPage";
import TagsPage from "@/pages/TagsPage";
import TermDetailPage from "@/pages/TermDetailPage";
import NotesPage from "@/pages/NotesPage";
import CountdownPage from "@/pages/CountdownPage";
import LinksPage from "@/pages/LinksPage";
import AboutPage from "@/pages/AboutPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="posts/:slug" element={<PostPage />} />
        <Route path="archives" element={<ArchivesPage />} />
        <Route path="tags" element={<TagsPage />} />
        <Route path="tags/:name" element={<TermDetailPage kind="tag" />} />
        <Route path="categories/:name" element={<TermDetailPage kind="category" />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="countdown" element={<CountdownPage />} />
        <Route path="links" element={<LinksPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
