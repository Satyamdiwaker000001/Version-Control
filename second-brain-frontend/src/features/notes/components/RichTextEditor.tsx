import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import './editor-styles.css';

export interface RichTextEditorRef {
  getHTML: () => string;
  insertContent: (content: string) => void;
  insertImage: (src: string, alt?: string) => void;
  focus: () => void;
}

interface RichTextEditorProps {
  content: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ content, onChange, placeholder = 'Start writing...', editable = true, className = '' }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          codeBlock: { HTMLAttributes: { class: 'code-block' } },
        }),
        Link.configure({
          openOnClick: true,
          autolink: true,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
        Image.configure({
          inline: false,
          allowBase64: true,
          HTMLAttributes: { class: 'editor-image' },
        }),
        Placeholder.configure({ placeholder }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ],
      content: content || '',
      editable,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: `tiptap-editor ${className}`,
        },
        handleDrop: (view, event, _slice, moved) => {
          if (!moved && event.dataTransfer?.files.length) {
            const files = Array.from(event.dataTransfer.files);
            files.forEach(file => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                  const src = reader.result as string;
                  view.dispatch(view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src })
                  ));
                };
                reader.readAsDataURL(file);
              }
            });
            return true;
          }
          return false;
        },
        handlePaste: (view, event) => {
          const items = Array.from(event.clipboardData?.items || []);
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              event.preventDefault();
              const file = item.getAsFile();
              if (!file) continue;
              const reader = new FileReader();
              reader.onload = () => {
                const src = reader.result as string;
                view.dispatch(view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src })
                ));
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
          return false;
        },
      },
    });

    // Sync external content changes (e.g., when switching notes)
    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content || '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || '',
      insertContent: (html: string) => {
        editor?.commands.insertContent(html);
      },
      insertImage: (src: string, alt: string = '') => {
        editor?.chain().focus().setImage({ src, alt }).run();
      },
      focus: () => {
        editor?.commands.focus();
      },
    }));

    if (!editor) return null;

    return <EditorContent editor={editor} />;
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { useEditor };

// Re-export Editor type for toolbar
export type { Editor } from '@tiptap/react';
