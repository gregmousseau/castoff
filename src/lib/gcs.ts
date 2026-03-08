import { Storage } from '@google-cloud/storage'

interface UploadResult {
  url: string
  key: string
}

function getStorage(): Storage {
  return new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: process.env.GCS_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY)
      : undefined,
  })
}

function getBucketName(): string {
  return process.env.GCS_BUCKET_NAME || 'castoff-media'
}

export async function uploadToGCS(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'photos'
): Promise<UploadResult> {
  const bucketName = getBucketName()
  const key = `${folder}/${Date.now()}-${fileName}`

  const storage = getStorage()
  const bucket = storage.bucket(bucketName)
  const blob = bucket.file(key)
  await blob.save(file, { contentType, resumable: false })

  return {
    url: `https://storage.googleapis.com/${bucketName}/${key}`,
    key,
  }
}

export async function deleteFromGCS(key: string): Promise<void> {
  const storage = getStorage()
  const bucket = storage.bucket(getBucketName())
  try {
    await bucket.file(key).delete()
  } catch (err: unknown) {
    const error = err as { code?: number }
    // Ignore 404 - file already gone
    if (error.code !== 404) throw err
  }
}

export function isGCSConfigured(): boolean {
  return !!(
    process.env.GCS_BUCKET_NAME &&
    process.env.GCS_PROJECT_ID &&
    (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCS_SERVICE_ACCOUNT_KEY)
  )
}

export function getPublicUrl(key: string): string {
  const bucketName = getBucketName()
  return `https://storage.googleapis.com/${bucketName}/${key}`
}
