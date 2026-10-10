# Student Academic Portfolio

A responsive academic portfolio website for a university student, written in plain **HTML5, CSS3 and vanilla JavaScript**. It has no frameworks, no build step and no paid services.

**Sections:** Home (hero + student card) · About Me (Introduction, Academic Interest, Future Goals, CV) · COA Learning Rules · Number System Converter · Assignments · Footer

**Extras:** dark/light mode, sticky navbar, mobile hamburger menu, smooth scrolling, active nav link, scroll animations, loading screen, back-to-top button, keyboard focus states, reduced-motion support.

```
├── index.html      ← page structure and all editable text
├── style.css       ← all styling (organised into 17 numbered sections)
├── script.js       ← all behaviour (organised into 8 numbered sections)
├── CV.pdf          ← your CV (opened by "View CV")
├── images/         ← profile photo placeholder + cv.png (image used to build CV.pdf)
└── netlify.toml    ← tells Netlify to publish the folder as-is
```

---

## 1. Running the website locally

Because it is a static site, you can:

- **Simply double-click `index.html`** to open it in your browser. Everything works except "Copy result" may fall back to an older copy method.
- **Or (recommended) run a tiny local server**, so it behaves exactly like it will online:
  - VS Code: install the **Live Server** extension → right-click `index.html` → *Open with Live Server*.
  - Python: `python -m http.server 8000` in this folder, then open http://localhost:8000
  - Node: `npx serve .`

## 2. Your name, UID, semester and course

Open **`script.js`** and edit the `STUDENT` object at the very top:

```js
const STUDENT = {
  name: "Your Name",
  uid: "24BCS00000",
  semester: "3rd Semester",
  course: "B.E. Computer Science & Engineering",
};
```

These values fill in every element marked `data-student="..."` (navbar, hero card, footer, copyright, page title, and the initials in the logo). You only need to change them once. The same text also appears in `index.html` as a fallback, so you can change it there too if you like.

## 3. Introduction, academic interests, future goals and welcome message

In **`index.html`**, search for `EDIT:` comments:

- `<!-- EDIT: Your short welcome message -->`: the paragraph in the hero.
- `<!-- EDIT: Introduction -->`, `<!-- EDIT: Academic Interest -->`, `<!-- EDIT: Future Goals -->`: the About Me cards. Replace the `<p>` text, and add or remove `<li>` items in the interests list.
- `<!-- EDIT: Each <details> block is one topic -->`: the COA Learning Rules. Each topic is a `<details>` element. Edit the text inside `<div class="coa-item__body">`, or copy a whole `<details>` block to add a new topic.

## 4. Your CV

Replace the **`CV.pdf`** file in the project's root folder with your own PDF, and **keep the same file name**. The "View CV" button opens it in a new tab and "Download CV" downloads it. If you want a different file name, search for `CV.pdf` in `index.html` (it appears in the About section and in the footer) and update each link.

## 5. Profile photo

- **Profile photo:** put your photo in `images/` (e.g. `images/profile.jpg`) and change `src="images/profile.svg"` in `index.html`. A square photo works best.
- Tip: keep each image below roughly 500 KB (resize or compress at squoosh.app) so the page loads quickly.

## 6. How the number converter works

1. Pick the **From** system. The badge, placeholder and hint below the box show which digits are allowed.
2. Type a number. It is **validated as you type**:
   - Binary: only `0` and `1`
   - Octal: only `0–7`
   - Decimal: `0–9`
   - Hexadecimal: `0–9` and `A–F` (lower-case also works)
   - You may also use one `.` for fractions, a leading `-`, the prefixes `0b` / `0o` / `0x`, and spaces or `_` as separators.
   
   Invalid characters produce a friendly message such as *"2" is not a valid Binary digit.*
3. Press **Convert** (or Enter). If you **change the To system**, the number is converted straight away.
4. **Swap** exchanges the two systems and moves the result into the input. **Copy result** copies the result to the clipboard. **Clear** empties both boxes.
5. The last 8 conversions appear under **Conversion History**. They are saved in localStorage, and **Clear history** removes them.

Internally (see `validateNumber` and `convertNumber` in `script.js`), the whole-number part is converted with JavaScript `BigInt`, so very large numbers stay exact. Fractions are converted by repeated multiplication and shown with up to 12 digits.

## 7. How the Assignments section works right now

- Enter an assignment name, a subject, and a file (click or drag-and-drop, max 10 MB), then press **Upload**.
- The details (name, subject, file name, size, date) are saved in the browser's **localStorage**. The file itself is saved in the browser's **IndexedDB**, so **Download** gives you back the real file.
- **Delete** removes the card and the stored file after you confirm.
- ⚠️ **Nothing is sent to a server.** The data exists only in the browser and on the device where it was added. Visitors to your published site will not see your assignments, and clearing your browser data erases them. The page states this clearly in a notice above the form.

## 8. Connecting real cloud storage later

All storage code is in one place: the **`AssignmentService`** object in `script.js` (section 6). It has four functions: `list()`, `add()`, `remove(id)` and `getFileUrl(id)`. The UI only calls these four, so you can swap the storage without touching the UI.

Free options include **Netlify Functions + Netlify Blobs** (on the same free host as your site), **Firebase Storage + Firestore**, and **Supabase Storage + Postgres**. For example, using your own API endpoint:

```js
const AssignmentService = {
  async list() {
    const res = await fetch("/api/assignments");
    return res.json();
  },
  async add({ name, subject, file }) {
    const body = new FormData();
    body.append("name", name);
    body.append("subject", subject);
    body.append("file", file);
    const res = await fetch("/api/assignments", { method: "POST", body });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  async remove(id) {
    await fetch(`/api/assignments/${id}`, { method: "DELETE" });
  },
  async getFileUrl(id) {
    return `/api/assignments/${id}/file`;
  },
};
```

Once uploads are public, also add **login/authentication** so that only you can upload or delete files. When you switch over, update the notice text in the Assignments section of `index.html`.

## 9. Publishing for free

### GitHub Pages
1. Create a free account at github.com and click **New repository** (e.g. `my-portfolio`). Make it **Public**.
2. Click **Add file → Upload files** and drag in `index.html`, `style.css`, `script.js`, `CV.pdf` and the `images` folder. Then click **Commit changes**.
3. Open **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, select branch **main** and folder **/ (root)**, and click **Save**.
4. After about a minute, your site is live at `https://<your-username>.github.io/my-portfolio/`.
5. To update the site, upload the changed files again (or use `git push`). The site redeploys automatically.

### Netlify (also free)
This project is already set up for Netlify (`netlify.toml` publishes the folder as-is). Every change pushed to the connected repository deploys automatically.
