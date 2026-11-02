"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import type { JSONContent } from "@tiptap/react";
import { uploadImage } from "@/app/admin/actions";

type Props = {
  initialContent: JSONContent | null;
  onChange: (value: { json: JSONContent; html: string }) => void;
};

export function Editor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    // Adds dir="auto" to each block so Arabic paragraphs read right-to-left.
    textDirection: "auto",
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false }),
    ],
    content: initialContent ?? "",
    editorProps: {
      attributes: { "aria-label": "Article body", "aria-multiline": "true", role: "textbox" },
    },
    onCreate: ({ editor }) => onChange({ json: editor.getJSON(), html: editor.getHTML() }),
    onUpdate: ({ editor }) => onChange({ json: editor.getJSON(), html: editor.getHTML() }),
  });

  return (
    <div className="editor">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

function Toolbar({ editor }: { editor: TiptapEditor }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      quote: editor.isActive("blockquote"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (leave empty to remove the link)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function onImageChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadImage(fd);
    setUploading(false);
    if (!result.ok) {
      setUploadError(result.error);
      return;
    }
    const alt = window.prompt("Describe the image for people who can’t see it (optional)") ?? "";
    editor.chain().focus().setImage({ src: result.url, alt }).run();
  }

  const btn = (label: string, title: string, pressed: boolean | undefined, run: () => void, disabled = false) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={pressed === undefined ? undefined : pressed}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
      disabled={disabled}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
        {btn("B", "Bold", state.bold, () => editor.chain().focus().toggleBold().run())}
        {btn("I", "Italic", state.italic, () => editor.chain().focus().toggleItalic().run())}
        {btn("U", "Underline", state.underline, () => editor.chain().focus().toggleUnderline().run())}
        <span className="sep" aria-hidden="true" />
        {btn("Heading", "Heading", state.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn("Subheading", "Subheading", state.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        <span className="sep" aria-hidden="true" />
        {btn("• List", "Bulleted list", state.bullet, () => editor.chain().focus().toggleBulletList().run())}
        {btn("1. List", "Numbered list", state.ordered, () => editor.chain().focus().toggleOrderedList().run())}
        {btn("Quote", "Quote", state.quote, () => editor.chain().focus().toggleBlockquote().run())}
        <span className="sep" aria-hidden="true" />
        {btn("Link", "Add or edit link", state.link, setLink)}
        {btn(uploading ? "Uploading…" : "Image", "Insert image", undefined, () => fileInput.current?.click(), uploading)}
        <span className="sep" aria-hidden="true" />
        {btn("Undo", "Undo", undefined, () => editor.chain().focus().undo().run(), !state.canUndo)}
        {btn("Redo", "Redo", undefined, () => editor.chain().focus().redo().run(), !state.canRedo)}
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={onImageChosen}
        />
      </div>
      {uploadError && <p className="notice error" role="alert" style={{ margin: "0.5rem" }}>{uploadError}</p>}
    </>
  );
}
