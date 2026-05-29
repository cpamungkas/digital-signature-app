# Cloudinary Configuration Guide

## Setup Cloudinary

### 1. Login to Cloudinary

Use the provided credentials:
- Email: aliejosh@yahoo.com
- Password: Jakarta2008@!

### 2. Get API Credentials

1. Go to Dashboard
2. Copy the following:
   - **Cloud Name**: Your unique cloud identifier
   - **API Key**: Your API key
   - **API Secret**: Your API secret (keep this private!)

### 3. Update .env File

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Folder Structure in Cloudinary

Create these folders in Cloudinary for organization:
- `digital-signature/documents` - For uploaded documents
- `digital-signature/signatures` - For signature images
- `digital-signature/temp` - For temporary files

### 5. Upload Presets (Optional)

Create upload presets for different file types:

**For Documents:**
- Folder: `digital-signature/documents`
- Resource type: Auto
- Max file size: 10MB

**For Signatures:**
- Folder: `digital-signature/signatures`
- Resource type: Image
- Max file size: 1MB

## Usage in Code

The Cloudinary integration will be used in the document upload service:

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file
const result = await cloudinary.uploader.upload(filePath, {
  folder: 'digital-signature/documents',
  resource_type: 'auto'
});
```

## Security Best Practices

1. Never commit API secrets to version control
2. Use environment variables for all credentials
3. Rotate API keys regularly
4. Use signed URLs for file access
5. Set up access controls in Cloudinary dashboard

## Troubleshooting

### Authentication Failed
- Verify credentials are correct
- Check if account is active

### Upload Failed
- Check file size (max 10MB)
- Verify file format is supported
- Check folder permissions

### Rate Limiting
- Cloudinary has rate limits on free tier
- Consider upgrading for production use
