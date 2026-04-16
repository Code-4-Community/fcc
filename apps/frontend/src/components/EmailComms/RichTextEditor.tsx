import ToolBarButton from './ToolBarButton';
import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Strike from '@tiptap/extension-strike';

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
        heading: { levels: [1, 2, 3] },
        bulletList: {},
        orderedList: {},
        bold: {},
        italic: {},
        strike: {},
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
    <div className="flex flex-col gap-2 pb-4">
      <div className="flex flex-row items-center justify-between px-3 py-2 bg-[#D4D4D4] rounded-md w-full">
        <ToolBarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4"
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
            className="w-4 h-4"
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

        <div className="w-px h-5 bg-[#212529]/20 mx-1" />

        <div className="relative flex items-center">
          <select
            className="appearance-none bg-transparent text-[#212529] text-sm pr-5 pl-1 py-0.5 cursor-pointer focus:outline-none"
            value={
              editor.isActive('heading', { level: 1 })
                ? 'h1'
                : editor.isActive('heading', { level: 2 })
                  ? 'h2'
                  : editor.isActive('heading', { level: 3 })
                    ? 'h3'
                    : 'p'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'p') editor.chain().focus().setParagraph().run();
              else if (val === 'h1')
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              else if (val === 'h2')
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              else if (val === 'h3')
                editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
          >
            <option value="p" className="bg-[#D4D4D4]">
              Normal text
            </option>
            <option value="h1" className="bg-[#D4D4D4]">
              Heading 1
            </option>
            <option value="h2" className="bg-[#D4D4D4]">
              Heading 2
            </option>
            <option value="h3" className="bg-[#D4D4D4]">
              Heading 3
            </option>
          </select>
          <svg
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#212529]"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="w-px h-5 bg-[#212529]/20 mx-1" />

        <ToolBarButton
          title="Align left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <rect x="1" y="3" width="14" height="1.5" rx="0.5" />
            <rect x="1" y="6.5" width="9" height="1.5" rx="0.5" />
            <rect x="1" y="10" width="12" height="1.5" rx="0.5" />
          </svg>
        </ToolBarButton>

        <div className="w-px h-5 bg-[#212529]/20 mx-1" />

        <ToolBarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span className="font-bold text-sm leading-none">B</span>
        </ToolBarButton>

        <ToolBarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic text-sm font-serif leading-none">I</span>
        </ToolBarButton>

        <ToolBarButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline text-sm leading-none">U</span>
        </ToolBarButton>

        <ToolBarButton
          title="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="line-through text-sm leading-none">S</span>
        </ToolBarButton>

        <ToolBarButton
          title="Inline code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M5 4L1.5 8 5 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 4l3.5 4L11 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToolBarButton>

        <ToolBarButton
          title="Highlight"
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M3 13h4l6-6-4-4-6 6v4z" strokeLinejoin="round" />
            <path d="M9 5l2 2" />
          </svg>
        </ToolBarButton>

        <div className="w-px h-5 bg-[#212529]/20 mx-1" />

        <ToolBarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <circle cx="2.5" cy="4.5" r="1.2" />
            <rect x="5" y="3.75" width="9" height="1.5" rx="0.5" />
            <circle cx="2.5" cy="8.5" r="1.2" />
            <rect x="5" y="7.75" width="9" height="1.5" rx="0.5" />
            <circle cx="2.5" cy="12.5" r="1.2" />
            <rect x="5" y="11.75" width="9" height="1.5" rx="0.5" />
          </svg>
        </ToolBarButton>

        <ToolBarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <text
              x="0.5"
              y="5.5"
              fontSize="4.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              1.
            </text>
            <rect x="5" y="3.75" width="9" height="1.5" rx="0.5" />
            <text
              x="0.5"
              y="9.5"
              fontSize="4.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              2.
            </text>
            <rect x="5" y="7.75" width="9" height="1.5" rx="0.5" />
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
            className="w-4 h-4"
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

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
