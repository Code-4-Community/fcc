import ToolBarButton from './ToolBarButton';
import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

export default function RichTextEditor({
  content,
  onUpdate,
}: {
  content: string;
  onUpdate: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: {},
        orderedList: {},
        bold: {},
        italic: {},
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Type your message here…' }),
    ],
    content,
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[220px] focus:outline-none px-4 py-3 text-slate-700 leading-relaxed',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('Enter URL', prev);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50">
        <ToolBarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-3.5 h-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 7H10a3 3 0 010 6H7" strokeLinecap="round" />

            <path
              d="M5.5 4.5L3 7l2.5 2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToolBarButton>

        <ToolBarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-3.5 h-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M13 7H6a3 3 0 000 6h3" strokeLinecap="round" />

            <path
              d="M10.5 4.5L13 7l-2.5 2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToolBarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolBarButton
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <span className="font-bold text-xs">H2</span>
        </ToolBarButton>

        <ToolBarButton
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <span className="font-bold text-xs">H3</span>
        </ToolBarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolBarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span className="font-bold text-xs">B</span>
        </ToolBarButton>

        <ToolBarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic text-xs font-serif">I</span>
        </ToolBarButton>

        <ToolBarButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline text-xs">U</span>
        </ToolBarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolBarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <circle cx="2.5" cy="4" r="1.2" />

            <rect x="5" y="3.25" width="9" height="1.5" rx="0.5" />

            <circle cx="2.5" cy="8" r="1.2" />

            <rect x="5" y="7.25" width="9" height="1.5" rx="0.5" />
          </svg>
        </ToolBarButton>

        <ToolBarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <text
              x="1"
              y="5.5"
              fontSize="4.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              1.
            </text>

            <rect x="5" y="3.25" width="9" height="1.5" rx="0.5" />

            <text
              x="1"
              y="9.5"
              fontSize="4.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              2.
            </text>

            <rect x="5" y="7.25" width="9" height="1.5" rx="0.5" />
          </svg>
        </ToolBarButton>

        <ToolBarButton
          title="Insert link"
          active={editor.isActive('link')}
          onClick={setLink}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-3.5 h-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L7.5 3.5"
              strokeLinecap="round"
            />

            <path
              d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1"
              strokeLinecap="round"
            />
          </svg>
        </ToolBarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
