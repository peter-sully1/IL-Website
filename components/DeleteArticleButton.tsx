"use client";

import { deleteArticle } from "@/app/admin/actions";

export function DeleteArticleButton({ id }: { id: string }) {
  return (
    <form
      action={deleteArticle}
      onSubmit={(e) => {
        if (!window.confirm("Delete this article permanently? This can’t be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn danger" type="submit">Delete article</button>
    </form>
  );
}
