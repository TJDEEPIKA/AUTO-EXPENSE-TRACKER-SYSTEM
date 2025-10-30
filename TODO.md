# TODO: Fix Google OAuth for Production Deployment on Render

## Steps to Complete

- [x] Update backend/src/controllers/authController.js: Replace hardcoded localhost redirects with FRONTEND_URL environment variable.
- [x] Update backend/src/routes/authRoutes.js: Replace hardcoded localhost failureRedirect with FRONTEND_URL environment variable.
- [ ] Set environment variables on Render:
  - GOOGLE_CALLBACK_URL=https://your-render-backend-app.com/api/auth/google/callback
  - FRONTEND_URL=https://your-frontend-app.com
- [ ] Update Google Console: Add the production callback URL to authorized redirect URIs.
- [ ] Redeploy backend on Render after changes.
- [ ] Test Google signup in production environment.
