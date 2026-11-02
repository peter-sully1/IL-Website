"use client";

import { useActionState, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { saveArticle, uploadImage, type SaveState } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import { Editor } from "./Editor";

export type ArticleFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentJson: JSONContent | null;
  coverImagePath: string;
  coverImageUrl: string | null;
  status: "draft" | "published";
};

export function ArticleForm({ article }: { article: ArticleFormValues }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveArticle, undefined);

  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(article.id));
  const [content, setContent] = useState<{ json: JSONContent; html: string } | null>(null);
  const [cover, setCover] = useState({ path: article.coverImagePath, url: article.coverImageUrl });
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);

  const isPublished = article.status === "published";
  const fe = state?.fieldErrors ?? {};

  async function onCoverChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    setCoverError(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadImage(fd);
    setCoverUploading(false);
    if (result.ok) setCover({ path: result.path, url: result.url });
    else setCoverError(result.error);
  }

  return (
    <form action={formAction} className="form">
      {state?.error && <p className="notice error" role="alert">{state.error}</p>}

      {article.id && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="contentJson" value={JSON.stringify(content?.json ?? article.contentJson ?? {})} />
      <input type="hidden" name="contentHtml" value={content?.html ?? ""} />
      <input type="hidden" name="coverImagePath" value={cover.path} />

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
          aria-invalid={Boolean(fe.title)}
        />
        {fe.title && <p className="field-error">{fe.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="slug">Web address</label>
        <input
          id="slug"
          name="slug"
          type="text"
          maxLength={120}
          value={slug}
          onChange={(e) => {
            setSlugEdited(true);
            setSlug(e.target.value.toLowerCase());
          }}
          aria-describedby="slug-hint"
          aria-invalid={Boolean(fe.slug)}
        />
        <p className="hint" id="slug-hint">
          The article will be at /articles/{slug || "…"}
          {isPublished && ". Changing this breaks links people have already shared."}
        </p>
        {fe.slug && <p className="field-error">{fe.slug}</p>}
      </div>

      <div className="field">
        <label htmlFor="excerpt">Summary</label>
        <textarea
          id="excerpt"
          name="excerpt"
          maxLength={400}
          defaultValue={article.excerpt}
          aria-describedby="excerpt-hint"
        />
        <p className="hint" id="excerpt-hint">One or two sentences shown on the Articles page and when the link is shared.</p>
        {fe.excerpt && <p className="field-error">{fe.excerpt}</p>}
      </div>

      <div className="field">
        <span id="cover-label" style={{ fontWeight: 600, fontSize: "0.95rem" }}>Cover image</span>
        <div className="cover-preview" aria-labelledby="cover-label">
          {cover.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.url} alt="Current cover image" />
          )}
          <button type="button" className="btn" onClick={() => coverInput.current?.click()} disabled={coverUploading}>
            {coverUploading ? "Uploading…" : cover.url ? "Change image" : "Add image"}
          </button>
          {cover.url && (
            <button type="button" className="link-button" onClick={() => setCover({ path: "", url: null })}>
              Remove image
            </button>
          )}
          <input
            ref={coverInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={onCoverChosen}
          />
        </div>
        <p className="hint">Optional. JPEG, PNG, WebP or GIF up to 5 MB.</p>
        {coverError && <p className="field-error" role="alert">{coverError}</p>}
      </div>

      <div className="field">
        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Article</span>
        <Editor initialContent={article.contentJson} onChange={setContent} />
      </div>

      <div className="actions">
        <button className="btn" type="submit" name="intent" value="draft" disabled={pending || !content}>
          {isPublished ? "Save changes" : "Save draft"}
        </button>
        {!isPublished && (
          <button className="btn primary" type="submit" name="intent" value="publish" disabled={pending || !content}>
            Publish
          </button>
        )}
        {isPublished && (
          <button className="btn" type="submit" name="intent" value="unpublish" disabled={pending || !content}>
            Unpublish
          </button>
        )}
        {pending && <span aria-live="polite">Saving…</span>}
      </div>
    </form>
  );
}
