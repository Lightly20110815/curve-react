import { Route, Routes } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import HomePage from "@/pages/HomePage";
import PostPage from "@/pages/PostPage";
import ArchivesPage from "@/pages/ArchivesPage";
import CategoriesPage from "@/pages/CategoriesPage";
import TagsPage from "@/pages/TagsPage";
import CategoryDetailPage from "@/pages/CategoryDetailPage";
import TagDetailPage from "@/pages/TagDetailPage";
import NotesPage from "@/pages/NotesPage";
import AboutPage from "@/pages/AboutPage";
import LinksPage from "@/pages/LinksPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="posts/:slug" element={<PostPage />} />
        <Route path="archives" element={<ArchivesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/:name" element={<CategoryDetailPage />} />
        <Route path="tags" element={<TagsPage />} />
        <Route path="tags/:name" element={<TagDetailPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="links" element={<LinksPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
