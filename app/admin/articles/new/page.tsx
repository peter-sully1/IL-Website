import { ArticleForm } from "@/components/ArticleForm";

export default function NewArticlePage() {
  return (
    <>
      <h1>New article</h1>
      <ArticleForm
        article={{
          title: "",
          slug: "",
          excerpt: "",
          contentJson: null,
          coverImagePath: "",
          coverImageUrl: null,
          status: "draft",
        }}
      />
    </>
  );
}
