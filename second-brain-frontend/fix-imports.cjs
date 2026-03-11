const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { from: /['"].*\/store\/useAuthStore['"]/g, to: "'@/features/auth/store/useAuthStore'" },
  { from: /['"].*\/store\/useWorkspaceStore['"]/g, to: "'@/features/workspace/store/useWorkspaceStore'" },
  { from: /['"].*\/store\/useNoteStore['"]/g, to: "'@/features/notes/store/useNoteStore'" },
  { from: /['"].*\/store\/useThemeStore['"]/g, to: "'@/shared/store/useThemeStore'" },
  
  { from: /['"].*\/components\/ai\/AIPanel['"]/g, to: "'@/features/ai/components/AIPanel'" },
  { from: /['"].*\/NoteMetadataPanel['"]/g, to: "'@/features/notes/components/NoteMetadataPanel'" },
  { from: /['"].*\/VersionDiffViewer['"]/g, to: "'@/features/notes/components/VersionDiffViewer'" },
  
  { from: /['"].*\/components\/layout\/Header['"]/g, to: "'@/shared/layout/Header'" },
  { from: /['"].*\/components\/layout\/Sidebar['"]/g, to: "'@/shared/layout/Sidebar'" },
  { from: /['"].*\/components\/layout\/CommandPalette['"]/g, to: "'@/shared/layout/CommandPalette'" },
  { from: /['"].*\/components\/layout\/AppLayout['"]/g, to: "'@/shared/layout/AppLayout'" },
  { from: /['"].*\/components\/layout\/AuthLayout['"]/g, to: "'@/shared/layout/AuthLayout'" },
  { from: /['"].*\/AuthLayout['"]/g, to: "'@/shared/layout/AuthLayout'" },
  { from: /['"].*\/AppLayout['"]/g, to: "'@/shared/layout/AppLayout'" },
  { from: /['"].*\/GlobalSearch['"]/g, to: "'@/shared/layout/GlobalSearch'" },

  { from: /['"].*\/pages\/RegisterPage['"]/g, to: "'@/features/auth/pages/RegisterPage'" },
  { from: /['"].*\/pages\/LoginPage['"]/g, to: "'@/features/auth/pages/LoginPage'" },
  { from: /['"].*\/pages\/DashboardPage['"]/g, to: "'@/features/analytics/components/DashboardPage'" },
  { from: /['"].*\/pages\/NoteEditorPage['"]/g, to: "'@/features/notes/components/NoteEditorPage'" },
  { from: /['"].*\/pages\/GraphPage['"]/g, to: "'@/features/graph/components/GraphPage'" },
  
  { from: /['"].*\/utils\/cn['"]/g, to: "'@/shared/utils/cn'" },
  { from: /['"].*\/types['"]/g, to: "'@/shared/types'" },
  { from: /['"].*\/services\/authService['"]/g, to: "'@/features/auth/services/authService'" },
  
  { from: /['"].*\/ui\/button['"]/g, to: "'@/shared/ui/button'" },
  { from: /['"].*\/ui\/card['"]/g, to: "'@/shared/ui/card'" },
  { from: /['"].*\/ui\/input['"]/g, to: "'@/shared/ui/input'" },
  { from: /['"].*\/ui\/label['"]/g, to: "'@/shared/ui/label'" },
  { from: /['"].*\/ui\/toast['"]/g, to: "'@/shared/ui/toast'" },
  { from: /['"].*\/ui\/use-toast['"]/g, to: "'@/shared/ui/use-toast'" },
  { from: /['"].*\/ui\/toaster['"]/g, to: "'@/shared/ui/toaster'" },
  { from: /['"].*\/ui\/dialog['"]/g, to: "'@/shared/ui/dialog'" },
  { from: /['"].*\/ui\/scroll-area['"]/g, to: "'@/shared/ui/scroll-area'" }
];

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    replacements.forEach(rep => {
      newContent = newContent.replace(rep.from, rep.to);
    });
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
