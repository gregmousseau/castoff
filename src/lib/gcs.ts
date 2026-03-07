// Google Cloud Storage utility for photo uploads
// TODO: Wire up real GCS when credentials are configured

interface UploadResult {
  url: string
  key: string
}

export async function uploadToGCS(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'photos'
): Promise<UploadResult> {
  const bucketName = process.env.GCS_BUCKET_NAME || 'castoff-photos'
  const key = `${folder}/${Date.now()}-${fileName}`

  // TODO: Implement real GCS upload when credentials are available
  // const { Storage } = await import('@google-cloud/storage')
  // const storage = new Storage({
  //   projectId: process.env.GCS_PROJECT_ID,
  //   credentials: process.env.GCS_SERVICE_ACCOUNT_KEY
  //     ? JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY)
  //     : undefined,
  // })
  // const bucket = storage.bucket(bucketName)
  // const blob = bucket.file(key)
  // await blob.save(file, { contentType, resumable: false })
  // await blob.makePublic()
  // return {
  //   url: `https://storage.googleapis.com/${bucketName}/${key}`,
  //   key,
  // }

  throw new Error(
    `GCS not configured. Set GCS_BUCKET_NAME, GCS_PROJECT_ID, and GOOGLE_APPLICATION_CREDENTIALS or GCS_SERVICE_ACCOUNT_KEY. ` +
    `Bucket: ${bucketName}, Key: ${key}`
  )
}

export function isGCSConfigured(): boolean {
  return !!(
    process.env.GCS_BUCKET_NAME &&
    process.env.GCS_PROJECT_ID &&
    (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCS_SERVICE_ACCOUNT_KEY)
  )
}

export function getPublicUrl(key: string): string {
  const bucketName = process.env.GCS_BUCKET_NAME || 'castoff-photos'
  return `https://storage.googleapis.com/${bucketName}/${key}`
}
