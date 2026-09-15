# Deployment Guide: GitHub Actions & Firebase Hosting

This project is fully configured for automated CI/CD deployment to **Firebase Hosting** (`resize-studio-20e56`) via **GitHub Actions**.

---

## What You Need to Add in GitHub

You only need to add **ONE Secret** to your GitHub repository:

### Secret Name
```text
FIREBASE_SERVICE_ACCOUNT_RESIZE_STUDIO_20E56
```

### Where to Get the Secret Value:
1. Open the [Firebase Console Service Accounts tab](https://console.firebase.google.com/project/resize-studio-20e56/settings/serviceaccounts/adminsdk).
2. Click the **Generate new private key** button.
3. A `.json` file will download to your computer.
4. Open that `.json` file in any text editor, copy its **entire contents**.

### How to Add It to GitHub:
1. Open your repository on GitHub.
2. Click **Settings** (top right tab of your repository).
3. In the left sidebar, click **Secrets and variables** → **Actions**.
4. Click the green **New repository secret** button.
5. In **Name**, paste:
   ```text
   FIREBASE_SERVICE_ACCOUNT_RESIZE_STUDIO_20E56
   ```
6. In **Secret**, paste the JSON content from your downloaded key.
7. Click **Add secret**.

---

## Verification: Workflow Permissions
To allow GitHub Actions to report deployment status:
1. In GitHub repo **Settings** → **Actions** → **General**.
2. Scroll to **Workflow permissions**.
3. Ensure **Read and write permissions** is selected.
4. Click **Save**.

---

## How to Trigger the Deployment

### Option A: Push to GitHub
Commit and push your code to `main` or `master`:
```bash
git add .
git commit -m "Deploy Resizer Studio"
git push origin main
```
GitHub Actions will automatically build and deploy.

### Option B: One-Click Deploy from GitHub UI
1. Go to the **Actions** tab in your GitHub repository.
2. Click **Deploy to Firebase Hosting on Merge** in the left list.
3. Click the **Run workflow** dropdown on the right and click **Run workflow**.

---

## Your Live Website URLs
Once the workflow finishes (takes ~1 minute), your site is live at:
- **https://resize-studio-20e56.web.app**
- **https://resize-studio-20e56.firebaseapp.com**
