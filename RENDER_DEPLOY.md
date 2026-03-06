# Deploying DropRoom to Render

## Pre-Deployment Checklist

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Environment Variables**
   - No special environment variables needed for basic deployment
   - PORT is automatically set by Render (default 10000)
   - NODE_ENV is automatically set to production

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

1. Go to [render.com](https://render.com)
2. Sign up or log in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `fileshare-app` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose Free or Paid tier

6. Click **"Create Web Service"**
7. Render will automatically deploy whenever you push to your repository

### Option 2: Using render.yaml (Infrastructure as Code)

Since we've already created a `render.yaml`, you can also:

1. Push your code to GitHub (including `render.yaml`)
2. Go to [render.com/blueprints](https://render.com/blueprints)
3. Click **"New Blueprint Instance"**
4. Select your GitHub repository
5. Review the configuration from `render.yaml`
6. Click **"Create Blueprint Instance"**

## Post-Deployment

Once deployed, you'll get a URL like: `https://your-app-name.onrender.com`

### Testing the Deployment
- Open `https://your-app-name.onrender.com` in your browser
- Create a room and test file uploads/downloads
- Share the room code with others

### Monitoring
- View logs in the Render Dashboard
- Check the application health at: `https://your-app-name.onrender.com/health`

## Important Notes

- **Free Tier**: Services spin down after 15 minutes of inactivity
- **Upload Directory**: Files are stored in `/uploads` (non-persistent on free tier)
  - On free tier, files are lost when the service restarts
  - For persistent storage, upgrade to paid tier or use external storage (e.g., AWS S3)
- **Build Time**: Initial build may take 2-3 minutes
- **Automatic Deploys**: Any push to your main branch will trigger a redeploy

## Troubleshooting

### Issue: "Cannot GET /"
- Check that `npm run build` completed successfully
- Verify `client/dist` folder exists

### Issue: Socket.io connection errors
- Clear browser cache (Cmd+Shift+Delete)
- Check that the server is running (look at Render logs)
- Ensure CLIENT_URL is not interfering (it's optional)

### Issue: File uploads not working
- Check server logs for errors
- Ensure multer is properly configured in `server/routes/room.js`
- Verify the `/uploads` directory is writable

## Optional: Custom Domain

1. In Render Dashboard, go to your service
2. Click **Settings** → **Custom Domain**
3. Add your domain and follow DNS instructions

---

For more help, see [Render Documentation](https://docs.render.com/)
