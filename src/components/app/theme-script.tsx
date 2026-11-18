/**
 * Applies the saved app theme, sidebar width and collapsed state before
 * first paint, so nothing flashes or jumps.
 * "system" (no saved value) leaves it to prefers-color-scheme.
 */
const code = `try{var d=document.documentElement,t=localStorage.getItem('stride-theme');if(t==='light'||t==='dark')d.setAttribute('data-app-theme',t);var w=parseInt(localStorage.getItem('stride-sidebar-w')||'');if(w>=220&&w<=360)d.style.setProperty('--app-sb-w',w+'px');if(localStorage.getItem('stride-sidebar')==='collapsed')d.setAttribute('data-app-sb','collapsed')}catch(e){}`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
