const fs = require('fs');
const path = require('path');

// Simple Markdown-to-HTML converter
const mdToHtml = (markdown) => {
    return markdown
        .replace(/^# (.*$)/gim, '<h2>$1</h2>')
        .replace(/^## (.*$)/gim, '<h3>$1</h3>')
        .replace(/^### (.*$)/gim, '<h4>$1</h4>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>') // Basic list support
        .replace(/<\/ul>\s*<ul>/gim, '') // Merge lists
        .replace(/\n$/gim, '<br />');
};

const POSTS_DIR = path.join(__dirname, 'posts');
const OUTPUT_DIR = path.join(__dirname, 'public');
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'post.html');
const INDEX_TEMPLATE_PATH = path.join(__dirname, 'templates', 'index.html');
const BLOG_TEMPLATE_PATH = path.join(__dirname, 'templates', 'blog.html');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
if (!fs.existsSync(path.join(OUTPUT_DIR, 'blog'))) fs.mkdirSync(path.join(OUTPUT_DIR, 'blog'));
if (!fs.existsSync(path.join(OUTPUT_DIR, 'css'))) fs.mkdirSync(path.join(OUTPUT_DIR, 'css'));
if (!fs.existsSync(path.join(OUTPUT_DIR, 'js'))) fs.mkdirSync(path.join(OUTPUT_DIR, 'js'));

// Read Templates
const postTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const indexTemplate = fs.readFileSync(INDEX_TEMPLATE_PATH, 'utf-8');
const blogTemplate = fs.readFileSync(BLOG_TEMPLATE_PATH, 'utf-8');

// Copy CSS/JS
fs.copyFileSync(path.join(__dirname, 'css', 'style.css'), path.join(OUTPUT_DIR, 'css', 'style.css'));
fs.copyFileSync(path.join(__dirname, 'js', 'script.js'), path.join(OUTPUT_DIR, 'js', 'script.js'));

// Get Posts
const posts = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md')).map(file => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const [meta, ...body] = content.split('---').filter(Boolean);
    const metaObj = JSON.parse(meta);
    const htmlBody = mdToHtml(body.join('---'));
    const slug = file.replace('.md', '');
    
    // Auto-excerpt if missing
    if (!metaObj.excerpt) {
        metaObj.excerpt = htmlBody.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
    }
    
    return { ...metaObj, slug, content: htmlBody };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate Individual Post Pages
posts.forEach(post => {
    const html = postTemplate
        .replace(/{{title}}/g, post.title)
        .replace(/{{date}}/g, post.date)
        .replace(/{{author}}/g, post.author)
        .replace(/{{slug}}/g, post.slug)
        .replace(/{{excerpt}}/g, post.excerpt)
        .replace(/{{content}}/g, post.content);
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'blog', `${post.slug}.html`), html);
});

// Generate Index (Home)
const recentPostsHtml = posts.slice(0, 3).map(post => `
    <article class="post-preview">
        <span class="post-meta">${post.date} // ${post.author}</span>
        <h3><a href="blog/${post.slug}.html">${post.title}</a></h3>
        <p>${post.excerpt}</p>
    </article>
`).join('');

const indexHtml = indexTemplate.replace('{{posts}}', recentPostsHtml);
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml);

// Generate Blog Page
const allPostsHtml = posts.map(post => `
    <article class="post-preview">
        <span class="post-meta">${post.date} // ${post.author}</span>
        <h3><a href="blog/${post.slug}.html">${post.title}</a></h3>
        <p>${post.excerpt}</p>
    </article>
`).join('');

const blogHtml = blogTemplate.replace('{{posts}}', allPostsHtml);
fs.writeFileSync(path.join(OUTPUT_DIR, 'blog.html'), blogHtml);

console.log(`Deployed ${posts.length} transmissions.`);
