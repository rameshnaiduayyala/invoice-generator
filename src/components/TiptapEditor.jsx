import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Palette, Heading2 
} from 'lucide-react';

// --- THE TOOLBAR COMPONENT ---
const MenuBar = ({ editor, theme }) => {
  if (!editor) return null;

  // Safety check: Ensure theme has a primary color, otherwise default to gray
  const activeColor = theme?.primary || '#3b82f6';

  return (
    <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-white border border-gray-200 rounded-lg shadow-lg w-fit print:hidden animate-in fade-in slide-in-from-bottom-2 z-50">
      
      {/* Bold / Italic / Underline */}
      <div className="flex gap-0.5 border-r pr-1 mr-1 border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition ${editor.isActive('bold') ? 'bg-gray-100 text-black font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition ${editor.isActive('italic') ? 'bg-gray-100 text-black italic' : 'text-gray-500 hover:bg-gray-50'}`}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition ${editor.isActive('underline') ? 'bg-gray-100 text-black underline' : 'text-gray-500 hover:bg-gray-50'}`}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex gap-0.5 border-r pr-1 mr-1 border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition ${editor.isActive('bulletList') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
          title="Bullet List"
        >
          <List size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition ${editor.isActive('orderedList') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex gap-0.5 border-r pr-1 mr-1 border-gray-200">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <AlignLeft size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <AlignCenter size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <AlignRight size={14} />
        </button>
      </div>

      {/* Color Picker */}
      <div className="relative group p-1.5 rounded hover:bg-gray-100 cursor-pointer flex items-center justify-center border-r pr-1 mr-1 border-gray-200">
        <Palette size={14} style={{ color: editor.getAttributes('textStyle').color || 'gray' }} />
        <input
          type="color"
          onInput={(event) => editor.chain().focus().setColor(event.target.value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title="Text Color"
        />
      </div>
      
      {/* Heading Toggle */}
      <button
         onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
         className={`p-1.5 rounded transition flex items-center gap-1 text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
         title="Large Heading"
      >
        <Heading2 size={14} />
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---
const TiptapEditor = ({ 
  content, 
  onChange, 
  placeholder, 
  className, 
  theme = { primary: '#000000' } // Default theme to prevent crashes
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Type here...' }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // We add 'prose' class for better list styling if you use Tailwind Typography
        class: `focus:outline-none min-h-[1.5em] prose prose-sm max-w-none ${className}`,
      },
    },
  });

  return (
    <div className="group relative">
      {/* Global Style overrides for Lists in Tiptap (since Tailwind resets them) */}
      <style>{`
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror p { margin: 0; }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 { margin: 0; line-height: 1.2; }
      `}</style>

      {/* Floating Toolbar */}
      <div className="absolute -top-12 left-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
        <MenuBar editor={editor} theme={theme} />
      </div>
      
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;