# Sanmati's portfolio (static HTML + Gemini chatbot on Vercel)

1. Get a free key at https://aistudio.google.com/apikey
2. (Done) LinkedIn and GitHub links are set. To use real project screenshots, add PNGs to projects/ and change the img src in index.html
3. Push this folder to GitHub, import it at https://vercel.com/new
4. Vercel > Project > Settings > Environment Variables: add GEMINI_API_KEY (and optionally GEMINI_MODEL), then Redeploy
5. Local test: npm i -g vercel, then `vercel dev` (put keys in .env.local)
